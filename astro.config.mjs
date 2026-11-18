import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// GitHub Pages: https://<org>.github.io/<repo>/
// Change SITE / BASE_PATH here or through environment variables when the repo exists.
const SITE = process.env.SITE_URL ?? 'https://audritogiorgio.github.io';
const BASE = process.env.BASE_PATH ?? '/GRAPE';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [tailwind({ applyBaseStyles: false })],
});
