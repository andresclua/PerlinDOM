import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { demos } from './apiDemos.js';
import { onRefreshJump } from './scroll.js';

gsap.registerPlugin(ScrollTrigger);

const HOLD = 0.62; // share of each slot a panel stays fully on screen before handing over

/**
 * Chapter 4: one pinned stage, one panel per option. Scroll hands over from panel to panel;
 * a step list and a progress bar show where you are. Each panel's demo (its PerlinDOM
 * instances, DOM and rAF) exists only while the panel is on screen, or about to be.
 */
export function mountApiChapters(root) {
  const panels = [...root.querySelectorAll('.api-panel')];
  const n = panels.length;
  const copies = panels.map(p => p.querySelector('.api-panel__copy'));
  const stages = panels.map(p => p.querySelector('.api-panel__stage'));
  const stepsEl = root.querySelector('.api__steps');
  const fill = root.querySelector('.api__progress-fill');

  const steps = panels.map((p, i) => {
    const li = document.createElement('li');
    li.className = 'api__step';
    li.innerHTML = `<span class="api__step-n">${String(i + 1).padStart(2, '0')}</span><span class="api__step-t"></span>`;
    li.lastChild.textContent = p.dataset.step || p.querySelector('.api-panel__title').textContent;
    stepsEl.appendChild(li);
    return li;
  });

  const live = new Map(); // panel index -> running demo
  let inView = false;
  let active = -1;

  function sync() {
    const t = tl.time();
    const i = Math.min(n - 1, Math.floor(t));
    const frac = t - i;
    const want = new Set();
    if (inView) {
      want.add(i);
      if (i < n - 1 && frac > HOLD - 0.08) want.add(i + 1);
    }
    for (const [k, demo] of live) {
      if (!want.has(k)) {
        demo.destroy();
        live.delete(k);
      }
    }
    for (const k of want) {
      if (!live.has(k)) live.set(k, demos[panels[k].dataset.demo](stages[k], panels[k]));
      // local: 0 when the panel starts coming in, 1 at the end of its hold
      live.get(k).update?.((t - k + 0.38) / (HOLD + 0.38));
    }
    const now = i < n - 1 && frac > HOLD + 0.16 ? i + 1 : i;
    if (now !== active) {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === now));
      active = now;
    }
    fill.style.transform = `scaleX(${tl.progress().toFixed(4)})`;
  }

  const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => sync() });
  gsap.set(panels.slice(1), { autoAlpha: 0 });
  for (let i = 0; i < n - 1; i++) {
    const at = i + HOLD;
    tl.to(copies[i], { y: -40, duration: 0.3, ease: 'power2.in' }, at)
      .to(stages[i], { scale: 0.96, duration: 0.3, ease: 'power2.in' }, at)
      .to(panels[i], { autoAlpha: 0, duration: 0.22 }, at + 0.06)
      .fromTo(panels[i + 1], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, immediateRender: false }, at + 0.18)
      .fromTo(copies[i + 1], { y: 50 }, { y: 0, duration: 0.3, ease: 'power2.out', immediateRender: false }, at + 0.14)
      .fromTo(stages[i + 1], { scale: 1.04 }, { scale: 1, duration: 0.34, ease: 'power2.out', immediateRender: false }, at + 0.14);
  }
  tl.to({}, { duration: n - 0.25 - tl.duration() });

  const st = ScrollTrigger.create({
    id: 'ch-api',
    trigger: root,
    start: 'top top',
    end: () => `+=${window.innerHeight * n * 0.85}`,
    pin: true,
    scrub: 0.6,
    animation: tl,
    // Settle in the middle of a panel's hold when scrolling stops.
    snap: {
      snapTo: panels.map((_, i) => (i + HOLD / 2) / tl.duration()).concat([0, 1]),
      duration: { min: 0.25, max: 0.7 },
      delay: 0.12,
      inertia: false, // nearest panel, not a velocity projection (a fast flick would skip panels)
      ease: 'power2.inOut',
    },
    onRefresh: onRefreshJump,
  });

  // Demos run only while the chapter (including its pin spacer) touches the viewport.
  const view = ScrollTrigger.create({
    trigger: root.parentElement.classList.contains('pin-spacer') ? root.parentElement : root,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: self => {
      inView = self.isActive;
      sync();
    },
  });

  inView = view.isActive;
  tl.progress(st.progress);
  sync();

  return {
    destroy() {
      view.kill();
      st.kill(true);
      tl.kill();
      live.forEach(demo => demo.destroy());
      live.clear();
      steps.forEach(s => s.remove());
      gsap.set([...panels, ...copies, ...stages], { clearProps: 'all' });
      fill.style.transform = '';
    },
  };
}
