# Düzeltme ve İçerik Kaldırma Politikası

## Düzeltme Bildirimi

Herhangi bir kayıttaki hatalı veya güncelliğini yitirmiş bilgi için `/duzeltme-bildir/` sayfasındaki form
kullanılabilir (bkz. `src/components/CorrectionForm.astro`). Form alanları:

- İlgili yayın (radyo/TV adı, `<datalist>` ile önerilir)
- İlgili şehir (`<datalist>` ile önerilir)
- Mevcut bilgi
- Önerilen düzeltme (zorunlu)
- Kaynak URL (isteğe bağlı)
- Açıklama (isteğe bağlı)
- Ad, e-posta (isteğe bağlı)
- Gizlilik onayı (zorunlu)

Form, Netlify Forms ile çalışır (`data-netlify="true"`, honeypot alanı) ve sıfır özel sunucu kodu
gerektirmez; `src/config/site.ts` → `forms.provider` üzerinden alternatif bir endpoint'e de
yönlendirilebilir.

## Profil Doğrulama / Sahiplenme Talebi

Bir yayın kuruluşu kendi profilini doğrulamak isterse, profil sayfasındaki "Bu yayın kuruluşunu temsil
ediyor musunuz?" bölümünden (`src/components/ClaimProfile.astro`) düzeltme formuna bağlam bilgisiyle
yönlendirilir. Bu süreç için herhangi bir ücret veya backlink şartı aranmaz (bkz.
[`LINKING_POLICY.md`](./LINKING_POLICY.md)).

## İçerik Kaldırma Başvurusu

Bir kaydın tamamen kaldırılmasını (örn. artık var olmayan bir yayın, hatalı eklenmiş bir kuruluş) talep etmek
için aynı düzeltme formu kullanılır; "Açıklama" alanında talebin bir kaldırma talebi olduğu ve gerekçesi
belirtilmelidir. Talepler editöryal ekip tarafından değerlendirilir:

1. Talep gerçek ve doğrulanabilirse, ilgili kayıt veri dosyasından kaldırılır veya `status: "inactive"` /
   `"discontinued"` olarak işaretlenir (kayıt tamamen silinmek yerine genellikle "artık aktif değil" olarak
   işaretlenir, böylece geçmiş bir aramanın "bulunamadı" yerine anlamlı bir sonuca ulaşması sağlanır).
2. Değişiklik `src/data/frequency-updates.json` içine bir `discontinued-broadcast` kaydı olarak eklenir.
3. `npm run data:validate` ile referans bütünlüğü doğrulanır (kaldırılan bir kaydı referans eden başka
   kayıt kalmamalıdır).

## Telif Hakkı ve Marka İtirazları

- Kanal/radyo logoları yalnızca tanımlayıcı/editoryal amaçla, yeniden tasarlanmadan kullanılır. Logo
  kaynağı belirtilmemiş kayıtlarda kırık görsel yerine baş harfli güvenli bir yer tutucu gösterilir (bkz.
  `src/components/LogoPlaceholder.astro`).
- Bir logo, marka adı veya açıklama metniyle ilgili bir itirazınız varsa, düzeltme formu üzerinden
  belirtebilirsiniz; talep değerlendirilene kadar ilgili görsel/metin geçici olarak kaldırılabilir.
- Canlı yayın bağlantılarıyla ilgili telif itirazları için bkz. [`LINKING_POLICY.md`](./LINKING_POLICY.md) —
  proje zaten yalnızca resmî bağlantılara yönlendirir, hiçbir içeriği kendi sunucularında barındırmaz veya
  yeniden yayınlamaz.

## Yanıt Süresi

Bu ilk sürümde başvurular manuel olarak değerlendirilir; otomatik bir SLA taahhüdü verilmemektedir. İletişim
için [`README.md`](./README.md) içindeki iletişim bilgilerine veya `/iletisim/` sayfasına bakın.
