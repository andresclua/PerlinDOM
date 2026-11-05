import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountNav } from './site/nav.js';
import { mountHero } from './site/hero.js';
import { mountLetters } from './site/letters.js';
import { mountApiChapters } from './site/apiChapters.js';
import { mountFinale } from './site/finale.js';
import { mountBackdrop } from './site/backdrop.js';
import { keepStoryPositionOnResize, manageScrollRestoration } from './site/scroll.js';

const restoreScroll = manageScrollRestoration();
mountNav();

const hero = document.querySelector('.hero');
const api = document.querySelector('.api');
const finale = document.querySelector('.finale');

// Chapter hues (purple / indigo / blue / teal). Each API panel gets its own pair.
const HERO = { a: '#1a0b3b', b: '#0d3b66' };
const LETTERS = { a: '#260a4a', b: '#1d2370' };
const PANELS = [
  { a: '#170e4c', b: '#0b3a78' },
  { a: '#10154f', b: '#0a4a7e' },
  { a: '#0b1c4c', b: '#075470' },
  { a: '#0a2244', b: '#0a5d68' },
  { a: '#1c0f4d', b: '#223283' },
  { a: '#280f4c', b: '#173f80' },
];
const FINALE = { a: '#2a0c52', b: '#0e4a7c' };

function backdropStops() {
  const at = id => ScrollTrigger.getById(id);
  const stops = [{ at: 0, ...HERO }];
  const letters = at('ch-letters');
  if (letters) stops.push({ at: letters.start, ...HERO }, { at: letters.end, ...LETTERS });
  const apiST = at('ch-api');
  if (apiST) {
    const span = apiST.end - apiST.start;
    PANELS.forEach((c, i) => stops.push({ at: apiST.start + (span * i) / PANELS.length, ...c }));
    stops.push({ at: apiST.end, ...PANELS[PANELS.length - 1] });
  }
  const fin = at('ch-finale');
  if (fin) stops.push({ at: fin.start, ...FINALE });
  return stops;
}

/**
 * The one place that decides how the story runs. Every chapter takes `{ still }`:
 * - animated: pins, scrub, noise drift (the default);
 * - still: the chapters' end states as a plain, static page. Used when the OS asks for
 *   reduced motion, or when the reader picks "View as a static page".
 * The second case is also the non-scroll path for screen-reader and keyboard users: in the
 * animated story, API panels 2-6 stay visibility:hidden until the pin scrolls to them, so the
 * first focusable element on the page (the motion toggle, visible on focus) offers the same
 * static page, where every panel and the finale are plain, reachable content.
 */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const STATIC_KEY = 'perlindom:static';
const readChoice = () => {
  try { return sessionStorage.getItem(STATIC_KEY) === '1'; } catch { return false; }
};
const saveChoice = on => {
  try { on ? sessionStorage.setItem(STATIC_KEY, '1') : sessionStorage.removeItem(STATIC_KEY); } catch { /* storage blocked */ }
};
let chosenStatic = readChoice();
const wantStill = () => reduceMotion.matches || chosenStatic;

function mountStory(still) {
  document.documentElement.classList.toggle('is-static', still);
  const parts = [];
  // Chapters mount top to bottom: pins must be created in page order.
  if (hero) {
    parts.push(mountHero(hero, { still }));
    if (!still) parts.push(mountLetters(hero.querySelector('.hero__title')));
  }
  if (api) parts.push(mountApiChapters(api, { still }));
  if (finale) parts.push(mountFinale(finale, { still }));
  if (!still) parts.push(mountBackdrop(backdropStops));
  return {
    still,
    // Reverse order: later pins are reverted before the ones they sit after.
    destroy: () => parts.reverse().forEach(p => p.destroy()),
  };
}

// The chapter the reader is in, to land on the same one after switching modes.
function currentChapter() {
  const mid = window.innerHeight / 2;
  return [hero, api, finale].filter(Boolean).findLast(s => {
    const box = s.parentElement.classList.contains('pin-spacer') ? s.parentElement : s;
    return box.getBoundingClientRect().top <= mid;
  });
}

const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'motion-toggle';
const renderToggle = () => {
  // With the OS preference on there is nothing to switch back to.
  toggle.hidden = reduceMotion.matches;
  toggle.textContent = story.still ? 'Play the animated story' : 'View as a static page';
};

let story = mountStory(wantStill());

function sync() {
  const still = wantStill();
  if (still !== story.still) {
    const chapter = currentChapter();
    story.destroy();
    story = mountStory(still);
    ScrollTrigger.refresh();
    if (chapter && chapter !== hero) {
      const box = chapter.parentElement.classList.contains('pin-spacer') ? chapter.parentElement : chapter;
      window.scrollTo(0, box.getBoundingClientRect().top + window.scrollY);
    } else {
      window.scrollTo(0, 0);
    }
  }
  renderToggle();
}

toggle.addEventListener('click', () => {
  chosenStatic = !story.still;
  saveChoice(chosenStatic);
  sync();
});
reduceMotion.addEventListener('change', sync);
// Dev only (stripped from builds): lets a test count live triggers across mode switches.
if (import.meta.env.DEV) window.__story = { ScrollTrigger, get still() { return story.still; } };
renderToggle();
document.body.prepend(toggle); // before the nav: first in tab order

// All pins exist now, so the page has its real height. Listen first, so the restore's own
// refresh is the one that marks the resize handler ready; then put the reader back.
keepStoryPositionOnResize();
restoreScroll();
