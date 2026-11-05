import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { on, span } from './shared.js';

// 7. A button whose glow circles drift while it is hovered or focused.
const options = i => ({ x: span(15), y: span(15), speed: 0.007, seed: i * 1000, lerpSpeed: 0.1 });

export const snippet = `const button = document.querySelector('.glow-button');
const circles = [...button.querySelectorAll('.circle')];
let animations = [];

function start() {
  if (!animations.length) {
    animations = circles.map((el, i) => new PerlinDOM(${literal({ element: '@el', ...options(0), seed: '@i * 1000' }, 2)}));
  }
  animations.forEach(anim => anim.play());
}
const stop = () => animations.forEach(anim => anim.pause());

button.addEventListener('mouseenter', start);
button.addEventListener('focus', start);
button.addEventListener('mouseleave', stop);
button.addEventListener('blur', stop);`;

// Hover and focus are its controls, nothing moves otherwise: destroy only, no Pause / Play.
export function mount(card) {
  const button = card.querySelector('.ex-button');
  const circles = [...button.querySelectorAll('.ex-button__circle')];
  let animations = [];
  const start = () => {
    if (!animations.length) animations = circles.map((el, i) => new PerlinDOM({ element: el, ...options(i) }));
    animations.forEach(anim => anim.play());
  };
  const stop = () => animations.forEach(anim => anim.pause());
  const offs = [
    on(button, 'mouseenter', start),
    on(button, 'focus', start),
    on(button, 'mouseleave', stop),
    on(button, 'blur', stop),
  ];
  return {
    destroy() {
      offs.forEach(off => off());
      animations.forEach(anim => anim.destroy());
    },
  };
}
