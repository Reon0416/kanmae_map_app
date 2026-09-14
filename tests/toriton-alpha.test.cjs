/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const sharp = require("sharp");

test("toriton roof and wall stay opaque while exterior remains transparent", async () => {
  const { data, info } = await sharp(path.join(__dirname,
    "../public/maps/stores/toriton-map-opaque-v2.webp")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 1122);
  assert.equal(info.height, 1402);
  const alpha = (x, y) => data[(y * info.width + x) * 4 + 3];
  for (let y = 295; y < 330; y++) {
    for (let x = 450; x < 690; x++) assert.equal(alpha(x, y), 255, `roof ${x},${y}`);
  }
  for (let y = 450; y < 790; y++) {
    for (let x = 885; x < 940; x++) assert.equal(alpha(x, y), 255, `wall ${x},${y}`);
  }
  for (const [x, y] of [[0, 0], [1100, 1300], [240, 650]]) assert.equal(alpha(x, y), 0);
});
