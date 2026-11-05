const LINKS = [
  ['Home', 'index.html'],
  ['API', 'api.html'],
  ['Examples', 'examples.html'],
];

export function mountNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Main');
  nav.innerHTML =
    LINKS.map(([label, page]) => {
      const here = page === current ? ' aria-current="page"' : '';
      return `<a href="./${page}"${here}>${label}</a>`;
    }).join('') +
    '<a class="site-nav__ext" href="https://github.com/andresclua/PerlinDOM" target="_blank" rel="noopener">GitHub</a>';
  document.body.prepend(nav);
}
