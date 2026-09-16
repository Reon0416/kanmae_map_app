/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const vm = require("node:vm");

test("visit distance validation accepts nearby coordinates and rejects distant ones", () => {
  const exports = {};
  const source = fs.readFileSync(
    path.join(__dirname, "../src/features/visit-records/validate-location.ts"),
    "utf8"
  );
  vm.runInNewContext(
    ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, Math }
  );

  const store = { lat: 34.7734, lng: 135.5061 };
  assert.equal(exports.validateVisitLocation(store, store).isValid, true);
  assert.equal(exports.validateVisitLocation({ lat: 34.7834, lng: 135.5061 }, store).isValid, false);
});

test("visit API no longer rejects saves because of distance validation", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/app/api/visit-records/route.ts"), "utf8");
  const stampIndex = source.indexOf('supabase.rpc("record_anonymous_visit_stamp"');

  assert.ok(stampIndex >= 0);
  assert.doesNotMatch(source, /validateVisitLocation\(body\.data\.location/);
  assert.doesNotMatch(source, /店舗付近でのみ来店記録できます/);
  assert.doesNotMatch(source, /status: 403/);
});

test("location guidance covers Safari denial and precise-location failures", () => {
  const hook = fs.readFileSync(
    path.join(__dirname, "../src/features/visit-records/use-visit-location.ts"),
    "utf8"
  );
  const notice = fs.readFileSync(
    path.join(__dirname, "../src/components/visit-records/VisitLocationNotice.tsx"),
    "utf8"
  );

  assert.match(hook, /PERMISSION_DENIED/);
  assert.match(hook, /POSITION_UNAVAILABLE|position_unavailable/);
  assert.match(hook, /TIMEOUT/);
  assert.match(hook, /coords\.accuracy > 500/);
  assert.match(notice, /Webサイトの設定/);
  assert.match(notice, /正確な位置情報/);
  assert.match(notice, /位置情報や移動履歴は保存しません/);
});
