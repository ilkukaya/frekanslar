---
title: "Uydu Kanalı Nasıl Eklenir? Adım Adım Rehber"
description: "Uydu alıcınıza yeni bir televizyon veya radyo kanalını manuel olarak eklemek için frekans, polarizasyon, sembol oranı ve FEC bilgilerini nasıl kullanacağınızı adım adım anlatan rehber."
publishedDate: "2026-01-15"
updatedDate: "2026-08-05"
featured: true
relatedGuideIds: ["fm-radyo-frekansi-nasil-bulunur"]
relatedStationIds: []
relatedChannelIds: ["trt-1", "a-spor"]
relatedSatelliteIds: ["turksat-4a", "turksat-3a"]
seoTitle: null
seoDescription: null
faq:
  - question: "Uydu alıcısında kanal bulunamıyor, ne yapmalıyım?"
    answer: "Öncelikle çanağınızın doğru uyduya (örneğin 42°E üzerindeki bir Türksat uydusuna) yönlendirildiğinden emin olun. Ardından girdiğiniz frekans, polarizasyon ve sembol oranı değerlerini kanalın Frekanslar profil sayfasındaki güncel bilgilerle karşılaştırın."
  - question: "Otomatik kanal arama neden yeterli olmuyor?"
    answer: "Otomatik arama bazen tüm transponderleri taramaz veya şifreli yayınları atlar. Belirli bir kanalı hızlıca bulmak için o kanalın taşındığı transponderin frekans, polarizasyon ve sembol oranı bilgilerini manuel olarak girmek daha güvenilirdir."
---

Uydu alıcınıza (uydu receiver / set-top box) yeni bir kanal eklemenin iki yolu vardır: **otomatik kanal arama** ve **manuel transponder girişi**. Belirli bir kanalı hızlıca bulmak istiyorsanız, o kanalın hangi uydu ve transponder üzerinden yayınlandığını bilerek manuel giriş yapmak genellikle daha hızlı sonuç verir.

## 1. Kanalın hangi uydu ve transponderde olduğunu bulun

Her televizyon kanalının Frekanslar üzerindeki profil sayfasında (`/tv/[kanal-slug]/`) şu bilgiler yer alır:

- Uydu adı ve yörünge konumu (örneğin "Türksat 4A, 42°E")
- Transponder frekansı (MHz)
- Polarizasyon (H, V, L veya R)
- Sembol oranı (symbol rate)
- FEC (Forward Error Correction) oranı
- Modülasyon türü (örneğin DVB-S2 8PSK)

Bu bilgilerin tamamını kanalın profil sayfasındaki "Uydu Yayın Bilgileri" bölümünde, tek bir özet tabloda bulabilirsiniz.

## 2. Çanağınızın doğru uyduya baktığından emin olun

Manuel giriş yapmadan önce çanağınızın, kanalın yayınlandığı uyduya (örneğin 42°E yörünge konumundaki bir Türksat uydusuna) doğru şekilde yönlendirildiğinden emin olun. Yanlış uyduya bakan bir çanakla doğru frekans bilgilerini girseniz bile kanalı bulamazsınız.

## 3. Alıcınızda manuel transponder ekleme ekranını açın

Çoğu uydu alıcısında bu menü "Kurulum", "Kanal Arama" veya "Transponder Ekle / Düzenle" gibi bir başlık altında yer alır. Bu ekranda aşağıdaki alanları kanalın profil sayfasındaki değerlerle birebir aynı şekilde doldurun:

1. **Frekans (MHz)** — örneğin 11958
2. **Polarizasyon** — H (yatay) veya V (dikey)
3. **Sembol oranı (Symbol Rate)** — örneğin 27500
4. **FEC** — örneğin 5/6

## 4. Kanal aramasını başlatın

Bilgileri girdikten sonra "Ara" veya "Tara" seçeneğini çalıştırın. Alıcınız yalnızca o transponder üzerindeki servisleri tarayacağı için işlem birkaç saniye ile birkaç dakika arasında tamamlanır.

## 5. Kanal listenizi güncelleyin

Tarama tamamlandığında bulunan kanalları (ve varsa aynı transponderdeki radyo servislerini) kanal listenize ekleyebilirsiniz. Bir transponder genellikle birden fazla televizyon ve radyo servisini aynı anda taşır; bu nedenle tek bir taramada birden fazla kanal bulmanız normaldir.

## Sık karşılaşılan sorunlar

- **"Sinyal yok" uyarısı**: Çanak yönü veya LNB ayarı hatalı olabilir.
- **"Sinyal var, kanal yok" uyarısı**: Frekans doğru ama polarizasyon veya sembol oranı hatalı girilmiş olabilir.
- **Kanal şifreli görünüyor**: Bazı kanallar şifreli (encrypted) yayınlanır ve yalnızca yetkili bir CAM modül veya abonelikle açılabilir. Kanalın profil sayfasındaki "şifreli / şifresiz" bilgisi bunu önceden gösterir.

> Frekanslar'daki uydu yayın bilgileri, ilgili kanalın profil sayfasında son doğrulama tarihiyle birlikte gösterilir. Bir kanalı eklerken sorun yaşarsanız, önce bilgilerin ne zaman doğrulandığını kontrol edin; uzun süredir doğrulanmamış kayıtlarda değişiklik olmuş olabilir.
