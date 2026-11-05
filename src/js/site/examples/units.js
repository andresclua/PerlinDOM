import PerlinDOM from '../../PerlinDom.js';
import { literal } from '../snippet.js';
import { group, span } from './shared.js';

// 9 and 11. Two panes side by side, each with its own options. Percentages are of the
// parent's size, re-read every frame; each pane's caption shows what they resolve to.
export function panes(configs) {
  const snippet = configs
    .map(({ comment, selector, options }) => `// ${comment}\nnew PerlinDOM(${literal({ element: `@document.querySelector('${selector}')`, ...options })});`)
    .join('\n\n');

  function mount(card) {
    const els = [...card.querySelectorAll('.ex-pane .demo-dot')];
    const insts = els.map((el, i) => new PerlinDOM({ element: el, ...configs[i].options }));
    const captions = [...card.querySelectorAll('[data-resolved]')];
    const px = (v, size) => (typeof v === 'string' ? Math.round((parseFloat(v) / 100) * size) : v);
    const ro = new ResizeObserver(() => els.forEach((el, i) => {
      const { x, y } = configs[i].options;
      const pane = el.parentElement;
      captions[i].textContent = `x ±${px(x.max, pane.clientWidth)}px · y ±${px(y.max, pane.clientHeight)}px`;
    }));
    els.forEach(el => ro.observe(el.parentElement));
    const g = group(insts);
    return {
      ...g,
      destroy() {
        ro.disconnect();
        captions.forEach(c => { c.textContent = ''; });
        g.destroy();
      },
    };
  }

  return { snippet, mount, configs };
}

export const { snippet, mount, configs } = panes([
  {
    comment: 'Pixels: the same distance at any size',
    selector: '.dot-px',
    options: { x: span(50), y: span(50), speed: 0.01, seed: 123 },
  },
  {
    comment: 'Percentages: a share of the parent, so it scales with it',
    selector: '.dot-percent',
    options: { x: span('20%'), y: span('20%'), speed: 0.01, seed: 123 },
  },
]);
