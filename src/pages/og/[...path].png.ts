// Her sayfa için derleme sırasında 1200x630 paylaşım görseli üretir.
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { categories, allCalcs } from '../../utils/catalog';

const require = createRequire(import.meta.url);
const fontDir = require.resolve('@fontsource/bricolage-grotesque/package.json').replace(/package\.json$/, 'files/');
const font = (subset: string, weight: number) =>
  readFileSync(`${fontDir}bricolage-grotesque-${subset}-${weight}-normal.woff`);

const fonts = [
  { name: 'Bricolage', data: font('latin', 800), weight: 800 as const, style: 'normal' as const },
  { name: 'Bricolage', data: font('latin-ext', 800), weight: 800 as const, style: 'normal' as const },
  { name: 'Bricolage', data: font('latin', 500), weight: 500 as const, style: 'normal' as const },
  { name: 'Bricolage', data: font('latin-ext', 500), weight: 500 as const, style: 'normal' as const },
];

interface OgProps {
  title: string;
  description: string;
  label: string;
  color: string;
}

export const getStaticPaths: GetStaticPaths = () => {
  const paths: { params: { path: string }; props: OgProps }[] = [
    {
      params: { path: 'default' },
      props: {
        title: 'Aradığın hesap, saniyeler içinde.',
        description: 'Kredi, maaş, vergi, sağlık ve sınav hesaplamaları. 2026 güncel verileriyle, ücretsiz.',
        label: `${allCalcs.length} ücretsiz hesaplayıcı`,
        color: '#E8541E',
      },
    },
  ];
  for (const cat of categories) {
    paths.push({
      params: { path: cat.slug },
      props: { title: `${cat.name} hesaplama araçları`, description: cat.description, label: `${cat.calculators.length} araç`, color: cat.color },
    });
    for (const c of cat.calculators) {
      paths.push({
        params: { path: `${cat.slug}/${c.slug}` },
        props: { title: c.title, description: c.description, label: cat.name, color: cat.color },
      });
    }
  }
  return paths;
};

const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { title, description, label, color } = props as OgProps;

  const tree = h(
    'div',
    {
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      background: '#F7F7F4', padding: '64px 72px', fontFamily: 'Bricolage', color: '#15171A', position: 'relative',
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        h('div', { width: 56, height: 56, borderRadius: 16, background: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }, [
          h('div', { display: 'flex', color: '#F7F7F4', fontSize: 30, fontWeight: 800, marginRight: 8 }, 'H'),
          h('div', { display: 'flex', color: '#E8541E', fontSize: 30, fontWeight: 800, position: 'absolute', right: 8, top: 7 }, '+'),
        ]),
        h('div', { display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: -1 }, [
          h('span', {}, 'hemen'),
          h('span', { color: '#E8541E' }, 'hesapla'),
        ]),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000 }, [
        h('div', { display: 'flex', fontSize: title.length > 28 ? 68 : 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }, title),
        h('div', { display: 'flex', fontSize: 32, fontWeight: 500, color: '#4B5058', lineHeight: 1.3 }, description),
      ]),
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 500, color: '#15171A' }, [
          h('div', { width: 14, height: 14, borderRadius: 7, background: color }),
          label,
        ]),
        h('div', { display: 'flex', fontSize: 26, fontWeight: 500, color: '#676C75' }, '2026 güncel · ücretsiz · hemenhesapla.net'),
      ]),
      h('div', { position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: color }),
    ],
  );

  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
