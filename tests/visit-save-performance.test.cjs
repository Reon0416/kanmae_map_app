/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

test("only the self-authenticating visit POST skips duplicate middleware authentication", async () => {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "../middleware.ts"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "key" } },
    require(name) {
      if (name === "next/server") return { NextResponse: { next: () => "next" } };
      if (name.endsWith("auth-config")) return {};
      if (name === "@supabase/ssr") return { createServerClient() { throw new Error("auth still runs"); } };
      throw new Error(name);
    }
  });
  const request = { method: "POST", nextUrl: { pathname: "/api/visit-records" } };
  assert.equal(await exports.middleware(request), "next");
  await assert.rejects(exports.middleware({ ...request, method: "GET" }), /auth still runs/);
  await assert.rejects(exports.middleware({ ...request, nextUrl: { pathname: "/api/stamps" } }), /auth still runs/);
});

function loadRoute({ user = { id: "owner" }, missing = false, stampFails = false, crowdFails = false } = {}) {
  const calls = [];
  let authStarted = false;
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "../src/app/api/visit-records/route.ts"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, performance,
    require(name) {
      if (name === "zod") return require("zod");
      if (name === "next/server") return { NextResponse: { json: (data, options = {}) => ({ data, status: options.status ?? 200, headers: options.headers }) } };
      if (name.endsWith("wait-time-options")) return { WAIT_TIME_BUCKET: { NO_WAIT: "no_wait", WITHIN_5: "within_5", BETWEEN_5_10: "between_5_10", BETWEEN_10_20: "between_10_20", OVER_20: "over_20" } };
      if (name.endsWith("rate-limit")) return { checkRateLimit: () => ({ allowed: true }) };
      if (name.endsWith("store-queries")) return { async getStoreSummaries() {
        calls.push("summaries");
        await Promise.resolve();
        assert.ok(authStarted, "authentication and catalogue lookup must start concurrently");
        return missing ? [] : [{ id: "real-id", name: "蝉", assetKey: "semi" }];
      } };
      if (name.endsWith("supabase/server")) return { createSupabaseServerClient: async () => ({
        auth: { async getUser() { authStarted = true; calls.push("auth"); return { data: { user }, error: null }; } },
        async rpc(name, params) {
          calls.push(name);
          if (name === "record_visit_stamp") {
            assert.equal(params.p_store_key, "semi");
            return stampFails ? { error: {} } : { data: [{ event_id: "event", stamp_count: 3, stamped_at: "today" }] };
          }
          assert.equal(params.p_store_id, "real-id");
          return { error: crowdFails ? {} : null };
        }
      }) };
      throw new Error("Unexpected module: " + name);
    }
  });
  return { calls, post: payload => exports.POST({ json: async () => payload }) };
}

test("saving uses parallel lean lookup, authenticates and records real store identity", async () => {
  const route = loadRoute();
  const result = await route.post({ storeId: "real-id", waitTime: "within_5" });
  assert.equal(result.status, 200);
  assert.equal(result.data.crowdStatusUpdated, true);
  assert.match(result.headers["Server-Timing"], /verify;dur=.*stamp;dur=.*crowd;dur=/);
  assert.deepEqual(route.calls, ["summaries", "auth", "record_visit_stamp", "report_crowd_wait_time"]);
});

test("invalid, anonymous and unknown-store requests never write stamps", async () => {
  for (const [options, payload, status] of [
    [{}, { storeId: "real-id", waitTime: "invalid" }, 400],
    [{ user: null }, { storeId: "real-id", waitTime: "within_5" }, 401],
    [{ missing: true }, { storeId: "real-id", waitTime: "within_5" }, 404]
  ]) {
    const route = loadRoute(options);
    assert.equal((await route.post(payload)).status, status);
    assert.ok(!route.calls.includes("record_visit_stamp"));
  }
});

test("stamp failure is not reported as success and never updates crowd status", async () => {
  const route = loadRoute({ stampFails: true });
  assert.equal((await route.post({ storeId: "real-id", waitTime: "within_5" })).status, 500);
  assert.ok(!route.calls.includes("report_crowd_wait_time"));
});

test("a committed stamp remains successful when only crowd update fails", async () => {
  const route = loadRoute({ crowdFails: true });
  const result = await route.post({ storeId: "real-id", waitTime: "within_5" });
  assert.equal(result.status, 200);
  assert.equal(result.data.id, "event");
  assert.equal(result.data.crowdStatusUpdated, false);
  assert.equal(route.calls.filter(call => call === "record_visit_stamp").length, 1);
});
