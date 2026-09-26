# Hemen Hesapla – Kurulum ve Gelir Rehberi

Bu rehber teknik bilgi gerektirmeden sitenin tamamen canlı, Google'da görünür ve gelir getirir hâle gelmesi için **sizin** yapmanız gereken adımları sırayla anlatır. Kod tarafında yapılması gereken her şey hazırdır; aşağıdaki kimlikleri aldıkça Netlify'a girmeniz (veya Claude'a iletmeniz) yeterlidir.

---

## 1. Alan adı (hemenhesapla.net)

Site şu an **https://hemenhesapla.netlify.app** adresinde yayında. Kod, kanonik adres olarak `https://hemenhesapla.net` kullanır.

1. Alan adını henüz almadıysanız bir kayıt firmasından (ör. Natro, İsimtescil, Cloudflare, Namecheap) `hemenhesapla.net` alın.
2. Netlify → **hemenhesapla** projesi → **Domain management** → **Add a domain** → `hemenhesapla.net` yazın.
3. Netlify'ın verdiği DNS kayıtlarını (veya Netlify DNS ad sunucularını) alan adı firmanızın paneline girin.
4. HTTPS sertifikası Netlify tarafından otomatik ve ücretsiz verilir.

> Farklı bir alan adı kullanacaksanız: Netlify → **Site configuration → Environment variables** → `PUBLIC_SITE_URL` = `https://yeni-alan-adi.com` ekleyin ve yeniden yayınlayın.

## 2. Google Search Console (ücretsiz – en önemli adım)

1. https://search.google.com/search-console → **Mülk ekle** → **URL öneki** → `https://hemenhesapla.net`
2. Doğrulama yöntemi olarak **HTML etiketi**'ni seçin. `content="..."` içindeki kodu kopyalayın.
3. Netlify'da ortam değişkeni ekleyin: `PUBLIC_GOOGLE_SITE_VERIFICATION` = (kopyaladığınız kod) → yeniden yayınlayın → Search Console'da **Doğrula**.
4. **Site haritaları** bölümüne `sitemap-index.xml` yazıp gönderin.

Aynısını ücretsiz olarak Bing ve Yandex için de yapın (Yandex Türkiye'de önemli bir trafik kaynağıdır):
- Bing Webmaster Tools → `PUBLIC_BING_SITE_VERIFICATION`
- Yandex Webmaster → `PUBLIC_YANDEX_VERIFICATION`

## 3. Google Analytics 4 (ücretsiz)

1. https://analytics.google.com → yeni mülk → Web akışı → `https://hemenhesapla.net`
2. **Ölçüm kimliğini** (`G-XXXXXXXXXX`) kopyalayın.
3. Netlify'da `PUBLIC_GA_ID` = `G-XXXXXXXXXX` ekleyin.

Kimlik eklendiğinde KVKK uyumlu çerez bildirimi otomatik olarak açılır (Google Consent Mode v2). Sitede şu olaylar ölçülür: `calculate` (hesaplama yapıldı), `result_copy`, `result_share`, `affiliate_click`.

## 4. Google AdSense (reklam geliri)

AdSense başvurusu için sitenin kendi alan adında yayında olması, yeterli ve özgün içeriğe sahip olması ve gizlilik/iletişim sayfalarının bulunması gerekir — bunların hepsi hazır.

1. https://adsense.google.com → başvurun, siteyi `hemenhesapla.net` olarak ekleyin.
2. Size verilen **yayıncı kimliğini** (`ca-pub-1234567890123456`) Netlify'a `PUBLIC_ADSENSE_CLIENT` olarak girin ve yeniden yayınlayın. Bu işlem:
   - AdSense kodunu sayfalara ekler,
   - `ads.txt` dosyasını otomatik oluşturur,
   - Reklam alanlarını (sonuç altı, SSS üstü, masaüstü kenar çubuğu) açar.
3. Onay geldikten sonra AdSense → **Reklamlar → Reklam birimine göre** üç "Görüntülü reklam" birimi oluşturun ve kimliklerini ekleyin (isteğe bağlı ama gelir için önerilir):
   - `PUBLIC_AD_SLOT_AFTER_RESULT` – hesaplama sonucunun altı (en değerli alan)
   - `PUBLIC_AD_SLOT_IN_CONTENT` – içerik / SSS bölümü
   - `PUBLIC_AD_SLOT_SIDEBAR` – masaüstü kenar çubuğu (300×600)
4. AdSense → **Gizlilik ve mesajlaşma** → Avrupa (GDPR) ziyaretçileri için Google'ın ücretsiz onay mesajını etkinleştirin.

> Önerilen yol: Trafik ayda ~50.000 oturumu geçtiğinde Ezoic veya benzeri bir reklam ağına geçmek RPM'i genellikle belirgin şekilde artırır.

## 5. Satış ortaklığı (affiliate) geliri

Hesaplayıcılar yüksek satın alma niyeti taşıyan trafiği çeker (kredi, sigorta, mevduat, yatırım hesabı, fitness ürünleri, yapı market, sınav hazırlık). Sitede bu tekliflerin yerleri hazırdır: `src/data/affiliates.json`.

Başvurabileceğiniz ücretsiz programlar:
| Alan | Program örnekleri |
|---|---|
| Kredi / mevduat / kredi kartı karşılaştırma | HangiKredi, Enuygun Finans, Hesapkurdu ortaklık programları, Gelir Ortakları, Admitad |
| Sigorta (kasko, trafik, sağlık) | Sigortam.net, Koalay ortaklık programları |
| Yatırım hesabı | Aracı kurumların "arkadaşını getir" / ortaklık programları |
| E-ticaret (tartı, protein, boya, parke) | Hepsiburada Affiliate, Trendyol Partner, Amazon.com.tr Ortaklık Programı |
| Eğitim | Online kurs platformlarının ortaklık programları |

Bir programa kabul edildiğinizde size özel takip linkini Claude'a iletin (veya `affiliates.json` içinde ilgili teklifin `url` alanına yazıp `enabled` değerini `true` yapın). Kutular otomatik olarak **Sponsorlu** etiketiyle ve doğru sayfalarda görünür.

## 6. Netlify'da ortam değişkeni ekleme

Netlify → **hemenhesapla** → **Site configuration** → **Environment variables** → **Add a variable**. Ekledikten sonra **Deploys → Trigger deploy → Deploy site** ile yeniden yayınlayın.

| Değişken | Ne işe yarar | Örnek |
|---|---|---|
| `PUBLIC_SITE_URL` | Kanonik alan adı | `https://hemenhesapla.net` |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console doğrulama | `abc123...` |
| `PUBLIC_BING_SITE_VERIFICATION` | Bing doğrulama | `1234ABCD...` |
| `PUBLIC_YANDEX_VERIFICATION` | Yandex doğrulama | `a1b2c3...` |
| `PUBLIC_GA_ID` | Google Analytics 4 | `G-XXXXXXXXXX` |
| `PUBLIC_ADSENSE_CLIENT` | AdSense yayıncı kimliği | `ca-pub-1234567890123456` |
| `PUBLIC_AD_SLOT_AFTER_RESULT` | Sonuç altı reklam birimi | `1234567890` |
| `PUBLIC_AD_SLOT_IN_CONTENT` | İçerik reklam birimi | `1234567890` |
| `PUBLIC_AD_SLOT_SIDEBAR` | Kenar çubuğu reklam birimi | `1234567890` |

## 7. Büyüme için ücretsiz yapılacaklar

- **Google İşletme / sosyal profiller:** X, Instagram, LinkedIn ve YouTube'da "hemenhesapla" adını alın; profillere siteyi ekleyin.
- **Mevsimsel içerik:** Ocak ve Temmuz'da (asgari ücret, memur zammı, vergi dilimi, kıdem tavanı) aramalar patlar. Bu dönemlerde ilgili sayfaları güncelleyip sosyal medyada paylaşın.
- **Paylaşım:** Her sonuç, girilen değerleri içeren bir bağlantıyla paylaşılabilir; WhatsApp gruplarında ve forumlarda (Ekşi Sözlük, Donanımhaber, Reddit r/Turkey) doğal olarak yayılması için idealdir.
- **Backlink:** Üniversite öğrenci toplulukları (vize-final), muhasebe blogları (net-brüt maaş) ve emlak siteleri (kira artışı, tapu harcı) ile içerik iş birlikleri yapın.
- **Yıllık güncelleme takvimi:** 1 Ocak ve 1 Temmuz'dan önce `src/data/` klasöründeki yasal değerleri güncelleyin (Claude'a "2027 verilerini güncelle" demeniz yeterli).

## Teknik özet (geliştiriciler için)

- Astro (statik site) + Tailwind CSS v4, Netlify'da barındırılır; `main` dal yerine üretim dalı `claude/turkish-calculator-platform-74uTT`'dir.
- `npm run dev` – yerel geliştirme, `npm run build` – üretim derlemesi, `npm run icons` – uygulama ikonlarını yeniden üretir.
- Her sayfa için OG görseli derleme sırasında `src/pages/og/[...path].png.ts` ile üretilir.
- Yapısal veri (JSON-LD): Organization, WebSite + SearchAction, WebPage, BreadcrumbList, WebApplication, FAQPage, HowTo, CollectionPage/ItemList.
- Yapay zekâ arama motorları için `llms.txt` ve açık `robots.txt` kuralları bulunur.
