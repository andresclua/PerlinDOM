// Entries come from pull requests: keep only well-formed ones, https links only.
const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

// Optional screenshot: a file committed under src/public/showcase/ (no external hotlinks, no path tricks).
const IMAGE = /^showcase\/[\w-]+\.(png|jpe?g|webp)$/i;

export function validEntries(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(e => {
    if (!e || !str(e.title, 80) || !str(e.by, 60) || !str(e.description, 220) || !str(e.url, 300)) return false;
    if (e.image !== undefined && !(typeof e.image === 'string' && IMAGE.test(e.image))) return false;
    try {
      return new URL(e.url).protocol === 'https:';
    } catch {
      return false;
    }
  });
}
