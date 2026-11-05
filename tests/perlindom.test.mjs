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

test('amplitude 0 lands on target', async () => {
  const PerlinDOM = await load();
  const inst = new PerlinDOM({ ...opts(fakeEl()), amplitude: 0, target: { x: 40, y: -25 } });
  runFrame();
  assert.equal(inst.lastX, 40);
  assert.equal(inst.lastY, -25);
});

test('amplitude 1 equals previous behavior', async () => {
  const PerlinDOM = await load();
  const el = fakeEl();
  // Values captured from the implementation before amplitude existed.
  const inst = new PerlinDOM({ ...opts(el), seed: 3, target: { x: 40, y: -25 } });
  for (let i = 0; i < 7; i++) inst.step();
  assert.equal(inst.lastX, -0.9914399999999883);
  assert.equal(inst.lastY, -1.068479999999985);
  assert.match(el.style.transform, /^translate3d\(-0\.99/);
});

test('amplitude clamps and ignores NaN', async () => {
  const PerlinDOM = await load();
  const inst = new PerlinDOM(opts(fakeEl()));
  assert.equal(inst.amplitude, 1);
  inst.amplitude = 5;
  assert.equal(inst.amplitude, 1);
  inst.amplitude = -2;
  assert.equal(inst.amplitude, 0);
  inst.amplitude = 0.4;
  assert.equal(inst.amplitude, 0.4);
  inst.amplitude = NaN;
  assert.equal(inst.amplitude, 1);
});

test('setTarget(null) returns to origin at amplitude 0', async () => {
  const PerlinDOM = await load();
  const inst = new PerlinDOM({ ...opts(fakeEl()), amplitude: 0, target: { x: 40, y: -25 } });
  runFrame();
  assert.equal(inst.lastX, 40);
  inst.setTarget(null);
  runFrame();
  assert.equal(inst.lastX, 0);
  assert.equal(inst.lastY, 0);
});

test('bad target values degrade to 0 and stay finite', async () => {
  const PerlinDOM = await load();
  for (const amplitude of [0, 0.5]) {
    const el = fakeEl();
    const inst = new PerlinDOM({
      ...opts(el),
      seed: 3,
      amplitude,
      target: { x: NaN, y: Infinity },
    });
    inst.step();
    assert.ok(Number.isFinite(inst.lastX) && Number.isFinite(inst.lastY));
    assert.doesNotMatch(el.style.transform, /NaN|Infinity/);
    inst.setTarget({ x: '40', y: undefined });
    inst.step();
    assert.ok(Number.isFinite(inst.lastX) && Number.isFinite(inst.lastY));
    assert.deepEqual(inst.target, { x: 0, y: 0 });
    inst.setTarget('junk');
    assert.equal(inst.target, null);
  }
});

test('amplitude 0.5 lands midway between target and noise', async () => {
  const PerlinDOM = await load();
  const free = new PerlinDOM({ ...opts(fakeEl()), seed: 3 });
  const half = new PerlinDOM({ ...opts(fakeEl()), seed: 3, amplitude: 0.5, target: { x: 40, y: -20 } });
  free.step();
  half.step();
  assert.ok(Math.abs(half.lastX - (40 + (free.lastX - 40) / 2)) < 1e-12);
  assert.ok(Math.abs(half.lastY - (-20 + (free.lastY + 20) / 2)) < 1e-12);
});

test('amplitude written at runtime changes the next output', async () => {
  const PerlinDOM = await load();
  const inst = new PerlinDOM({ ...opts(fakeEl()), seed: 3, target: { x: 40, y: -25 } });
  inst.step();
  assert.notEqual(inst.lastX, 40);
  inst.amplitude = 0;
  inst.step();
  assert.equal(inst.lastX, 40);
  assert.equal(inst.lastY, -25);
});

test('NaN or non-number after 0.4 resets amplitude to 1', async () => {
  const PerlinDOM = await load();
  const inst = new PerlinDOM(opts(fakeEl()));
  inst.amplitude = 0.4;
  inst.amplitude = NaN;
  assert.equal(inst.amplitude, 1);
  inst.amplitude = 0.4;
  inst.amplitude = null;
  assert.equal(inst.amplitude, 1);
});

test('mutating the caller target object does not move the element', async () => {
  const PerlinDOM = await load();
  const mine = { x: 40, y: -25 };
  const inst = new PerlinDOM({ ...opts(fakeEl()), amplitude: 0, target: mine });
  mine.x = 999;
  inst.step();
  assert.equal(inst.lastX, 40);
});
