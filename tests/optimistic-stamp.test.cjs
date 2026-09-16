/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

function harness(file, overlayReady = false) {
  const states = [];
  let cursor = 0;
  let calls = 0;
  let resolve, reject;
  const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
  const overlay = () => null;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = overlayReady ? true : initial;
      return [states[index], value => { states[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = { current: initial };
      return states[index];
    },
    useEffect() {}
  };
  const stubs = {
    react,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': () => null,
    'next/navigation': { useRouter: () => ({ refresh() {} }) },
    'lucide-react': { CheckCircle2: 'icon', X: 'icon', Utensils: 'icon', Sparkles: 'icon' },
    '@/components/ui/button': { Button: 'button' },
    '@/components/visit-records/WaitTimeSelector': { WaitTimeSelector: 'selector' },
    '@/components/visit-records/VisitLocationNotice': { VisitLocationNotice: () => null, getVisitLocationButtonLabel: () => '記録する' },
    '@/features/stores/store-thumbnail-images': { storeThumbnailImages: {} },
    '@/features/visit-records/save-visit-record': { saveVisitRecord: () => { calls++; return pending; } },
    '@/features/visit-records/use-visit-location': {
      useVisitLocation: () => ({
        canSaveWithLocation: true,
        location: { lat: 34.7732, lng: 135.5073 },
        locationMessage: 'ready',
        requestLocation: async () => ({ lat: 34.7732, lng: 135.5073 }),
        status: 'ready'
      })
    },
    '@/features/visit-records/stamp-sound': { playStampSound: () => { throw new Error('Audio unavailable'); } },
    '@/features/visit-records/stamp-reward-loader': { prepareStampReward() {} },
    '@/features/visit-records/stamp-images': { getStampImage: () => undefined },
    '@/components/visit-records/StampRewardOverlay': { StampRewardOverlay: overlay },
    '@/features/visit-records/record-events': { OPEN_STORE_DETAIL_RECORD_EVENT: 'open', SHOW_MAP_LOCATION_ERROR_EVENT: 'location-error' },
    '@/lib/utils': { cn: (...parts) => parts.filter(Boolean).join(' ') }
  };
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true
  } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, Error, require: id => {
    assert.ok(id in stubs, `Unexpected import: ${id}`);
    return stubs[id];
  } });
  return { exports, overlay, resolve, reject, calls: () => calls,
    render(component, props) { cursor = 0; return component(props); } };
}

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('');
  return typeof tree === 'object' && tree ? text(tree.props?.children) : String(tree ?? '');
}

for (const [file, name] of [
  ['src/components/visit-records/QuickRecordPanel.tsx', 'QuickRecordPanel'],
  ['src/components/stores/StoreDetailRecordSheet.tsx', 'StoreRecordSheet']
]) {
  for (const succeeds of [true, false]) {
    test(`${name}: animation starts before save and handles ${succeeds ? 'success' : 'failure'}`, async () => {
      const h = harness(file);
      const store = { id: 'test', name: 'Test store', genre: 'ramen' };
      const props = name === 'QuickRecordPanel' ? { stores: [store] } : { store, isOpen: true, onClose() {} };
      const render = () => h.render(h.exports[name], props);
      if (name === 'QuickRecordPanel') nodes(render()).find(n => n.type === 'button').props.onClick();
      const save = nodes(render()).find(n => n.type === 'button' && text(n) === '記録する').props.onClick;
      const saving = save();
      const during = nodes(render());
      const reward = during.find(n => n.type === h.overlay);
      assert.equal(reward.props.isPending, true);
      assert.equal(during.find(n => n.type === 'button' && text(n) === '保存中').props.disabled, true);
      reward.props.onClose();
      assert.ok(nodes(render()).find(n => n.type === h.overlay));
      await save();
      assert.equal(h.calls(), 1);
      if (succeeds) h.resolve({ crowdStatusUpdated: true });
      else h.reject(new Error('Save failed'));
      await saving;
      const after = nodes(render());
      if (succeeds) {
        assert.equal(after.find(n => n.type === h.overlay).props.isPending, false);
        assert.equal(after.find(n => n.type === 'button' && text(n) === '記録しました').props.disabled, true);
      } else {
        assert.equal(after.find(n => n.type === h.overlay), undefined);
        assert.equal(after.find(n => n.type === 'button' && text(n) === '記録する').props.disabled, false);
        assert.ok(text(render()).includes('Save failed'));
      }
    });
  }
}

test('Reward cannot dismiss a pending save even after animation delay', () => {
  const h = harness('src/components/visit-records/StampRewardOverlay.tsx', true);
  let closed = 0;
  const props = { store: { id: 'test', name: 'Test' }, isPending: true, onClose: () => closed++ };
  const pending = h.render(h.exports.StampRewardOverlay, props);
  pending.props.onClick();
  pending.props.onKeyDown({ key: 'Escape' });
  assert.equal(closed, 0);
  assert.equal(nodes(pending).find(n => n.type === 'button').props.disabled, true);
  assert.equal(text(pending), '');
  const saved = h.render(h.exports.StampRewardOverlay, { ...props, isPending: false });
  saved.props.onClick();
  assert.equal(closed, 1);
  assert.equal(text(saved), '');
});
