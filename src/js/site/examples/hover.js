import PerlinDOM from '../../PerlinDom.js';
import { literal, setSnippet } from '../snippet.js';
import { on, span } from './shared.js';

// 5. Smooth pause / play from mouse events; lerpSpeed sets how soft the ease is.
export const OPTIONS = { x: span(80), y: span(80), speed: 0.01, seed: 7, lerpSpeed: 0.05 };
// Event names shared by the snippet and the code below.
export const EVENTS = { play: 'mouseenter', pause: 'mouseleave' };

export const code = lerpSpeed => `const orb = new PerlinDOM(${literal({
  element: "@document.querySelector('.orb')", ...OPTIONS, lerpSpeed,
})});

const stage = document.querySelector('.stage');
stage.addEventListener('${EVENTS.play}', () => orb.play());
stage.addEventListener('${EVENTS.pause}', () => orb.pause());

// The slider: lower = softer, slower transitions
slider.addEventListener('input', () => {
  orb.lerpSpeed = Number(slider.value);
});`;

export const snippet = code(OPTIONS.lerpSpeed);

// Owns its controls (hover + its own Pause / Play button), so it returns destroy only.
export function mount(card) {
  const stage = card.querySelector('.ex-hover');
  const button = card.querySelector('[data-hover-toggle]');
  const slider = card.querySelector('[data-lerp]');
  const output = card.querySelector('[data-lerp-out]');
  const status = card.querySelector('[data-hover-status]');
  const meter = card.querySelector('.ex-meter');
  const pre = card.querySelector('pre');
  const orb = new PerlinDOM({
    element: stage.querySelector('.ex-orb'), ...OPTIONS, lerpSpeed: Number(slider.value),
  });

  const render = () => {
    button.querySelector('span').textContent = orb.isPlaying ? 'Pause' : 'Play';
    button.dataset.state = orb.isPlaying ? 'playing' : 'paused';
    status.textContent = orb.isPlaying ? 'Playing' : 'Paused';
  };
  const play = () => { orb.play(); render(); };
  const pause = () => { orb.pause(); render(); };

  // The meter shows the eased speed factor (1 = full speed, 0 = stopped).
  let raf = requestAnimationFrame(function frame() {
    meter.style.setProperty('--f', orb.lerpFactor.toFixed(3));
    raf = requestAnimationFrame(frame);
  });

  const offs = [
    on(stage, EVENTS.play, play),
    on(stage, EVENTS.pause, pause),
    on(button, 'click', () => (orb.isPlaying ? pause() : play())),
    on(slider, 'input', () => {
      orb.lerpSpeed = Number(slider.value);
      output.textContent = orb.lerpSpeed.toFixed(2);
      setSnippet(pre, code(orb.lerpSpeed));
    }),
  ];
  render();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach(off => off());
      orb.destroy();
      meter.style.removeProperty('--f');
      status.textContent = '';
    },
  };
}
