import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLayoutResize } from '../src/js/site/viewport.js';

const prev = { w: 390, h: 844 };

test('a width change always relayouts', () => {
  assert.equal(isLayoutResize(prev, { w: 400, h: 844 }, true), true);
  assert.equal(isLayoutResize(prev, { w: 400, h: 844 }, false), true);
});

test('orientation change (width/height swap) relayouts on touch', () => {
  assert.equal(isLayoutResize(prev, { w: 844, h: 390 }, true), true);
});

test('small height-only change on touch is ignored (mobile toolbar)', () => {
  assert.equal(isLayoutResize(prev, { w: 390, h: 760 }, true), false);
  assert.equal(isLayoutResize(prev, { w: 390, h: 924 }, true), false);
});

test('large height-only change on touch relayouts', () => {
  assert.equal(isLayoutResize(prev, { w: 390, h: 500 }, true), true);
});

test('small height change on desktop still relayouts', () => {
  assert.equal(isLayoutResize({ w: 1440, h: 900 }, { w: 1440, h: 860 }, false), true);
});

test('no change is not a resize', () => {
  assert.equal(isLayoutResize(prev, { ...prev }, false), false);
  assert.equal(isLayoutResize(prev, { ...prev }, true), false);
});
