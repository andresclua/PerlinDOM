import { bootDocsPage } from './docs.js';
import { validEntries } from './showcaseData.js';
import entries from '../../showcase.json';

bootDocsPage();

const list = document.querySelector('.sc-list');
for (const e of validEntries(entries)) {
  const li = document.createElement('li');
  li.className = 'sc-card';
  if (e.image) {
    const img = document.createElement('img');
    img.src = `./${e.image}`;
    img.alt = `Screenshot of ${e.title}`;
    img.loading = 'lazy';
    img.className = 'sc-card__img';
    li.append(img);
  }
  const a = document.createElement('a');
  a.href = e.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'sc-card__title';
  a.textContent = e.title;
  const p = document.createElement('p');
  p.textContent = e.description;
  const by = document.createElement('span');
  by.className = 'sc-card__by';
  by.textContent = `by ${e.by}`;
  li.append(a, p, by);
  list.append(li);
}
