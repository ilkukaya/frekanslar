# Editöryal Politika

## Amaç

Frekanslar, "aynı arama niyetine" hizmet eden çok sayıda zayıf sayfa yerine, her biri gerçek ve benzersiz
veri/işlev sunan az sayıda güçlü sayfa üretmeyi hedefler.

## Programatik SEO İlkesi

- Aynı niyete (örn. "Show TV frekansı", "Show TV yeni frekansı", "Show TV uydu frekansı") hizmet eden
  varyasyonlar **ayrı sayfa olarak üretilmez**; tek bir güçlü profil sayfasında birleştirilir
  (`/tv/show-tv/`).
- Gerçekten farklı kullanıcı niyetleri (kanal profili, uydu profili, transponder profili, rehber makalesi)
  ayrı sayfalardır.
- `/yayin-turu/[slug]/` sayfaları bilinçli olarak `broadcastType` alanına göre üretilir, "ulusal radyolar"
  gibi kapsam+ortam bileşik ifadelerine göre değil — çünkü mevcut örnek veri setinde bu iki gruplama aynı
  sonuç kümesini üretir ve ikisini birden sayfa olarak yayımlamak tam olarak kaçınılması gereken
  "aynı niyet, iki zayıf sayfa" örüntüsü olurdu. Bkz. `src/lib/category-pages.ts`.
- İlçe sayfaları yalnızca o ilçeye özgü gerçek içerik (fiziksel bir verici konumu) olduğunda üretilir; aksi
  halde il sayfasının ince bir tekrarı olurdu. Bkz. `src/pages/radyo-frekanslari/[il]/[ilce]/index.astro`.

## AEO/GEO (Yapay Zeka Arama Motorları İçin Optimizasyon)

- Her profil sayfası, gerçek veriden otomatik üretilen kısa bir "doğrudan cevap" ile başlar
  (`src/lib/direct-answers.ts`). Bu cevaplar şablon metin değildir; kanal/radyo adı, şehir/uydu ve değeri
  aynı cümlede birlikte geçer.
- Her teknik veri; değer, birim, bağlam, son doğrulama tarihi ve kaynakla birlikte gösterilir
  (`src/components/DataCard.astro`).
- Eski ve güncel frekans/uydu bilgisi her zaman ayrı gösterilir (bkz. "Eski Frekanslar ve Değişiklik
  Geçmişi" bölümleri, `src/data/frequency-updates.json`).
- FAQ içerikleri (`src/lib/faq-generator.ts`) yalnızca sayfadaki gerçek verilerden üretilir; veri yoksa
  ilgili soru tamamen atlanır, asla tahmini veya genel bir cevapla doldurulmaz.
- "Yapay zekâ için yazılmış" hissi veren anlamsız dolgu cümleler kullanılmaz; her cümle kullanıcı için de
  doğrudan faydalı olmalıdır.

## Öne Çıkarma (Featured) Kriterleri

`featured: true` işareti, bir radyo/TV kaydının ana sayfadaki "Popüler" bölümlerinde öncelikli gösterilmesini
sağlar. Bu alan editöryal bir karardır (örn. marka bilinirliği), doğrulama durumundan bağımsızdır ve tek
başına bir kalite/doğruluk iddiası taşımaz — `verificationStatus` bunun için ayrı bir alandır.

## Ton ve Dil

- Türkçe, sade, doğrudan cümleler.
- Belirsiz zamirlerden kaçınılır ("o", "bu" yerine kanal/radyo/şehir adı tekrar edilir).
- Abartılı pazarlama dili kullanılmaz ("en iyi", "kesinlikle" gibi doğrulanamaz üstünlük ifadeleri yoktur).
- Doğrulanmamış hiçbir teknik değer "güncel" veya "doğrulanmış" olarak sunulmaz; bkz.
  [`VERIFICATION_POLICY.md`](./VERIFICATION_POLICY.md).
