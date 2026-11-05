import { bootDocsPage } from '../docs.js';
import { enhanceSnippet, setSnippet } from '../snippet.js';
import { runDemos } from '../demos.js';
import * as basic from './basic.js';
import * as horizontal from './horizontal.js';
import * as seeds from './seeds.js';
import * as background from './background.js';
import * as hover from './hover.js';
import * as controls from './controls.js';
import * as button from './button.js';
import * as triangle from './triangle.js';
import * as units from './units.js';
import * as resizable from './resizable.js';
import * as mixed from './mixed.js';
import * as amplitude from './amplitude.js';

// Card id (examples.html) -> module. Each module exports `snippet` and `mount(card)`.
const MODULES = {
  basic, horizontal, seeds, background, hover, controls, button, triangle, units, resizable, mixed, amplitude,
};

runDemos(Object.entries(MODULES).map(([id, mod]) => {
  const card = document.getElementById(id);
  const pre = card.querySelector('pre');
  setSnippet(pre, mod.snippet);
  enhanceSnippet(pre, card.querySelector('h2').textContent.trim());
  return { card, mount: mod.mount };
}));

bootDocsPage(); // after the snippets read the plain heading text (it adds '#' links)
