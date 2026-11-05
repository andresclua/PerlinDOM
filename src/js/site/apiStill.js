import PerlinDOM from '../PerlinDom.js';
import { make, dot, lanes } from './apiDemos.js';

// Static versions of the API demos (reduced motion / static page). Nothing moves: each one
// draws the path the noise *would* take, computed up front by stepping an element-less
// PerlinDOM instance, and leaves a dot where that path ends. Same parts and colours as the
// live demos, so the panel still explains its option. Each factory returns { destroy() }.

const SVG = 'http://www.w3.org/2000/svg';

/**
 * Offsets (px, from the element's base point) of `frames` steps. The instance has no element
 * and is destroyed before the next frame, so the shared loop never runs it.
 * `at(i, inst)` runs before each step (pause partway, move the target); `read` picks what
 * is recorded after it (default: the offset).
 */
function trace({ frames, at, read = inst => [inst.lastX, inst.lastY], ...options }) {
  const inst = new PerlinDOM({ element: null, ...options });
  const pts = [];
  for (let i = 0; i < frames; i++) {
    at?.(i, inst);
    inst.step();
    pts.push(read(inst, i));
  }
  inst.destroy();
  return pts;
}

const range = (rx, ry) => ({ x: { min: -rx, max: rx }, y: { min: -ry, max: ry } });

/**
 * Draws traces inside `box` (an absolutely filled SVG, origin at the box centre, where
 * .demo-dot sits) and moves each trace's dot to its last point. The path fades in from its
 * start, like the live trails. Returns the svg.
 */
function draw(box, items) {
  const w = box.clientWidth;
  const h = box.clientHeight;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'demo-still');
  svg.setAttribute('viewBox', `${-w / 2} ${-h / 2} ${w} ${h}`);
  const CHUNKS = 12;
  for (const { pts, color = 'a', el, mark } of items) {
    const per = Math.ceil(pts.length / CHUNKS);
    for (let c = 0; c < CHUNKS; c++) {
      const seg = pts.slice(Math.max(0, c * per - 1), (c + 1) * per);
      if (seg.length < 2) continue;
      const path = document.createElementNS(SVG, 'path');
      path.setAttribute('d', `M${seg.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`);
      path.setAttribute('class', `demo-still__path demo-still__path--${color}`);
      path.style.opacity = (0.08 + 0.6 * ((c + 1) / CHUNKS)).toFixed(2);
      svg.appendChild(path);
    }
    if (mark != null) {
      const [x, y] = pts[mark];
      const ring = document.createElementNS(SVG, 'circle');
      ring.setAttribute('class', `demo-still__mark demo-still__path--${color}`);
      ring.setAttribute('cx', x.toFixed(1));
      ring.setAttribute('cy', y.toFixed(1));
      ring.setAttribute('r', '6');
      svg.appendChild(ring);
    }
    const [x, y] = pts[pts.length - 1];
    if (el) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }
  box.prepend(svg);
  return svg;
}

/**
 * Builds the demo's DOM once, then (re)draws the traces whenever the stage changes size.
 * `render()` returns the svgs it drew, removed before the next render.
 */
function still(stage, render) {
  let svgs = [];
  const ro = new ResizeObserver(() => {
    svgs.forEach(s => s.remove());
    svgs = render();
  });
  ro.observe(stage);
  return {
    destroy() {
      ro.disconnect();
      stage.replaceChildren();
    },
  };
}

function speed(stage) {
  const speeds = [0.003, 0.016];
  const ls = lanes(stage, speeds.map(s => `speed ${s}`));
  const dots = ls.map((lane, i) => dot(lane, i ? 'b' : ''));
  return still(stage, () => ls.map((lane, i) => draw(lane, [{
    el: dots[i],
    color: i ? 'b' : 'a',
    pts: trace({ frames: 400, speed: speeds[i], seed: 11, ...range(lane.clientWidth * 0.36, lane.clientHeight * 0.3) }),
  }])));
}

function seed(stage) {
  const wrap = make('div', 'demo-cells', stage);
  const seeds = [7, 7, 42];
  const cells = seeds.map(s => {
    const cell = make('div', 'demo-cell', wrap);
    make('span', 'demo-label', cell, `seed ${s}`);
    return cell;
  });
  const dots = cells.map((cell, i) => dot(cell, i === 2 ? 'b' : ''));
  return still(stage, () => cells.map((cell, i) => draw(cell, [{
    el: dots[i],
    color: i === 2 ? 'b' : 'a',
    pts: trace({ frames: 400, speed: 0.011, seed: seeds[i], ...range(cell.clientWidth * 0.34, cell.clientHeight * 0.3) }),
  }])));
}

function ranges(stage, panel) {
  const code = name => panel.querySelector(`[data-live="${name}"]`) || {};
  const box = make('div', 'demo-range', stage);
  const lx = make('span', 'demo-label demo-range__x', box);
  const ly = make('span', 'demo-label demo-range__y', box);
  const dots = [dot(stage), dot(stage, 'b')];
  return still(stage, () => {
    const rx = Math.round(stage.clientWidth * 0.3);
    const ry = Math.round(stage.clientHeight * 0.24);
    box.style.width = `${rx * 2}px`;
    box.style.height = `${ry * 2}px`;
    lx.textContent = `x  ${-rx} … ${rx}`;
    ly.textContent = `y  ${-ry} … ${ry}`;
    code('x-min').textContent = -rx;
    code('x-max').textContent = rx;
    code('y-min').textContent = -ry;
    code('y-max').textContent = ry;
    return [draw(stage, dots.map((el, i) => ({
      el,
      color: i ? 'b' : 'a',
      pts: trace({ frames: 600, speed: 0.006, seed: 3 + i * 50, ...range(rx, ry) }),
    })))];
  });
}

// The ease-out itself: lerpFactor (1 = full speed, 0 = stopped) over time, pause() at the ring.
// 0.03 glides down for seconds, 0.2 stops almost at once.
function lerp(stage) {
  const speeds = [0.03, 0.2];
  const ls = lanes(stage, speeds.map(s => `lerpSpeed ${s}`));
  const dots = ls.map((lane, i) => dot(lane, i ? 'b' : ''));
  const PAUSE = 50;
  const FRAMES = 300;
  return still(stage, () => ls.map((lane, i) => {
    // The plot is laid out below the lane label, measured, so the "pause()" note (which
    // sits just above the plot's top line) can never reach the label at any width.
    const label = lane.querySelector('.demo-label');
    const NOTE = 28; // room above the plot for the note (11px text + gaps)
    const top = label.offsetTop + label.offsetHeight + NOTE;
    const bottom = lane.clientHeight - 16;
    const h = Math.max(24, bottom - top);
    const cy = top + h / 2 - lane.clientHeight / 2; // plot centre, from the lane centre
    const w = lane.clientWidth * 0.76;
    const svg = draw(lane, [{
      el: dots[i],
      color: i ? 'b' : 'a',
      mark: PAUSE,
      pts: trace({
        frames: FRAMES,
        speed: 0.012,
        seed: 21,
        lerpSpeed: speeds[i],
        at: (f, inst) => { if (f === PAUSE) inst.pause(); },
        read: (inst, f) => [(f / (FRAMES - 1) - 0.5) * w, cy + (0.5 - inst.lerpFactor) * h],
      }),
    }]);
    const note = document.createElementNS(SVG, 'text');
    note.setAttribute('class', 'demo-still__note');
    // Beside the ring, in the band between the label and the plot.
    note.setAttribute('x', ((PAUSE / (FRAMES - 1) - 0.5) * w + 12).toFixed(1));
    note.setAttribute('y', (cy - 0.5 * h - 8).toFixed(1));
    note.textContent = 'pause()';
    svg.appendChild(note);
    return svg;
  }));
}

// One frame of the scrub: amplitude falls from 1 (left column) to 0 (right column).
function amplitude(stage) {
  const cols = window.innerWidth < 768 ? 6 : 9;
  const rows = 5;
  const grid = make('div', 'demo-grid', stage);
  grid.style.setProperty('--cols', cols);
  make('span', 'demo-label demo-grid__from', stage, 'amplitude 1');
  make('span', 'demo-label demo-grid__to', stage, '0');
  const dots = [];
  for (let i = 0; i < cols * rows; i++) {
    const cell = make('span', 'demo-grid__cell', grid);
    dots.push(dot(cell, i % 3 === 0 ? 'b' : ''));
  }
  return still(stage, () => {
    const r = Math.min(stage.clientWidth, stage.clientHeight) * 0.32;
    dots.forEach((el, i) => {
      const a = 1 - (i % cols) / (cols - 1);
      const [[x, y]] = trace({ frames: 120, speed: 0.005, seed: 500 + i * 13, amplitude: a, ...range(r, r) }).slice(-1);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
    return [];
  });
}

// The live demo's whole loop at once: eased moves of the target between spots (faint rings),
// three dots at amplitude 0.28 following it, still breathing. Ends on the last spot.
const SPOTS = [[0.55, -0.35], [-0.6, 0.3], [0.4, 0.45], [-0.45, -0.4]];
const MOVE = 84; // frames per move (1.4 s), then
const REST = 36; // frames resting on the spot (0.6 s)
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // power3.inOut

function target(stage, panel) {
  const mark = make('span', 'demo-target', stage);
  const dots = [dot(stage), dot(stage, 'b'), dot(stage, 'sm')];
  const live = panel.querySelector('[data-live="target"]');
  return still(stage, () => {
    const r = Math.min(stage.clientWidth, stage.clientHeight) * 0.42;
    const spots = SPOTS.map(([x, y]) => [Math.round(x * r), Math.round(y * r * 0.8)]);
    const targetAt = f => {
      const k = Math.min(spots.length - 1, Math.floor(f / (MOVE + REST)));
      const from = k ? spots[k - 1] : [0, 0];
      const p = easeInOut(Math.min(1, (f - k * (MOVE + REST)) / MOVE));
      return { x: from[0] + (spots[k][0] - from[0]) * p, y: from[1] + (spots[k][1] - from[1]) * p };
    };
    const [tx, ty] = spots[spots.length - 1];
    mark.style.transform = `translate(${tx}px, ${ty}px)`;
    if (live) live.textContent = `{ x: ${tx}, y: ${ty} }`;
    const svg = draw(stage, dots.map((el, i) => ({
      el,
      color: i === 1 ? 'b' : 'a',
      pts: trace({
        frames: spots.length * (MOVE + REST),
        speed: 0.007,
        seed: 70 + i * 31,
        amplitude: 0.28,
        at: (f, inst) => inst.setTarget(targetAt(f)),
        ...range(r, r),
      }),
    })));
    spots.slice(0, -1).forEach(([x, y]) => {
      const ring = document.createElementNS(SVG, 'circle');
      ring.setAttribute('class', 'demo-still__mark demo-still__path--b');
      ring.setAttribute('cx', x);
      ring.setAttribute('cy', y);
      ring.setAttribute('r', '17');
      ring.style.opacity = '0.45';
      svg.appendChild(ring);
    });
    return [svg];
  });
}

export const stillDemos = { speed, seed, ranges, lerp, amplitude, target };
