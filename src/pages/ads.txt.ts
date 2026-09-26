import type { APIRoute } from 'astro';
import { INTEGRATIONS } from '../config/site';

// AdSense yayıncı kimliği tanımlandığında ads.txt otomatik oluşur.
export const GET: APIRoute = () => {
  const client = INTEGRATIONS.adsenseClient;
  const pub = client.replace(/^ca-/, '');
  const body = client ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# AdSense yayıncı kimliği henüz tanımlanmadı.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
