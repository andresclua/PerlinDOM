import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, span } from './shared.js';

// 1. Basic animation. The orb's CSS transform (scale + skew) is kept: PerlinDOM only adds a translate.
export const OPTIONS = { x: span(50), y: span(50), speed: 0.01, seed: 123 };

export const snippet = `// .orb { transform: scale(3.5) skewX(120deg); } stays as it is
new PerlinDOM(${literal({ element: "@document.querySelector('.orb')", ...OPTIONS })});`;

export function mount(card) {
  return group([new PerlinDOM({ element: card.querySelector('.ex-basic'), ...OPTIONS })]);
}
