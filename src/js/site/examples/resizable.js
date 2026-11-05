import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, on, span } from './shared.js';

// 10. A resizable container: percentage ranges follow its size on the next frame.
const OPTIONS = { x: span('25%'), y: span('25%'), speed: 0.008, seed: 456 };

export const snippet = `new PerlinDOM(${literal({ element: "@document.querySelector('.dot')", ...OPTIONS })});
// No resize handling needed: % is read from the parent's size every frame`;

export function mount(card) {
  const box = card.querySelector('.ex-resizable');
  const slider = card.querySelector('[data-width]');
  const output = card.querySelector('[data-width-out]');
  const caption = card.querySelector('[data-resolved]');
  const g = group([new PerlinDOM({ element: box.querySelector('.demo-dot'), ...OPTIONS })]);

  // Drag handle (CSS resize) for pointers, the slider for everyone.
  const off = on(slider, 'input', () => {
    box.style.width = `${slider.value}%`;
    output.textContent = `${slider.value}%`;
  });
  const ro = new ResizeObserver(() => {
    const w = box.clientWidth;
    const h = box.clientHeight;
    caption.textContent = `${w} × ${h}px · range ±${Math.round(w * 0.25)} × ±${Math.round(h * 0.25)}px`;
  });
  ro.observe(box);

  return {
    ...g,
    destroy() {
      off();
      ro.disconnect();
      caption.textContent = '';
      g.destroy();
    },
  };
}
