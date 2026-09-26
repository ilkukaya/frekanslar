# Frekanslar – Yayın ve Gelir Rehberi (teknik olmayan sürüm)

Bu dosya, sitenin **sizin yapmanız gereken** (hesap açma, onay verme gibi yalnızca sizin yapabileceğiniz)
adımlarını sırasıyla anlatır. Kodla ilgili her şey hazırdır; aşağıdaki değerleri Netlify'a girdiğiniz anda
site kendini otomatik günceller.

> **Değer nereye girilir?** Netlify → Projects → **frekanslar** → **Project configuration → Environment
> variables → Add a variable**. Kaydettikten sonra **Deploys → Trigger deploy → Deploy project** deyin.

## 1. Google Search Console (ücretsiz, en önemli adım)

1. <https://search.google.com/search-console> → **Mülk ekle** → **URL ön eki** → `https://frekanslar.netlify.app`
2. Doğrulama yöntemi olarak **HTML etiketi**ni seçin. Size `content="AbC123..."` gibi bir kod verir.
3. Netlify'da `PUBLIC_GOOGLE_SITE_VERIFICATION` = `AbC123...` (sadece tırnak içindeki kısım) ekleyin, yeniden
   deploy edin, sonra Search Console'da **Doğrula**'ya basın.
4. Sol menü **Site haritaları** → `sitemap-index.xml` yazıp **Gönder**.

## 2. Bing Webmaster Tools (ücretsiz; ChatGPT ve Copilot aramaları Bing'i kullanır)

1. <https://www.bing.com/webmasters> → **Search Console'dan içe aktar** (en kolayı) ya da siteyi elle ekleyin.
2. Elle eklerseniz meta etiket kodunu `PUBLIC_BING_SITE_VERIFICATION` olarak girin.
3. Site haritası: `https://frekanslar.netlify.app/sitemap-index.xml`
4. IndexNow zaten kurulu: GitHub → **Actions → IndexNow → Run workflow** ile tüm sayfaları anında
   bildirebilirsiniz (her pazartesi otomatik de çalışır).

## 3. Google Analytics 4 (ücretsiz)

1. <https://analytics.google.com> → Yönetici → **Mülk oluştur** → Web akışı → site adresi.
2. Size `G-XXXXXXX` şeklinde bir **Ölçüm Kimliği** verir → Netlify'da `PUBLIC_GA4_ID` olarak girin.

## 4. Google AdSense (reklam geliri)

1. <https://adsense.google.com> → site olarak `frekanslar.netlify.app` ekleyin.
   *Not:* AdSense, `.netlify.app` gibi alt alan adlarını çoğu zaman kabul etmez. Onay için **kendi alan
   adınızı** (ör. `frekanslar.com.tr` / `frekanslar.net`, yıllık ~150–400 TL) almanız şiddetle önerilir –
   bkz. 6. adım.
2. AdSense'in verdiği yayıncı kimliği `ca-pub-1234567890123456` biçimindedir → Netlify'da
   `PUBLIC_ADSENSE_CLIENT` olarak girin. Bu değer girildiği anda:
   - reklam kodu tüm sayfalara eklenir,
   - `/ads.txt` dosyası otomatik doğru içerikle oluşur,
   - sayfalardaki reklam alanları görünür hale gelir (değer yokken hiç boş kutu görünmez).
3. AdSense → **Gizlilik ve mesajlaşma** → **Avrupa düzenlemeleri** mesajını oluşturup yayınlayın (AB/İngiltere
   ziyaretçileri için zorunlu çerez onayı; ücretsizdir).
4. İsteğe bağlı: AdSense'te "Reklam birimleri" oluşturursanız kimliklerini `PUBLIC_ADSENSE_SLOT_INCONTENT`,
   `PUBLIC_ADSENSE_SLOT_LISTING` olarak girebilirsiniz. Girmezseniz site "otomatik/makale içi" reklam kullanır.

## 5. Affiliate (satış ortaklığı) gelirleri

Rehber sayfalarında (anten ayarı, çanak anten, LNB, DVB-T2, FM radyo…) "Bu rehber için gerekli ekipman"
kutusu hazırdır; programlardan birine katıldığınızda kimliği girmeniz yeterli:

| Program | Başvuru | Netlify değişkeni |
| --- | --- | --- |
| Amazon Türkiye Ortaklık | <https://gelirortakligi.amazon.com.tr> | `PUBLIC_AMAZON_TAG` (ör. `frekanslar-21`) |
| Hepsiburada Affiliate | Hepsiburada ortaklık programı | `PUBLIC_HEPSIBURADA_AFF_ID` |
| Trendyol Affiliate | Trendyol ortaklık programı | `PUBLIC_TRENDYOL_AFF_ID` |

## 6. Kendi alan adınız (önerilir, ücretli)

1. Bir alan adı satın alın (Natro, İsimtescil, GoDaddy, Cloudflare…).
2. Netlify → **Domain management → Add a domain** → alan adınızı yazın, Netlify'ın gösterdiği DNS
   ayarlarını alan adı firmanızın paneline girin. HTTPS sertifikası otomatik ve ücretsizdir.
3. Netlify'da `PUBLIC_SITE_URL` değerini yeni adresle değiştirin (ör. `https://www.frekanslar.com.tr`) ve
   yeniden deploy edin. Search Console'a yeni adresi de ekleyin.

## 7. Yayıncılardan veri toplama (büyüme)

- Her radyo/TV sayfasında "Bağlantıyı bildirin" ve her firma sayfasında "Profil güncelleme formu" vardır.
  Gelen bildirimler Netlify → **Forms** bölümüne düşer.
- Resmî web sitesi / canlı yayın linki olan kayıtlarda "Dinle / İzle" butonu otomatik görünür.
  Yeni link eklemek için `src/data/radio-stations.json` veya `television-channels.json` içinde ilgili kaydın
  `officialWebsite` / `officialLiveUrl` alanlarını doldurmak yeterlidir.

## Tüm ortam değişkenleri (özet)

| Değişken | Ne işe yarar | Zorunlu mu |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | Sitenin gerçek adresi (canonical, sitemap) | Evet (ayarlandı) |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console doğrulaması | Önerilir |
| `PUBLIC_BING_SITE_VERIFICATION` | Bing doğrulaması | İsteğe bağlı |
| `PUBLIC_YANDEX_VERIFICATION` | Yandex doğrulaması | İsteğe bağlı |
| `PUBLIC_GA4_ID` | Google Analytics | Önerilir |
| `PUBLIC_ADSENSE_CLIENT` | Reklamlar + ads.txt | Gelir için |
| `PUBLIC_ADSENSE_SLOT_*` | Belirli reklam birimleri | İsteğe bağlı |
| `PUBLIC_AMAZON_TAG`, `PUBLIC_HEPSIBURADA_AFF_ID`, `PUBLIC_TRENDYOL_AFF_ID` | Affiliate linkleri | Gelir için |
| `PUBLIC_CONTACT_EMAIL` | İletişim sayfasındaki e-posta | İsteğe bağlı |
