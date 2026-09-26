/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_GA_ID?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly PUBLIC_BING_SITE_VERIFICATION?: string;
  readonly PUBLIC_YANDEX_VERIFICATION?: string;
  readonly PUBLIC_AD_SLOT_IN_CONTENT?: string;
  readonly PUBLIC_AD_SLOT_SIDEBAR?: string;
  readonly PUBLIC_AD_SLOT_AFTER_RESULT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
