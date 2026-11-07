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
  const inst = new PerlinDOM({ ...opts(el), seed: 3, legacyNoise: true, target: { x: 40, y: -25 } });
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

/* ---------- offscreen pause, shared observation, loop robustness ---------- */

// IntersectionObserver stub: records observe/unobserve calls, exposes the callback.
const stubObserver = () => {
  const io = { cb: null, observed: [], unobserved: [] };
  globalThis.IntersectionObserver = class {
    constructor(cb) { io.cb = cb; }
    observe(t) { io.observed.push(t); }
    unobserve(t) { io.unobserved.push(t); }
  };
  return io;
};

test('offscreen element renders a catch-up frame when amplitude changes', async () => {
  const io = stubObserver();
  const PerlinDOM = await load();
  const el = fakeEl();
  const inst = new PerlinDOM({ ...opts(el), seed: 3, legacyNoise: true, target: { x: 40, y: -25 } });
  runFrame();
  // Its own drift carried it out: the observer now reports it not intersecting.
  io.cb([{ target: el, isIntersecting: false }]);
  const frozen = el.style.transform;
  runFrame();
  assert.equal(el.style.transform, frozen);
  inst.amplitude = 0;
  runFrame();
  assert.equal(inst.lastX, 40);
  assert.equal(inst.lastY, -25);
  assert.match(el.style.transform, /^translate3d\(40px, -25px/);
});

test('offscreen element renders a catch-up frame when setTarget is called', async () => {
  const io = stubObserver();
  const PerlinDOM = await load();
  const el = fakeEl();
  const inst = new PerlinDOM({ ...opts(el), amplitude: 0, target: { x: 40, y: -25 } });
  runFrame();
  io.cb([{ target: el, isIntersecting: false }]);
  inst.setTarget({ x: 5, y: 6 });
  runFrame();
  assert.equal(inst.lastX, 5);
  assert.equal(inst.lastY, 6);
});

test('offscreen at rest with unchanged amplitude and target is not stepped', async () => {
  const io = stubObserver();
  const PerlinDOM = await load();
  const el = fakeEl();
  const inst = new PerlinDOM({ ...opts(el), amplitude: 0.5, target: { x: 40, y: -25 } });
  runFrame();
  io.cb([{ target: el, isIntersecting: false }]);
  inst.amplitude = 0.5; // same value: not a change
  inst.setTarget({ x: 40, y: -25 }); // same target: not a change
  const t = inst.time;
  runFrame();
  runFrame();
  assert.equal(inst.time, t);
  assert.equal(pending.size, 1); // still in the loop, ready to resume
});

test('visibility is measured on the parent box, not the drifting element', async () => {
  const io = stubObserver();
  const PerlinDOM = await load();
  const parent = {};
  const el = { style: {}, parentElement: parent };
  const inst = new PerlinDOM(opts(el));
  assert.deepEqual(io.observed, [parent]);
  io.cb([{ target: parent, isIntersecting: false }]);
  const t = inst.time;
  runFrame();
  assert.equal(inst.time, t);
  io.cb([{ target: parent, isIntersecting: true }]);
  runFrame();
  assert.ok(inst.time > t);
});

test('instances sharing an observed box all get visibility updates', async () => {
  const io = stubObserver();
  const PerlinDOM = await load();
  const el = fakeEl();
  const a = new PerlinDOM(opts(el));
  const b = new PerlinDOM(opts(el));
  io.cb([{ target: el, isIntersecting: false }]);
  assert.equal(a.onScreen, false);
  assert.equal(b.onScreen, false);
  // A late joiner inherits the box's known state.
  const c = new PerlinDOM(opts(el));
  assert.equal(c.onScreen, false);
  a.destroy();
  c.destroy();
  assert.deepEqual(io.unobserved, []);
  io.cb([{ target: el, isIntersecting: true }]);
  assert.equal(b.onScreen, true);
  b.destroy();
  assert.deepEqual(io.unobserved, [el]);
});

test('pauseOffscreen: false never observes and always steps', async () => {
  const io = stubObserver();
  const PerlinDOM = await load();
  const el = fakeEl();
  new PerlinDOM({ ...opts(el), pauseOffscreen: false });
  assert.deepEqual(io.observed, []);
  runFrame();
  assert.ok(el.style.transform);
});

test('an instance created inside a step does not start a second rAF chain', async () => {
  const PerlinDOM = await load();
  const a = new PerlinDOM(opts(fakeEl()));
  const origStep = a.step.bind(a);
  let made = false;
  a.step = () => {
    if (!made) { made = true; new PerlinDOM(opts(fakeEl())); }
    return origStep();
  };
  runFrame();
  assert.equal(pending.size, 1);
  runFrame();
  assert.equal(pending.size, 1);
});

test('A destroying B within the same frame: B does not step', async () => {
  const PerlinDOM = await load();
  const a = new PerlinDOM(opts(fakeEl()));
  const bEl = fakeEl();
  const b = new PerlinDOM(opts(bEl));
  const origStep = a.step.bind(a);
  a.step = () => { b.destroy(); return origStep(); };
  const t = b.time;
  runFrame();
  assert.equal(b.time, t);
  assert.equal(bEl.style.transform, '');
});

test('destroy restores the original inline transform', async () => {
  const PerlinDOM = await load();
  const el = { style: { transform: 'rotate(5deg)' }, parentElement: null };
  const inst = new PerlinDOM(opts(el));
  runFrame();
  assert.match(el.style.transform, /^translate3d/);
  inst.destroy();
  assert.equal(el.style.transform, 'rotate(5deg)');
});

test('init() again restarts playback after a full pause', async () => {
  const PerlinDOM = await load();
  const el = fakeEl();
  const inst = new PerlinDOM({ ...opts(el), lerpSpeed: 1 });
  inst.pause();
  runFrame();
  assert.equal(pending.size, 0);
  inst.init(5);
  assert.equal(inst.isPlaying, true);
  assert.equal(pending.size, 1);
  const t = inst.time;
  runFrame();
  assert.ok(inst.time > t);
});

test('default noise is not flat at the start (seed 42)', async () => {
  const PerlinDOM = await load();
  const a = new PerlinDOM({ ...opts(fakeEl()), seed: 42 });
  const b = new PerlinDOM({ ...opts(fakeEl()), seed: 42, legacyNoise: true });
  for (let i = 0; i < 5; i++) { a.step(); b.step(); }
  assert.notEqual(a.lastX, b.lastX);
  assert.ok(Math.abs(a.lastX) > 0.01 || Math.abs(a.lastY) > 0.01);
});

test('reset rewinds the noise path and restores the element', async () => {
  const PerlinDOM = await load();
  const el = fakeEl();
  const inst = new PerlinDOM({ ...opts(el), seed: 5 });
  const path = () => Array.from({ length: 4 }, () => (inst.step(), inst.lastX));
  const first = path();
  inst.reset();
  assert.equal(el.style.transform, '');
  assert.equal(inst.lastX, 0);
  assert.deepEqual(path(), first);
});

test('reset while playing re-arms the loop; paused stays paused; destroyed is a no-op', async () => {
  const PerlinDOM = await load();
  const a = fakeEl();
  const playing = new PerlinDOM(opts(a));
  for (let i = 0; i < 30; i++) runFrame(); // let nothing else interfere
  playing.reset();
  runFrame();
  assert.ok(a.style.transform);

  const b = fakeEl();
  const paused = new PerlinDOM(opts(b));
  paused.pause();
  for (let i = 0; i < 80; i++) runFrame();
  paused.reset();
  b.style.transform = 'sentinel';
  runFrame();
  assert.equal(b.style.transform, 'sentinel'); // not stepping: still paused
  paused.play();
  runFrame();
  assert.notEqual(b.style.transform, 'sentinel');

  const c = fakeEl();
  const gone = new PerlinDOM(opts(c));
  gone.destroy();
  gone.reset();
  runFrame();
  assert.equal(c.style.transform, '');
});
