// Runs the live demos of the docs pages (examples cards, the API page's amplitude demo).
//
// Each demo is a card element plus a module `mount(card) -> { destroy, pause?, play? }`.
// - Motion allowed: a demo mounts when its card nears the viewport (lazy). Once mounted it
//   stays mounted; the library's offscreen pause stops its work when scrolled away.
// - prefers-reduced-motion: reduce: nothing mounts by itself. The card shows its static
//   markup and a Play button; the demo starts only when the reader presses it.
// - The preference is followed live: switching it on unmounts every demo, switching it off
//   mounts the ones near the viewport again.
//
// The card's toggle ([data-demo-toggle]) is Play while unmounted. Once mounted it becomes
// Pause / Play if the module returns pause/play (smooth, via the library), and is hidden
// otherwise (the demo has its own controls, e.g. hover).

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function runDemos(items) {
  const demos = items.map(({ card, mount }) => {
    const demo = { card, mount, api: null, near: false, playing: false };
    demo.toggle = card.querySelector('[data-demo-toggle]');
    demo.toggle?.addEventListener('click', () => onToggle(demo));
    render(demo);
    return demo;
  });

  function start(demo) {
    demo.api = demo.mount(demo.card);
    demo.playing = true;
    demo.card.classList.add('is-live');
    render(demo);
  }

  function stop(demo) {
    demo.api?.destroy();
    demo.api = null;
    demo.playing = false;
    demo.card.classList.remove('is-live');
    render(demo);
  }

  function onToggle(demo) {
    if (!demo.api) return start(demo);
    if (demo.playing) demo.api.pause?.();
    else demo.api.play?.();
    demo.playing = !demo.playing;
    render(demo);
  }

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      const demo = demos.find(d => d.card === e.target);
      demo.near = e.isIntersecting;
      if (demo.near && !demo.api && !reduceMotion.matches) start(demo);
    }
  }, { rootMargin: '200px 0px' });
  demos.forEach(d => io.observe(d.card));

  const onPreference = () => {
    demos.forEach(d => {
      if (reduceMotion.matches) stop(d);
      else if (d.near && !d.api) start(d);
    });
  };
  reduceMotion.addEventListener('change', onPreference);

  return {
    destroy() {
      io.disconnect();
      reduceMotion.removeEventListener('change', onPreference);
      demos.forEach(stop);
    },
  };
}

function render(demo) {
  // A demo's own controls (sliders, buttons) only work while it is mounted.
  demo.card.querySelectorAll('[data-needs-demo]').forEach(c => { c.disabled = !demo.api; });
  const t = demo.toggle;
  if (!t) return;
  const canPause = !demo.api || (demo.api.pause && demo.api.play);
  t.hidden = !canPause;
  const playing = !!demo.api && demo.playing;
  t.dataset.state = playing ? 'playing' : 'paused';
  t.querySelector('span').textContent = playing ? 'Pause' : 'Play';
}
