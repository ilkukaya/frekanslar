# Veri Kaynakları

Bu belge, Frekanslar'daki her veri kaydına eşlik eden kaynak modelini ve önceliğini açıklar. Site içi
görünümü için `/veri-kaynaklari/` sayfasına bakın (`src/pages/veri-kaynaklari/index.astro`); o sayfa
`src/data/sources.json` içeriğini doğrudan render eder, bu nedenle iki belge her zaman senkron kalır.

## Kaynak Önceliği

1. **Resmî düzenleyici kurum** — Türkiye'de RTÜK (Radyo ve Televizyon Üst Kurulu).
2. **Resmî uydu işletmecisi** — Türksat A.Ş.
3. **Yayın kuruluşunun resmî web sitesi.**
4. **Yayın kuruluşunun doğrulanmış sosyal medya hesabı.**
5. **Güvenilir ikincil kaynaklar.**
6. **Kullanıcı bildirimi** — doğrulanana kadar `unverified`/`community-reported` kabul edilir.

## `sources.json` Alan Şeması

```ts
{
  id: string;
  name: string;
  slug: string;
  type: 'regulator' | 'satellite-operator' | 'broadcaster-official'
      | 'verified-social' | 'secondary' | 'user-submission' | 'editorial-placeholder';
  url: string | null;
  description: string;
  reliability: 'high' | 'medium' | 'low';
}
```

### RTÜK İçe Aktarımı (karasal radyo/TV)

`cities.json`, `districts.json`, `terrestrial-transmitters.json`, `broadcasters.json`, `radio-stations.json`,
`television-channels.json`, `terrestrial-frequencies.json` ve `terrestrial-tv-channels.json` dosyalarının
tamamı, RTÜK'ün resmî "il bazında yayın lisans listesi" PDF'lerinden (81 il × radyo/TV, RTÜK'ün kendi
`_indirme_ozeti.csv` dosyasıyla birlikte) içe aktarılmıştır. Bu kayıtlar `sourceIds: ["rtuk"]` ve
`verificationStatus: "verified"` taşır. İçe aktarım araçları: `scripts/import/extract-rtuk-pdfs.py`
(PDF tablo çıkarımı, PyMuPDF gerektirir) ve `scripts/import/build-rtuk-data.ts`
(`npm run data:import-rtuk -- <raw_extracted.json>`, şema doğrulama ve normalizasyon). Her iki script de
kaynak koduna gömülü ayrıntılı tasarım notları içerir (marka/kuruluş adlarının neden büyük/küçük harf
normalize edilmediği, R1/R2/R3 ve T1/T2/T3 lisans kodlarının `coverageType`'a nasıl eşlendiği, "Ünvanı" ile
"Radyo Çağrı"/"Tv Logo" alanlarının bir istasyonu neden birlikte tanımladığı gibi).

RTÜK'ün lisans listeleri şunları **kapsamaz** ve bu nedenle içe aktarılan kayıtlarda `null`/boş bırakılır:
resmî web sitesi, resmî canlı yayın bağlantısı, sosyal medya hesapları, logo, tür/dil bilgisi (kategori alanı
yalnızca marka adından çıkarılan sınırlı bir anahtar kelime tahminidir). Bu alanların gerçek verilerle
doldurulması, ayrı ve açıkça kaynaklandırılmış bir sonraki veri toplama aşamasıdır.

### `editorial-placeholder` Türü

Uydu (`satellites.json`, `transponders.json`, `satellite-services.json`) ve platform
(`platforms.json`, `platform-channels.json`) verileri RTÜK'ün kapsamı dışındadır ve hâlâ mimariyi
göstermek amacıyla oluşturulmuş örnek/gösterim verisidir. Bu kayıtlar **gerçek bir otoriteye (Türksat,
yayın kuruluşu) atfedilmez** — onlar bu verileri sağlamadı. Bunun yerine `editorial-placeholder` türündeki
dahili kaynağa atıfta bulunulur; bu, hem şeffaflık hem de Türksat gibi gerçek kurumların adının, onlar
tarafından doğrulanmamış sayılara yanlışlıkla bağlanmasını önlemek için bilinçli bir tasarım kararıdır.

## Yeni Kaynak Ekleme

`src/data/sources.json` içine yukarıdaki şemaya uyan bir kayıt ekleyin, ardından ilgili veri kayıtlarının
`sourceIds` alanına bu kaynağın `id`'sini ekleyin. `npm run data:validate`, her `sourceIds` girişinin
`sources.json` içinde gerçekten var olduğunu doğrular (bkz. `scripts/lib/check-integrity.ts`).

## Coğrafi Referans Verisi

Şehir (`cities.json`) ve ilçe (`districts.json`) dosyalarındaki veriler, Türkiye'nin idari coğrafyasına
ait kamuya açık, düşük değişkenlikli bilgilerdir (il/ilçe adı, plaka kodu, bölge). Bu kayıtlar bir
`verificationStatus` alanı taşımaz; yayın verilerinin aksine bir "doğrulama iş akışına" tabi değildir.
