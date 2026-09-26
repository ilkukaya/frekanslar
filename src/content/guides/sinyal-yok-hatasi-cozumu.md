---
title: "Uydu Alıcısında \"Sinyal Yok\" Hatası Nasıl Çözülür? Adım Adım Kontrol Listesi"
description: "Uydu alıcısında veya televizyonda 'Sinyal yok' uyarısı aldığınızda sorunun alıcı ayarında mı, kabloda mı, LNB'de mi yoksa çanakta mı olduğunu adım adım bulmanızı sağlayan sorun giderme rehberi."
publishedDate: "2026-09-26"
updatedDate: "2026-09-26"
featured: true
relatedGuideIds: ["canak-anten-ayari-turksat", "lnb-nedir-cesitleri", "otomatik-kanal-aramasi-nasil-yapilir", "uydu-kanali-nasil-eklenir"]
relatedStationIds: []
relatedChannelIds: ["trt-1"]
relatedSatelliteIds: ["turksat-4a"]
seoTitle: "Sinyal Yok Hatası Çözümü: Uydu Alıcısı İçin 8 Adımlık Kontrol"
seoDescription: null
faq:
  - question: "Tüm kanallarda 'Sinyal yok' yazıyorsa sorun nerededir?"
    answer: "Tüm kanallar aynı anda gittiyse sorun genellikle ortak noktadadır: alıcının LNB gücü veya giriş ayarı, kablo ve konnektörler, LNB ya da çanağın yönü. Önce alıcıyı yeniden başlatıp kablo bağlantılarını kontrol edin."
  - question: "Yalnızca bazı kanallarda 'Sinyal yok' yazıyorsa ne yapmalıyım?"
    answer: "Belirli kanallar gelmiyorsa bu kanallar frekans değiştirmiş, yayını durdurmuş ya da farklı bir polarizasyonda/bantta olabilir. Kanalın güncel transponder bilgisini Frekanslar'daki profil sayfasından kontrol edip manuel ekleme yapın."
  - question: "Yağmurda sinyal neden kesiliyor?"
    answer: "Yoğun yağmur ve kar, Ku bandındaki uydu sinyalini zayıflatır. Çanak tam hizalı değilse sinyal payı az olduğundan kesinti kolayca yaşanır. Hava açtığında yayın geri geliyorsa çanağın ince ayarını iyileştirmek veya daha büyük çanak kullanmak kalıcı çözümdür."
  - question: "Televizyonda 'Sinyal yok' yazıyor ama uydu alıcısı çalışıyor, neden?"
    answer: "Bu durumda televizyon yanlış kaynağı gösteriyordur. Kumandadaki Source/Kaynak tuşuyla alıcının bağlı olduğu HDMI girişini seçin. Alıcının ön ışığı açık ve menüsü görünmüyorsa HDMI kablosunu da kontrol edin."
  - question: "Kısa devre (LNB short) uyarısı ne demek?"
    answer: "Alıcı, LNB hattında kısa devre algılamıştır. Genellikle F konnektördeki örgü tellerinin merkez iletkene değmesinden, ezilmiş kablodan veya arızalı LNB'den kaynaklanır. Alıcıyı kapatıp konnektörleri yeniden hazırlayın."
---

**Kısa cevap:** "Sinyal yok" uyarısında sırasıyla şunları kontrol edin: (1) televizyonun doğru HDMI kaynağında olduğunu, (2) alıcıyı elektrikten çekip yeniden başlatmayı, (3) alıcıda LNB gücünün açık, uydu ve DiSEqC ayarlarının doğru olduğunu, (4) kablo ve F konnektörlerin sağlam olduğunu, (5) çanağın önünde engel olmadığını ve yerinden oynamadığını, (6) LNB'yi. Sorun yalnızca bazı kanallardaysa kanalın frekansı değişmiş olabilir; güncel bilgiyi [TV Frekansları](/tv-frekanslari/) sayfasından kontrol edin.

## Önce belirtiyi doğru okuyun

Sorun gidermede zamanı en çok kazandıran şey, arızanın **kapsamını** belirlemektir:

| Belirti | En olası bölge |
| --- | --- |
| Hiçbir kanal yok, menüde sinyal gücü sıfır | Alıcı ayarı, kablo, LNB |
| Hiçbir kanal yok, sinyal gücü var ama kalite sıfır | Çanak yönü, yanlış uydu, DiSEqC portu |
| Sadece bazı kanallar yok | Kanalın frekans değişikliği, 22 kHz/LNB tipi, sınırda hizalama |
| Sadece yağmurda/karda gidiyor | Sınırda hizalama, küçük çanak, çanakta kar |
| Sadece rüzgârda gidip geliyor | Gevşek çanak ayağı veya cıvata |
| Gece-gündüz değişiyor, bazen var bazen yok | Nemli/oksitli konnektör, arızalanmaya başlayan LNB |

## 1. Televizyon kaynağını kontrol edin

Kulağa basit gelse de en sık rastlanan neden budur. Televizyonun kendi tuner'ı "Sinyal yok" yazar çünkü kaynak "TV/Anten" olarak kalmıştır. Kumandadaki **Source / Kaynak / Input** tuşuyla alıcının bağlı olduğu HDMI girişini seçin. Alıcının menüsü ekrana geliyorsa bu adım tamamdır.

## 2. Alıcıyı yeniden başlatın

Alıcıyı bekleme modundan değil, **elektrikten tamamen çekerek** 30 saniye kapalı tutun ve yeniden açın. Donmuş bir tuner veya LNB besleme devresindeki geçici bir koruma bu şekilde sıfırlanır.

## 3. Alıcının anten ayarlarını kontrol edin

Kurulum menüsünde anten/uydu ayarları ekranını açın ve şunlara bakın:

- **Uydu:** Türksat 42°E seçili mi?
- **LNB tipi:** Universal (9750/10600) mı?
- **LNB gücü:** Açık mı? Kapalıysa LNB çalışmaz ve sinyal hiç gelmez.
- **22 kHz:** Universal LNB için "Otomatik" mi?
- **DiSEqC:** Tek çanakta kapalı mı? DiSEqC anahtarı kullanıyorsanız doğru port seçili mi?

Yazılım güncellemesi, fabrika ayarlarına dönme veya kumandaya yanlışlıkla basma bu ayarları değiştirebilir. Bu terimlerin anlamı için [LNB Nedir?](/rehber/lnb-nedir-cesitleri/) rehberine bakabilirsiniz.

Aynı ekranda sinyal **gücü** ve **kalitesi** göstergelerini not edin. Sonraki adımlarda bu değerlerin değişip değişmediğini izleyeceksiniz.

## 4. Kısa devre uyarısına dikkat

Ekranda "LNB kısa devre", "LNB overload" veya "Anten aşırı yük" gibi bir mesaj görüyorsanız **alıcıyı hemen kapatın**. Bu uyarı genellikle:

- F konnektördeki kablo örgüsünden bir telin merkez iletkene değmesinden,
- Ezilmiş veya su almış kablodan,
- Arızalı LNB'den

kaynaklanır. Konnektörleri söküp yeniden hazırlamadan alıcıyı tekrar açmayın.

## 5. Kablo ve konnektörleri inceleyin

- Alıcının arkasındaki kablo tam oturmuş mu? F konnektör saat yönünde sonuna kadar vidalanmalıdır.
- Kablo balkon kapısı, pencere veya mobilya altında ezilmiş mi?
- LNB tarafındaki konnektörde nem, pas veya yeşillenme var mı?
- Arada ayırıcı (splitter), priz veya ek var mı? Uydu hattında sıradan TV ayırıcıları kullanılamaz; uydu hattına uygun olmayan ayırıcı LNB gücünü iletmeyebilir.

Mümkünse alıcıyı **kısa ve sağlam bir kabloyla doğrudan LNB'ye** bağlayarak deneyin. Sorun kayboluyorsa suçlu aradaki kablo veya bağlantı elemanıdır.

## 6. Çanağı kontrol edin

- **Engel:** Son zamanlarda büyüyen ağaç dalları, karşıya yapılan bina, asılan tente veya çamaşır ipi sinyal yolunu kesebilir.
- **Kar ve buz:** Çanak yüzeyinde veya LNB kapağında biriken kar sinyali engeller. Çanağın yönünü bozmadan hafifçe temizleyin.
- **Yön kayması:** Fırtınadan sonra, çatıda çalışma yapıldıysa veya çanak ayağı gevşekse çanak birkaç milimetre bile kaysa sinyal gider. Cıvataları kontrol edin.

Çanağın yeniden hizalanması gerekiyorsa [Çanak Anten Türksat Ayarı](/rehber/canak-anten-ayari-turksat/) rehberindeki açılar ve adımlarla ayarı baştan yapabilirsiniz.

## 7. LNB'yi test edin

Diğer her şey doğruysa LNB'den şüphelenin. Tipik LNB arızası belirtileri:

- Sinyal gücü ve kalitesi tamamen sıfır, kablo sağlam.
- Yalnızca yatay veya yalnızca dikey polarizasyondaki kanallar geliyor.
- Sinyal zaman zaman kendiliğinden gidip geliyor.

En güvenilir test, bilinen sağlam bir LNB ile değiştirmektir. Twin veya quad LNB'de alıcıyı **farklı bir çıkışa** bağlamak da hangi çıkışın arızalı olduğunu gösterir.

## 8. Alıcıyı test edin

Alıcının tuner'ı da arızalanabilir. Mümkünse başka bir alıcıyı veya uydu tuner'lı bir televizyonu aynı kabloya bağlayın. Diğer cihazda yayın geliyorsa sorun alıcınızdadır.

## Yalnızca bazı kanallar gelmiyorsa

Bu durum çoğunlukla donanım arızası değildir:

1. **Kanal frekans değiştirmiş olabilir.** Yayıncılar zaman zaman transponder değiştirir. Kanalın güncel frekans, polarizasyon ve sembol oranı bilgisini kanal profilinden (örneğin [TRT 1](/tv/trt-1/)) veya [Türksat 4A](/uydu/turksat-4a/) transponder listesinden kontrol edip [Uydu Kanalı Nasıl Eklenir?](/rehber/uydu-kanali-nasil-eklenir/) rehberindeki gibi manuel ekleyin.
2. **Kanal yayını durdurmuş olabilir.** Kanal profil sayfasındaki yayın durumu ve güncelleme tarihlerini kontrol edin.
3. **Toplu frekans değişikliği sonrası** en pratik çözüm tam bir kanal araması yapmaktır: [Otomatik Kanal Araması Nasıl Yapılır?](/rehber/otomatik-kanal-aramasi-nasil-yapilir/)
4. **Belirli bir frekans aralığı eksikse** 22 kHz ve LNB tipi ayarına geri dönün.

## Ne zaman teknik servis çağırmalı?

- Çanak erişilmesi tehlikeli bir çatıdaysa,
- Apartman ortak uydu sistemi (multiswitch) kullanılıyorsa ve sorun birden fazla dairede varsa,
- Kablo duvar içinden geçiyorsa ve hat testi gerekiyorsa

işi uzmanına bırakmak hem güvenli hem de genellikle daha hızlıdır. Ortak sistemde sorun tüm binadaysa arıza büyük ihtimalle merkezî ekipmandadır ve bina yönetimine bildirilmelidir.
