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

// Chapters mount top to bottom: pins must be created in page order.
const hero = document.querySelector('.hero');
const api = document.querySelector('.api');
const finale = document.querySelector('.finale');
if (hero) {
  mountHero(hero);
  mountLetters(hero.querySelector('.hero__title'));
}
if (api) mountApiChapters(api);
if (finale) mountFinale(finale);

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

mountBackdrop(() => {
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
});

// All pins exist now, so the page has its real height: put the reader back, then watch resizes.
restoreScroll();
keepStoryPositionOnResize();
