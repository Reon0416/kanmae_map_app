/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function load(file, modules = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX
  } }).outputText, { exports, Date, require: id => {
    assert.ok(id in modules, id);
    return modules[id];
  } });
  return exports;
}

test('stamp snapshots are user-isolated, expire and clear on logout', () => {
  const cache = load('src/features/visit-records/stamp-snapshot.ts');
  const value = { userId: 'a', stores: [], stampData: { totalStampCount: 43 }, fetchedAt: 1000 };
  let updates = 0;
  const stop = cache.subscribeStampSnapshot(() => updates++);
  cache.rememberStampSnapshot(value);
  assert.equal(cache.readStampSnapshot('a', 1000), value);
  assert.equal(cache.readStampSnapshot('b', 1000), null);
  assert.equal(cache.readStampSnapshot('a', 999), null);
  assert.equal(cache.readStampSnapshot('a', 300999), value);
  assert.equal(cache.readStampSnapshot('a', 301000), null);
  cache.clearStampSnapshot();
  assert.equal(cache.readStampSnapshot('a', 1001), null);
  assert.equal(updates, 2);
  stop();
  cache.clearStampSnapshot();
  assert.equal(updates, 2);
});

test('pending my page reuses the same user card; fresh response and updates replace it', () => {
  const cache = load('src/features/visit-records/stamp-snapshot.ts');
  const ui = load('src/components/my/CachedStampContent.tsx', {
    react: { useCallback: fn => fn, useSyncExternalStore: (_subscribe, read) => read() },
    'react/jsx-runtime': require('react/jsx-runtime'),
    './VisitStampCard': { VisitStampCard: 'card' },
    '@/features/visit-records/stamp-snapshot': cache
  });
  const cached = { userId: 'a', stores: [], stampData: { totalStampCount: 43 }, fetchedAt: Date.now() };
  cache.rememberStampSnapshot(cached);
  const pending = ui.CachedStampContent({ userId: 'a' });
  assert.equal(pending.type, 'card');
  assert.equal(pending.props.initialStampData.totalStampCount, 43);
  assert.equal(pending.props.onStampDataChange, undefined);
  assert.notEqual(ui.CachedStampContent({ userId: 'b' }).type, 'card');
  const fresh = ui.CachedStampContent({ userId: 'a', value: { ...cached, stampData: { totalStampCount: 44 } } });
  assert.equal(fresh.props.initialStampData.totalStampCount, 44);
  fresh.props.onStampDataChange({ totalStampCount: 45 });
  assert.equal(cache.readStampSnapshot('a').stampData.totalStampCount, 45);
  fresh.props.onStampDataChange(null);
  assert.equal(cache.readStampSnapshot('a'), null);
});

test('cached fallback is only rendered after server verifies identity; auth entry points clear memory', () => {
  const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const page = read('src/app/my/page.tsx');
  assert.ok(page.indexOf('await getSupabaseServerUser()') < page.indexOf('fallback={<CachedStampContent'));
  assert.ok(page.includes('if (!user || error)'));
  for (const file of ['src/components/auth/AuthForm.tsx', 'src/components/auth/SignOutButton.tsx']) {
    assert.ok(read(file).includes('clearStampSnapshot();'));
  }
  const cache = read('src/features/visit-records/stamp-snapshot.ts');
  assert.ok(!/sessionStorage|localStorage/.test(cache));
});
