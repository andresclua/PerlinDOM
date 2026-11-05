import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, on, span } from './shared.js';

// 12 (also the API page's live demo). Each dot gets a target on a ring; the slider sets
// amplitude on all of them: 1 drifts freely, 0 pins every dot to its target.
// Static markup (reduced motion, before Play) draws the same ring in CSS (_examples.scss).
const RING = 0.32; // radius as a share of the stage's shorter side, same as the CSS
const RANGE = span('50%');
const SPEED = 0.006;
const SEED_STEP = 811;

export const snippet = `const dots = [...document.querySelectorAll('.dot')];
const r = Math.min(stage.clientWidth, stage.clientHeight) * ${RING};

const instances = dots.map((el, i) => {
  const a = (i / dots.length) * Math.PI * 2;
  return new PerlinDOM({
    element: el,
    x: ${literal(RANGE)},
    y: ${literal(RANGE)},
    speed: ${SPEED},
    seed: i * ${SEED_STEP},
    // px offset from the dot's base position (the centre)
    target: { x: Math.cos(a) * r, y: Math.sin(a) * r },
  });
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
    element: el,
    x: RANGE,
    y: RANGE,
    speed: SPEED,
    seed: i * SEED_STEP,
    amplitude: Number(slider.value),
  }));

  const place = () => {
    const radius = Math.min(stage.clientWidth, stage.clientHeight) * RING;
    instances.forEach((inst, i) => {
      const angle = (i / dots.length) * Math.PI * 2;
      inst.setTarget({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    });
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
