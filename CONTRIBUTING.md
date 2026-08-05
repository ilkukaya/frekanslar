# Katkı Rehberi

Frekanslar'a katkıda bulunduğunuz için teşekkürler. Bu belge, kod ve veri katkılarının nasıl yapılacağını
özetler.

## Genel İlkeler

- Tüm kod TypeScript strict mode ile yazılır (`tsconfig.json`, `tsconfig.scripts.json`).
- Veri değişiklikleri her zaman `src/data/*.json` üzerinden yapılır ve Zod şemalarından geçer
  (`src/data/schemas.ts`).
- Hiçbir sayfa; çalışmayan buton, göstermelik fonksiyon veya "yakında" yazan placeholder içermemelidir. Bir
  özellik build/test/lint'ten geçmeden tamamlanmış sayılmaz.
- Örnek/doğrulanmamış veri her zaman `pending-review` veya `community-reported` olarak işaretlenir; gerçek
  kaynaktan doğrulanmadan `verified` yapılmaz.

## Geliştirme Akışı

```bash
npm install
npm run dev
```

Bir değişiklik yaptıktan sonra, PR açmadan önce sırasıyla:

```bash
npm run data:validate   # veri değişikliği yaptıysanız
npm run typecheck       # astro check + scripts/tests tip kontrolü
npm run lint
npm run test
npm run build
```

çalıştırın. Hepsi hatasız tamamlanmalıdır.

## Kod Katkıları

- Bileşenler `src/components/`, sayfa şablonları `src/pages/`, framework'ten bağımsız mantık `src/lib/`
  altında tutulur. `src/lib/*` dosyaları `astro:content` içe aktarmaz; bu sayede hem sayfalarda hem
  `scripts/` altındaki Node script'lerinde ve testlerde kullanılabilir.
- İstemci tarafı script'ler `src/scripts/` altında, framework kullanmayan (vanilla) TypeScript olarak
  yazılır. Yeni bir etkileşim eklerken önce "gerçekten JavaScript gerekiyor mu?" diye sorun; çoğu durumda
  native `<details>`, `<datalist>` veya sunucu tarafında render edilmiş bir tablo yeterlidir.
- Yeni bir React/Vue/Svelte bileşeni **eklemeyin**; proje bilinçli olarak framework'süz kalır.
- Tailwind sınıfları, `src/styles/global.css` içindeki `@theme` token'larından türetilen renk/aralık/gölge
  adlarını kullanır (örn. `text-ink`, `bg-primary-600`, `border-border`). Yeni bir renk gerekiyorsa önce
  `@theme` bloğuna token olarak ekleyin.

## Veri Katkıları

Yeni radyo, TV kanalı, şehir frekansı veya kaynak ekleme adımları için [`README.md`](./README.md) → "Veri
Ekleme Yöntemi" bölümüne bakın. Kısaca:

1. İlgili `src/data/*.json` dosyasına kaydı ekleyin.
2. `npm run data:validate` çalıştırın; şema veya referans hatası varsa düzeltin.
3. `npm run data:normalize` çalıştırarak sıralama/formatı standartlaştırın.
4. Anlamlı bir değişiklikse `src/data/frequency-updates.json` içine bir kayıt ekleyin.
5. `npm run data:build-search && npm run build` ile yeni sayfaların doğru üretildiğini doğrulayın.

## Test Ekleme

Yeni bir `src/lib/*` fonksiyonu eklediğinizde, `tests/` altına o modülle aynı adı taşıyan bir test dosyası
ekleyin (örn. `src/lib/foo.ts` → `tests/foo.test.ts`). Testler `Vitest` ile çalışır ve `astro:content`
içermeyen, saf fonksiyonlar üzerinde çalışır; sabit (fixture) veri kullanın, gerçek `src/data/*.json`
dosyalarına bağımlı olmayın.

## Commit ve PR

- Anlamlı, İngilizce veya Türkçe tutarlı bir dilde commit mesajları yazın.
- PR açıklamanızda hangi `npm run` komutlarını çalıştırdığınızı belirtin.
- Kaynak/telif ile ilgili değişiklikler için [`DATA_SOURCES.md`](./DATA_SOURCES.md) ve
  [`LINKING_POLICY.md`](./LINKING_POLICY.md) dosyalarını gözden geçirin.
