/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function loadStampQueries(user, events = []) {
  const calls = [];
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "../src/features/visit-records/stamp-queries.ts"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    require(name) {
      if (name.endsWith("stamp-card-config")) return { STAMP_EVENT_FETCH_LIMIT: 36 };
      if (name.endsWith("supabase/server")) return {
        getSupabaseServerUser: async () => ({ data: { user }, error: null }),
        createSupabaseServerClient: async () => ({ from(table) {
          calls.push(table);
          const result = Promise.resolve({ data: table === "stamp_events" ? events : [{ store_key: "semi", stamp_count: events.length }], error: null });
          const query = {
            select() { return query; },
            eq(key, value) { assert.equal(key, "user_id"); assert.equal(value, user.id); return query; },
            order() { return query; },
            limit(value) { assert.equal(value, 36); return query; },
            then: result.then.bind(result)
          };
          return query;
        } })
      };
      throw new Error(name);
    }
  });
  return { exports, calls };
}

test("anonymous stamp requests do not query personal tables", async () => {
  const { exports, calls } = loadStampQueries(null);
  assert.equal(await exports.getCurrentUserStampData(), null);
  assert.equal(calls.length, 0);
});

test("display payload omits unused metadata without losing stamps or ordinal order", async () => {
  const { exports, calls } = loadStampQueries({ id: "owner" }, [
    { id: "new", store_key: "semi", store_name: "蝉", created_at: "2026-09-14" },
    { id: "old", store_key: "semi", store_name: "蝉", created_at: "2026-09-13" }
  ]);
  const full = await exports.getCurrentUserStampData();
  const lean = exports.toStampDisplayData(full);
  assert.equal(lean.totalStampCount, 2);
  assert.deepEqual(Array.from(lean.cardStamps, stamp => stamp.stampOrdinal), [1, 2]);
  assert.equal(lean.cardStamps[0].storeName, "蝉");
  assert.equal("id" in lean.cardStamps[0], false);
  assert.equal("stampedAt" in lean.cardStamps[0], false);
  assert.equal("lastStampedAt" in lean.stores[0], false);
  assert.ok(JSON.stringify(lean).length < JSON.stringify(full).length);
  assert.equal(calls.length, 2);
  assert.equal(exports.toStampDisplayData(null), null);
});
