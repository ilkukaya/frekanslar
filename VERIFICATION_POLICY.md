# Doğrulama Politikası

## Doğrulama Durumları

| Durum | Anlamı | Rozet rengi |
| --- | --- | --- |
| `verified` | Resmî düzenleyici kurum, uydu işletmecisi veya yayın kuruluşunun resmî kaynağıyla doğrulanmış. | Mavi |
| `partially-verified` | Bilginin bir kısmı doğrulanmış, bir kısmı henüz teyit edilmemiş. | Turuncu |
| `community-reported` | Kullanıcı bildirimiyle eklenmiş, editöryal ekip tarafından henüz doğrulanmamış. | Turuncu |
| `outdated` | Daha önce doğrulanmış ama güncelliğini yitirmiş olabilir. | Kırmızı |
| `inactive` | İlgili yayın veya kayıt artık aktif değil. | Kırmızı |
| `pending-review` | Mimariyi göstermek için oluşturulmuş örnek veri; yayın öncesi gerçek kaynaklarla doğrulanmalı. | Turuncu |

Renk paleti bilinçli olarak mavi/kırmızı/turuncu ile sınırlıdır (bkz. `src/components/VerificationBadge.astro`);
"doğrulanmış" durumu her zaman yalnızca gerçek bir kaynağa dayandığında kullanılır, asla varsayılan/iyimser
bir durum olarak değil.

## Bu Depodaki Mevcut Durum

Bu depoyu oluştururken hiçbir canlı kaynak doğrulaması yapılmadı (bu oturumda internet erişimi kapsam dışı
tutuldu). Bu nedenle:

- Şehir/ilçe verileri (coğrafi referans verisi) doğrulama iş akışına tabi değildir ve doğru kabul edilir.
- Yayın kuruluşu/istasyon/kanalın **var olduğu** ve genel profili (ad, tür, kapsam) makul güvenle
  bilinmektedir, ancak teknik parametreler (frekans, transponder, PID, sembol oranı vb.) **tamamen
  örnek/gösterim verisidir** ve tüm bu kayıtlar `verificationStatus: "pending-review"` olarak
  işaretlenmiştir.
- Örnek verinin kaynağı gerçek bir otoriteye (RTÜK, Türksat) değil, dahili `editorial-placeholder` kaynağına
  atfedilir (bkz. [`DATA_SOURCES.md`](./DATA_SOURCES.md)).

## Doğrulama Süreci (Gelecek Veri Girişleri İçin)

1. Bir kaynaktan (öncelik sırası için `DATA_SOURCES.md`) bilgi toplanır.
2. Kayıt, kaynağın güvenilirliğine göre uygun `verificationStatus` ile eklenir/güncellenir.
3. `lastVerifiedAt` alanı, bilginin **gerçekten** kontrol edildiği tarihe ayarlanır — kaydın oluşturulma
   tarihine değil.
4. `sourceIds` alanına en az bir kaynak eklenir; `npm run data:validate` bunu zorunlu kılar.
5. Önemli bir değişiklikse `src/data/frequency-updates.json` içine bir kayıt eklenir.
6. `npm run data:report`, 180 günden eski `lastVerifiedAt` değerine sahip kayıtları "uzun süredir
   doğrulanmamış" olarak listeler; bu kayıtlar yeniden gözden geçirilmelidir.

## Kullanıcı Bildirimleri

Düzeltme formu (`/duzeltme-bildir/`) üzerinden gelen bilgiler doğrudan siteye yazılmaz; editöryal ekip
tarafından değerlendirilir. Bir bildirim kabul edilip veri dosyasına işlendiğinde, kaynak
`community-reported` veya (bağımsız olarak teyit edildiyse) daha yüksek bir güven düzeyi ile işaretlenir.

## Sayfa Üzerinde Görünürlük

Her profil, tablo satırı ve veri kartı, doğrulama durumunu ve son kontrol tarihini açıkça gösterir (bkz.
`src/components/VerificationBadge.astro`, `src/components/DataCard.astro`). Bu bilgi hiçbir sayfada
gizlenmez veya küçük harflerle "gömülmez".
