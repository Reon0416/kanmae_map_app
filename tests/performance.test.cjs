const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function loadMiddleware(user = null, role = "user") {
  let authCalls = 0;
  const exports = {};
  const input = fs.readFileSync(path.join(__dirname, "../middleware.ts"), "utf8");
  const output = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const response = url => ({ url, cookies: { set() {} } });
  vm.runInNewContext(output, {
    exports, URL,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" } },
    require(name) {
      if (name === "next/server") return { NextResponse: { next: () => response(null), redirect: response } };
      if (name === "@/lib/supabase/auth-config") return { supabaseAuthCookieOptions: {} };
      if (name === "@supabase/ssr") return { createServerClient: () => ({
        auth: { async getUser() { authCalls++; return { data: { user } }; } },
        from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role } }) }) }) })
      }) };
      throw new Error("Unexpected module: " + name);
    }
  });
  return {
    authCalls: () => authCalls,
    run(pathname) {
      const url = new URL(pathname, "https://example.com");
      url.clone = () => new URL(url);
      return exports.middleware({ nextUrl: url, url: url.href, cookies: { getAll: () => [], set() {} } });
    }
  };
}

test("only public storefront routes skip authentication", async () => {
  const middleware = loadMiddleware();
  for (const route of ["/", "/filters", "/stores", "/stores/id"]) {
    assert.equal((await middleware.run(route)).url, null);
  }
  assert.equal(middleware.authCalls(), 0);
  for (const route of ["/record", "/my", "/admin", "/store-admin"]) {
    assert.equal((await middleware.run(route)).url.pathname, "/login");
  }
  await middleware.run("/api/visit-records");
  assert.equal(middleware.authCalls(), 5);
});

test("protected pages still enforce user roles", async () => {
  const middleware = loadMiddleware({ id: "user-id" }, "user");
  assert.equal((await middleware.run("/record")).url, null);
  assert.equal((await middleware.run("/admin")).url.pathname, "/");
  assert.equal((await middleware.run("/store-admin")).url.pathname, "/");
});

function loadQueries({ rows = [], error = null, configured = true, production = true, statusResult } = {}) {
  const selections = [];
  const filters = [];
  const input = fs.readFileSync(path.join(__dirname, "../src/features/stores/store-queries.ts"), "utf8");
  const output = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    process: { env: { NODE_ENV: production ? "production" : "development" } },
    require(name) {
      if (name === "react") return { cache: fn => fn };
      if (name === "next/cache") return {
        unstable_noStore() {},
        unstable_cache(fn, keys, options) {
          assert.equal(options.revalidate, 60);
          let result;
          return () => result ??= fn();
        }
      };
      if (name === "@/lib/map/map-config") return { latLngToMapPosition: () => ({ x: 0, y: 0 }) };
      if (name === "@/lib/supabase/server") return {
        hasSupabaseEnvironment: () => configured,
      };
      if (name === "@/lib/supabase/public") return {
        createSupabasePublicClient: () => ({
          from: table => ({
            select(fields) {
              selections.push(fields);
              const data = table === "current_store_status"
                ? rows?.map(row => ({ store_id: row.id, ...row.current_store_status }))
                : rows;
              const promise = Promise.resolve({ data, error });
              return { order: () => promise, then: promise.then.bind(promise), eq(field, value) {
                filters.push({ table, field, value });
                return { maybeSingle: () => statusResult ?? Promise.resolve({
                  data: data?.find(row => row.store_id === value) ?? null, error
                }) };
              } };
            }
          })
        })
      };
      throw new Error("Unexpected module: " + name);
    }
  });
  return { exports, selections, filters };
}

test("summary query excludes live status and detail fields, retaining real IDs and artwork keys", async () => {
  const { exports, selections } = loadQueries({ rows: [
    { id: "database-id", name: "麺屋　こころ", genre: "ラーメン", address: "unused" },
    { id: "new-id", name: "新店舗", genre: null }
  ] });
  const rows = JSON.parse(JSON.stringify(await exports.getStoreSummaries()));
  assert.deepEqual(selections, ["id, name, genre"]);
  assert.deepEqual(rows, [
    { id: "database-id", assetKey: "kokoro", name: "麺屋　こころ", genre: "ラーメン" },
    { id: "new-id", name: "新店舗", genre: "未設定" }
  ]);
});

test("map and store list still request live status", async () => {
  const { exports, selections } = loadQueries({ rows: [
    { id: "id", name: "蝉", current_store_status: { display_status: "full", wait_time: "over_20" } }
  ] });
  const [store] = await exports.getStores();
  assert.ok(selections.includes("store_id, display_status, wait_time, source, updated_at"));
  assert.equal(store.status, "full");
  assert.equal(store.waitTime, "over_20");
});

test("stale report-sourced wait times expire to no wait", async () => {
  const oldTimestamp = new Date(Date.now() - 31 * 60000).toISOString();
  const { exports } = loadQueries({ rows: [
    { id: "id", name: "蝉", current_store_status: { display_status: "full", wait_time: "over_20", source: "reports", updated_at: oldTimestamp } }
  ] });
  const [store] = await exports.getStores();
  assert.equal(store.status, "available");
  assert.equal(store.waitTime, "no_wait");
});

test("production summary failures do not expose demo records", async () => {
  await assert.rejects(loadQueries({ configured: false }).exports.getStoreSummaries(), /not configured/);
  await assert.rejects(loadQueries({ rows: null, error: { message: "denied" } }).exports.getStoreSummaries(), /denied/);
});

test("development summaries include all nine storefront identities", async () => {
  const rows = await loadQueries({ production: false }).exports.getStoreSummaries();
  assert.equal(rows.length, 9);
  assert.equal(new Set(rows.map(row => row.assetKey)).size, 9);
});

test("public catalogue is reused while wait times are fetched on every request", async () => {
  const { exports, selections } = loadQueries({ rows: [
    { id: "id", name: "蝉", current_store_status: { display_status: "available", wait_time: "within_5" } }
  ] });
  await exports.getStores();
  await exports.getStores();
  await exports.getStoreSummaries();
  await exports.getStoreSummaries();
  assert.equal(selections.filter(fields => fields === "id, name, genre").length, 1);
  assert.equal(selections.filter(fields => fields.includes("description")).length, 1);
  assert.equal(selections.filter(fields => fields.startsWith("store_id")).length, 2);
});

test("detail metadata does not wait for or query live status", async () => {
  const { exports, selections } = loadQueries({ rows: [
    { id: "real-id", name: "麺屋　こころ", hours: "11:00-22:00" }
  ], statusResult: new Promise(() => {}) });
  const store = await exports.getStoreInfoById("kokoro");
  assert.equal(store.id, "real-id");
  assert.equal(store.hours, "11:00-22:00");
  assert.equal(selections.length, 1);
  assert.ok(!selections.some(fields => fields.startsWith("store_id")));
  assert.equal(await exports.getStoreInfoById("missing"), undefined);
  assert.equal(selections.length, 1);
});

test("detail status queries only the resolved database ID and applies report expiry", async () => {
  const { exports, filters } = loadQueries({ rows: [
    { id: "real-id", name: "蝉", current_store_status: {
      display_status: "full", wait_time: "over_20", source: "reports",
      updated_at: new Date(Date.now() - 31 * 60000).toISOString()
    } }
  ] });
  const store = await exports.getStoreById("semi");
  assert.equal(store.id, "real-id");
  assert.equal(store.status, "available");
  assert.equal(store.waitTime, "no_wait");
  assert.deepEqual(filters, [{ table: "current_store_status", field: "store_id", value: "real-id" }]);
});

test("missing store never requests live status and failures never expose demo data", async () => {
  const h = loadQueries();
  assert.equal(await h.exports.getStoreById("missing"), undefined);
  assert.equal(h.filters.length, 0);
  await assert.rejects(loadQueries({ configured: false }).exports.getStoreInfoById("semi"), /not configured/);
  await assert.rejects(loadQueries({ error: { message: "denied" } }).exports.getStoreInfoById("semi"), /denied/);
  await assert.rejects(loadQueries({ error: { message: "denied" } }).exports.getStoreLiveStatus("real-id"), /denied/);
});

test("detail streams live data separately and list prefetches only to loading boundary", () => {
  const page = fs.readFileSync(path.join(__dirname, "../src/app/stores/[storeId]/page.tsx"), "utf8");
  const list = fs.readFileSync(path.join(__dirname, "../src/app/stores/page.tsx"), "utf8");
  assert.ok(page.includes('await getStoreInfoById(storeId)'));
  assert.ok(!page.includes('await getStoreById'));
  assert.equal((page.match(/<Suspense fallback=/g) ?? []).length, 3);
  assert.ok(!list.match(/href=\{`\/stores\/\$\{store.id\}`\}\s+prefetch=\{false\}/));
  assert.ok(fs.existsSync(path.join(__dirname, "../src/app/stores/[storeId]/loading.tsx")));
});
