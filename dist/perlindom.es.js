var q = (i) => {
  throw TypeError(i);
};
var $ = (i, t, e) => t.has(i) || q("Cannot " + e);
var P = (i, t, e) => ($(i, t, "read from private field"), e ? e.call(i) : t.get(i)), X = (i, t, e) => t.has(i) ? q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(i) : t.set(i, e), C = (i, t, e, s) => ($(i, t, "write to private field"), s ? s.call(i, e) : t.set(i, e), e), a = (i, t, e) => ($(i, t, "access private method"), e);
const T = /* @__PURE__ */ new Set();
let F = null;
function G() {
  F = null;
  for (const i of [...T])
    T.has(i) && (!i.onScreen && !i._dirty || (i._dirty = !1, i.step() === !1 && T.delete(i)));
  T.size > 0 && F === null && (F = requestAnimationFrame(G));
}
function D(i) {
  T.add(i), F === null && (F = requestAnimationFrame(G));
}
function Z(i) {
  T.delete(i), T.size === 0 && F !== null && (cancelAnimationFrame(F), F = null);
}
const B = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new WeakMap();
let I = null;
function V(i) {
  if (typeof IntersectionObserver > "u" || !i.el || !i.pauseOffscreen || A.has(i)) return;
  I ?? (I = new IntersectionObserver((s) => {
    for (const r of s) {
      const o = B.get(r.target);
      if (o) {
        o.visible = r.isIntersecting;
        for (const n of o.insts) n.onScreen = r.isIntersecting;
      }
    }
  }));
  const t = i.el.parentElement || i.el;
  let e = B.get(t);
  e || (e = { visible: !0, insts: /* @__PURE__ */ new Set() }, B.set(t, e), I.observe(t)), e.insts.add(i), A.set(i, t), i.onScreen = e.visible;
}
function _(i) {
  const t = A.get(i);
  if (!t) return;
  A.delete(i);
  const e = B.get(t);
  e && (e.insts.delete(i), e.insts.size === 0 && (B.delete(t), I.unobserve(t)));
}
var x, l, J, K, y, L, c, Q, U, S, z, O;
const f = class f {
  constructor({
    element: t,
    x: e = null,
    y: s = null,
    speed: r = 0.01,
    seed: o = 0,
    lerpSpeed: n = 0.1,
    preserveBaseTranslation: h = !1,
    // <-- si querés mantener la traslación base
    amplitude: u = 1,
    target: m = null,
    // {x, y} en px, offset desde la posición base
    pauseOffscreen: g = !0
    // false = keep stepping even when the parent box is out of view
  }) {
    X(this, c);
    X(this, x, 1);
    var d, R, b, v;
    if (this._dirty = !1, this.pauseOffscreen = g !== !1, this.amplitude = u, this.setTarget(m), this.el = t, this.xRange = e, this.yRange = s, this.speed = r, this.time = o, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = n, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.preserveBaseTranslation = h, this.hasPercentages = !!(e && (a(d = f, l, y).call(d, e.min) || a(R = f, l, y).call(R, e.max)) || s && (a(b = f, l, y).call(b, s.min) || a(v = f, l, y).call(v, s.max))), t) {
      const p = window.getComputedStyle(t);
      p.position === "static" && (t.style.position = "relative"), this.originalInlineTransform = t.style.transform || "", this.baseTransform = a(this, c, O).call(this, p.transform, this.preserveBaseTranslation), this.hasPercentages && (this.handleResize = this.handleResize.bind(this), window.addEventListener("resize", this.handleResize));
    } else
      this.originalInlineTransform = "", this.baseTransform = "";
    this.onScreen = !0, this.init(o);
  }
  init(t) {
    var e;
    this.noise = a(this, c, Q).call(this, a(e = f, l, K).call(e, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, V(this), D(this);
  }
  // 0 = clavado en target (o 0,0), 1 = deriva libre; siempre clampeado a [0, 1], NaN cuenta como 1
  get amplitude() {
    return P(this, x);
  }
  set amplitude(t) {
    const e = typeof t == "number" && !Number.isNaN(t) ? Math.min(1, Math.max(0, t)) : 1;
    e !== P(this, x) && (this._dirty = !0), C(this, x, e);
  }
  setTarget(t) {
    const e = this.target;
    if (t === null || typeof t != "object")
      this.target = null;
    else {
      const r = (o) => typeof o == "number" && Number.isFinite(o) ? o : 0;
      this.target = { x: r(t.x), y: r(t.y) };
    }
    const s = this.target;
    ((e == null ? void 0 : e.x) !== (s == null ? void 0 : s.x) || (e == null ? void 0 : e.y) !== (s == null ? void 0 : s.y)) && (this._dirty = !0);
  }
  // Permite refrescar el transform base si cambian clases/estilos en runtime
  refreshBaseTransform(t = this.preserveBaseTranslation) {
    if (!this.el) return;
    const e = window.getComputedStyle(this.el);
    this.baseTransform = a(this, c, O).call(this, e.transform, t);
  }
  // Handle window resize for percentage-based values
  handleResize() {
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1);
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && D(this));
  }
  // Un frame de este instance; devuelve false cuando queda totalmente pausado
  step() {
    var t, e, s, r, o, n, h, u, m, g, d, R;
    if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = a(this, c, U).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
      this.time += this.speed * this.lerpFactor;
      const b = this.noise.perlin2(this.time, 0), v = this.noise.perlin2(this.time, 100);
      if (this.el) {
        let p, w, M, Y;
        if (this.hasPercentages) {
          const W = this.el.parentElement || document.body, j = W.clientWidth, k = W.clientHeight;
          this.xRange && (p = a(t = f, l, y).call(t, this.xRange.min) ? a(e = f, l, L).call(e, this.xRange.min, j) : this.xRange.min, w = a(s = f, l, y).call(s, this.xRange.max) ? a(r = f, l, L).call(r, this.xRange.max, j) : this.xRange.max), this.yRange && (M = a(o = f, l, y).call(o, this.yRange.min) ? a(n = f, l, L).call(n, this.yRange.min, k) : this.yRange.min, Y = a(h = f, l, y).call(h, this.yRange.max) ? a(u = f, l, L).call(u, this.yRange.max, k) : this.yRange.max);
        } else
          p = (m = this.xRange) == null ? void 0 : m.min, w = (g = this.xRange) == null ? void 0 : g.max, M = (d = this.yRange) == null ? void 0 : d.min, Y = (R = this.yRange) == null ? void 0 : R.max;
        const E = a(this, c, S).call(this, this.xRange ? a(this, c, z).call(this, b, -1, 1, p, w) : 0, "x"), N = a(this, c, S).call(this, this.yRange ? a(this, c, z).call(this, v, -1, 1, M, Y) : 0, "y");
        this.lastX = E, this.lastY = N, this.el.style.transform = `translate3d(${E}px, ${N}px, 0) ${this.baseTransform}`.trim();
      } else {
        const p = a(this, c, S).call(this, this.xRange ? a(this, c, z).call(this, b, -1, 1, this.xRange.min, this.xRange.max) : 0, "x"), w = a(this, c, S).call(this, this.yRange ? a(this, c, z).call(this, v, -1, 1, this.yRange.min, this.yRange.max) : 0, "y");
        this.lastX = p, this.lastY = w;
      }
    }
    return this.lerpFactor > 0 || this.targetLerpFactor > 0;
  }
  destroy() {
    Z(this), _(this), this.el && (this.el.style.transform = this.originalInlineTransform || ""), this.hasPercentages && window.removeEventListener("resize", this.handleResize);
  }
};
x = new WeakMap(), l = new WeakSet(), J = function(t) {
  return function() {
    let e = t += 1831565813;
    return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
  };
}, K = function(t = 0) {
  var r;
  const e = Array.from({ length: 256 }, (o, n) => n), s = a(r = f, l, J).call(r, t);
  for (let o = 255; o > 0; o--) {
    const n = Math.floor(s() * (o + 1));
    [e[o], e[n]] = [e[n], e[o]];
  }
  return e.concat(e);
}, y = function(t) {
  return typeof t == "string" && t.endsWith("%");
}, L = function(t, e) {
  var r;
  return a(r = f, l, y).call(r, t) ? parseFloat(t) / 100 * e : t;
}, c = new WeakSet(), Q = function(t) {
  const e = (n) => n * n * n * (n * (n * 6 - 15) + 10), s = (n, h, u) => h + n * (u - h), r = (n, h, u) => {
    const m = n & 15, g = m < 8 ? h : u, d = m < 4 ? u : m === 12 || m === 14 ? h : 0;
    return (m & 1 ? -g : g) + (m & 2 ? -d : d);
  }, o = (n, h) => n & 1 ? -h : h;
  return {
    // Original 1D Perlin noise function
    perlin1(n) {
      const h = Math.floor(n) & 255;
      n -= Math.floor(n);
      const u = e(n);
      return s(u, o(t[h], n), o(t[h + 1], n - 1));
    },
    // New 2D Perlin noise function
    perlin2(n, h) {
      const u = Math.floor(n) & 255, m = Math.floor(h) & 255;
      n -= Math.floor(n), h -= Math.floor(h);
      const g = e(n), d = e(h), R = t[u] + m, b = t[u + 1] + m, v = t[R], p = t[R + 1], w = t[b], M = t[b + 1];
      return s(
        d,
        s(g, r(t[v], n, h), r(t[w], n - 1, h)),
        s(g, r(t[p], n, h - 1), r(t[M], n - 1, h - 1))
      );
    }
  };
}, U = function(t, e, s) {
  return t + s * (e - t);
}, // target + (noise - target) * amplitude; amplitude 1 returns noise untouched (exact legacy values)
S = function(t, e) {
  var r;
  if (P(this, x) === 1) return t;
  const s = ((r = this.target) == null ? void 0 : r[e]) ?? 0;
  return s + (t - s) * P(this, x);
}, z = function(t, e, s, r, o) {
  return (t - e) * (o - r) / (s - e) + r;
}, // Quita o preserva la traslación del transform base en 2D según flag
O = function(t, e = !1) {
  if (!t || t === "none") return "";
  try {
    const s = new DOMMatrixReadOnly(t);
    if (s.is2D) {
      const r = e ? s.e : 0, o = e ? s.f : 0;
      return `matrix(${s.a}, ${s.b}, ${s.c}, ${s.d}, ${r}, ${o})`;
    } else
      return t;
  } catch {
    return t;
  }
}, X(f, l);
let H = f;
export {
  H as default
};
