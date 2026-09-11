// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://shaofeng.page',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
