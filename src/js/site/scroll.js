import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { currentViewport, isLayoutResize } from './viewport.js';

// Same pattern as hero.js: on every refresh (load, scroll restore, fonts, resize) jump the
// scrubbed animation straight to the scroll position instead of easing there from wherever it was.
export function onRefreshJump(self) {
  self.getTween()?.progress(1);
  self.animation?.progress(self.progress);
}

const SCROLL_KEY = 'perlindom:story-scroll';

/**
 * The page is only tall once the pins exist (their spacers are created by JS), so the
 * browser's own restoration can run against a short page and clamp the position, sometimes to 0.
 * We take restoration over: `history.scrollRestoration = 'manual'` (also set inline in <head>
 * before anything loads), the position is saved on pagehide, and `restore()` is called after
 * every chapter has created its pins. Only reloads and back/forward restore; a fresh visit
 * starts at the top.
 */
export function manageScrollRestoration() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const type = performance.getEntriesByType?.('navigation')?.[0]?.type;
  let saved = NaN;
  if (type === 'reload' || type === 'back_forward') {
    try { saved = Number(sessionStorage.getItem(SCROLL_KEY)); } catch { /* storage blocked */ }
  }
  const save = () => {
    try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY))); } catch { /* storage blocked */ }
  };
  window.addEventListener('pagehide', save);
  const onHidden = () => { if (document.visibilityState === 'hidden') save(); };
  document.addEventListener('visibilitychange', onHidden);

  return function restore() {
    if (!(saved > 0)) return;
    // Measure first: a pin created moments ago may not have its spacing yet, and scrolling
    // against that shorter page would clamp the position (seen as landing at the finale's start).
    ScrollTrigger.refresh();
    window.scrollTo(0, saved);
    // Then every chapter's onRefresh jumps its animation to the restored position, synchronously.
    ScrollTrigger.refresh();
  };
}

/**
 * Pin lengths are in viewport heights, so a height change moves every chapter in px.
 * Keep the reader at the same point of the story (same share of the page) instead.
 */
export function keepStoryPositionOnResize() {
  // Nothing is trusted until one refresh has measured the finished pins: before that, `max`
  // may describe the page without its pin spacers and the ratio would be meaningless.
  let ready = false;
  let w = 0;
  let h = 0;
  let max = 0;
  let y = 0;
  let ratio = null;
  // The live scrollY is not trusted at refreshInit: while the viewport resizes, the browser can
  // clamp it against the reflowed page first. Only positions read at the measured size count.
  // A mobile toolbar show/hide (small height-only change on touch) is not a resize here either:
  // positions read through it still count, and it never moves the reader.
  const touchOnly = ScrollTrigger.isTouch === 1;
  const sameLayout = () => !isLayoutResize({ w, h }, currentViewport(), touchOnly);
  const onScroll = () => {
    if (sameLayout()) y = window.scrollY;
  };
  const before = () => { ratio = ready && max > 0 ? y / max : null; };
  const after = () => {
    const nextMax = ScrollTrigger.maxScroll(window);
    if (ready && ratio !== null && window.innerHeight !== h && !sameLayout() && nextMax > 0) {
      window.scrollTo(0, Math.round(ratio * nextMax));
    }
    w = window.innerWidth;
    h = window.innerHeight;
    max = nextMax;
    y = window.scrollY;
    ready = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  ScrollTrigger.addEventListener('refreshInit', before);
  ScrollTrigger.addEventListener('refresh', after);
  return () => {
    window.removeEventListener('scroll', onScroll);
    ScrollTrigger.removeEventListener('refreshInit', before);
    ScrollTrigger.removeEventListener('refresh', after);
  };
}
