// Small helpers shared by the example modules.

/** pause / play / destroy over a list of PerlinDOM instances (the card's Pause / Play). */
export const group = instances => ({
  pause: () => instances.forEach(inst => inst.pause()),
  play: () => instances.forEach(inst => inst.play()),
  destroy: () => instances.forEach(inst => inst.destroy()),
});

/** Adds a listener and returns its remover, so destroy() can undo every one. */
export function on(target, type, fn, options) {
  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}

/** `{ min: -n, max: n }` */
export const span = n => ({ min: typeof n === 'string' ? `-${n}` : -n, max: n });
