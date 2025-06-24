var $ = Object.defineProperty;
var q = (c) => {
  throw TypeError(c);
};
var j = (c, t, i) => t in c ? $(c, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : c[t] = i;
var D = (c, t, i) => j(c, typeof t != "symbol" ? t + "" : t, i), O = (c, t, i) => t.has(c) || q("Cannot " + i);
var A = (c, t, i) => t.has(c) ? q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(c) : t.set(c, i);
var a = (c, t, i) => (O(c, t, "access private method"), i);
var n, W, H, u, X, p, S, T, L;
const o = class o {
  constructor({
    element: t,
    x: i = null,
    y: h = null,
    speed: r = 0.01,
    seed: l = 0,
    lerpSpeed: s = 0.1
  }) {
    A(this, p);
    D(this, "animate", () => {
      var t, i, h, r, l, s, e, g, m, f, R, y;
      if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = a(this, p, T).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
        this.time += this.speed * this.lerpFactor;
        const P = this.noise.perlin2(this.time, 0), Y = this.noise.perlin2(this.time, 100);
        if (this.el) {
          let d, F, x, v;
          if (this.hasPercentages) {
            const b = this.el.parentElement || document.body, B = b.clientWidth, w = b.clientHeight;
            this.xRange && (d = a(t = o, n, u).call(t, this.xRange.min) ? a(i = o, n, X).call(i, this.xRange.min, B) : this.xRange.min, F = a(h = o, n, u).call(h, this.xRange.max) ? a(r = o, n, X).call(r, this.xRange.max, B) : this.xRange.max), this.yRange && (x = a(l = o, n, u).call(l, this.yRange.min) ? a(s = o, n, X).call(s, this.yRange.min, w) : this.yRange.min, v = a(e = o, n, u).call(e, this.yRange.max) ? a(g = o, n, X).call(g, this.yRange.max, w) : this.yRange.max);
          } else
            d = (m = this.xRange) == null ? void 0 : m.min, F = (f = this.xRange) == null ? void 0 : f.max, x = (R = this.yRange) == null ? void 0 : R.min, v = (y = this.yRange) == null ? void 0 : y.max;
          const M = this.xRange ? a(this, p, L).call(this, P, -1, 1, d, F) : 0, z = this.yRange ? a(this, p, L).call(this, Y, -1, 1, x, v) : 0;
          this.lastX = M, this.lastY = z, this.el.style.left = `${this.initialX + M}px`, this.el.style.top = `${this.initialY + z}px`;
        } else {
          const d = this.xRange ? a(this, p, L).call(this, P, -1, 1, this.xRange.min, this.xRange.max) : 0, F = this.yRange ? a(this, p, L).call(this, Y, -1, 1, this.yRange.min, this.yRange.max) : 0;
          this.lastX = d, this.lastY = F;
        }
      }
      (this.lerpFactor > 0 || this.targetLerpFactor > 0) && (this.raf = requestAnimationFrame(this.animate));
    });
    var e, g, m, f;
    this.el = t, this.xRange = i, this.yRange = h, this.speed = r, this.time = l, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = s, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.hasPercentages = !1, (i && (a(e = o, n, u).call(e, i.min) || a(g = o, n, u).call(g, i.max)) || h && (a(m = o, n, u).call(m, h.min) || a(f = o, n, u).call(f, h.max))) && (this.hasPercentages = !0), t ? (this.initialX = t.offsetLeft, this.initialY = t.offsetTop, this.hasPercentages && (this.handleResize = this.handleResize.bind(this), window.addEventListener("resize", this.handleResize))) : (this.initialX = 0, this.initialY = 0), this.animate = this.animate.bind(this), this.init(l);
  }
  init(t) {
    var i;
    this.noise = a(this, p, S).call(this, a(i = o, n, H).call(i, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, this.raf = requestAnimationFrame(this.animate), console.log("PerlinDOM initialized");
  }
  // Handle window resize for percentage-based values
  handleResize() {
    this.hasPercentages && this.el && (this.needsRecalculation = !0);
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1, console.log("PerlinDOM pausing..."));
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && (this.raf = requestAnimationFrame(this.animate)), console.log("PerlinDOM playing..."));
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
  var r;
  const i = Array.from({ length: 256 }, (l, s) => s), h = a(r = o, n, W).call(r, t);
  for (let l = 255; l > 0; l--) {
    const s = Math.floor(h() * (l + 1));
    [i[l], i[s]] = [i[s], i[l]];
  }
  return i.concat(i);
}, u = function(t) {
  return typeof t == "string" && t.endsWith("%");
}, X = function(t, i) {
  var r;
  return a(r = o, n, u).call(r, t) ? parseFloat(t) / 100 * i : t;
}, p = new WeakSet(), S = function(t) {
  const i = (s) => s * s * s * (s * (s * 6 - 15) + 10), h = (s, e, g) => e + s * (g - e), r = (s, e, g) => {
    const m = s & 15, f = m < 8 ? e : g, R = m < 4 ? g : m === 12 || m === 14 ? e : 0;
    return (m & 1 ? -f : f) + (m & 2 ? -R : R);
  }, l = (s, e) => s & 1 ? -e : e;
  return {
    // Original 1D Perlin noise function
    perlin1(s) {
      const e = Math.floor(s) & 255;
      s -= Math.floor(s);
      const g = i(s);
      return h(g, l(t[e], s), l(t[e + 1], s - 1));
    },
    // New 2D Perlin noise function
    perlin2(s, e) {
      const g = Math.floor(s) & 255, m = Math.floor(e) & 255;
      s -= Math.floor(s), e -= Math.floor(e);
      const f = i(s), R = i(e), y = t[g] + m, P = t[g + 1] + m, Y = t[y], d = t[y + 1], F = t[P], x = t[P + 1];
      return h(
        R,
        h(
          f,
          r(t[Y], s, e),
          r(t[F], s - 1, e)
        ),
        h(
          f,
          r(t[d], s, e - 1),
          r(t[x], s - 1, e - 1)
        )
      );
    }
  };
}, T = function(t, i, h) {
  return t + h * (i - t);
}, L = function(t, i, h, r, l) {
  return (t - i) * (l - r) / (h - i) + r;
}, A(o, n);
let E = o;
export {
  E as default
};
