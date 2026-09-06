import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  base: process.env.BASE_PATH || '/',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'never' },
});
