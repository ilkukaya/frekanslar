# Frekanslar

Türkiye Radyo ve Televizyon Frekans Rehberi, Yayın Veritabanı ve Frekans Arama Motoru.

> **Proje aşaması:** Bu depo erken geliştirme aşamasındadır. Karasal radyo ve televizyon frekans/lisans
> verileri (81 il, 937 radyo markası, 143 TV kanalı, ~6.000 frekans ve ~1.900 karasal TV kanal ataması)
> RTÜK'ün resmî il bazında yayın lisans listelerinden içe aktarılmıştır ve `verified` olarak işaretlidir
> (bkz. [`DATA_SOURCES.md`](./DATA_SOURCES.md)). Uydu, transponder,
> platform verileri ile resmî web sitesi/logo/sosyal medya gibi zenginleştirme alanları henüz mimariyi
> göstermek amacıyla oluşturulmuş **örnek verilerdir** ve `pending-review` olarak işaretlidir. Ayrıntı için
> [`DATA_SOURCES.md`](./DATA_SOURCES.md) ve [`VERIFICATION_POLICY.md`](./VERIFICATION_POLICY.md) dosyalarına
> bakın.

## Projenin Amacı

Basit bir frekans listesi değil; şehre, radyo/TV adına, frekansa, uyduya, transpondere veya platforma göre
arama yapılabilen, her kaydın kaynağını ve doğrulama durumunu açıkça gösteren, programatik SEO'ya uygun ve
binlerce sayfaya ölçeklenebilecek şekilde tasarlanmış bir veri ürünü.

- **Statik üretim:** Neredeyse tüm sayfalar build zamanında üretilir (Astro `output: 'static'`).
- **Minimum istemci JS:** Arama, tablo filtre/sıralama ve kopyala butonları dışında JavaScript yok; bu üçü de
  framework içermeyen, elle yazılmış, küçük TypeScript modülleridir (React/Vue/Svelte kullanılmaz).
- **Veri odaklı tasarım:** Her teknik değer; birim, bağlam, kaynak ve son doğrulama tarihiyle birlikte gösterilir.

## Teknoloji Yığını

| Katman | Teknoloji |
| --- | --- |
| Framework | Astro 7 (statik çıktı) |
| Dil | TypeScript (strict mode, `noUncheckedIndexedAccess`) |
| Veri modeli | Astro Content Collections (`file()` / `glob()` loader) + Zod |
| Stil | Tailwind CSS v4 (`@theme` tabanlı tasarım token'ları) |
| Arama | Fuse.js (istemci tarafı, framework'süz TypeScript denetleyici) |
| İkonlar | `@lucide/astro` (derleme zamanında statik SVG, sıfır çalışma zamanı JS) |
| Testler | Vitest |
| Lint | ESLint (flat config) + typescript-eslint + eslint-plugin-astro |

## Kurulum

```bash
npm install
```

Node.js 22.12 veya üzeri gerekir (bkz. `package.json` → `engines`).

## Development

```bash
npm run dev
```

`http://localhost:4321` adresinde açılır. Astro içerik katmanı, `src/data/*.json` ve `src/content/guides/*.md`
dosyalarındaki değişiklikleri otomatik olarak algılar.

## Build

```bash
npm run build
```

Bu komut sırasıyla:

1. `npm run data:validate` — tüm veri dosyalarını Zod şemalarına ve referans bütünlüğüne göre doğrular,
2. `npm run data:build-search` — istemci tarafı arama dizinini (`public/search-index.json`) üretir,
3. `astro build` — statik siteyi `dist/` klasörüne derler.

çalıştırır. Herhangi bir adım başarısız olursa build durur.

```bash
npm run preview   # dist/ klasörünü yerel olarak servis eder
```

## Test, Tip Kontrolü ve Lint

```bash
npm run test        # Vitest ile birim testleri çalıştırır
npm run check        # astro check (şablon + tip tanılamaları)
npm run typecheck    # astro check + scripts/tests için ayrı bir tsc geçişi
npm run lint          # ESLint
npm run lint:fix      # ESLint (otomatik düzeltmeli)
```

## Veri Yapısı

Tüm veriler `src/data/*.json` altında normalleştirilmiş, tekrarsız dosyalarda tutulur ve
`src/data/schemas.ts` içindeki Zod şemalarıyla doğrulanır. Şemalar `src/content.config.ts` üzerinden Astro
Content Collections'a bağlanır; sayfalar `getCollection()` ile bu verilere tip güvenli şekilde erişir.

```
src/data/
  cities.json                    şehirler (il)
  districts.json                 ilçeler
  terrestrial-transmitters.json  karasal radyo/TV verici noktaları
  broadcasters.json              yayın kuruluşları (birden fazla marka sahibi olabilir)
  radio-stations.json            radyo markaları
  television-channels.json       televizyon markaları
  terrestrial-frequencies.json   şehir/ilçe bazlı FM frekans kayıtları
  terrestrial-tv-channels.json   şehir/ilçe bazlı karasal TV bant/kanal (multiplex) atamaları
  satellites.json                uydular
  transponders.json              transponderler (frekans/polarizasyon/sembol oranı/FEC/modülasyon)
  satellite-services.json        bir transponder üzerindeki radyo/TV servisleri
  platforms.json                 kablo/IPTV/OTT platformları
  platform-channels.json         platform kanal numaraları
  frequency-updates.json         değişiklik geçmişi
  sources.json                   kaynaklar (RTÜK, Türksat, resmî siteler, ...)
src/content/guides/*.md          rehber makaleleri (Markdown + frontmatter)
```

### Tasarım Kararı: Transponder Sinyal Parametreleri Nerede Tutulur?

DVB-S/S2'de frekans, polarizasyon, sembol oranı, FEC ve modülasyon **taşıyıcı (transponder) düzeyinde**
paylaşılan parametrelerdir; aynı transponderdeki tüm servisler bunları paylaşır. Bu nedenle bu alanlar yalnızca
`transponders.json` içinde tutulur, `satellite-services.json` bunları tekrar etmez; sayfalar
`transponderId` üzerinden join ederek gösterir. Bu, spesifikasyonun alan listesindeki bilgilerin hiçbirini
kaybetmeden (`/tv/[slug]/` sayfası hâlâ frekans/polarizasyon/sembol oranı/FEC gösterir), veriyi
tekrarsız tutan bilinçli bir normalizasyon kararıdır.

### Tasarım Kararı: Karasal TV Neden `terrestrial-frequencies.json` İçinde Değil?

Türkiye'de dijital karasal TV (DVB-T2), FM radyonun aksine bir MHz frekansıyla değil, bant grubu (RTÜK
verisinde gözlemlenen: VHF3, UHF4, UHF5) + o bant içindeki mantıksal bir multiplex kanal numarasıyla
lisanslanır. Bu değeri "frekans" gibi göstermek RTÜK'ün kendi verisini yanlış temsil eder; bu yüzden ayrı
bir `terrestrial-tv-channels.json` ve şeması (`terrestrialTvChannelSchema`) tutulur.

## Veri Ekleme Yöntemi

Tüm değişiklikler `src/data/*.json` dosyalarında yapılır, ardından:

```bash
npm run data:validate    # şema + referans bütünlüğü kontrolü
npm run data:normalize   # id'ye göre sırala, varsayılan alanları doldur, formatı standartlaştır
```

çalıştırılır. `data:validate` başarısız olursa build de başarısız olur (bkz. `npm run build`).

### Yeni Radyo Ekleme

1. `src/data/radio-stations.json` içine `radioStationSchema`'ya uyan yeni bir kayıt ekleyin (`id`/`slug`
   Türkçe karaktersiz, küçük harf, kebab-case olmalı — bkz. `src/lib/slug.ts`).
2. En az bir kaynak (`sourceIds`) belirtin; henüz doğrulanmadıysa `verificationStatus: "pending-review"` veya
   `"community-reported"` kullanın.
3. Şehir bazlı frekanslar için `src/data/terrestrial-frequencies.json` içine, bu radyonun `id`'sini
   `stationId` olarak kullanan kayıtlar ekleyin (örnek modele bakın).
4. `npm run data:validate && npm run build` çalıştırarak yeni sayfaların (`/radyo/[slug]/`,
   `/radyo/[slug]/[il]/`) doğru üretildiğini doğrulayın.

### Yeni TV Kanalı Ekleme

1. `src/data/television-channels.json` içine `televisionChannelSchema`'ya uyan bir kayıt ekleyin.
2. Uydu yayını varsa: gerekirse `src/data/transponders.json` içine transponder ekleyin, ardından
   `src/data/satellite-services.json` içine bu kanalın `stationId`'sini (`broadcastKind: "tv"`) kullanan bir
   servis kaydı ekleyin.
3. Platform kanal numarası varsa `src/data/platform-channels.json` içine ekleyin.
4. `npm run data:validate` çalıştırın.

### Yeni Şehir Frekansı Ekleme

`src/data/terrestrial-frequencies.json` içine, spesifikasyondaki örnek modele uyan bir kayıt ekleyin:

```json
{
  "id": "metro-fm-istanbul-97-2",
  "stationId": "metro-fm",
  "frequency": 97.2,
  "unit": "MHz",
  "cityId": "istanbul",
  "districtId": null,
  "transmitterId": "istanbul-camlica",
  "coverageType": "national",
  "status": "active",
  "validFrom": null,
  "validTo": null,
  "lastVerifiedAt": "2026-08-05",
  "sourceIds": ["official-broadcaster"],
  "verificationStatus": "verified",
  "notes": null
}
```

Yeni bir şehir ekliyorsanız önce `src/data/cities.json` içine ekleyin; ilçe bazlı bir sayfa isterseniz
`src/data/districts.json`'a ekleyip o ilçede gerçek bir verici (`terrestrial-transmitters.json`, `districtId`
alanı doldurulmuş) tanımlayın — ilçe sayfaları yalnızca gerçek, ilçeye özgü içerik (bir verici konumu) olan
ilçeler için üretilir (bkz. `src/pages/radyo-frekanslari/[il]/[ilce]/index.astro`).

### Kaynak Ekleme

`src/data/sources.json` içine `sourceSchema`'ya uyan bir kayıt ekleyin. `type` alanı için öncelik sırası ve
anlamlar için [`DATA_SOURCES.md`](./DATA_SOURCES.md) dosyasına bakın. Örnek/gösterim amaçlı veriler için
gerçek bir otoriteyi (RTÜK, Türksat) kaynak göstermeyin; bunun yerine mevcut `editorial-placeholder` kaynağını
kullanın.

## Doğrulama Durumları

`verified` · `partially-verified` · `community-reported` · `outdated` · `inactive` · `pending-review`

Ayrıntılı açıklamalar için [`VERIFICATION_POLICY.md`](./VERIFICATION_POLICY.md).

## SEO Mimarisi

- Merkezi `src/components/SEO.astro` bileşeni her indekslenebilir sayfada benzersiz title/description,
  canonical URL, Open Graph, Twitter Card ve robots meta üretir.
- JSON-LD: `src/lib/seo/jsonld.ts` içindeki üreticiler ile `WebSite`, `Organization`, `WebPage`,
  `CollectionPage`, `ItemList`, `BreadcrumbList`, `Dataset`, `FAQPage` (yalnızca sayfada gerçek FAQ varsa),
  `RadioStation`/`TelevisionStation` şemaları üretilir.
- Her profil sayfası başında gerçek veriden üretilen bir "doğrudan cevap" kutusu bulunur
  (`src/lib/direct-answers.ts`).
- Site içi arama sonuç sayfası (`/ara/`) ve düzeltme teşekkür sayfası `noindex,follow` ile işaretlenir ve
  sitemap'e dahil edilmez.

## Sitemap

`@astrojs/sitemap` paketinin otomatik numaralı bölümleme yaklaşımı yerine, projenin istediği isimlendirilmiş
mimariye birebir uyan, elle yazılmış Astro endpoint'leri kullanılır (`src/pages/sitemap-*.xml.ts`):

```
/sitemap-index.xml        tüm alt sitemap'lere referans verir
/sitemap-pages.xml        statik sayfalar + yayın türü kategorileri
/sitemap-radio.xml        radyo profilleri + radyo×şehir sayfaları
/sitemap-tv.xml           TV kanal profilleri
/sitemap-cities.xml       il + (gerçek veriye sahip) ilçe sayfaları
/sitemap-frequencies.xml  /frekans/[slug]/ sayfaları
/sitemap-satellites.xml   uydular + transponderler + platformlar
/sitemap-guides.xml       rehber makaleleri
/sitemap-updates.xml      güncelleme kayıtları
```

`/robots.txt` da aynı şekilde bir endpoint'tir (`src/pages/robots.txt.ts`); site içi arama sonuçlarını ve
sorgu dizesi (`?`) içeren URL'leri crawl alanı dışında tutar, CSS/JS'i engellemez.

## Veri İçe Aktarma / Bakım Komutları

```bash
npm run data:validate      # şema + referans bütünlüğü doğrulaması (build'in bir parçası)
npm run data:normalize     # kayıtları id'ye göre sırala, varsayılanları doldur, formatı standartlaştır
npm run data:build-search  # public/search-index.json üretir (build'in bir parçası)
npm run data:check-links   # officialWebsite/officialLiveUrl/kaynak URL'lerinin erişilebilirliğini kontrol eder
npm run data:report        # kayıt sayıları, doğrulama dağılımı, kapsam boşlukları, eski kayıtlar (reports/data-report.json)
npm run data:diff          # -- --old <dizin> veya --ref <git-ref> ile eski/yeni veri karşılaştırması
npm run data:import-rtuk   # -- <raw_extracted.json> ile RTÜK lisans verisini yeniden içe aktarır
```

`data:diff`, varsayılan olarak mevcut git geçmişiyle (`HEAD`) karşılaştırır; bu depo gibi henüz commit'i
olmayan bir depoda çalıştırıldığında bunu açıkça bildirir ve tüm kayıtları "yeni" olarak raporlar.

`data:import-rtuk`, RTÜK'ün karasal radyo/TV verisini yeniden (örn. güncel bir lisans listesi indirildiğinde)
içe aktarmak için kullanılır. İki adımdan oluşur: `scripts/import/extract-rtuk-pdfs.py` (RTÜK'ün il bazında
PDF'lerini + `_indirme_ozeti.csv`'sini düz bir JSON'a çevirir, `pip install pymupdf` gerektirir), ardından
`npm run data:import-rtuk -- <o JSON'un yolu>` (şemaya eşler, doğrular, `src/data/*.json` dosyalarını
yazar). Her iki script de kaynağında ayrıntılı tasarım notları içerir. Diğer kaynaklardan (satellite/uydu,
platform vb.) CSV/scraper çıktısı almak isterseniz, ham veriyi `src/data/*.json` şemasına yakın bir şekle
getirip `npm run data:normalize` ile kanonikleştirmeniz önerilir.

## Deployment

Proje statik bir sitedir; Netlify ile uyumludur (bkz. [`netlify.toml`](./netlify.toml)). Gerçek bir domain
belirlendiğinde `PUBLIC_SITE_URL` ortam değişkenini ayarlayın (varsayılan: `https://example.com`,
bkz. `src/config/site.ts`).

```bash
npm run build   # dist/ üretir, Netlify'ın publish dizini budur
```

`netlify.toml`; build komutunu, güvenlik başlıklarını (`X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, temel bir `Content-Security-Policy`), önbellekleme kurallarını ve trailing-slash
davranışını tanımlar. Düzeltme formu, sıfır ek sunucu kodu gerektirmeden Netlify Forms ile çalışır (bkz.
`src/components/CorrectionForm.astro` ve `src/config/site.ts` → `forms`).

## İçerik ve Veri Güncelleme Prosedürü

1. Değişikliği ilgili `src/data/*.json` dosyasında yapın; `lastVerifiedAt` ve `sourceIds` alanlarını güncelleyin.
2. Anlamlı bir değişiklikse (yeni yayın, kapanan yayın, frekans/uydu/transponder değişikliği) aynı olayı
   `src/data/frequency-updates.json` içine bir kayıt olarak ekleyin — bu, `/guncellemeler/` sayfasında ve
   ilgili profil sayfasının "Eski Frekanslar ve Değişiklik Geçmişi" bölümünde otomatik olarak görünür.
3. `npm run data:validate && npm run data:normalize && npm run test && npm run build` çalıştırın.
4. Değişiklikleri gözden geçirin (`npm run data:report` ve `npm run data:diff` çıktıları yardımcı olur).

## Telif ve Resmî Yayın Bağlantıları Politikası

Ayrıntılar için [`LINKING_POLICY.md`](./LINKING_POLICY.md) ve [`CONTENT_REMOVAL_POLICY.md`](./CONTENT_REMOVAL_POLICY.md).
Özet: yalnızca resmî web sitesi veya doğrulanmış resmî canlı yayın sayfasına bağlantı verilir; korsan/yetkisiz
üçüncü taraf yayın bağlantısı veya izinsiz iframe gömme yapılmaz; harici bağlantılar yeni sekmede
`rel="noopener noreferrer"` ile açılır.

## Diğer Belgeler

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — katkı süreci
- [`DATA_SOURCES.md`](./DATA_SOURCES.md) — kaynak önceliği ve tür tanımları
- [`EDITORIAL_POLICY.md`](./EDITORIAL_POLICY.md) — editöryal ilkeler, öne çıkarma (featured) kriterleri
- [`LINKING_POLICY.md`](./LINKING_POLICY.md) — iç/dış bağlantı ve rozet (badge) politikası
- [`VERIFICATION_POLICY.md`](./VERIFICATION_POLICY.md) — doğrulama durumları ve süreci
- [`CONTENT_REMOVAL_POLICY.md`](./CONTENT_REMOVAL_POLICY.md) — düzeltme ve kaldırma başvuruları

## Yayın, SEO ve Gelir

- Canlı adres: <https://frekanslar.netlify.app> (Netlify, GitHub'a her push'ta otomatik deploy).
- Reklam (AdSense), analitik (GA4), arama motoru doğrulamaları ve affiliate kimlikleri **ortam
  değişkenleriyle** açılır; hiçbiri ayarlanmadığında site hiçbir üçüncü taraf betik yüklemez. Adım adım
  anlatım: [`YAYIN-VE-GELIR-REHBERI.md`](./YAYIN-VE-GELIR-REHBERI.md).
- Arama motorları + yapay zekâ yanıt motorları (GEO/AEO) için: `robots.txt` (AI botlarına açık), `llms.txt`,
  zengin JSON-LD (RadioStation, TelevisionStation, Organization, Article, FAQPage, Dataset, BreadcrumbList),
  her profilde "doğrudan cevap" kutusu ve veri odaklı SSS, IndexNow anahtar dosyası + `npm run seo:indexnow`.

## Bilinen Eksikler

- **Uydu transponder / platform kanal numarası** verileri doğrulanana kadar yayımlanmaz (örnek veriler
  kaldırıldı). Uydu ve platform sayfaları içerik eklenene kadar `noindex` durumundadır.
- Resmî web sitesi / canlı yayın bağlantıları öncelikle ulusal ve bölgesel yayıncılar için eklendi; yerel
  yayıncıların çoğunda henüz boştur (bağlantı yoksa "Dinle/İzle" butonu gösterilmez, profil sayfasında
  "Bağlantıyı bildirin" çağrısı görünür).
- Logolar: kayıtta doğrulanmış bir logo dosyası yoksa, yayıncının resmî sitesindeki simge Google'ın simge
  servisi üzerinden gösterilir; o da yoksa renkli bir monogram kullanılır.
- Karasal TV MHz değerleri, RTÜK listesindeki UHF/VHF kanal numarasından standart kanal planına göre
  hesaplanır (bkz. `tvChannelCenterMhz`).
