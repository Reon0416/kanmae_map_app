/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, modules = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020
  } }).outputText;
  vm.runInNewContext(compiled, { exports, Date, require: id => {
    assert.ok(id in modules, `Unexpected import: ${id}`);
    return modules[id];
  } });
  return exports;
}

function setup() {
  const cache = load('src/features/stores/store-status-snapshot.ts');
  const ui = load('src/components/stores/CachedStoreStatus.tsx', {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: { useCallback: fn => fn, useEffect() {}, useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot() },
    '@/features/stores/store-status-snapshot': cache,
    '@/components/stores/StoreStatusBadge': { StoreStatusBadge: 'badge' },
    '@/components/stores/WaitTimeLabel': { WaitTimeLabel: 'wait' },
    '@/lib/utils': { formatRelativeTime: value => value }
  });
  return { cache, ui };
}

test('snapshots are store-specific, expire after 60 seconds and reject future timestamps', () => {
  const { cache } = setup();
  const a = { id: 'a', status: 'full', waitTime: 'over_20', lastUpdatedAt: 'original', fetchedAt: 1000 };
  const b = { ...a, id: 'b', status: 'available' };
  cache.rememberStoreStatuses([a, b]);
  assert.equal(cache.readStoreStatusSnapshot('a', 1001), a);
  assert.equal(cache.readStoreStatusSnapshot('b', 1001), b);
  assert.equal(cache.readStoreStatusSnapshot('missing', 1001), null);
  assert.equal(cache.readStoreStatusSnapshot('a', 60999), a);
  assert.equal(cache.readStoreStatusSnapshot('a', 61000), null);
  assert.equal(cache.readStoreStatusSnapshot('a', 999), null);
});

test('older navigation payloads do not overwrite a newer snapshot; listeners unsubscribe', () => {
  const { cache } = setup();
  let updates = 0;
  const stop = cache.subscribeStoreStatuses(() => updates++);
  const newer = { id: 'a', status: 'full', waitTime: 'over_20', lastUpdatedAt: 'new', fetchedAt: 2000 };
  cache.rememberStoreStatuses([newer]);
  cache.rememberStoreStatuses([{ ...newer, fetchedAt: 1000, status: 'available' }]);
  assert.equal(cache.readStoreStatusSnapshot('a', 2001), newer);
  assert.equal(updates, 2);
  stop();
  cache.rememberStoreStatuses([newer]);
  assert.equal(updates, 2);
});

test('all three pending fields show list values before fresh results arrive', () => {
  const { cache, ui } = setup();
  const cached = { id: 'a', status: 'full', waitTime: 'over_20', lastUpdatedAt: 'original-update-time', fetchedAt: Date.now() };
  cache.rememberStoreStatuses([cached]);
  const render = (field, props = {}) => ui.CachedStoreStatus({ storeId: 'a', field, ...props });
  assert.equal(render('badge').props.children.props.status, 'full');
  assert.equal(render('waitTime').props.children.props.waitTime, 'over_20');
  assert.equal(render('updatedAt').props.children, 'original-update-time');
  assert.ok(render('badge').props.title.includes('確認中'));
  const fresh = { ...cached, status: 'available', waitTime: 'no_wait', lastUpdatedAt: 'new-update-time' };
  assert.equal(render('badge', { value: fresh }).props.children.props.status, 'available');
  assert.equal(render('waitTime', { value: fresh }).props.children.props.waitTime, 'no_wait');
  assert.equal(render('updatedAt', { value: fresh }).props.children, 'new-update-time');
  assert.equal(render('badge', { value: fresh }).props.title, undefined);
  assert.ok(render('badge', { failed: true }).props.title.includes('取得できませんでした'));
});

test('direct entry and expired snapshots do not invent availability; missing rows override cache', () => {
  const { cache, ui } = setup();
  const render = props => ui.CachedStoreStatus({ storeId: 'a', field: 'waitTime', ...props });
  assert.equal(render({}).props['aria-label'], '読み込み中');
  cache.rememberStoreStatuses([{ id: 'a', status: 'full', waitTime: 'over_20', lastUpdatedAt: 'old', fetchedAt: Date.now() - 61000 }]);
  assert.equal(render({}).props['aria-label'], '読み込み中');
  assert.equal(render({ failed: true }).props.children, '取得できませんでした');
  cache.rememberStoreStatuses([{ id: 'a', status: 'full', waitTime: 'over_20', lastUpdatedAt: 'new', fetchedAt: Date.now() }]);
  assert.equal(render({ value: null }).props.children, '未確認');
});
