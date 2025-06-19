var R = Object.defineProperty;
var m = (e) => {
  throw TypeError(e);
};
var X = (e, i, t) => i in e ? R(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var u = (e, i, t) => X(e, typeof i != "symbol" ? i + "" : i, t), Y = (e, i, t) => i.has(e) || m("Cannot " + t);
var g = (e, i, t) => i.has(e) ? m("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, t);
var o = (e, i, t) => (Y(e, i, "access private method"), t);
var l, y, d, h, L, P, f;
const c = class c {
  constructor({
    element: i,
    x: t = null,
    y: n = null,
    speed: r = 0.01,
    seed: s = 0,
    lerpSpeed: a = 0.1
  }) {
    g(this, h);
    u(this, "animate", () => {
      if (this.lerpFactor !== this.targetLerpFactor && (this.lerpFactor = o(this, h, P).call(this, this.lerpFactor, this.targetLerpFactor, this.lerpSpeed), Math.abs(this.lerpFactor - this.targetLerpFactor) < 1e-3 && (this.lerpFactor = this.targetLerpFactor)), this.lerpFactor > 0) {
        this.time += this.speed * this.lerpFactor;
        const i = this.noise.perlin1(this.time), t = this.noise.perlin1(this.time + 999), n = this.xRange ? o(this, h, f).call(this, i, -1, 1, this.xRange.min, this.xRange.max) : 0, r = this.yRange ? o(this, h, f).call(this, t, -1, 1, this.yRange.min, this.yRange.max) : 0;
        this.lastX = n, this.lastY = r, this.el.style.left = `${this.initialX + n}px`, this.el.style.top = `${this.initialY + r}px`;
      }
      (this.lerpFactor > 0 || this.targetLerpFactor > 0) && (this.raf = requestAnimationFrame(this.animate));
    });
    this.el = i, this.xRange = t, this.yRange = n, this.speed = r, this.time = s, this.isPlaying = !0, this.lerpFactor = 1, this.lerpSpeed = a, this.targetLerpFactor = 1, this.lastX = 0, this.lastY = 0, this.initialX = i.offsetLeft, this.initialY = i.offsetTop, this.animate = this.animate.bind(this), this.init(s);
  }
  init(i) {
    var t;
    this.noise = o(this, h, L).call(this, o(t = c, l, d).call(t, i)), this.isPlaying = !0, this.lerpFactor = 1, this.targetLerpFactor = 1, this.raf = requestAnimationFrame(this.animate), console.log("PerlinDOM initialized");
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
l = new WeakSet(), y = function(i) {
  return function() {
    let t = i += 1831565813;
    return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}, d = function(i = 0) {
  var r;
  const t = Array.from({ length: 256 }, (s, a) => a), n = o(r = c, l, y).call(r, i);
  for (let s = 255; s > 0; s--) {
    const a = Math.floor(n() * (s + 1));
    [t[s], t[a]] = [t[a], t[s]];
  }
  return t.concat(t);
}, h = new WeakSet(), L = function(i) {
  const t = (s) => s * s * s * (s * (s * 6 - 15) + 10), n = (s, a, p) => a + s * (p - a), r = (s, a) => s & 1 ? -a : a;
  return {
    perlin1(s) {
      const a = Math.floor(s) & 255;
      s -= Math.floor(s);
      const p = t(s);
      return n(p, r(i[a], s), r(i[a + 1], s - 1));
    }
  };
}, P = function(i, t, n) {
  return i + n * (t - i);
}, f = function(i, t, n, r, s) {
  return (i - t) * (s - r) / (n - t) + r;
}, g(c, l);
let F = c;
export {
  F as default
};
