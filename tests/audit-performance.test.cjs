/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, modules, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020
  } }).outputText;
  vm.runInNewContext(compiled, { exports, AbortController, ...globals, require: id => {
    assert.ok(id in modules, id);
    return modules[id];
  } });
  return exports;
}

test('stamp API sends display-only data and never publicly caches it', async () => {
  for (const authenticated of [true, false]) {
    let conversions = 0;
    const route = load('src/app/api/stamps/route.ts', {
      'next/server': { NextResponse: { json: (data, options) => ({ data, options }) } },
      '@/features/visit-records/stamp-queries': {
        getCurrentUserStampData: async () => authenticated ? { privateUnused: 'unused' } : null,
        toStampDisplayData: () => { conversions++; return { totalStampCount: 12, stores: [], cardStamps: [] }; }
      }
    });
    const response = await route.GET();
    if (authenticated) {
      assert.equal(response.data.totalStampCount, 12);
      assert.equal(response.data.privateUnused, undefined);
      assert.equal(response.options.headers['Cache-Control'], 'private, no-store');
      assert.equal(conversions, 1);
    } else {
      assert.equal(response.options.status, 401);
      assert.equal(conversions, 0);
    }
  }
});

function stampHarness() {
  const states = [];
  const effects = [];
  const requests = [];
  const listeners = new Map();
  let cursor = 0;
  const ui = load('src/components/my/VisitStampCard.tsx', {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], value => { states[index] = value; }];
      },
      useRef: initial => ({ current: initial }),
      useMemo: fn => fn(),
      useEffect: fn => effects.push(fn)
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': 'image',
    'next/link': 'link',
    'lucide-react': { Loader2: 'loader', LogIn: 'login', Sparkles: 'sparkles' },
    '@/features/visit-records/stamp-card-config': { getCurrentStampCardNumber: () => 1, STAMPS_PER_CARD: 12 },
    '@/features/visit-records/stamp-images': { getStampImage: () => null },
    '@/lib/utils': { cn: (...parts) => parts.filter(Boolean).join(' ') }
  }, {
    window: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
    fetch: (_url, options) => new Promise(resolve => requests.push({ resolve, options }))
  });
  const props = { stores: [], initialStampData: { totalStampCount: 1, stores: [], cardStamps: [] } };
  const render = () => { cursor = 0; return ui.VisitStampCard(props); };
  render();
  const cleanup = effects[1]();
  return { render, requests, cleanup, update: () => listeners.get('kanmae:visit-record-created')() };
}

test('stamp refresh keeps the card visible and coalesces repeated events with one trailing refresh', async () => {
  const h = stampHarness();
  const first = h.update();
  h.update();
  h.update();
  assert.equal(h.requests.length, 1);
  assert.equal(h.render().props['aria-busy'], true);
  assert.equal(h.render().props['data-image-callout-disabled'], true);
  h.requests[0].resolve({ status: 200, ok: true, json: async () => ({ totalStampCount: 2, stores: [], cardStamps: [] }) });
  await first;
  assert.equal(h.requests.length, 2);
  h.requests[1].resolve({ status: 200, ok: true, json: async () => ({ totalStampCount: 3, stores: [], cardStamps: [] }) });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.render().props['aria-busy'], false);
  h.cleanup();
});

test('leaving my page aborts its pending refresh and does not enqueue another request', async () => {
  const h = stampHarness();
  const first = h.update();
  h.update();
  h.cleanup();
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.requests[0].resolve({ status: 200, ok: true });
  await first;
  assert.equal(h.requests.length, 1);
});

test('map background is memoized independently of panning offsets', () => {
  let memoCalls = 0;
  load('src/components/map/StoreMap.tsx', {
    react: { memo: fn => { memoCalls++; return fn; } },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': 'image',
    'lucide-react': {},
    '@/constants/wait-time-options': {},
    '@/lib/map/map-layout': {},
    '@/lib/map/map-config': {}
  });
  assert.equal(memoCalls, 1);
});
