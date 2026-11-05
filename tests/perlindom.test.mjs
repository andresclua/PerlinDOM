import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let pending;
let nextId;
let loads = 0;

beforeEach(() => {
  pending = new Map();
  nextId = 1;
  globalThis.window = {
    getComputedStyle: () => ({ position: 'relative', transform: 'none' }),
    addEventListener() {},
    removeEventListener() {},
  };
  globalThis.requestAnimationFrame = cb => {
    const id = nextId++;
    pending.set(id, cb);
    return id;
  };
  globalThis.cancelAnimationFrame = id => pending.delete(id);
  delete globalThis.IntersectionObserver;
});

// Fresh module instance per test so module-level state does not leak.
const load = async () => (await import(`../src/js/PerlinDom.js?t=${loads++}`)).default;

const runFrame = () => {
  const cbs = [...pending.values()];
  pending.clear();
  cbs.forEach(cb => cb(0));
};

const fakeEl = () => ({ style: {}, parentElement: null });
const opts = el => ({ element: el, x: { min: -10, max: 10 }, y: { min: -10, max: 10 }, speed: 0.3 });

test('one rAF callback serves two instances', async () => {
  const PerlinDOM = await load();
  const a = fakeEl();
  const b = fakeEl();
  new PerlinDOM(opts(a));
  new PerlinDOM(opts(b));
  assert.equal(pending.size, 1);
  runFrame();
  assert.ok(a.style.transform);
  assert.ok(b.style.transform);
  assert.equal(pending.size, 1);
});

test('destroy during a frame does not skip others', async () => {
  const PerlinDOM = await load();
  const a = fakeEl();
  const b = fakeEl();
  const instA = new PerlinDOM(opts(a));
  new PerlinDOM(opts(b));
  const origStep = instA.step.bind(instA);
  instA.step = () => {
    origStep();
    instA.destroy();
  };
  runFrame();
  assert.ok(b.style.transform);
  assert.equal(a.style.transform, '');
});

test('loop stops when no instance is active', async () => {
  const PerlinDOM = await load();
  const inst = new PerlinDOM(opts(fakeEl()));
  inst.destroy();
  assert.equal(pending.size, 0);
});

test('play after full pause restarts the loop', async () => {
  const PerlinDOM = await load();
  const el = fakeEl();
  const inst = new PerlinDOM({ ...opts(el), lerpSpeed: 1 });
  inst.pause();
  runFrame();
  assert.equal(pending.size, 0);
  inst.play();
  assert.equal(pending.size, 1);
  runFrame();
  assert.ok(el.style.transform);
});

test('offscreen instances skip stepping when IntersectionObserver exists', async () => {
  let observerCb;
  globalThis.IntersectionObserver = class {
    constructor(cb) { observerCb = cb; }
    observe() {}
    unobserve() {}
  };
  const PerlinDOM = await load();
  const el = fakeEl();
  new PerlinDOM(opts(el));
  observerCb([{ target: el, isIntersecting: false }]);
  runFrame();
  assert.equal(el.style.transform, undefined);
  observerCb([{ target: el, isIntersecting: true }]);
  runFrame();
  assert.ok(el.style.transform);
});
