var C = (i) => {
  throw TypeError(i);
};
var I = (i, t, e) => t.has(i) || C("Cannot " + e);
var M = (i, t, e) => (I(i, t, "read from private field"), e ? e.call(i) : t.get(i)), B = (i, t, e) => t.has(i) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(i) : t.set(i, e), D = (i, t, e, s) => (I(i, t, "write to private field"), s ? s.call(i, e) : t.set(i, e), e), h = (i, t, e) => (I(i, t, "access private method"), e);
const w = /* @__PURE__ */ new Set();
let v = null;
function G() {
  v = null;
  for (const i of [...w])
    w.has(i) && (!i.onScreen && !i._dirty || (i._dirty = !1, i.step() === !1 && w.delete(i)));
  w.size > 0 && v === null && (v = requestAnimationFrame(G));
}
function $(i) {
  w.add(i), v === null && (v = requestAnimationFrame(G));
}
function Z(i) {
  w.delete(i), w.size === 0 && v !== null && (cancelAnimationFrame(v), v = null);
}
const z = /* @__PURE__ */ new Map(), Y = /* @__PURE__ */ new WeakMap();
let O = null;
function V(i) {
  if (typeof IntersectionObserver > "u" || !i.el || !i.pauseOffscreen || Y.has(i)) return;
  O ?? (O = new IntersectionObserver((s) => {
    for (const r of s) {
      const a = z.get(r.target);
      if (a) {
        a.visible = r.isIntersecting;
        for (const n of a.insts) n.onScreen = r.isIntersecting;
      }
    }
  }));
  const t = i.el.parentElement || i.el;
  let e = z.get(t);
  e || (e = { visible: !0, insts: /* @__PURE__ */ new Set() }, z.set(t, e), O.observe(t)), e.insts.add(i), Y.set(i, t), i.onScreen = e.visible;
}
function _(i) {
  const t = Y.get(i);
  if (!t) return;
  Y.delete(i);
  const e = z.get(t);
  e && (e.insts.delete(i), e.insts.size === 0 && (z.delete(t), O.unobserve(t)));
}
var F, l, J, K, y, L, c, Q, U, S, X, E;
const f = class f {
  constructor({
    element: t,
    x: e = null,
    y: s = null,
    speed: r = 0.01,
    seed: a = 0,
    lerpSpeed: n = 0.1,
    preserveBaseTranslation: o = !1,
    // <-- si querés mantener la traslación base
    amplitude: u = 1,
    target: m = null,
    // {x, y} en px, offset desde la posición base
    legacyNoise: g = !1,
    // true = sample noise at y=0/100 like <=0.0.6 (flat spots on one axis)
    pauseOffscreen: R = !0
    // false = keep stepping even when the parent box is out of view
  }) {
    B(this, c);
    B(this, F, 1);
    var b, x, T, d;
    if (this._dirty = !1, this.pauseOffscreen = R !== !1, this._ny = g ? [0, 100] : [0.5, 100.5], this.amplitude = u, this.setTarget(m), this.el = t, this.xRange = e, this.yRange = s, this.speed = r, this.seed = a, this.time = a, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = n, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.preserveBaseTranslation = o, this.hasPercentages = !!(e && (h(b = f, l, y).call(b, e.min) || h(x = f, l, y).call(x, e.max)) || s && (h(T = f, l, y).call(T, s.min) || h(d = f, l, y).call(d, s.max))), t) {
      const p = window.getComputedStyle(t);
      p.position === "static" && (t.style.position = "relative"), this.originalInlineTransform = t.style.transform || "", this.baseTransform = h(this, c, E).call(this, p.transform, this.preserveBaseTranslation), this.hasPercentages && (this.handleResize = this.handleResize.bind(this), window.addEventListener("resize", this.handleResize));
    } else
      this.originalInlineTransform = "", this.baseTransform = "";
    this.onScreen = !0, this.init(a);
  }
  init(t) {
    var e;
    this._destroyed = !1, this.noise = h(this, c, Q).call(this, h(e = f, l, K).call(e, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, V(this), $(this);
  }
  // 0 = clavado en target (o 0,0), 1 = deriva libre; siempre clampeado a [0, 1], NaN cuenta como 1
  get amplitude() {
    return M(this, F);
  }
  set amplitude(t) {
    const e = typeof t == "number" && !Number.isNaN(t) ? Math.min(1, Math.max(0, t)) : 1;
    e !== M(this, F) && (this._dirty = !0), D(this, F, e);
  }
  setTarget(t) {
    const e = this.target;
    if (t === null || typeof t != "object")
      this.target = null;
    else {
      const r = (a) => typeof a == "number" && Number.isFinite(a) ? a : 0;
      this.target = { x: r(t.x), y: r(t.y) };
    }
    const s = this.target;
    ((e == null ? void 0 : e.x) !== (s == null ? void 0 : s.x) || (e == null ? void 0 : e.y) !== (s == null ? void 0 : s.y)) && (this._dirty = !0);
  }
  // Permite refrescar el transform base si cambian clases/estilos en runtime
  refreshBaseTransform(t = this.preserveBaseTranslation) {
    if (!this.el) return;
    const e = window.getComputedStyle(this.el);
    this.baseTransform = h(this, c, E).call(this, e.transform, t);
  }
  // Handle window resize for percentage-based values
  handleResize() {
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1);
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && $(this));
  }
  // Un frame de este instance; devuelve false cuando queda totalmente pausado
  step() {
    var t, e, s, r, a, n, o, u, m, g, R, b;
    if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = h(this, c, U).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
      this.time += this.speed * this.lerpFactor;
      const x = this.noise.perlin2(this.time, this._ny[0]), T = this.noise.perlin2(this.time, this._ny[1]);
      if (this.el) {
        let d, p, P, A;
        if (this.hasPercentages) {
          const j = this.el.parentElement || document.body, k = j.clientWidth, q = j.clientHeight;
          this.xRange && (d = h(t = f, l, y).call(t, this.xRange.min) ? h(e = f, l, L).call(e, this.xRange.min, k) : this.xRange.min, p = h(s = f, l, y).call(s, this.xRange.max) ? h(r = f, l, L).call(r, this.xRange.max, k) : this.xRange.max), this.yRange && (P = h(a = f, l, y).call(a, this.yRange.min) ? h(n = f, l, L).call(n, this.yRange.min, q) : this.yRange.min, A = h(o = f, l, y).call(o, this.yRange.max) ? h(u = f, l, L).call(u, this.yRange.max, q) : this.yRange.max);
        } else
          d = (m = this.xRange) == null ? void 0 : m.min, p = (g = this.xRange) == null ? void 0 : g.max, P = (R = this.yRange) == null ? void 0 : R.min, A = (b = this.yRange) == null ? void 0 : b.max;
        const N = h(this, c, S).call(this, this.xRange ? h(this, c, X).call(this, x, -1, 1, d, p) : 0, "x"), W = h(this, c, S).call(this, this.yRange ? h(this, c, X).call(this, T, -1, 1, P, A) : 0, "y");
        this.lastX = N, this.lastY = W, this.el.style.transform = `translate3d(${N}px, ${W}px, 0) ${this.baseTransform}`.trim();
      } else {
        const d = h(this, c, S).call(this, this.xRange ? h(this, c, X).call(this, x, -1, 1, this.xRange.min, this.xRange.max) : 0, "x"), p = h(this, c, S).call(this, this.yRange ? h(this, c, X).call(this, T, -1, 1, this.yRange.min, this.yRange.max) : 0, "y");
        this.lastX = d, this.lastY = p;
      }
    }
    return this.lerpFactor > 0 || this.targetLerpFactor > 0;
  }
  // Back to the starting state, as if just created: the noise path rewinds to its seed and the
  // element returns to its own transform (no drift). Keeps play/pause, amplitude and target.
  reset() {
    this._destroyed || (this.time = this.seed, this.lastX = 0, this.lastY = 0, this.el && (this.el.style.transform = this.originalInlineTransform || ""), this.isPlaying && $(this));
  }
  destroy() {
    this._destroyed = !0, Z(this), _(this), this.el && (this.el.style.transform = this.originalInlineTransform || ""), this.hasPercentages && window.removeEventListener("resize", this.handleResize);
  }
};
F = new WeakMap(), l = new WeakSet(), J = function(t) {
  return function() {
    let e = t += 1831565813;
    return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
  };
}, K = function(t = 0) {
  var r;
  const e = Array.from({ length: 256 }, (a, n) => n), s = h(r = f, l, J).call(r, t);
  for (let a = 255; a > 0; a--) {
    const n = Math.floor(s() * (a + 1));
    [e[a], e[n]] = [e[n], e[a]];
  }
  return e.concat(e);
}, y = function(t) {
  return typeof t == "string" && t.endsWith("%");
}, L = function(t, e) {
  var r;
  return h(r = f, l, y).call(r, t) ? parseFloat(t) / 100 * e : t;
}, c = new WeakSet(), Q = function(t) {
  const e = (n) => n * n * n * (n * (n * 6 - 15) + 10), s = (n, o, u) => o + n * (u - o), r = (n, o, u) => {
    const m = n & 15, g = m < 8 ? o : u, R = m < 4 ? u : m === 12 || m === 14 ? o : 0;
    return (m & 1 ? -g : g) + (m & 2 ? -R : R);
  }, a = (n, o) => n & 1 ? -o : o;
  return {
    // Original 1D Perlin noise function
    perlin1(n) {
      const o = Math.floor(n) & 255;
      n -= Math.floor(n);
      const u = e(n);
      return s(u, a(t[o], n), a(t[o + 1], n - 1));
    },
    // New 2D Perlin noise function
    perlin2(n, o) {
      const u = Math.floor(n) & 255, m = Math.floor(o) & 255;
      n -= Math.floor(n), o -= Math.floor(o);
      const g = e(n), R = e(o), b = t[u] + m, x = t[u + 1] + m, T = t[b], d = t[b + 1], p = t[x], P = t[x + 1];
      return s(
        R,
        s(g, r(t[T], n, o), r(t[p], n - 1, o)),
        s(g, r(t[d], n, o - 1), r(t[P], n - 1, o - 1))
      );
    }
  };
}, U = function(t, e, s) {
  return t + s * (e - t);
}, // target + (noise - target) * amplitude; amplitude 1 returns noise untouched (exact legacy values)
S = function(t, e) {
  var r;
  if (M(this, F) === 1) return t;
  const s = ((r = this.target) == null ? void 0 : r[e]) ?? 0;
  return s + (t - s) * M(this, F);
}, X = function(t, e, s, r, a) {
  return (t - e) * (a - r) / (s - e) + r;
}, // Quita o preserva la traslación del transform base en 2D según flag
E = function(t, e = !1) {
  if (!t || t === "none") return "";
  try {
    const s = new DOMMatrixReadOnly(t);
    if (s.is2D) {
      const r = e ? s.e : 0, a = e ? s.f : 0;
      return `matrix(${s.a}, ${s.b}, ${s.c}, ${s.d}, ${r}, ${a})`;
    } else
      return t;
  } catch {
    return t;
  }
}, B(f, l);
let H = f;
export {
  H as default
};
