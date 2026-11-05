import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { on, span } from './shared.js';

// 7. A button whose glow circles drift while it is hovered or focused.
export const SEED_STEP = 1000;
export const OPTIONS = { x: span(15), y: span(15), speed: 0.007, lerpSpeed: 0.1 };
const options = i => ({ ...OPTIONS, seed: i * SEED_STEP });
// Names shared by the snippet and the code below.
export const EVENTS = { start: ['mouseenter', 'focus'], stop: ['mouseleave', 'blur'] };

export const snippet = `const button = document.querySelector('.glow-button');
const circles = [...button.querySelectorAll('.circle')];
let animations = [];

function start() {
  if (!animations.length) {
    animations = circles.map((el, i) => new PerlinDOM(${literal({ element: '@el', ...OPTIONS, seed: `@i * ${SEED_STEP}` }, { depth: 2 })}));
  }
  animations.forEach(anim => anim.play());
}
const stop = () => animations.forEach(anim => anim.pause());

${EVENTS.start.map(type => `button.addEventListener('${type}', start);`).join('\n')}
${EVENTS.stop.map(type => `button.addEventListener('${type}', stop);`).join('\n')}`;

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
    ...EVENTS.start.map(type => on(button, type, start)),
    ...EVENTS.stop.map(type => on(button, type, stop)),
  ];
  return {
    destroy() {
      offs.forEach(off => off());
      animations.forEach(anim => anim.destroy());
    },
  };
}
