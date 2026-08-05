# Bağlantı (Linking) Politikası

## Dışa Giden Bağlantılar (Outbound)

- "Resmî Yayından Dinle" / "Resmî Yayından İzle" / "Resmî Web Sitesine Git" butonları yalnızca ilgili yayın
  kuruluşunun `officialWebsite` veya `officialLiveUrl` alanına bağlantı verir (bkz.
  `src/components/OfficialActionButton.astro`). Yetkisiz, korsan veya üçüncü taraf bir yayın bağlantısı
  **hiçbir koşulda** yedek olarak gösterilmez.
- Bu bağlantılar her zaman yeni sekmede açılır: `target="_blank" rel="noopener noreferrer"`.
- Buton yanında her zaman "Bu bağlantı sizi ... resmî ... sayfasına yönlendirir" açıklaması gösterilir; hiçbir
  buton kullanıcıyı "site üzerinde" yayın başlayacakmış gibi yanıltmaz.
- `officialLiveUrl` veya `officialWebsite` alanı `null` ise buton **render edilmez**; bunun yerine kısa,
  dürüst bir not gösterilir ("Bu yayın için resmî bağlantı henüz eklenmedi..."). Sahte/devre dışı görünen bir
  buton asla gösterilmez.
- Editöryal ve resmî kaynak bağlantılarına (`SourceList`, kanal/radyo resmî siteleri) `nofollow` **eklenmez**.
- Ücretli/sponsorlu bir yerleşim eklenirse (bu depoda şu an yok) `rel="sponsored"` kullanılmalıdır.
- Kullanıcı tarafından gönderilip henüz doğrulanmamış bir bağlantı sayfada render edilirse
  `rel="ugc nofollow"` kullanılmalıdır (bu depoda düzeltme formu gönderimleri Netlify'a gider ve sitede geri
  render edilmez, bu nedenle şu an bu duruma girmez).
- Hiçbir canlı yayın izinsiz olarak yeniden yayınlanmaz, proxy'lenmez veya iframe ile gömülmez.

## İç Bağlantı Grafiği

Aşağıdaki ilişkiler, ilgili sayfa şablonlarında (`src/pages/**`) doğal içerik bağlantıları veya
`RelatedLinks`/`Breadcrumb` bileşenleri olarak gerçek veriye dayalı şekilde üretilir:

```
şehir       -> radyo         (o şehirde aktif yayın yapan istasyonlar)
radyo       -> şehir         (istasyonun aktif olduğu şehirler)
radyo       -> frekans       (şehir bazlı FM frekans tablosu)
frekans     -> şehir         (o frekansı kullanan şehirler)
TV kanalı   -> uydu          (uydu yayın bilgileri bölümü)
TV kanalı   -> transponder   (frekans/polarizasyon/sembol oranı satırı)
transponder -> kanal/radyo   ("Transponder Üzerindeki Servisler" tablosu)
uydu        -> transponder   (uydu profilindeki transponder listesi)
rehber      -> ilgili kanal/uydu/rehber (frontmatter `relatedStationIds`/`relatedChannelIds`/`relatedSatelliteIds`)
güncelleme  -> ilgili eski/yeni kayıt   (`relatedStationId`/`relatedChannelId`/`cityId`)
```

Her indekslenebilir sayfanın en az bir üst kategori bağlantısı (breadcrumb) ve en az bir ilgili içerik
bölümü vardır.

## Geri Bağlantı (Backlink) Stratejisi

Resmî sitelere verdiğimiz bağlantılar doğal kaynak/kullanıcı hizmetidir ve Frekanslar'a bir backlink
**değildir**. Bunun yerine, yayın kuruluşlarının kendi isteğiyle kullanabileceği, zorunlu olmayan bir
doğal bağlantı sistemi sunulur:

1. Her yayın kuruluşu markası için doğrulanabilir bir profil sayfası (`/radyo/[slug]/`, `/tv/[slug]/`).
2. Profil sayfasında "Bu yayın kuruluşunu temsil ediyor musunuz?" bölümü
   (`src/components/ClaimProfile.astro`) — düzeltme formuna bağlam bilgisiyle yönlendirir.
3. Gömülebilir, JavaScript gerektirmeyen, inline stilli bir rozet HTML kodu
   (`src/lib/badge.ts`, `src/components/BadgeSnippet.astro`); iki varyant sunar:
   - Nötr: "Frekans Bilgilerini Görüntüle — Frekanslar" (her zaman kullanılabilir).
   - Doğrulanmış: "Frekanslar'da Doğrulanmış Yayın" (yalnızca `verificationStatus === 'verified'` olduğunda
     gösterilir/önerilir).
4. Rozet kullanımı **zorunlu değildir** ve profil doğrulaması için bir backlink şartı **aranmaz**.
5. Toplu veya karşılıklı manipülatif link takası yapılmaz.
6. Editöryal ekibin yayın kuruluşuna gönderebileceği hazır bir bildirim metni, profil sayfasındaki "Editör
   notu" açılır bölümünde kopyalanabilir durumda bulunur.

Rozet domaini her zaman merkezi site config'inden (`src/config/site.ts` → `siteConfig.siteUrl`) türetilir;
hiçbir yerde sabit kodlanmış bir domain kullanılmaz.
