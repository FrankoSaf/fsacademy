// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://finesoundacademy.com',
  build: {
    // Inline CSS to eliminate critical request chain (HTML → CSS fetch)
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/datenschutz') &&
        !page.includes('/impressum') &&
        !page.includes('/kontakt/danke'),
    }),
  ],
});