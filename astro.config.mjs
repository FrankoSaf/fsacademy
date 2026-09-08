// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://finesoundacademy.com',
  trailingSlash: 'always',
  build: {
    // 'auto' inlines only small stylesheets and links the rest.
    //
    // This was 'always', to avoid the HTML -> CSS request chain. But the sheet
    // had grown to ~40KB per page (38-44% of every HTML file), inlined into all
    // 20 pages with no way to cache it: navigating home -> preise re-downloaded
    // essentially the same 40KB. One shared stylesheet, pinned immutable under
    // /_astro/ in netlify.toml, is fetched once and then free for the rest of
    // the session - and over HTTP/2 the extra request is cheap.
    inlineStylesheets: 'auto',
  },
  // Dev parity for the /duesseldorf/ -> / consolidation.
  //
  // netlify.toml only applies on Netlify, so `astro dev` and any plain static
  // preview 404 on /duesseldorf/. This emits a noindex meta-refresh stub there
  // instead. The netlify.toml rule carries force = true so production still
  // answers with a real 301 rather than serving this stub.
  redirects: {
    '/duesseldorf/': '/',
  },
  integrations: [
    sitemap({
      // /kontakt/danke/ redirects away; 404 must never be advertised.
      filter: (page) => !page.includes('/kontakt/danke') && !page.includes('/404'),
    }),
  ],
});