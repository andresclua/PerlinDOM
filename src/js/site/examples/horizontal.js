import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, span } from './shared.js';

// 2. Horizontal only: y is null, so that axis never moves.
export const OPTIONS = { x: span(100), y: null, speed: 0.02 };
export const COMMENTS = { y: 'no vertical movement' };

export const snippet = `new PerlinDOM(${literal({ element: "@document.querySelector('.slider')", ...OPTIONS }, { comments: COMMENTS })});`;

export function mount(card) {
  return group([new PerlinDOM({ element: card.querySelector('.ex-horizontal'), ...OPTIONS })]);
}
