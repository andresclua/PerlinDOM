// Shared glass-bead circles (hero field, finale field). Styles live in _hero.scss (.hero__dot).

const TINTS = ['255 255 255', '196 168 255', '150 190 255', '120 220 255', '226 200 255'];

export function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One translucent circle. depth 0 = far (small, crisp, slow), 1 = near (big, soft, faster).
 * Returns the element plus the values callers lay out with; `u`/`v` are a free 0..1 position.
 */
export function createDot(rand) {
  const depth = Math.pow(rand(), 2.4);
  const el = document.createElement('span');
  el.className = depth > 0.62 ? 'hero__dot is-near' : 'hero__dot';
  el.style.setProperty('--tint', TINTS[Math.floor(rand() * TINTS.length)]);
  el.style.setProperty('--o', (0.9 - depth * 0.55 - rand() * 0.2).toFixed(2));
  el.style.zIndex = String(Math.round(depth * 10));
  return { el, depth, size: 4 + depth * 30 + rand() * 3, u: rand(), v: rand() };
}
