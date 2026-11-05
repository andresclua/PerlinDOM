import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, span } from './shared.js';

// 4. Background effect: big, blurred, very slow shapes behind real content.
export const OPTIONS = { x: span(110), y: span(110), speed: 0.002 };
export const SEED_SPREAD = 2000; // seed: Math.random() * SEED_SPREAD
export const COMMENTS = { speed: 'very slow' };

export const snippet = `document.querySelectorAll('.glow').forEach(el => {
  new PerlinDOM(${literal(
    { element: '@el', ...OPTIONS, seed: `@Math.random() * ${SEED_SPREAD}` },
    { depth: 1, comments: COMMENTS },
  )});
});`;

export function mount(card) {
  const els = [...card.querySelectorAll('.ex-glow')];
  return group(els.map(el => new PerlinDOM({ element: el, ...OPTIONS, seed: Math.random() * SEED_SPREAD })));
}
