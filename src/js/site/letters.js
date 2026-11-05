import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PerlinDOM from '../PerlinDom.js';
import { onRefreshJump } from './scroll.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Chapter 3: the converged title breaks into letters, each drifting on its own seed.
 *
 * Handoff with hero.js: the h1 never changes owner or node. hero.js keeps owning the h1's
 * `opacity` (its fade-in) and the field/subtitle state up to the end of its pin. At mount
 * this module splits the h1's text into glyph spans that sit exactly where the text was
 * (PerlinDOM at amplitude 0 with no target = translate(0,0)), so the split is invisible and
 * there is never a second title. A second pin of the same section starts where the hero pin
 * ends and scrubs amplitude 0 -> 1 per letter, while it fades the converged circles out
 * (from the hero's end values) so only the real letters carry the word.
 */
export function mountLetters(h1) {
  const section = h1.closest('section');
  const copy = h1.parentElement;
  const field = section.querySelector('.hero__field');
  const sub = section.querySelector('.hero__sub');
  const heroST = ScrollTrigger.getAll().find(t => t.pin === section);
  const word = h1.textContent.trim();
  const originalHTML = h1.innerHTML;

  // Screen readers get the word once (sr-only copy); the moving glyphs are aria-hidden.
  h1.textContent = '';
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = word;
  const glyphs = document.createElement('span');
  glyphs.className = 'letters';
  glyphs.setAttribute('aria-hidden', 'true');
  const letters = [...word].map((ch, i) => {
    const el = document.createElement('span');
    el.className = 'letters__glyph';
    el.textContent = ch;
    const seed = 101 + i * 37;
    el.dataset.seed = seed;
    glyphs.appendChild(el);
    return { el, seed };
  });
  h1.append(sr, glyphs);

  const line = document.createElement('p');
  line.className = 'letters__line';
  line.setAttribute('aria-hidden', 'true'); // decorative echo of the chapter, not content
  line.textContent = 'Every letter, its own seed.';
  copy.appendChild(line);

  // hero.js scrubs the field's and subtitle's opacity; a fast scroll can leave its scrub still
  // catching up while this chapter renders. Tweening the same properties would let whichever
  // renders last win, so this chapter fades wrappers around them instead.
  const wrap = (el, className) => {
    const w = document.createElement('div');
    w.className = className;
    el.before(w);
    w.appendChild(el);
    return w;
  };
  const fieldWrap = wrap(field, 'letters__fade letters__fade--field');
  const subWrap = wrap(sub, 'letters__fade');

  const instances = letters.map(({ el, seed }, i) => new PerlinDOM({
    element: el,
    x: { min: -1, max: 1 },
    y: { min: -1, max: 1 },
    speed: 0.0035 + (i % 3) * 0.0009,
    seed,
    amplitude: 0,
  }));

  // Drift ranges in px, proportional to the title size (a few tens of px).
  function layout() {
    const fs = parseFloat(getComputedStyle(h1).fontSize) || 100;
    instances.forEach(inst => {
      const rx = Math.max(fs * 0.2, 12);
      const ry = Math.max(fs * 0.38, 22);
      inst.xRange = { min: -rx, max: rx };
      inst.yRange = { min: -ry, max: ry };
    });
  }
  layout();

  // Letters are released left to right: letter i starts when p reaches its delay
  // (0 for the first, `lag` for the last) and ramps linearly so every letter reaches 1 at p = 1.
  const state = { p: 0 };
  const lag = 0.55;
  const applyAmplitude = () => {
    const n = instances.length - 1 || 1;
    instances.forEach((inst, i) => {
      const delay = (lag * i) / n;
      inst.amplitude = Math.min(1, Math.max(0, (state.p - delay) / (1 - delay)));
    });
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'ch-letters',
      trigger: section,
      // Same section, pinned again right after the hero pin (created in order, so no overlap).
      start: () => (heroST ? heroST.end : 0),
      end: () => `+=${window.innerHeight * 1.6}`,
      pin: true,
      scrub: 0.8,
      onRefresh: self => {
        layout();
        onRefreshJump(self);
      },
    },
  });
  tl.fromTo(fieldWrap, { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0)
    .fromTo(subWrap, { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.14 }, 0.02)
    .to(state, { p: 1, duration: 0.7, ease: 'power1.inOut', onUpdate: applyAmplitude }, 0.04)
    .fromTo(line, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.16 }, 0.18)
    .fromTo(h1, { '--seed-o': 0 }, { '--seed-o': 1, duration: 0.2 }, 0.3)
    // Glow and vignette end at the section's edge; fade them before it scrolls away (no seam).
    .fromTo(section, { '--hero-fx': 1 }, { '--hero-fx': 0, duration: 0.2 }, 0.78)
    .to({}, { duration: 0.04 });
  tl.progress(tl.scrollTrigger.progress);

  return {
    destroy() {
      tl.scrollTrigger?.kill(true);
      tl.kill();
      instances.forEach(inst => inst.destroy());
      fieldWrap.replaceWith(field);
      subWrap.replaceWith(sub);
      section.style.removeProperty('--hero-fx');
      line.remove();
      h1.innerHTML = originalHTML;
      h1.style.removeProperty('--seed-o');
    },
  };
}
