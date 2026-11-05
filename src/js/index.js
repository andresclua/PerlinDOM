import { mountNav } from './site/nav.js';
import { mountHero } from './site/hero.js';

mountNav();

const hero = document.querySelector('.hero');
if (hero) mountHero(hero);
