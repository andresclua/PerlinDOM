import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickPoints } from '../src/js/site/sampleText.js';

// Build a mask with filled axis-aligned rectangles [x0, y0, x1, y1) (exclusive end).
const makeMask = (width, height, rects) => {
  const mask = new Uint8Array(width * height);
  for (const [x0, y0, x1, y1] of rects) {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) mask[y * width + x] = 1;
  }
  return mask;
};

test('returns exactly count points, all inside the bounds', () => {
  const w = 120, h = 40;
  const mask = makeMask(w, h, [[0, 0, w, h]]);
  const pts = pickPoints(mask, w, h, 300);
  assert.equal(pts.length, 300);
  for (const p of pts) {
    assert.ok(p.x >= 0 && p.x < w, `x out of range: ${p.x}`);
    assert.ok(p.y >= 0 && p.y < h, `y out of range: ${p.y}`);
  }
});

test('only picks set mask pixels', () => {
  const w = 100, h = 50;
  // Two small islands; everything else empty.
  const mask = makeMask(w, h, [[10, 10, 14, 30], [70, 5, 90, 9]]);
  const pts = pickPoints(mask, w, h, 60);
  assert.equal(pts.length, 60);
  for (const p of pts) {
    assert.equal(mask[Math.floor(p.y) * w + Math.floor(p.x)], 1, `(${p.x}, ${p.y}) is not on the mask`);
  }
});

test('spreads points across separate shapes instead of clumping', () => {
  const w = 200, h = 20;
  const mask = makeMask(w, h, [[0, 0, 20, 20], [180, 0, 200, 20]]);
  const pts = pickPoints(mask, w, h, 20);
  const left = pts.filter(p => p.x < 100).length;
  assert.ok(left >= 6 && left <= 14, `expected a balanced split, got ${left} left of 20`);
});

test('is deterministic', () => {
  const w = 64, h = 32;
  const mask = makeMask(w, h, [[4, 4, 60, 8], [4, 20, 60, 28]]);
  assert.deepEqual(pickPoints(mask, w, h, 50), pickPoints(mask, w, h, 50));
});

test('still returns count points when count exceeds the set pixels', () => {
  const w = 10, h = 10;
  const mask = makeMask(w, h, [[2, 2, 4, 4]]); // 4 pixels
  const pts = pickPoints(mask, w, h, 9);
  assert.equal(pts.length, 9);
  for (const p of pts) assert.equal(mask[Math.floor(p.y) * w + Math.floor(p.x)], 1);
});

test('returns [] for an empty mask or count 0', () => {
  assert.deepEqual(pickPoints(new Uint8Array(100), 10, 10, 30), []);
  assert.deepEqual(pickPoints(makeMask(10, 10, [[0, 0, 10, 10]]), 10, 10, 0), []);
});
