import PerlinDOM from '../../PerlinDom.js';
import { group } from './shared.js';

// 3. Five elements, one seed each: same code, five different paths.
const SEED_STEP = 16700;
const options = i => ({
  x: { min: -100, max: 100 + i * 20 },
  y: { min: -100, max: 120 },
  speed: 0.002 + i * 0.001,
  seed: i * SEED_STEP,
});

export const snippet = `document.querySelectorAll('.blob').forEach((el, i) => {
  new PerlinDOM({
    element: el,
    x: { min: -100, max: 100 + i * 20 },
    y: { min: -100, max: 120 },
    speed: 0.002 + i * 0.001,
    seed: i * ${SEED_STEP}, // a different seed per element
  });
});`;

export function mount(card) {
  const els = [...card.querySelectorAll('.ex-blob')];
  return group(els.map((el, i) => new PerlinDOM({ element: el, ...options(i) })));
}
