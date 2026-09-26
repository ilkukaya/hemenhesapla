// Uygulama ikonlarını (PNG + ICO) favicon tasarımından üretir.
// Kullanım: node scripts/generate-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const mark = (size, { pad = 0, bg = '#15171A', fg = '#F7F7F4', radius = 9, full = false } = {}) => {
  const inner = 32 - pad * 2;
  const s = inner / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  ${full ? `<rect width="32" height="32" fill="${bg}"/>` : ''}
  <g transform="translate(${pad} ${pad}) scale(${s})">
    <rect width="32" height="32" rx="${full ? 0 : radius}" fill="${bg}"/>
    <path d="M9 9.5v13M9 16h7.5M16.5 9.5v13" fill="none" stroke="${fg}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M20.5 16h4.5M22.75 13.75v4.5" fill="none" stroke="#E8541E" stroke-width="2.6" stroke-linecap="round"/>
  </g></svg>`;
};

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

writeFileSync('public/icons/icon-192.png', png(mark(192), 192));
writeFileSync('public/icons/icon-512.png', png(mark(512), 512));
writeFileSync('public/icons/icon-maskable-512.png', png(mark(512, { pad: 5, full: true }), 512));
writeFileSync('public/icons/apple-touch-icon.png', png(mark(180, { pad: 3, full: true }), 180));

// ICO (PNG gömülü, 32x32)
const p32 = png(mark(32), 32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(p32.length, 14); header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, p32]));
console.log('ikonlar üretildi');
