import { mountNav } from './nav.js';

// Shared setup of the two docs pages (API, examples): nav, skip link first in tab order,
// and a "#" anchor link after every heading that has an id.
export function bootDocsPage() {
  mountNav();
  const skip = document.querySelector('.skip-link');
  if (skip) document.body.prepend(skip);

  for (const h of document.querySelectorAll('main :is(h2, h3)[id]')) {
    // The heading text moves into its own span, and everything that is named or described
    // by the heading points at that span instead: the anchor link stays out of those names.
    const text = document.createElement('span');
    text.id = `${h.id}-text`;
    text.append(...h.childNodes);
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      for (const el of document.querySelectorAll(`[${attr}~="${h.id}"]`)) {
        el.setAttribute(attr, el.getAttribute(attr).split(/\s+/).map(id => (id === h.id ? text.id : id)).join(' '));
      }
    }
    const a = document.createElement('a');
    a.className = 'anchor';
    a.href = `#${h.id}`;
    a.setAttribute('aria-label', `Link to this section: ${text.textContent.trim()}`);
    a.textContent = '#';
    h.append(text, a);
  }
}
