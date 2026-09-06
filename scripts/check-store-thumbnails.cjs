const fs = require('fs');
const path = require('path');
const Module = require('module');
const vm = require('vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const componentPath = path.resolve('src/components/stores/StoreThumbnail.tsx');
const compiled = ts.transpileModule(fs.readFileSync(componentPath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  reportDiagnostics: true
});
if (compiled.diagnostics.some(d => d.category === ts.DiagnosticCategory.Error)) throw new Error('TSX error');
const mod = new Module(componentPath, module);
mod.filename = componentPath;
mod.paths = Module._nodeModulePaths(path.dirname(componentPath));
mod._compile(compiled.outputText, componentPath);
const source = ts.createSourceFile('page.tsx', fs.readFileSync('src/app/stores/page.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let images;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'storeThumbnailImages') {
    images = vm.runInNewContext('(' + node.initializer.getText(source) + ')');
  }
  ts.forEachChild(node, visit);
}
visit(source);
const rows = Object.entries(images).map(([id, image]) => {
  const bytes = fs.readFileSync(path.join('public', image.src));
  const props = { ...image, src: 'data:image/png;base64,' + bytes.toString('base64') };
  return `<div class="row"><div class="frame" data-store="${id}">${renderToStaticMarkup(React.createElement(mod.exports.StoreThumbnail, { image: props }))}</div><span>${id}</span></div>`;
}).join('');
(async () => {
  fs.mkdirSync('output', { recursive: true });
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
  try {
    for (const width of [375, 390, 1000]) {
      const page = await browser.newPage({ viewport: { width, height: 430 }, deviceScaleFactor: 2 });
      await page.setContent(`<html><style>body{margin:12px;background:#f1f5f9;font:16px Arial}.row{display:flex;align-items:center;gap:12px;background:white;padding:12px;border-bottom:1px solid #ddd}.frame{width:122px;height:86px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:white}</style>${rows}</html>`);
      await page.locator('img').evaluateAll(imgs => Promise.all(imgs.map(i => i.decode())));
      const checks = await page.locator('[data-store]').evaluateAll((frames, images) => frames.map(frame => {
        const crop = frame.firstElementChild.getBoundingClientRect();
        const img = frame.querySelector('img');
        const meta = images[frame.dataset.store];
        const rect = img.getBoundingClientRect();
        const scale = rect.width / meta.width;
        const left = rect.left + meta.bounds.x * scale;
        const top = rect.top + meta.bounds.y * scale;
        const right = left + meta.bounds.width * scale;
        const bottom = top + meta.bounds.height * scale;
        const contained = left >= crop.left - 0.1 && top >= crop.top - 0.1 && right <= crop.right + 0.1 && bottom <= crop.bottom + 0.1;
        return { store: frame.dataset.store, width: crop.width, height: crop.height, artworkHeight: bottom-top, contained, loaded: img.complete && img.naturalWidth > 0 };
      }), images);
      if (checks.some(c => c.width !== 114 || c.height !== 78 || !c.loaded || !c.contained || Math.abs(c.artworkHeight-78)>0.1)) throw new Error(JSON.stringify(checks));
      console.log(width, checks);
      await page.screenshot({ path: `output/thumbnail-check-${width}.png` });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

