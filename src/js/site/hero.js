import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PerlinDOM from '../PerlinDom.js';
import { sampleText } from './sampleText.js';
import { createDot, mulberry32 } from './dots.js';

gsap.registerPlugin(ScrollTrigger);

const COUNT_DESKTOP = 300;
const COUNT_MOBILE = 60;

/**
 * Hero: translucent circles drift with Perlin noise, then converge on the title as the
 * pinned section is scrolled. GSAP only tweens `amplitude`; PerlinDOM owns `transform`.
 *
 * `still` (reduced motion / static page): the end state only. Circles sit on their text
 * points (what amplitude 0 renders), title and subtitle visible; no PerlinDOM, no pin.
 */
export function mountHero(root, { still = false } = {}) {
  const field = root.querySelector('.hero__field');
  const title = root.querySelector('.hero__title');
  const sub = root.querySelector('.hero__sub');
  const hint = root.querySelector('.hero__hint');
  const word = title.textContent.trim().toUpperCase();

  // Count is fixed at mount; a later resize across 768px keeps it (layout still adapts).
  const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP;
  const rand = mulberry32(20261105);
  const dots = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const d = createDot(rand);
    frag.appendChild(d.el);
    dots.push({ ...d, inst: null });
  }
  field.appendChild(frag);

  let scale = 1;
  const instances = still ? [] : dots.map((d, i) => {
    d.inst = new PerlinDOM({
      element: d.el,
      x: { min: -1, max: 1 }, // real range set in layout()
      y: { min: -1, max: 1 },
      speed: 0.0022 + d.depth * 0.004 + rand() * 0.0015,
      seed: i * 7919 + 17,
    });
    return d.inst;
  });

  // Sizes, base positions, drift ranges and text targets for the current viewport.
  function layout() {
    const w = root.clientWidth;
    const h = root.clientHeight;
    scale = Math.min(1, Math.max(0.75, w / 1440));
    for (const d of dots) {
      const s = d.size * scale;
      const r = (40 + d.depth * 110) * scale;
      d.el.style.setProperty('--s', `${s.toFixed(1)}px`);
      d.el.style.left = `${(d.u * w).toFixed(1)}px`;
      d.el.style.top = `${(d.v * h).toFixed(1)}px`;
      if (d.inst) {
        d.inst.xRange = { min: -r, max: r };
        d.inst.yRange = { min: -r, max: r };
      }
    }

    const cs = getComputedStyle(title);
    const rootRect = root.getBoundingClientRect();
    const rect = title.getBoundingClientRect();
    const spacing = parseFloat(cs.letterSpacing) || 0;
    const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const points = sampleText(word, font, rect.width + spacing, count, { letterSpacing: `${spacing}px` });
    const ox = rect.left - rootRect.left;
    const oy = rect.top - rootRect.top;
    points.forEach((p, i) => {
      const d = dots[i];
      const x = ox + p.x - d.u * w;
      const y = oy + p.y - d.v * h;
      if (d.inst) d.inst.setTarget({ x, y });
      else d.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  }

  // First layout right away (fallback font metrics if the webfont is not ready yet),
  // so dots never sit stacked at 0,0; it is redone once fonts resolve.
  layout();

  if (still) return mountStill({ layout, title, word, dots });

  const state = { amp: 1 };
  const applyAmplitude = () => {
    for (let i = 0; i < instances.length; i++) instances[i].amplitude = state.amp;
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=180%',
      pin: true,
      scrub: 0.8,
      // On every refresh (load, scroll restore, fonts, resize) jump straight to the scroll
      // position instead of letting the scrub ease there from wherever it was.
      onRefresh: self => {
        self.getTween()?.progress(1);
        self.animation?.progress(self.progress);
      },
    },
  });
  tl.to(hint, { opacity: 0, duration: 0.08 }, 0)
    .to(state, { amp: 0, duration: 0.72, ease: 'power2.inOut', onUpdate: applyAmplitude }, 0)
    .to(field, { opacity: 0.7, duration: 0.18 }, 0.74)
    .fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0.74)
    .fromTo(sub, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.16 }, 0.82)
    .to({}, { duration: 0.06 });
  // Apply the saved scroll position now (fresh trigger, or one already refreshed before the tweens existed).
  tl.progress(tl.scrollTrigger.progress);

  let destroyed = false;
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  const relayout = () => {
    if (destroyed) return;
    // Refresh first: while pinned, the pin holds the old px size until ScrollTrigger re-measures.
    // layout() only moves absolutely positioned dots, so no second refresh is needed.
    ScrollTrigger.refresh();
    lastW = window.innerWidth;
    lastH = window.innerHeight;
    layout();
  };

  // Sample only once the webfont is ready, otherwise the fallback font's glyphs get traced.
  const cs = getComputedStyle(title);
  document.fonts.load(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, word)
    .catch(() => {})
    .then(() => document.fonts.ready)
    .then(relayout);

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth !== lastW || window.innerHeight !== lastH) relayout();
    }, 150);
  };
  window.addEventListener('resize', onResize);

  return {
    destroy() {
      destroyed = true;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      tl.scrollTrigger?.kill(true);
      tl.kill();
      instances.forEach(inst => inst.destroy());
      dots.forEach(d => d.el.remove());
      hint.style.opacity = '';
      field.style.opacity = '';
      sub.style.transform = '';
      // Leave the real title readable once the effect is gone.
      title.style.opacity = '1';
      sub.style.opacity = '1';
    },
  };
}

// Static hero: same layout, re-run when the webfont lands or the viewport changes.
function mountStill({ layout, title, word, dots }) {
  let destroyed = false;
  const relayout = () => { if (!destroyed) layout(); };
  const cs = getComputedStyle(title);
  document.fonts.load(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, word)
    .catch(() => {})
    .then(() => document.fonts.ready)
    .then(relayout);
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayout, 150);
  };
  window.addEventListener('resize', onResize);
  return {
    destroy() {
      destroyed = true;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      dots.forEach(d => d.el.remove());
    },
  };
}
