import { mountCopyButton } from './copy.js';

// Code snippets on the docs pages: light syntax colouring (same accents as the landing's
// snippets) plus a header with the language and a Copy button that copies the exact text.

const KEYWORDS = new Set([
  'const', 'let', 'var', 'new', 'import', 'from', 'export', 'default', 'function', 'return',
  'if', 'else', 'true', 'false', 'null', 'undefined', 'await', 'async', 'of', 'for', 'this',
]);

// comment | string | html tag | number | word followed by "(" | word followed by ":" | word
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(<\/?[a-zA-Z][\w-]*|\/?>)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$-]*)(?=\s*:(?!:))|([A-Za-z_$][\w$]*)/g;

const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (cls, s) => `<span class="tok-${cls}">${escape(s)}</span>`;

export function highlight(text) {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    out += escape(text.slice(last, m.index));
    last = m.index + m[0].length;
    const [all, comment, str, tag, num, fn, key, word] = m;
    if (comment) out += span('comment', all);
    else if (str) out += span('string', all);
    else if (tag) out += span('tag', all);
    else if (num) out += span('number', all);
    else if (word && KEYWORDS.has(word)) out += span('keyword', all);
    else if (fn) out += KEYWORDS.has(fn) ? span('keyword', all) : span('fn', all);
    else if (key) out += span('key', all);
    else out += escape(all);
  }
  return out + escape(text.slice(last));
}

let status;
function sharedStatus() {
  if (!status) {
    status = document.createElement('span');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.append(status);
  }
  return status;
}

/** Re-colours a snippet with new text (live snippets that follow a demo's controls). */
export function setSnippet(pre, text) {
  pre.querySelector('code').innerHTML = highlight(text);
}

/**
 * Wraps `<pre data-lang><code>` in a header (language + Copy). `label` names the snippet
 * for screen readers ("Copy code: Quick start"). The copied text is the code's textContent,
 * so it is always exactly what is shown.
 */
export function enhanceSnippet(pre, label) {
  const code = pre.querySelector('code');
  const lang = pre.dataset.lang || 'js';
  if (lang !== 'bash') code.innerHTML = highlight(code.textContent);
  pre.tabIndex = 0; // long lines scroll: keyboard users need to reach them
  pre.setAttribute('aria-label', `Code: ${label}`);

  const box = document.createElement('div');
  box.className = 'snippet';
  const head = document.createElement('div');
  head.className = 'snippet__head';
  head.innerHTML = `<span class="snippet__lang" aria-hidden="true">${lang}</span>`
    + '<button class="snippet__copy" type="button"><span>Copy</span></button>';
  pre.before(box);
  box.append(head, pre);
  const button = head.querySelector('button');
  button.setAttribute('aria-label', `Copy code: ${label}`);
  return mountCopyButton(button, sharedStatus(), () => code.textContent);
}

/** Formats an options object as a JS literal, two-space indented, trailing commas. */
export function literal(value, depth = 0) {
  if (value === null) return 'null';
  if (typeof value === 'string') return value.startsWith('@') ? value.slice(1) : `'${value}'`;
  if (typeof value !== 'object') return String(value);
  const entries = Object.entries(value);
  const flat = entries.every(([, v]) => v === null || typeof v !== 'object');
  if (flat && entries.length <= 3) {
    return `{ ${entries.map(([k, v]) => `${k}: ${literal(v)}`).join(', ')} }`;
  }
  const pad = '  '.repeat(depth + 1);
  return `{\n${entries.map(([k, v]) => `${pad}${k}: ${literal(v, depth + 1)},`).join('\n')}\n${'  '.repeat(depth)}}`;
}
