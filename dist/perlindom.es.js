var j = Object.defineProperty;
var S = (c) => {
  throw TypeError(c);
};
var C = (c, t, i) => t in c ? j(c, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : c[t] = i;
var q = (c, t, i) => C(c, typeof t != "symbol" ? t + "" : t, i), k = (c, t, i) => t.has(c) || S("Cannot " + i);
var Y = (c, t, i) => t.has(c) ? S("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(c) : t.set(c, i);
var a = (c, t, i) => (k(c, t, "access private method"), i);
var n, W, H, R, v, p, T, $, L;
const o = class o {
  constructor({
    element: t,
    x: i = null,
    y: r = null,
    speed: h = 0.01,
    seed: l = 0,
    lerpSpeed: s = 0.1
  }) {
    Y(this, p);
    q(this, "animate", () => {
      var t, i, r, h, l, s, e, m, g, f, u, d;
      if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = a(this, p, $).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
        this.time += this.speed * this.lerpFactor;
        const x = this.noise.perlin2(this.time, 0), A = this.noise.perlin2(this.time, 100);
        if (this.el) {
          let F, y, P, X;
          if (this.hasPercentages) {
            const w = this.el.parentElement || document.body, M = w.clientWidth, B = w.clientHeight;
            this.xRange && (F = a(t = o, n, R).call(t, this.xRange.min) ? a(i = o, n, v).call(i, this.xRange.min, M) : this.xRange.min, y = a(r = o, n, R).call(r, this.xRange.max) ? a(h = o, n, v).call(h, this.xRange.max, M) : this.xRange.max), this.yRange && (P = a(l = o, n, R).call(l, this.yRange.min) ? a(s = o, n, v).call(s, this.yRange.min, B) : this.yRange.min, X = a(e = o, n, R).call(e, this.yRange.max) ? a(m = o, n, v).call(m, this.yRange.max, B) : this.yRange.max);
          } else
            F = (g = this.xRange) == null ? void 0 : g.min, y = (f = this.xRange) == null ? void 0 : f.max, P = (u = this.yRange) == null ? void 0 : u.min, X = (d = this.yRange) == null ? void 0 : d.max;
          const z = this.xRange ? a(this, p, L).call(this, x, -1, 1, F, y) : 0, b = this.yRange ? a(this, p, L).call(this, A, -1, 1, P, X) : 0;
          this.lastX = z, this.lastY = b, this.el.style.transform = `translate3d(${z}px, ${b}px, 0)`;
        } else {
          const F = this.xRange ? a(this, p, L).call(this, x, -1, 1, this.xRange.min, this.xRange.max) : 0, y = this.yRange ? a(this, p, L).call(this, A, -1, 1, this.yRange.min, this.yRange.max) : 0;
          this.lastX = F, this.lastY = y;
        }
      }
      (this.lerpFactor > 0 || this.targetLerpFactor > 0) && (this.raf = requestAnimationFrame(this.animate));
    });
    var e, m, g, f;
    if (this.el = t, this.xRange = i, this.yRange = r, this.speed = h, this.time = l, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = s, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.hasPercentages = !1, (i && (a(e = o, n, R).call(e, i.min) || a(m = o, n, R).call(m, i.max)) || r && (a(g = o, n, R).call(g, r.min) || a(f = o, n, R).call(f, r.max))) && (this.hasPercentages = !0), t) {
      const u = window.getComputedStyle(t);
      u.position === "static" && (t.style.position = "relative");
      const d = u.transform;
      (!d || d === "none") && (t.style.transform = "translate3d(0px, 0px, 0px)"), this.hasPercentages && (this.handleResize = this.handleResize.bind(this), window.addEventListener("resize", this.handleResize));
    }
    this.animate = this.animate.bind(this), this.init(l);
  }
  init(t) {
    var i;
    this.noise = a(this, p, T).call(this, a(i = o, n, H).call(i, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, this.raf = requestAnimationFrame(this.animate);
  }
  // Handle window resize for percentage-based values
  handleResize() {
    this.hasPercentages && this.el && (this.needsRecalculation = !0);
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1);
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && (this.raf = requestAnimationFrame(this.animate)));
  }
  destroy() {
    cancelAnimationFrame(this.raf), this.hasPercentages && window.removeEventListener("resize", this.handleResize);
  }
};
n = new WeakSet(), W = function(t) {
  return function() {
    let i = t += 1831565813;
    return i = Math.imul(i ^ i >>> 15, i | 1), i ^= i + Math.imul(i ^ i >>> 7, i | 61), ((i ^ i >>> 14) >>> 0) / 4294967296;
  };
}, H = function(t = 0) {
  var h;
  const i = Array.from({ length: 256 }, (l, s) => s), r = a(h = o, n, W).call(h, t);
  for (let l = 255; l > 0; l--) {
    const s = Math.floor(r() * (l + 1));
    [i[l], i[s]] = [i[s], i[l]];
  }
  return i.concat(i);
}, R = function(t) {
  return typeof t == "string" && t.endsWith("%");
}, v = function(t, i) {
  var h;
  return a(h = o, n, R).call(h, t) ? parseFloat(t) / 100 * i : t;
}, p = new WeakSet(), T = function(t) {
  const i = (s) => s * s * s * (s * (s * 6 - 15) + 10), r = (s, e, m) => e + s * (m - e), h = (s, e, m) => {
    const g = s & 15, f = g < 8 ? e : m, u = g < 4 ? m : g === 12 || g === 14 ? e : 0;
    return (g & 1 ? -f : f) + (g & 2 ? -u : u);
  }, l = (s, e) => s & 1 ? -e : e;
  return {
    // Original 1D Perlin noise function
    perlin1(s) {
      const e = Math.floor(s) & 255;
      s -= Math.floor(s);
      const m = i(s);
      return r(m, l(t[e], s), l(t[e + 1], s - 1));
    },
    // New 2D Perlin noise function
    perlin2(s, e) {
      const m = Math.floor(s) & 255, g = Math.floor(e) & 255;
      s -= Math.floor(s), e -= Math.floor(e);
      const f = i(s), u = i(e), d = t[m] + g, x = t[m + 1] + g, A = t[d], F = t[d + 1], y = t[x], P = t[x + 1];
      return r(
        u,
        r(
          f,
          h(t[A], s, e),
          h(t[y], s - 1, e)
        ),
        r(
          f,
          h(t[F], s, e - 1),
          h(t[P], s - 1, e - 1)
        )
      );
    }
  };
}, $ = function(t, i, r) {
  return t + r * (i - t);
}, L = function(t, i, r, h, l) {
  return (t - i) * (l - h) / (r - i) + h;
}, Y(o, n);
let E = o;
export {
  E as default
};
