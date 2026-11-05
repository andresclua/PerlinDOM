import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, on, span } from './shared.js';

// 12 (also the API page's live demo). Each dot gets a target on a ring; the slider sets
// amplitude on all of them: 1 drifts freely, 0 pins every dot to its target.
// Static markup (reduced motion, before Play) draws the same ring in CSS (_examples.scss).
export const RING = 0.32; // radius as a share of the stage's shorter side, same as the CSS
export const RANGE = span('50%');
export const SPEED = 0.006;
export const SEED_STEP = 811;

// The options and the ring point each dot gets; mount() runs these, the snippet prints them.
export const options = i => ({ x: RANGE, y: RANGE, speed: SPEED, seed: i * SEED_STEP });
export const ringTarget = (i, count, r) => {
  const a = (i / count) * Math.PI * 2;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
};
export const COMMENTS = { target: 'px offset from the centre' };

export const snippet = `const dots = [...document.querySelectorAll('.dot')];
const r = Math.min(stage.clientWidth, stage.clientHeight) * ${RING};

const instances = dots.map((el, i) => {
  const a = (i / dots.length) * Math.PI * 2;
  return new PerlinDOM(${literal({
    element: '@el',
    ...options(0),
    seed: `@i * ${SEED_STEP}`,
    target: '@{ x: Math.cos(a) * r, y: Math.sin(a) * r }',
  }, { depth: 1, comments: COMMENTS })});
});

slider.addEventListener('input', () => {
  const amplitude = Number(slider.value);
  instances.forEach(inst => { inst.amplitude = amplitude; });
});`;

export function mount(card) {
  const stage = card.querySelector('.ex-ring');
  const dots = [...stage.querySelectorAll('.demo-dot')];
  const slider = card.querySelector('[data-amplitude]');
  const output = card.querySelector('[data-amplitude-out]');
  const instances = dots.map((el, i) => new PerlinDOM({
    element: el, ...options(i), amplitude: Number(slider.value),
  }));

  const place = () => {
    const radius = Math.min(stage.clientWidth, stage.clientHeight) * RING;
    instances.forEach((inst, i) => inst.setTarget(ringTarget(i, dots.length, radius)));
  };
  const ro = new ResizeObserver(place);
  ro.observe(stage);
  place();

  const off = on(slider, 'input', () => {
    instances.forEach(inst => { inst.amplitude = Number(slider.value); });
    output.textContent = Number(slider.value).toFixed(2);
  });
  const g = group(instances);
  return {
    ...g,
    destroy() {
      off();
      ro.disconnect();
      g.destroy();
    },
  };
}
