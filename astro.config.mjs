import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://hemenhesapla.net').replace(/\/$/, '');
const EXCLUDE = ['/ara/', '/iletisim/tesekkurler/', '/404/'];

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      filter: (page) => !EXCLUDE.some((p) => page.endsWith(p)),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const depth = path.split('/').filter(Boolean).length;
        item.lastmod = new Date().toISOString();
        item.changefreq = depth === 2 ? 'monthly' : 'weekly';
        item.priority = path === '/' ? 1.0 : depth === 1 ? 0.8 : 0.9;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
