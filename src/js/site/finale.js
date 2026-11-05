import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PerlinDOM from '../PerlinDom.js';
import { createDot, mulberry32 } from './dots.js';
import { onRefreshJump } from './scroll.js';

gsap.registerPlugin(ScrollTrigger);

const COUNT_DESKTOP = 160;
const COUNT_MOBILE = 45;
const COMMAND = 'npm install @andresclua/perlindom';

/**
 * Chapter 5: a field of circles arrives gathered in a quiet ring around the install line,
 * then the pinned scroll raises amplitude back to 1 and everything floats again.
 *
 * `still` (reduced motion / static page): the ring at rest (amplitude 0), copy visible, no pin.
 */
export function mountFinale(root, { still = false } = {}) {
  const field = root.querySelector('.finale__field');
  const copy = root.querySelector('.finale__copy');
  const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP;
  const rand = mulberry32(5150);
  const frag = document.createDocumentFragment();
  const dots = [];
  for (let i = 0; i < count; i++) {
    const d = createDot(rand);
    d.angle = rand() * Math.PI * 2;
    d.jitter = rand() - 0.5;
    frag.appendChild(d.el);
    dots.push(d);
  }
  field.appendChild(frag);

  const instances = still ? [] : dots.map((d, i) => new PerlinDOM({
    element: d.el,
    speed: 0.002 + d.depth * 0.004 + rand() * 0.0015,
    seed: 9000 + i * 7919,
    amplitude: 0,
  }));

  function layout() {
    const w = root.clientWidth;
    const h = root.clientHeight;
    const scale = Math.min(1, Math.max(0.7, w / 1440));
    const rx = Math.min(w * 0.42, 560);
    const ry = Math.min(h * 0.34, 300);
    dots.forEach((d, i) => {
      const s = d.size * scale;
      const r = (40 + d.depth * 110) * scale;
      const bx = d.u * w;
      const by = d.v * h;
      d.el.style.setProperty('--s', `${s.toFixed(1)}px`);
      d.el.style.left = `${bx.toFixed(1)}px`;
      d.el.style.top = `${by.toFixed(1)}px`;
      const k = 1 + d.jitter * 0.16;
      const x = w / 2 + Math.cos(d.angle) * rx * k - bx;
      const y = h / 2 + Math.sin(d.angle) * ry * k - by;
      const inst = instances[i];
      if (!inst) {
        d.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        return;
      }
      inst.xRange = { min: -r, max: r };
      inst.yRange = { min: -r, max: r };
      inst.setTarget({ x, y });
    });
  }
  layout();

  const copyButton = mountCopyButton(root);
  if (still) {
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 150);
    };
    window.addEventListener('resize', onResize);
    return {
      destroy() {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        copyButton.destroy();
        dots.forEach(d => d.el.remove());
      },
    };
  }

  const state = { amp: 0 };
  const applyAmplitude = () => instances.forEach(inst => { inst.amplitude = state.amp; });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'ch-finale',
      trigger: root,
      start: 'top top',
      end: () => `+=${window.innerHeight * 1.1}`,
      pin: true,
      scrub: 0.8,
      onRefresh: self => {
        layout();
        onRefreshJump(self);
      },
    },
  });
  // The copy arrives framed by the ring first, then the ring lets go.
  tl.fromTo(copy.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }, 0)
    .to(state, { amp: 1, duration: 0.65, ease: 'power2.inOut', onUpdate: applyAmplitude }, 0.2)
    .to({}, { duration: 0.15 });
  tl.progress(tl.scrollTrigger.progress);

  // Keyboard users can tab into the copy before the scroll has revealed it (opacity 0):
  // bring the pin to the point where the copy is fully in, and skip the scrub's catch-up.
  const st = tl.scrollTrigger;
  const REVEALED = 0.5; // timeline progress at which every copy child is at opacity 1
  const onFocusIn = () => {
    if (st.progress >= REVEALED) return;
    window.scrollTo(0, Math.ceil(st.start + (st.end - st.start) * REVEALED));
    ScrollTrigger.update();
    st.getTween()?.progress(1);
    tl.progress(st.progress);
  };
  copy.addEventListener('focusin', onFocusIn);

  return {
    destroy() {
      copy.removeEventListener('focusin', onFocusIn);
      copyButton.destroy();
      tl.scrollTrigger?.kill(true);
      tl.kill();
      gsap.set(copy.children, { clearProps: 'opacity,transform' });
      instances.forEach(inst => inst.destroy());
      dots.forEach(d => d.el.remove());
    },
  };
}

// The Copy button: clipboard write, a visible 'Copied' state and a polite status for AT.
function mountCopyButton(root) {
  const copyBtn = root.querySelector('[data-copy]');
  const status = root.querySelector('[data-copy-status]');
  let resetTimer = 0;
  const onCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(COMMAND);
      ok = true;
    } catch {
      ok = legacyCopy(COMMAND);
    }
    status.textContent = ok ? 'Copied' : 'Copy failed, select the command manually';
    copyBtn.classList.toggle('is-done', ok);
    copyBtn.querySelector('span').textContent = ok ? 'Copied' : 'Copy';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      status.textContent = '';
      copyBtn.classList.remove('is-done');
      copyBtn.querySelector('span').textContent = 'Copy';
    }, 2000);
  };
  copyBtn.addEventListener('click', onCopy);

  return {
    destroy() {
      clearTimeout(resetTimer);
      copyBtn.removeEventListener('click', onCopy);
    },
  };
}

// Fallback when the async clipboard is missing or refused (insecure context, old browser).
function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  // iOS needs focus plus an explicit range; select() alone copies nothing there.
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}
