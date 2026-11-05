// Text -> point cloud. pickPoints is pure (node-testable); sampleText is the canvas wrapper.

function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CANDIDATES = 12;

/**
 * Picks `count` points from the set pixels of `mask`, spread evenly
 * (Mitchell's best-candidate, seeded, so the result is deterministic).
 * Points sit on pixel centres. If count exceeds the set pixels, pixels repeat.
 */
export function pickPoints(mask, width, height, count) {
  const set = [];
  for (let i = 0, n = width * height; i < n; i++) if (mask[i]) set.push(i);
  if (set.length === 0 || count <= 0) return [];

  const rand = mulberry32(0x9e3779b9);
  const xs = new Float64Array(count);
  const ys = new Float64Array(count);
  const out = [];

  for (let k = 0; k < count; k++) {
    let bestX = 0, bestY = 0, bestD = -1;
    const tries = k === 0 ? 1 : CANDIDATES;
    for (let c = 0; c < tries; c++) {
      const idx = set[Math.floor(rand() * set.length)];
      const x = (idx % width) + 0.5;
      const y = Math.floor(idx / width) + 0.5;
      let d = Infinity;
      for (let j = 0; j < k; j++) {
        const dx = xs[j] - x, dy = ys[j] - y;
        const dd = dx * dx + dy * dy;
        if (dd < d) d = dd;
      }
      if (d > bestD) { bestD = d; bestX = x; bestY = y; }
    }
    xs[k] = bestX;
    ys[k] = bestY;
    out.push({ x: bestX, y: bestY });
  }
  return out;
}

/**
 * Renders `text` with a canvas `font` (e.g. '200 160px Outfit') into a box `width` px wide
 * and returns `count` points on its glyphs. Coordinates are relative to the top-left of the
 * text's line box (font ascent + descent, as with CSS `line-height: normal`), x starting at
 * the first glyph's origin. Browser only.
 */
export function sampleText(text, font, width, count, { letterSpacing = '0px' } = {}) {
  if (!text || count <= 0) return [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.font = font;
  const m = ctx.measureText(text);
  const ascent = Math.ceil(m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent);
  const descent = Math.ceil(m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent);
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, ascent + descent);
  canvas.width = w;
  canvas.height = h;

  // Resizing the canvas resets the context state.
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = letterSpacing;
    ctx.fillText(text, 0, ascent);
  } else {
    const spacing = parseFloat(letterSpacing) || 0;
    let x = 0;
    for (const ch of text) {
      ctx.fillText(ch, x, ascent);
      x += ctx.measureText(ch).width + spacing;
    }
  }

  const { data } = ctx.getImageData(0, 0, w, h);
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 127 ? 1 : 0;
  return pickPoints(mask, w, h, count);
}
