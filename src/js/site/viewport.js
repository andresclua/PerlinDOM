/**
 * Whether a viewport change from `prev` to `next` ({ w, h } in px) should relayout the story.
 *
 * On touch-only devices the browser toolbar showing/hiding changes `innerHeight` mid-scroll.
 * Relayouting (and refreshing pins, and restoring the scroll position) on that makes the page
 * jump. So there, a height-only change counts only when it is larger than 25% of the new height:
 * the same rule as ScrollTrigger's `ignoreMobileResize`, so we relayout whenever it refreshes.
 * Width changes (including orientation swaps) always count; on other devices any change counts.
 * Pass `touchOnly` as `ScrollTrigger.isTouch === 1`.
 */
export function isLayoutResize(prev, next, touchOnly) {
  if (next.w !== prev.w) return true;
  if (next.h === prev.h) return false;
  if (!touchOnly) return true;
  return Math.abs(next.h - prev.h) > next.h * 0.25;
}

export const currentViewport = () => ({ w: window.innerWidth, h: window.innerHeight });

/**
 * Debounced `resize` listener that calls `callback` only for layout resizes (see above).
 * `mark()` records the current size as laid out (call it after any other relayout).
 */
export function onLayoutResize(callback, { touchOnly, delay = 150 }) {
  let last = currentViewport();
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const next = currentViewport();
      if (!isLayoutResize(last, next, touchOnly)) return;
      last = next;
      callback();
    }, delay);
  };
  window.addEventListener('resize', onResize);
  return {
    mark() { last = currentViewport(); },
    stop() {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    },
  };
}
