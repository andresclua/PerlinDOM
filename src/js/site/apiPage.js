import { bootDocsPage } from './docs.js';
import { enhanceSnippet, setSnippet } from './snippet.js';
import { runDemos } from './demos.js';
import * as amplitude from './examples/amplitude.js';

const demo = document.getElementById('amplitude-demo');
setSnippet(demo.querySelector('pre'), amplitude.snippet);

// Copy buttons are named after their section (and sub-heading), read before '#' links exist.
for (const pre of document.querySelectorAll('main pre')) {
  const section = pre.closest('section');
  let label = section.querySelector('h2').textContent.trim();
  let prev = pre.previousElementSibling;
  while (prev && prev.tagName !== 'H3') prev = prev.previousElementSibling;
  if (pre.closest('.card')) label = `${label}, live demo`;
  else if (prev) label = `${label}, ${prev.textContent.trim()}`;
  enhanceSnippet(pre, label);
}

bootDocsPage();
runDemos([{ card: demo, mount: amplitude.mount }]);
mountToc(document.querySelector('.toc'));

/**
 * Desktop: the table of contents is a sticky side list, always open. Mobile: the same
 * <details> becomes a collapsed "On this page" disclosure at the top. The link of the
 * section being read gets aria-current="location".
 */
function mountToc(toc) {
  const details = toc.querySelector('details');
  const desktop = matchMedia('(min-width: 1024px)');
  const sync = () => { details.open = desktop.matches; };
  desktop.addEventListener('change', sync);
  sync();

  // Picking a section on mobile closes the disclosure again.
  toc.addEventListener('click', e => {
    if (e.target.closest('a') && !desktop.matches) details.open = false;
  });

  const links = [...toc.querySelectorAll('a')];
  const sections = links.map(a => document.getElementById(a.hash.slice(1)).closest('section'));
  let queued = false;
  const render = () => {
    queued = false;
    // The current section is the last one whose top has passed a third of the viewport;
    // at the very bottom the last section wins even if it never reaches that line.
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let current = 0;
    sections.forEach((sec, i) => { if (sec.getBoundingClientRect().top <= innerHeight / 3) current = i; });
    if (atEnd) current = sections.length - 1;
    links.forEach((a, i) => {
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(render); }
  }, { passive: true });
  render();
}
