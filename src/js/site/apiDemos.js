import gsap from 'gsap';
import PerlinDOM from '../PerlinDom.js';

// Live demos for the API chapter. Each factory builds its DOM inside `stage`, starts its
// PerlinDOM instances and returns { update?(local), destroy() }; destroy removes everything.

function make(tag, className, parent, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  parent?.appendChild(el);
  return el;
}

function dot(parent, variant = '') {
  return make('span', `demo-dot${variant ? ` demo-dot--${variant}` : ''}`, parent);
}

/**
 * Fading motion paths on a canvas behind the dots, plus one shared rAF for per-frame UI.
 * Positions are read from layout (getBoundingClientRect), so they include PerlinDOM's transform.
 */
function motion(stage, items, { onFrame, onResize } = {}) {
  const canvas = make('canvas', 'demo-trails');
  stage.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(stage);
  const colors = {
    a: css.getPropertyValue('--accent').trim() || '#b9a4ff',
    b: css.getPropertyValue('--accent-2').trim() || '#7fe0ff',
  };
  const LEN = 120;
  items.forEach(it => { it.pts = []; });

  let w = 0;
  let h = 0;
  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = stage.clientWidth;
    h = stage.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    items.forEach(it => { it.pts.length = 0; });
    onResize?.();
  };
  const ro = new ResizeObserver(size);
  ro.observe(stage);

  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const sr = stage.getBoundingClientRect();
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.25;
    ctx.lineCap = 'round';
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      it.pts.push(r.left + r.width / 2 - sr.left, r.top + r.height / 2 - sr.top);
      if (it.pts.length > LEN * 2) it.pts.splice(0, 2);
      ctx.strokeStyle = colors[it.color || 'a'];
      const n = it.pts.length / 2;
      for (let i = 1; i < n; i++) {
        ctx.globalAlpha = (i / n) * 0.55;
        ctx.beginPath();
        ctx.moveTo(it.pts[i * 2 - 2], it.pts[i * 2 - 1]);
        ctx.lineTo(it.pts[i * 2], it.pts[i * 2 + 1]);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    onFrame?.();
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}

function lanes(stage, labels) {
  const wrap = make('div', 'demo-lanes', stage);
  return labels.map(label => {
    const lane = make('div', 'demo-lane', wrap);
    make('span', 'demo-label', lane, label);
    return lane;
  });
}

// Two lanes, same ranges and seed, only `speed` differs.
function speed(stage) {
  const ls = lanes(stage, ['speed 0.003', 'speed 0.016']);
  const dots = ls.map((lane, i) => dot(lane, i ? 'b' : ''));
  const insts = dots.map((el, i) => new PerlinDOM({ element: el, speed: i ? 0.016 : 0.003, seed: 11 }));
  const fit = () => insts.forEach((inst, i) => {
    const lw = ls[i].clientWidth * 0.36;
    const lh = ls[i].clientHeight * 0.3;
    inst.xRange = { min: -lw, max: lw };
    inst.yRange = { min: -lh, max: lh };
  });
  fit();
  const stop = motion(stage, dots.map((el, i) => ({ el, color: i ? 'b' : 'a' })), { onResize: fit });
  return {
    destroy() {
      stop();
      insts.forEach(inst => inst.destroy());
      stage.replaceChildren();
    },
  };
}

// Three cells: seed 7, seed 7 (identical path), seed 42 (a different one).
function seed(stage) {
  const wrap = make('div', 'demo-cells', stage);
  const seeds = [7, 7, 42];
  const cells = seeds.map(s => {
    const cell = make('div', 'demo-cell', wrap);
    make('span', 'demo-label', cell, `seed ${s}`);
    return cell;
  });
  const dots = cells.map((cell, i) => dot(cell, i === 2 ? 'b' : ''));
  const insts = dots.map((el, i) => new PerlinDOM({ element: el, speed: 0.011, seed: seeds[i] }));
  const fit = () => insts.forEach((inst, i) => {
    const rx = cells[i].clientWidth * 0.34;
    const ry = cells[i].clientHeight * 0.3;
    inst.xRange = { min: -rx, max: rx };
    inst.yRange = { min: -ry, max: ry };
  });
  fit();
  const stop = motion(stage, dots.map((el, i) => ({ el, color: i === 2 ? 'b' : 'a' })), { onResize: fit });
  return {
    destroy() {
      stop();
      insts.forEach(inst => inst.destroy());
      stage.replaceChildren();
    },
  };
}

// A dashed outline drawn at exactly the allowed range; two dots never leave it.
function ranges(stage, panel) {
  const code = name => panel.querySelector(`[data-live="${name}"]`) || {};
  const box = make('div', 'demo-range', stage);
  const lx = make('span', 'demo-label demo-range__x', box);
  const ly = make('span', 'demo-label demo-range__y', box);
  const dots = [dot(stage), dot(stage, 'b')];
  const insts = dots.map((el, i) => new PerlinDOM({ element: el, speed: 0.006, seed: 3 + i * 50 }));
  const fit = () => {
    const rx = Math.round(stage.clientWidth * 0.3);
    const ry = Math.round(stage.clientHeight * 0.24);
    box.style.width = `${rx * 2}px`;
    box.style.height = `${ry * 2}px`;
    lx.textContent = `x  ${-rx} … ${rx}`;
    ly.textContent = `y  ${-ry} … ${ry}`;
    // The snippet shows the exact numbers the demo runs with.
    code('x-min').textContent = -rx;
    code('x-max').textContent = rx;
    code('y-min').textContent = -ry;
    code('y-max').textContent = ry;
    insts.forEach(inst => {
      inst.xRange = { min: -rx, max: rx };
      inst.yRange = { min: -ry, max: ry };
    });
  };
  fit();
  const stop = motion(stage, dots.map((el, i) => ({ el, color: i ? 'b' : 'a' })), { onResize: fit });
  return {
    destroy() {
      stop();
      insts.forEach(inst => inst.destroy());
      stage.replaceChildren();
    },
  };
}

// Same motion, two lerpSpeeds; the panel's real button calls pause()/play() on both.
function lerp(stage, panel) {
  const ls = lanes(stage, ['lerpSpeed 0.03', 'lerpSpeed 0.2']);
  const meters = ls.map(lane => make('span', 'demo-meter', lane));
  const dots = ls.map((lane, i) => dot(lane, i ? 'b' : ''));
  const insts = dots.map((el, i) => new PerlinDOM({
    element: el, speed: 0.012, seed: 21, lerpSpeed: i ? 0.2 : 0.03,
  }));
  const fit = () => insts.forEach((inst, i) => {
    const lw = ls[i].clientWidth * 0.36;
    const lh = ls[i].clientHeight * 0.3;
    inst.xRange = { min: -lw, max: lw };
    inst.yRange = { min: -lh, max: lh };
  });
  fit();

  const button = panel.querySelector('[data-toggle]');
  const call = panel.querySelector('[data-live="call"]');
  const render = playing => {
    button.textContent = playing ? 'Pause' : 'Play';
    // The label itself says the action (Pause / Play), so no aria-pressed on top of it.
    button.dataset.state = playing ? 'playing' : 'paused';
    if (call) call.textContent = playing ? 'play' : 'pause';
  };
  const onClick = () => {
    const playing = !insts[0].isPlaying;
    insts.forEach(inst => (playing ? inst.play() : inst.pause()));
    render(playing);
  };
  button.disabled = false;
  button.addEventListener('click', onClick);
  render(true);

  const stop = motion(stage, dots.map((el, i) => ({ el, color: i ? 'b' : 'a' })), {
    onResize: fit,
    // Each lane's meter shows its lerpFactor easing between 1 (playing) and 0 (paused).
    onFrame: () => insts.forEach((inst, i) => meters[i].style.setProperty('--f', inst.lerpFactor.toFixed(3))),
  });
  return {
    destroy() {
      stop();
      button.removeEventListener('click', onClick);
      button.disabled = true;
      render(true);
      insts.forEach(inst => inst.destroy());
      stage.replaceChildren();
    },
  };
}

// A grid of dots; scroll drives amplitude from 1 (chaos) to 0 (each on its grid spot).
function amplitude(stage, panel) {
  const ease = gsap.parseEase('power2.inOut');
  const mobile = window.innerWidth < 768;
  const cols = mobile ? 6 : 9;
  const rows = 5;
  const grid = make('div', 'demo-grid', stage);
  grid.style.setProperty('--cols', cols);
  const live = panel.querySelector('[data-live="amplitude"]');
  const dots = [];
  for (let i = 0; i < cols * rows; i++) {
    const cell = make('span', 'demo-grid__cell', grid);
    dots.push(dot(cell, i % 3 === 0 ? 'b' : ''));
  }
  const insts = dots.map((el, i) => new PerlinDOM({ element: el, speed: 0.005, seed: 500 + i * 13 }));
  const fit = () => {
    const r = Math.min(stage.clientWidth, stage.clientHeight) * 0.32;
    insts.forEach(inst => {
      inst.xRange = { min: -r, max: r };
      inst.yRange = { min: -r, max: r };
    });
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(stage);
  return {
    update(local) {
      const a = 1 - ease(Math.min(1, Math.max(0, local)));
      insts.forEach(inst => { inst.amplitude = a; });
      if (live) live.textContent = a.toFixed(2);
    },
    destroy() {
      ro.disconnect();
      insts.forEach(inst => inst.destroy());
      stage.replaceChildren();
    },
  };
}

// Three dots at low amplitude orbit a shared target; GSAP tweens the target, the noise keeps breathing.
function target(stage, panel) {
  const mark = make('span', 'demo-target', stage);
  const dots = [dot(stage), dot(stage, 'b'), dot(stage, 'sm')];
  const live = panel.querySelector('[data-live="target"]');
  const insts = dots.map((el, i) => new PerlinDOM({ element: el, speed: 0.007, seed: 70 + i * 31, amplitude: 0.28 }));
  const t = { x: 0, y: 0 };
  let r = 100;
  const fit = () => {
    r = Math.min(stage.clientWidth, stage.clientHeight) * 0.42;
    insts.forEach(inst => {
      inst.xRange = { min: -r, max: r };
      inst.yRange = { min: -r, max: r };
    });
  };
  fit();
  const apply = () => {
    insts.forEach(inst => inst.setTarget(t));
    mark.style.transform = `translate(${t.x}px, ${t.y}px)`;
    if (live) live.textContent = `{ x: ${Math.round(t.x)}, y: ${Math.round(t.y)} }`;
  };
  apply();
  const spots = [[0.55, -0.35], [-0.6, 0.3], [0.4, 0.45], [-0.45, -0.4], [0, 0]];
  const tl = gsap.timeline({ repeat: -1 });
  spots.forEach(([x, y]) => {
    tl.to(t, { x: () => x * r, y: () => y * r * 0.8, duration: 1.4, ease: 'power3.inOut', onUpdate: apply });
    tl.to({}, { duration: 0.6 });
  });
  const stop = motion(stage, dots.map((el, i) => ({ el, color: i === 1 ? 'b' : 'a' })), { onResize: fit });
  return {
    destroy() {
      tl.kill();
      stop();
      insts.forEach(inst => inst.destroy());
      stage.replaceChildren();
    },
  };
}

export const demos = { speed, seed, ranges, lerp, amplitude, target };
