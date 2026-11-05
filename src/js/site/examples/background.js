import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, span } from './shared.js';

// 4. Background effect: big, blurred, very slow shapes behind real content.
const OPTIONS = { x: span(110), y: span(110), speed: 0.002 };

export const snippet = `document.querySelectorAll('.glow').forEach(el => {
  new PerlinDOM(${literal({ element: '@el', ...OPTIONS, seed: '@Math.random() * 2000' }, 1)
    .replace('speed: 0.002,', 'speed: 0.002, // very slow')});
});`;

export function mount(card) {
  const els = [...card.querySelectorAll('.ex-glow')];
  return group(els.map(el => new PerlinDOM({ element: el, ...OPTIONS, seed: Math.random() * 2000 })));
}
