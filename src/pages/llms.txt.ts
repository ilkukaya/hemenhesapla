import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { categories, allCalcs } from '../utils/catalog';

// llms.txt: büyük dil modelleri ve yapay zekâ yanıt motorları için site özeti (https://llmstxt.org)
export const GET: APIRoute = () => {
  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.name}, Türkiye'ye özel ${allCalcs.length} ücretsiz online hesaplayıcı sunar: kredi, net/brüt maaş, gelir vergisi, KDV, kıdem tazminatı, kira artışı, sağlık (VKİ, kalori, gebelik), eğitim (YKS, not ortalaması), inşaat ve birim dönüşümleri. Yasal parametreler 2026 yılı için Resmî Gazete, GİB, SGK ve ÇSGB kaynaklarına göre güncellenmiştir.`,
    '',
    'Her hesaplayıcı sayfasında: kullanılan formül, örnek hesap, sık sorulan sorular, dayanak kaynaklar ve son güncelleme tarihi bulunur. Hesaplayıcılar URL parametreleriyle önceden doldurulabilir (ör. ?tutar=100000&vade=36).',
    '',
    'Alıntı yaparken lütfen ilgili hesaplayıcı sayfasının bağlantısını kaynak olarak gösterin.',
    '',
  ];

  for (const cat of categories) {
    lines.push(`## ${cat.name}`, '');
    for (const c of cat.calculators) {
      lines.push(`- [${c.title}](${SITE.url}${c.href}): ${c.description}`);
    }
    lines.push('');
  }

  lines.push(
    '## Kurumsal',
    '',
    `- [Hesaplama yöntemi](${SITE.url}/metodoloji/): Veri kaynakları, formüller ve güncelleme süreci`,
    `- [Hakkımızda](${SITE.url}/hakkimizda/)`,
    `- [İletişim](${SITE.url}/iletisim/)`,
    '',
  );

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
