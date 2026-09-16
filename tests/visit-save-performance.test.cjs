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

const validPayload = {
  storeId: "real-id",
  waitTime: "within_5",
  location: { lat: 34.7732, lng: 135.5073 },
  visitorId: "123e4567-e89b-12d3-a456-426614174000"
};

function loadRoute({ missing = false, stampFails = false, crowdFails = false } = {}) {
  const calls = [];
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "../src/app/api/visit-records/route.ts"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, performance,
    require(name) {
      if (name === "zod") return require("zod");
      if (name === "next/server") return { NextResponse: { json: (data, options = {}) => ({ data, status: options.status ?? 200, headers: options.headers }) } };
      if (name.endsWith("wait-time-options")) return { WAIT_TIME_BUCKET: { NO_WAIT: "no_wait", WITHIN_5: "within_5", BETWEEN_5_10: "between_5_10", BETWEEN_10_20: "between_10_20", OVER_20: "over_20" } };
      if (name.endsWith("rate-limit")) return { checkRateLimit: () => ({ allowed: true }) };
      if (name.endsWith("anonymous-visitor-server")) return { hashAnonymousVisitorId: id => `hashed-${id}` };
      if (name.endsWith("store-queries")) return { async getStoreInfoById(storeId) {
        calls.push("store-info");
        assert.equal(storeId, "real-id");
        return missing ? undefined : { id: "real-id", name: "蝉", assetKey: "semi", lat: 34.7732, lng: 135.5073 };
      } };
      if (name.endsWith("supabase/server")) return { createSupabaseServerClient: async () => ({
        async rpc(name, params) {
          calls.push(name);
          if (name === "record_anonymous_visit_stamp") {
            assert.equal(params.p_visitor_hash, `hashed-${validPayload.visitorId}`);
            assert.equal(params.p_store_key, "semi");
            assert.equal(params.p_store_name, "蝉");
            assert.equal(params.p_wait_time, "within_5");
            return stampFails ? { error: {} } : { data: [{ event_id: "event", stamp_count: 3, stamped_at: "today" }] };
          }
          assert.equal(params.p_store_id, "real-id");
          assert.equal(params.p_wait_time, "within_5");
          assert.equal(params.p_visitor_hash, `hashed-${validPayload.visitorId}`);
          return { error: crowdFails ? {} : null };
        }
      }) };
      throw new Error("Unexpected module: " + name);
    }
  });
  return { calls, post: payload => exports.POST({ json: async () => payload }) };
}

test("saving records anonymous stamp and crowd wait time with the real store identity", async () => {
  const route = loadRoute();
  const result = await route.post(validPayload);
  assert.equal(result.status, 200);
  assert.equal(result.data.crowdStatusUpdated, true);
  assert.match(result.headers["Server-Timing"], /verify;dur=.*stamp;dur=.*crowd;dur=/);
  assert.deepEqual(route.calls, ["store-info", "record_anonymous_visit_stamp", "report_anonymous_crowd_wait_time"]);
});

test("invalid and unknown-store requests never write stamps", async () => {
  for (const [options, payload, status] of [
    [{}, { ...validPayload, waitTime: "invalid" }, 400],
    [{}, { ...validPayload, visitorId: "not-a-uuid" }, 400],
    [{ missing: true }, validPayload, 404]
  ]) {
    const route = loadRoute(options);
    assert.equal((await route.post(payload)).status, status);
    assert.ok(!route.calls.includes("record_anonymous_visit_stamp"));
  }
});

test("location is optional and never blocks a valid visit save", async () => {
  for (const payload of [
    { ...validPayload, location: undefined },
    { ...validPayload, location: { lat: 35.0, lng: 135.0 } }
  ]) {
    const route = loadRoute();
    const result = await route.post(payload);
    assert.equal(result.status, 200);
    assert.ok(route.calls.includes("record_anonymous_visit_stamp"));
    assert.ok(route.calls.includes("report_anonymous_crowd_wait_time"));
  }
});

test("stamp failure is not reported as success and never updates crowd status", async () => {
  const route = loadRoute({ stampFails: true });
  assert.equal((await route.post(validPayload)).status, 500);
  assert.ok(!route.calls.includes("report_anonymous_crowd_wait_time"));
});

test("a committed stamp remains successful when only crowd update fails", async () => {
  const route = loadRoute({ crowdFails: true });
  const result = await route.post(validPayload);
  assert.equal(result.status, 200);
  assert.equal(result.data.id, "event");
  assert.equal(result.data.crowdStatusUpdated, false);
  assert.equal(route.calls.filter(call => call === "record_anonymous_visit_stamp").length, 1);
});
