import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Same pattern as hero.js: on every refresh (load, scroll restore, fonts, resize) jump the
// scrubbed animation straight to the scroll position instead of easing there from wherever it was.
export function onRefreshJump(self) {
  self.getTween()?.progress(1);
  self.animation?.progress(self.progress);
}

/**
 * Pin lengths are in viewport heights, so a height change moves every chapter in px.
 * Keep the reader at the same point of the story (same share of the page) instead.
 */
export function keepStoryPositionOnResize() {
  let h = window.innerHeight;
  let max = ScrollTrigger.maxScroll(window);
  let ratio = 0;
  const before = () => { ratio = max ? window.scrollY / max : 0; };
  const after = () => {
    const nextMax = ScrollTrigger.maxScroll(window);
    if (window.innerHeight !== h && max) window.scrollTo(0, Math.round(ratio * nextMax));
    h = window.innerHeight;
    max = nextMax;
  };
  ScrollTrigger.addEventListener('refreshInit', before);
  ScrollTrigger.addEventListener('refresh', after);
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', before);
    ScrollTrigger.removeEventListener('refresh', after);
  };
}
