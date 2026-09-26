// Sitenin tek merkezden yönetilen ayarları.
// Reklam, analiz ve doğrulama kimlikleri Netlify ortam değişkenlerinden gelir;
// boş bırakıldıklarında ilgili kod sayfaya hiç eklenmez.

const env = import.meta.env;

export const SITE = {
  name: 'Hemen Hesapla',
  shortName: 'HemenHesapla',
  url: (env.PUBLIC_SITE_URL || 'https://hemenhesapla.net').replace(/\/$/, ''),
  locale: 'tr_TR',
  lang: 'tr',
  tagline: 'Hesabı hemen yap',
  description:
    "Kredi, maaş, vergi, sağlık, sınav ve günlük hesaplamalar için 2026 güncel verileriyle çalışan, ücretsiz ve reklamı az online hesaplama araçları.",
  email: 'iletisim@hemenhesapla.net',
  foundingYear: 2026,
  themeColor: { light: '#F7F7F4', dark: '#0F1114' },
} as const;

export const INTEGRATIONS = {
  // Google AdSense yayıncı kimliği, ör. "ca-pub-1234567890123456"
  adsenseClient: (env.PUBLIC_ADSENSE_CLIENT || '').trim(),
  // Google Analytics 4 ölçüm kimliği, ör. "G-XXXXXXXXXX"
  gaId: (env.PUBLIC_GA_ID || '').trim(),
  // Search Console / Bing / Yandex site doğrulama kodları (yalnızca content değeri)
  googleVerification: (env.PUBLIC_GOOGLE_SITE_VERIFICATION || '').trim(),
  bingVerification: (env.PUBLIC_BING_SITE_VERIFICATION || '').trim(),
  yandexVerification: (env.PUBLIC_YANDEX_VERIFICATION || '').trim(),
  // AdSense reklam birimi (slot) kimlikleri. Boşsa otomatik reklam biçimi kullanılır.
  adSlots: {
    inContent: (env.PUBLIC_AD_SLOT_IN_CONTENT || '').trim(),
    sidebar: (env.PUBLIC_AD_SLOT_SIDEBAR || '').trim(),
    afterResult: (env.PUBLIC_AD_SLOT_AFTER_RESULT || '').trim(),
  },
} as const;

export const hasAds = INTEGRATIONS.adsenseClient.startsWith('ca-pub-');

export function absoluteUrl(path = '/') {
  return new URL(path, SITE.url + '/').href;
}
