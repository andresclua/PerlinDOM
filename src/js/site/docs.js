import { mountNav } from './nav.js';

// Shared setup of the two docs pages (API, examples): nav, skip link first in tab order,
// and a "#" anchor link after every heading that has an id.
export function bootDocsPage() {
  mountNav();
  const skip = document.querySelector('.skip-link');
  if (skip) document.body.prepend(skip);

  for (const h of document.querySelectorAll('main :is(h2, h3)[id]')) {
    const a = document.createElement('a');
    a.className = 'anchor';
    a.href = `#${h.id}`;
    a.setAttribute('aria-label', `Link to this section: ${h.textContent.trim()}`);
    a.textContent = '#';
    h.append(a);
  }
}
