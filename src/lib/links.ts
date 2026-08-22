/**
 * Link normalization.
 *
 * astro.config.mjs sets `trailingSlash: 'always'`, so `/preise` is not a valid
 * URL on this site — it 301-redirects to `/preise/`. Any internal link written
 * without the slash (in a template or in content/*.json) costs the visitor an
 * extra round trip and burns crawl budget on redirect hops.
 *
 * Route every internal href through `href()` so the canonical form is emitted
 * regardless of how an editor typed it in the CMS.
 */

/** True for anything we must not touch: absolute URLs, mailto/tel, fragments, queries. */
function isExternal(url: string): boolean {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(url) || // http:, https:, mailto:, tel:, ...
    url.startsWith('//') ||
    url.startsWith('#')
  );
}

/**
 * Normalize an internal path to the site's canonical trailing-slash form.
 * Leaves external URLs, `mailto:`/`tel:`, fragments and file paths untouched.
 */
export function href(url: string | undefined | null): string {
  if (!url) return '/';
  const raw = String(url).trim();
  if (isExternal(raw)) return raw;

  // Split off ?query and #fragment so the slash lands on the path, not the tail.
  const match = /^([^?#]*)(.*)$/.exec(raw);
  const path = match?.[1] ?? raw;
  const tail = match?.[2] ?? '';

  if (path === '' || path === '/') return `/${tail}`;
  // A path segment with an extension is a file (/favicon.ico), not a page.
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return raw;
  if (path.endsWith('/')) return raw;

  return `${path}/${tail}`;
}

/** True when the link leaves the site and therefore needs target/rel hardening. */
export function isExternalHref(url: string | undefined | null): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(String(url).trim());
}

/** `target`/`rel` pair for a link, so every component treats externals alike. */
export function linkAttrs(url: string | undefined | null): {
  target?: '_blank';
  rel?: 'noopener noreferrer';
} {
  return isExternalHref(url)
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
}
