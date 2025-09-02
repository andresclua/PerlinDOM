var D = Object.defineProperty;
var z = (c) => {
  throw TypeError(c);
};
var H = (c, t, s) => t in c ? D(c, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : c[t] = s;
var S = (c, t, s) => H(c, typeof t != "symbol" ? t + "" : t, s), j = (c, t, s) => t.has(c) || z("Cannot " + s);
var A = (c, t, s) => t.has(c) ? z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(c) : t.set(c, s);
var n = (c, t, s) => (j(c, t, "access private method"), s);
var r, E, I, d, P, f, W, C, T, B;
const l = class l {
  constructor({
    element: t,
    x: s = null,
    y: e = null,
    speed: h = 0.01,
    seed: o = 0,
    lerpSpeed: i = 0.1,
    preserveBaseTranslation: a = !1
    // <-- si querés mantener la traslación base
  }) {
    A(this, f);
    S(this, "animate", () => {
      var t, s, e, h, o, i, a, m, g, p, u, R;
      if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = n(this, f, C).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
        this.time += this.speed * this.lerpFactor;
        const x = this.noise.perlin2(this.time, 0), b = this.noise.perlin2(this.time, 100);
        if (this.el) {
          let F, y, v, L;
          if (this.hasPercentages) {
            const Y = this.el.parentElement || document.body, $ = Y.clientWidth, M = Y.clientHeight;
            this.xRange && (F = n(t = l, r, d).call(t, this.xRange.min) ? n(s = l, r, P).call(s, this.xRange.min, $) : this.xRange.min, y = n(e = l, r, d).call(e, this.xRange.max) ? n(h = l, r, P).call(h, this.xRange.max, $) : this.xRange.max), this.yRange && (v = n(o = l, r, d).call(o, this.yRange.min) ? n(i = l, r, P).call(i, this.yRange.min, M) : this.yRange.min, L = n(a = l, r, d).call(a, this.yRange.max) ? n(m = l, r, P).call(m, this.yRange.max, M) : this.yRange.max);
          } else
            F = (g = this.xRange) == null ? void 0 : g.min, y = (p = this.xRange) == null ? void 0 : p.max, v = (u = this.yRange) == null ? void 0 : u.min, L = (R = this.yRange) == null ? void 0 : R.max;
          const X = this.xRange ? n(this, f, T).call(this, x, -1, 1, F, y) : 0, w = this.yRange ? n(this, f, T).call(this, b, -1, 1, v, L) : 0;
          this.lastX = X, this.lastY = w, this.el.style.transform = `translate3d(${X}px, ${w}px, 0) ${this.baseTransform}`.trim();
        } else {
          const F = this.xRange ? n(this, f, T).call(this, x, -1, 1, this.xRange.min, this.xRange.max) : 0, y = this.yRange ? n(this, f, T).call(this, b, -1, 1, this.yRange.min, this.yRange.max) : 0;
          this.lastX = F, this.lastY = y;
        }
      }
      (this.lerpFactor > 0 || this.targetLerpFactor > 0) && (this.raf = requestAnimationFrame(this.animate));
    });
    var m, g, p, u;
    if (this.el = t, this.xRange = s, this.yRange = e, this.speed = h, this.time = o, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = i, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.preserveBaseTranslation = a, this.hasPercentages = !!(s && (n(m = l, r, d).call(m, s.min) || n(g = l, r, d).call(g, s.max)) || e && (n(p = l, r, d).call(p, e.min) || n(u = l, r, d).call(u, e.max))), t) {
      const R = window.getComputedStyle(t);
      R.position === "static" && (t.style.position = "relative"), this.originalInlineTransform = t.style.transform || "", this.baseTransform = n(this, f, B).call(this, R.transform, this.preserveBaseTranslation), this.hasPercentages && (this.handleResize = this.handleResize.bind(this), window.addEventListener("resize", this.handleResize));
    } else
      this.originalInlineTransform = "", this.baseTransform = "";
    this.animate = this.animate.bind(this), this.init(o);
  }
  init(t) {
    var s;
    this.noise = n(this, f, W).call(this, n(s = l, r, I).call(s, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, this.raf = requestAnimationFrame(this.animate);
  }
  // Permite refrescar el transform base si cambian clases/estilos en runtime
  refreshBaseTransform(t = this.preserveBaseTranslation) {
    if (!this.el) return;
    const s = window.getComputedStyle(this.el);
    this.baseTransform = n(this, f, B).call(this, s.transform, t);
  }
  // Handle window resize for percentage-based values
  handleResize() {
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1);
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && (this.raf = requestAnimationFrame(this.animate)));
  }
  destroy() {
    cancelAnimationFrame(this.raf), this.el && (this.el.style.transform = this.originalInlineTransform || ""), this.hasPercentages && window.removeEventListener("resize", this.handleResize);
  }
};
r = new WeakSet(), E = function(t) {
  return function() {
    let s = t += 1831565813;
    return s = Math.imul(s ^ s >>> 15, s | 1), s ^= s + Math.imul(s ^ s >>> 7, s | 61), ((s ^ s >>> 14) >>> 0) / 4294967296;
  };
}, I = function(t = 0) {
  var h;
  const s = Array.from({ length: 256 }, (o, i) => i), e = n(h = l, r, E).call(h, t);
  for (let o = 255; o > 0; o--) {
    const i = Math.floor(e() * (o + 1));
    [s[o], s[i]] = [s[i], s[o]];
  }
  return s.concat(s);
}, d = function(t) {
  return typeof t == "string" && t.endsWith("%");
}, P = function(t, s) {
  var h;
  return n(h = l, r, d).call(h, t) ? parseFloat(t) / 100 * s : t;
}, f = new WeakSet(), W = function(t) {
  const s = (i) => i * i * i * (i * (i * 6 - 15) + 10), e = (i, a, m) => a + i * (m - a), h = (i, a, m) => {
    const g = i & 15, p = g < 8 ? a : m, u = g < 4 ? m : g === 12 || g === 14 ? a : 0;
    return (g & 1 ? -p : p) + (g & 2 ? -u : u);
  }, o = (i, a) => i & 1 ? -a : a;
  return {
    // Original 1D Perlin noise function
    perlin1(i) {
      const a = Math.floor(i) & 255;
      i -= Math.floor(i);
      const m = s(i);
      return e(m, o(t[a], i), o(t[a + 1], i - 1));
    },
    // New 2D Perlin noise function
    perlin2(i, a) {
      const m = Math.floor(i) & 255, g = Math.floor(a) & 255;
      i -= Math.floor(i), a -= Math.floor(a);
      const p = s(i), u = s(a), R = t[m] + g, x = t[m + 1] + g, b = t[R], F = t[R + 1], y = t[x], v = t[x + 1];
      return e(
        u,
        e(p, h(t[b], i, a), h(t[y], i - 1, a)),
        e(p, h(t[F], i, a - 1), h(t[v], i - 1, a - 1))
      );
    }
  };
}, C = function(t, s, e) {
  return t + e * (s - t);
}, T = function(t, s, e, h, o) {
  return (t - s) * (o - h) / (e - s) + h;
}, // Quita o preserva la traslación del transform base en 2D según flag
B = function(t, s = !1) {
  if (!t || t === "none") return "";
  try {
    const e = new DOMMatrixReadOnly(t);
    if (e.is2D) {
      const h = s ? e.e : 0, o = s ? e.f : 0;
      return `matrix(${e.a}, ${e.b}, ${e.c}, ${e.d}, ${h}, ${o})`;
    } else
      return t;
  } catch {
    return t;
  }
}, A(l, r);
let q = l;
export {
  q as default
};
