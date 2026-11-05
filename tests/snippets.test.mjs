// The examples' snippets are built from the same config the demos run. These checks fail
// if a snippet stops printing a config value, or if a comment silently stops being inserted.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const ex = name => import(`../src/js/site/examples/${name}.js`);
const { literal } = await import('../src/js/site/snippet.js');

// Every option key/value of `options` appears in `snippet` exactly as literal() prints it.
function assertOptions(snippet, options, label) {
  for (const [key, value] of Object.entries(options)) {
    const expected = `${key}: ${literal(value)}`;
    assert.ok(snippet.includes(expected), `${label}: snippet lacks "${expected}"\n${snippet}`);
  }
}

test('literal() prints raw code, inline small objects and per-key comments', () => {
  assert.equal(literal({ min: -5, max: 5 }), '{ min: -5, max: 5 }');
  assert.equal(literal('@el'), 'el');
  assert.equal(literal('10%'), "'10%'");
  const out = literal({ a: 1, b: null }, { comments: { b: 'why' } });
  assert.equal(out, '{\n  a: 1,\n  b: null, // why\n}');
});

test('comments are really inserted into the snippets that declare them', async () => {
  for (const name of ['horizontal', 'background', 'triangle', 'amplitude']) {
    const mod = await ex(name);
    for (const [key, comment] of Object.entries(mod.COMMENTS)) {
      const line = mod.snippet.split('\n').find(l => l.trim().startsWith(`${key}:`));
      assert.ok(line, `${name}: no "${key}:" line`);
      assert.ok(line.endsWith(`, // ${comment}`), `${name}: comment for ${key} missing: ${line}`);
    }
  }
});

test('single-config examples print every option value', async () => {
  for (const name of ['basic', 'horizontal', 'background', 'hover', 'resizable', 'triangle']) {
    const mod = await ex(name);
    assertOptions(mod.snippet, mod.OPTIONS, name);
  }
  const triangle = await ex('triangle');
  assert.ok(triangle.snippet.includes(`const apex = ${literal(triangle.TOP)};`));
  assert.ok(triangle.snippet.includes(triangle.REST));
  const background = await ex('background');
  assert.ok(background.snippet.includes(`seed: Math.random() * ${background.SEED_SPREAD}`));
});

test('event wiring in the snippets uses the names the demos listen to', async () => {
  const hover = await ex('hover');
  assert.ok(hover.snippet.includes(`addEventListener('${hover.EVENTS.play}', () => orb.play())`));
  assert.ok(hover.snippet.includes(`addEventListener('${hover.EVENTS.pause}', () => orb.pause())`));
  assert.ok(hover.code(0.15).includes('lerpSpeed: 0.15,'), 'hover: live lerpSpeed not printed');
  const button = await ex('button');
  assertOptions(button.snippet, button.OPTIONS, 'button');
  assert.ok(button.snippet.includes(`seed: i * ${button.SEED_STEP}`));
  for (const type of button.EVENTS.start) assert.ok(button.snippet.includes(`addEventListener('${type}', start)`));
  for (const type of button.EVENTS.stop) assert.ok(button.snippet.includes(`addEventListener('${type}', stop)`));
});

test('seeds: the snippet prints the same rule options(i) runs', async () => {
  const { RULE, options, snippet } = await ex('seeds');
  assert.ok(snippet.includes(`x: { min: ${RULE.x.min}, max: ${RULE.x.max} + i * ${RULE.x.grow} }`));
  assert.ok(snippet.includes(`y: { min: ${RULE.y.min}, max: ${RULE.y.max} }`));
  assert.ok(snippet.includes(`speed: ${RULE.speed.base} + i * ${RULE.speed.step}`));
  assert.ok(snippet.includes(`seed: i * ${RULE.seedStep}`));
  // and options(i) evaluates those expressions
  assert.deepEqual(options(2), {
    x: { min: RULE.x.min, max: RULE.x.max + 2 * RULE.x.grow },
    y: { min: RULE.y.min, max: RULE.y.max },
    speed: RULE.speed.base + 2 * RULE.speed.step,
    seed: 2 * RULE.seedStep,
  });
});

test('controls: the live snippet follows the slider values', async () => {
  const { code, DEFAULTS, snippet } = await ex('controls');
  assert.equal(snippet, code(DEFAULTS));
  const live = code({ x: 80, y: 20, speed: 0.033, seed: 500 });
  for (const s of ['x: { min: -80, max: 80 }', 'y: { min: -20, max: 20 }', 'speed: 0.033', 'seed: 500']) {
    assert.ok(live.includes(s), `controls: missing ${s}`);
  }
});

test('panes (px vs %, mixed) print each pane config', async () => {
  for (const name of ['units', 'mixed']) {
    const { configs, snippet } = await ex(name);
    for (const c of configs) {
      assert.ok(snippet.includes(`// ${c.comment}`));
      assert.ok(snippet.includes(`document.querySelector('${c.selector}')`));
      assertOptions(snippet, c.options, `${name} ${c.selector}`);
    }
  }
});

test('amplitude: options and ring constants appear in the snippet', async () => {
  const { RING, SEED_STEP, options, ringTarget, snippet } = await ex('amplitude');
  const { seed, ...rest } = options(0);
  assertOptions(snippet, rest, 'amplitude');
  assert.equal(seed, 0);
  assert.ok(snippet.includes(`* ${RING};`));
  assert.ok(snippet.includes(`seed: i * ${SEED_STEP}`));
  assert.ok(snippet.includes('target: { x: Math.cos(a) * r, y: Math.sin(a) * r }'));
  const t = ringTarget(3, 12, 100); // a quarter turn
  assert.ok(Math.abs(t.x) < 1e-9 && Math.abs(t.y - 100) < 1e-9);
});
