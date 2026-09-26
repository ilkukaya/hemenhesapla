import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { popularCalcs } from '../utils/catalog';

export const GET: APIRoute = () => {
  const manifest = {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    lang: 'tr',
    dir: 'ltr',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: SITE.themeColor.light,
    theme_color: SITE.themeColor.light,
    categories: ['finance', 'utilities', 'education', 'health'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: popularCalcs.slice(0, 4).map((c) => ({ name: c.title, url: c.href })),
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
