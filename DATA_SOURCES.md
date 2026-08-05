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

### `editorial-placeholder` Türü

Bu proje deposundaki teknik yayın verilerinin büyük bölümü, mimariyi göstermek amacıyla oluşturulmuş
örnek/gösterim verisidir. Bu kayıtlar **gerçek bir otoriteye (RTÜK, Türksat, yayın kuruluşu) atfedilmez** —
onlar bu verileri sağlamadı. Bunun yerine `editorial-placeholder` türündeki dahili kaynağa atıfta bulunulur;
bu, hem şeffaflık hem de RTÜK/Türksat gibi gerçek kurumların adının, onlar tarafından doğrulanmamış sayılara
yanlışlıkla bağlanmasını önlemek için bilinçli bir tasarım kararıdır.

## Yeni Kaynak Ekleme

`src/data/sources.json` içine yukarıdaki şemaya uyan bir kayıt ekleyin, ardından ilgili veri kayıtlarının
`sourceIds` alanına bu kaynağın `id`'sini ekleyin. `npm run data:validate`, her `sourceIds` girişinin
`sources.json` içinde gerçekten var olduğunu doğrular (bkz. `scripts/lib/check-integrity.ts`).

## Coğrafi Referans Verisi

Şehir (`cities.json`) ve ilçe (`districts.json`) dosyalarındaki veriler, Türkiye'nin idari coğrafyasına
ait kamuya açık, düşük değişkenlikli bilgilerdir (il/ilçe adı, plaka kodu, bölge). Bu kayıtlar bir
`verificationStatus` alanı taşımaz; yayın verilerinin aksine bir "doğrulama iş akışına" tabi değildir.
