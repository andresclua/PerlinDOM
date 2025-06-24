var S = Object.defineProperty;
var y = (r) => {
  throw TypeError(r);
};
var $ = (r, t, i) => t in r ? S(r, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : r[t] = i;
var M = (r, t, i) => $(r, typeof t != "symbol" ? t + "" : t, i), j = (r, t, i) => t.has(r) || y("Cannot " + i);
var F = (r, t, i) => t.has(r) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(r) : t.set(r, i);
var f = (r, t, i) => (j(r, t, "access private method"), i);
var g, X, R, c, Y, B, d;
const u = class u {
  constructor({
    element: t,
    x: i = null,
    y: a = null,
    speed: n = 0.01,
    seed: o = 0,
    lerpSpeed: s = 0.1
  }) {
    F(this, c);
    M(this, "animate", () => {
      if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = f(this, c, B).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
        this.time += this.speed * this.lerpFactor;
        const t = this.noise.perlin2(this.time, 0), i = this.noise.perlin2(this.time, 100), a = this.xRange ? f(this, c, d).call(this, t, -1, 1, this.xRange.min, this.xRange.max) : 0, n = this.yRange ? f(this, c, d).call(this, i, -1, 1, this.yRange.min, this.yRange.max) : 0;
        this.lastX = a, this.lastY = n, this.el && (this.el.style.left = `${this.initialX + a}px`, this.el.style.top = `${this.initialY + n}px`);
      }
      (this.lerpFactor > 0 || this.targetLerpFactor > 0) && (this.raf = requestAnimationFrame(this.animate));
    });
    this.el = t, this.xRange = i, this.yRange = a, this.speed = n, this.time = o, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = s, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, t ? (this.initialX = t.offsetLeft, this.initialY = t.offsetTop) : (this.initialX = 0, this.initialY = 0), this.animate = this.animate.bind(this), this.init(o);
  }
  init(t) {
    var i;
    this.noise = f(this, c, Y).call(this, f(i = u, g, R).call(i, t)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, this.raf = requestAnimationFrame(this.animate), console.log("PerlinDOM initialized");
  }
  pause() {
    this.isPlaying && (this.targetLerpFactor = 0, this.isPlaying = !1, console.log("PerlinDOM pausing..."));
  }
  play() {
    this.isPlaying || (this.targetLerpFactor = 1, this.isPlaying = !0, this.lerpFactor === 0 && (this.raf = requestAnimationFrame(this.animate)), console.log("PerlinDOM playing..."));
  }
  destroy() {
    cancelAnimationFrame(this.raf);
  }
};
g = new WeakSet(), X = function(t) {
  return function() {
    let i = t += 1831565813;
    return i = Math.imul(i ^ i >>> 15, i | 1), i ^= i + Math.imul(i ^ i >>> 7, i | 61), ((i ^ i >>> 14) >>> 0) / 4294967296;
  };
}, R = function(t = 0) {
  var n;
  const i = Array.from({ length: 256 }, (o, s) => s), a = f(n = u, g, X).call(n, t);
  for (let o = 255; o > 0; o--) {
    const s = Math.floor(a() * (o + 1));
    [i[o], i[s]] = [i[s], i[o]];
  }
  return i.concat(i);
}, c = new WeakSet(), Y = function(t) {
  const i = (s) => s * s * s * (s * (s * 6 - 15) + 10), a = (s, e, h) => e + s * (h - e), n = (s, e, h) => {
    const l = s & 15, p = l < 8 ? e : h, m = l < 4 ? h : l === 12 || l === 14 ? e : 0;
    return (l & 1 ? -p : p) + (l & 2 ? -m : m);
  }, o = (s, e) => s & 1 ? -e : e;
  return {
    // Original 1D Perlin noise function
    perlin1(s) {
      const e = Math.floor(s) & 255;
      s -= Math.floor(s);
      const h = i(s);
      return a(h, o(t[e], s), o(t[e + 1], s - 1));
    },
    // New 2D Perlin noise function
    perlin2(s, e) {
      const h = Math.floor(s) & 255, l = Math.floor(e) & 255;
      s -= Math.floor(s), e -= Math.floor(e);
      const p = i(s), m = i(e), A = t[h] + l, L = t[h + 1] + l, b = t[A], v = t[A + 1], q = t[L], D = t[L + 1];
      return a(
        m,
        a(
          p,
          n(t[b], s, e),
          n(t[q], s - 1, e)
        ),
        a(
          p,
          n(t[v], s, e - 1),
          n(t[D], s - 1, e - 1)
        )
      );
    }
  };
}, B = function(t, i, a) {
  return t + a * (i - t);
}, d = function(t, i, a, n, o) {
  return (t - i) * (o - n) / (a - i) + n;
}, F(u, g);
let P = u;
export {
  P as default
};
