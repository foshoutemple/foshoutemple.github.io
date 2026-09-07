import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  base: process.env.BASE_PATH || '/',
  site: process.env.SITE_URL || 'https://foshoutemple.github.io',
  integrations: [sitemap({
    // List the content pages, excluding the language redirect and 404 page.
    filter: (page) => /\/(zh-hans|zh-hant|en)\//.test(new URL(page).pathname),
    i18n: {
      defaultLocale: 'zh-hant',
      locales: { 'zh-hans': 'zh-Hans', 'zh-hant': 'zh-Hant', en: 'en' },
    },
  })],
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'never' },
});
