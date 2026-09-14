const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function loadQueries({ rows = [], error = null, configured = true, production = true } = {}) {
  const selections = [];
  const input = fs.readFileSync(path.join(__dirname, "../src/features/stores/store-queries.ts"), "utf8");
  const output = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    process: { env: { NODE_ENV: production ? "production" : "development" } },
    require(name) {
      if (name === "react") return { cache: fn => fn };
      if (name === "@/lib/map/map-config") return { latLngToMapPosition: () => ({ x: 0, y: 0 }) };
      if (name === "@/lib/supabase/server") return {
        hasSupabaseEnvironment: () => configured,
        createSupabaseServerClient: async () => ({
          from: () => ({
            select(fields) {
              selections.push(fields);
              return { order: async () => ({ data: rows, error }) };
            }
          })
        })
      };
      throw new Error("Unexpected module: " + name);
    }
  });
  return { exports, selections };
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
  assert.match(selections[0], /current_store_status/);
  assert.equal(store.status, "full");
  assert.equal(store.waitTime, "over_20");
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
