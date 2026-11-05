import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onRefreshJump } from './scroll.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * One scrubbed timeline over the whole page that animates `--bg-a` / `--bg-b`.
 * `getStops()` returns [{ at: scrollPx, a, b }] in scroll order; between two stops the colours
 * interpolate. Stops depend on pin positions, so the timeline is rebuilt after every refresh.
 *
 * The properties live on an empty fixed layer behind the page (.backdrop), not on :root:
 * an inherited custom property changed on :root restyles every element (300+ hero dots) each
 * frame. Measured scrolling the whole story: style recalc 1.77 s -> about 0.6 s.
 */
export function mountBackdrop(getStops) {
  const root = document.createElement('div');
  root.className = 'backdrop';
  root.setAttribute('aria-hidden', 'true');
  document.body.prepend(root);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const st = ScrollTrigger.create({ start: 0, end: 'max', animation: tl, scrub: 0.6 });

  function build() {
    const max = ScrollTrigger.maxScroll(window) || 1;
    const stops = getStops();
    tl.clear();
    let prev = stops[0];
    let prevAt = 0;
    tl.set(root, { '--bg-a': prev.a, '--bg-b': prev.b }, 0);
    for (const s of stops.slice(1)) {
      const at = Math.min(1, Math.max(prevAt, s.at / max));
      tl.fromTo(
        root,
        { '--bg-a': prev.a, '--bg-b': prev.b },
        { '--bg-a': s.a, '--bg-b': s.b, duration: Math.max(at - prevAt, 0.0001), immediateRender: false },
        prevAt,
      );
      prev = s;
      prevAt = at;
    }
    if (prevAt < 1) tl.to({}, { duration: 1 - prevAt }, prevAt);
    onRefreshJump(st);
  }

  build();
  ScrollTrigger.addEventListener('refresh', build);

  return {
    destroy() {
      ScrollTrigger.removeEventListener('refresh', build);
      st.kill();
      tl.kill();
      root.remove();
    },
  };
}
