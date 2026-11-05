var C = (i) => {
  throw TypeError(i);
};
var $ = (i, t, e) => t.has(i) || C("Cannot " + e);
var X = (i, t, e) => ($(i, t, "read from private field"), e ? e.call(i) : t.get(i)), z = (i, t, e) => t.has(i) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(i) : t.set(i, e), D = (i, t, e, s) => ($(i, t, "write to private field"), s ? s.call(i, e) : t.set(i, e), e), r = (i, t, e) => ($(i, t, "access private method"), e);
const v = /* @__PURE__ */ new Set();
let w = null;
function k() {
  w = null;
  for (const i of [...v])
    v.has(i) && i.onScreen && i.step() === !1 && v.delete(i);
  v.size > 0 && (w = requestAnimationFrame(k));
}
function H(i) {
  v.add(i), w === null && (w = requestAnimationFrame(k));
}
function U(i) {
  v.delete(i), v.size === 0 && w !== null && (cancelAnimationFrame(w), w = null);
}
const A = /* @__PURE__ */ new Map();
let S = null;
function Z(i) {
  typeof IntersectionObserver > "u" || !i.el || (S ?? (S = new IntersectionObserver((t) => {
    for (const e of t) {
      const s = A.get(e.target);
      s && (s.onScreen = e.isIntersecting);
    }
  })), A.set(i.el, i), S.observe(i.el));
}
function V(i) {
  !S || !i.el || A.get(i.el) !== i || (A.delete(i.el), S.unobserve(i.el));
}
var T, o, G, J, d, L, c, K, Q, M, B, I;
const f = class f {
  constructor({
    element: t,
    x: e = null,
    y: s = null,
    speed: h = 0.01,
    seed: l = 0,
    lerpSpeed: n = 0.1,
    preserveBaseTranslation: a = !1,
    // <-- si querés mantener la traslación base
    amplitude: m = 1,
    target: u = null
    // {x, y} en px, offset desde la posición base
  }) {
    z(this, c);
    z(this, T, 1);
    var g, p, R, y;
    if (this.amplitude = m, this.setTarget(u), this.el = t, this.xRange = e, this.yRange = s, this.speed = h, this.time = l, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = n, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.preserveBaseTranslation = a, this.hasPercentages = !!(e && (r(g = f, o, d).call(g, e.min) || r(p = f, o, d).call(p, e.max)) || s && (r(R = f, o, d).call(R, s.min) || r(y = f, o, d).call(y, s.max))), t) {
      const x = window.getComputedStyle(t);
      x.position === "static" && (t.style.position = "relative"), this.originalInlineTransform = t.style.transform || "", this.baseTransform = r(this, c, I).call(this, x.transform, this.preserveBaseTranslation), this.hasPercentages && (this.handleResize = this.handleResize.bind(this), window.addEventListener("resize", this.handleResize));
    } else
      this.originalInlineTransform = "", this.baseTransform = "";
    this.onScreen = !0, this.init(l);
  }
  init(t) {
    var e;
    this.noise = r(this, c, K).call(this, r(e = f, o, J).call(e, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, Z(this), H(this);
  }
  // 0 = clavado en target (o 0,0), 1 = deriva libre; siempre clampeado a [0, 1], NaN cuenta como 1
  get amplitude() {
    return X(this, T);
  }
  set amplitude(t) {
    D(this, T, typeof t == "number" && !Number.isNaN(t) ? Math.min(1, Math.max(0, t)) : 1);
  }
  setTarget(t) {
    if (t === null || typeof t != "object") {
      this.target = null;
      return;
    }
    const e = (s) => typeof s == "number" && Number.isFinite(s) ? s : 0;
    this.target = { x: e(t.x), y: e(t.y) };
  }
  // Permite refrescar el transform base si cambian clases/estilos en runtime
  refreshBaseTransform(t = this.preserveBaseTranslation) {
    if (!this.el) return;
    const e = window.getComputedStyle(this.el);
    this.baseTransform = r(this, c, I).call(this, e.transform, t);
  }
  // Handle window resize for percentage-based values
  handleResize() {
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1);
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && H(this));
  }
  // Un frame de este instance; devuelve false cuando queda totalmente pausado
  step() {
    var t, e, s, h, l, n, a, m, u, g, p, R;
    if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = r(this, c, Q).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
      this.time += this.speed * this.lerpFactor;
      const y = this.noise.perlin2(this.time, 0), x = this.noise.perlin2(this.time, 100);
      if (this.el) {
        let F, b, P, Y;
        if (this.hasPercentages) {
          const W = this.el.parentElement || document.body, j = W.clientWidth, q = W.clientHeight;
          this.xRange && (F = r(t = f, o, d).call(t, this.xRange.min) ? r(e = f, o, L).call(e, this.xRange.min, j) : this.xRange.min, b = r(s = f, o, d).call(s, this.xRange.max) ? r(h = f, o, L).call(h, this.xRange.max, j) : this.xRange.max), this.yRange && (P = r(l = f, o, d).call(l, this.yRange.min) ? r(n = f, o, L).call(n, this.yRange.min, q) : this.yRange.min, Y = r(a = f, o, d).call(a, this.yRange.max) ? r(m = f, o, L).call(m, this.yRange.max, q) : this.yRange.max);
        } else
          F = (u = this.xRange) == null ? void 0 : u.min, b = (g = this.xRange) == null ? void 0 : g.max, P = (p = this.yRange) == null ? void 0 : p.min, Y = (R = this.yRange) == null ? void 0 : R.max;
        const N = r(this, c, M).call(this, this.xRange ? r(this, c, B).call(this, y, -1, 1, F, b) : 0, "x"), E = r(this, c, M).call(this, this.yRange ? r(this, c, B).call(this, x, -1, 1, P, Y) : 0, "y");
        this.lastX = N, this.lastY = E, this.el.style.transform = `translate3d(${N}px, ${E}px, 0) ${this.baseTransform}`.trim();
      } else {
        const F = r(this, c, M).call(this, this.xRange ? r(this, c, B).call(this, y, -1, 1, this.xRange.min, this.xRange.max) : 0, "x"), b = r(this, c, M).call(this, this.yRange ? r(this, c, B).call(this, x, -1, 1, this.yRange.min, this.yRange.max) : 0, "y");
        this.lastX = F, this.lastY = b;
      }
    }
    return this.lerpFactor > 0 || this.targetLerpFactor > 0;
  }
  destroy() {
    U(this), V(this), this.el && (this.el.style.transform = this.originalInlineTransform || ""), this.hasPercentages && window.removeEventListener("resize", this.handleResize);
  }
};
T = new WeakMap(), o = new WeakSet(), G = function(t) {
  return function() {
    let e = t += 1831565813;
    return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
  };
}, J = function(t = 0) {
  var h;
  const e = Array.from({ length: 256 }, (l, n) => n), s = r(h = f, o, G).call(h, t);
  for (let l = 255; l > 0; l--) {
    const n = Math.floor(s() * (l + 1));
    [e[l], e[n]] = [e[n], e[l]];
  }
  return e.concat(e);
}, d = function(t) {
  return typeof t == "string" && t.endsWith("%");
}, L = function(t, e) {
  var h;
  return r(h = f, o, d).call(h, t) ? parseFloat(t) / 100 * e : t;
}, c = new WeakSet(), K = function(t) {
  const e = (n) => n * n * n * (n * (n * 6 - 15) + 10), s = (n, a, m) => a + n * (m - a), h = (n, a, m) => {
    const u = n & 15, g = u < 8 ? a : m, p = u < 4 ? m : u === 12 || u === 14 ? a : 0;
    return (u & 1 ? -g : g) + (u & 2 ? -p : p);
  }, l = (n, a) => n & 1 ? -a : a;
  return {
    // Original 1D Perlin noise function
    perlin1(n) {
      const a = Math.floor(n) & 255;
      n -= Math.floor(n);
      const m = e(n);
      return s(m, l(t[a], n), l(t[a + 1], n - 1));
    },
    // New 2D Perlin noise function
    perlin2(n, a) {
      const m = Math.floor(n) & 255, u = Math.floor(a) & 255;
      n -= Math.floor(n), a -= Math.floor(a);
      const g = e(n), p = e(a), R = t[m] + u, y = t[m + 1] + u, x = t[R], F = t[R + 1], b = t[y], P = t[y + 1];
      return s(
        p,
        s(g, h(t[x], n, a), h(t[b], n - 1, a)),
        s(g, h(t[F], n, a - 1), h(t[P], n - 1, a - 1))
      );
    }
  };
}, Q = function(t, e, s) {
  return t + s * (e - t);
}, // target + (noise - target) * amplitude; amplitude 1 returns noise untouched (exact legacy values)
M = function(t, e) {
  var h;
  if (X(this, T) === 1) return t;
  const s = ((h = this.target) == null ? void 0 : h[e]) ?? 0;
  return s + (t - s) * X(this, T);
}, B = function(t, e, s, h, l) {
  return (t - e) * (l - h) / (s - e) + h;
}, // Quita o preserva la traslación del transform base en 2D según flag
I = function(t, e = !1) {
  if (!t || t === "none") return "";
  try {
    const s = new DOMMatrixReadOnly(t);
    if (s.is2D) {
      const h = e ? s.e : 0, l = e ? s.f : 0;
      return `matrix(${s.a}, ${s.b}, ${s.c}, ${s.d}, ${h}, ${l})`;
    } else
      return t;
  } catch {
    return t;
  }
}, z(f, o);
let O = f;
export {
  O as default
};
