import PerlinDOM from '../../PerlinDom.js';
import { literal, setSnippet } from '../snippet.js';
import { on, span } from './shared.js';

// 6. Interactive controls. Ranges and speed are plain writable properties, changed live;
// a new seed means a new path, so that one builds a fresh instance.
const DEFAULTS = { x: 50, y: 50, speed: 0.01, seed: 0 };

const options = v => ({ x: span(v.x), y: span(v.y), speed: v.speed, seed: v.seed });
const code = v => `const inst = new PerlinDOM(${literal({ element: "@document.querySelector('.dot')", ...options(v) })});

// Ranges and speed can change while it runs
inst.xRange = ${literal(span(v.x))};
inst.speed = ${v.speed};`;

export const snippet = code(DEFAULTS);

export function mount(card) {
  const el = card.querySelector('.ex-controls .demo-dot');
  const pre = card.querySelector('pre');
  const inputs = Object.fromEntries(
    [...card.querySelectorAll('input[data-key]')].map(input => [input.dataset.key, input]),
  );
  const read = () => Object.fromEntries(Object.entries(inputs).map(([k, input]) => [k, Number(input.value)]));
  let paused = false;
  let inst = new PerlinDOM({ element: el, ...options(read()) });

  const onInput = e => {
    const v = read();
    const key = e.target.dataset.key;
    if (key === 'seed') {
      inst.destroy();
      inst = new PerlinDOM({ element: el, ...options(v) });
      if (paused) inst.pause();
    } else {
      inst.xRange = span(v.x);
      inst.yRange = span(v.y);
      inst.speed = v.speed;
    }
    const shown = { x: `±${v.x}px`, y: `±${v.y}px`, speed: v.speed.toFixed(3), seed: v.seed };
    e.target.closest('.field').querySelector('output').textContent = shown[key];
    setSnippet(pre, code(v));
  };
  const offs = Object.values(inputs).map(input => on(input, 'input', onInput));

  return {
    pause() { paused = true; inst.pause(); },
    play() { paused = false; inst.play(); },
    destroy() {
      offs.forEach(off => off());
      inst.destroy();
    },
  };
}
