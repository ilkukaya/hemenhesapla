import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

// Arama motorları ve yapay zekâ tabanlı yanıt motorları (GEO/AEO) için açık erişim.
const body = `# ${SITE.name}
User-agent: *
Allow: /
Disallow: /ara/
Disallow: /iletisim/tesekkurler/

# Yapay zekâ arama ve yanıt motorları: içeriklerimizi kaynak göstererek kullanabilir
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: YandexBot
Allow: /

Sitemap: ${SITE.url}/sitemap-index.xml
`;

export const GET: APIRoute = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
