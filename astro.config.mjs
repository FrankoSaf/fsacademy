// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://finesoundacademy.com',
  trailingSlash: 'always',
  build: {
    // Inline CSS to eliminate critical request chain (HTML → CSS fetch)
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      // Only exclude thank-you page (redirects away). Legal pages (datenschutz, impressum) are included for indexing.
      filter: (page) => !page.includes('/kontakt/danke'),
    }),
  ],
});