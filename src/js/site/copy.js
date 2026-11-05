// The Copy button used across the site: clipboard write, a visible 'Copied' state and a
// polite status message for assistive tech. `getText()` is read at click time.
export function mountCopyButton(button, status, getText) {
  const label = button.querySelector('span') || button;
  let resetTimer = 0;
  const onCopy = async () => {
    const text = getText();
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    status.textContent = ok ? 'Copied' : 'Copy failed, select the text manually';
    button.classList.toggle('is-done', ok);
    label.textContent = ok ? 'Copied' : 'Copy';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      status.textContent = '';
      button.classList.remove('is-done');
      label.textContent = 'Copy';
    }, 2000);
  };
  button.addEventListener('click', onCopy);

  return {
    destroy() {
      clearTimeout(resetTimer);
      button.removeEventListener('click', onCopy);
    },
  };
}

// Fallback when the async clipboard is missing or refused (insecure context, old browser).
function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  // iOS needs focus plus an explicit range; select() alone copies nothing there.
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}
