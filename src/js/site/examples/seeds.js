import PerlinDOM from '../../PerlinDom.js';
import { group } from './shared.js';

// 3. Five elements, one seed each: same code, five different paths.
// Every number lives here; options(i) runs them and the snippet prints the same expressions.
export const RULE = {
  x: { min: -100, max: 100, grow: 20 }, // max grows by `grow` per element
  y: { min: -100, max: 120 },
  speed: { base: 0.002, step: 0.001 },
  seedStep: 16700,
};

export const options = i => ({
  x: { min: RULE.x.min, max: RULE.x.max + i * RULE.x.grow },
  y: { min: RULE.y.min, max: RULE.y.max },
  speed: RULE.speed.base + i * RULE.speed.step,
  seed: i * RULE.seedStep,
});

export const snippet = `document.querySelectorAll('.blob').forEach((el, i) => {
  new PerlinDOM({
    element: el,
    x: { min: ${RULE.x.min}, max: ${RULE.x.max} + i * ${RULE.x.grow} },
    y: { min: ${RULE.y.min}, max: ${RULE.y.max} },
    speed: ${RULE.speed.base} + i * ${RULE.speed.step},
    seed: i * ${RULE.seedStep}, // a different seed per element
  });
});`;

export function mount(card) {
  const els = [...card.querySelectorAll('.ex-blob')];
  return group(els.map((el, i) => new PerlinDOM({ element: el, ...options(i) })));
}
