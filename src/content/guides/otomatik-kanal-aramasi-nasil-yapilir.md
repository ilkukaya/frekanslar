---
title: "Otomatik Kanal Araması Nasıl Yapılır? Uydu Alıcısında Arama ve Kanal Sıralama"
description: "Uydu alıcısında veya uydu tuner'lı televizyonda otomatik (kör) arama, transponder araması ve manuel aramanın farkını, adım adım kanal aramayı ve kanal listesini düzenleme yöntemlerini anlatan rehber."
publishedDate: "2026-09-26"
updatedDate: "2026-09-26"
featured: false
relatedGuideIds: ["uydu-kanali-nasil-eklenir", "canak-anten-ayari-turksat", "sinyal-yok-hatasi-cozumu", "ulusal-tv-kanallari-listesi"]
relatedStationIds: []
relatedChannelIds: ["trt-1", "atv", "show-tv"]
relatedSatelliteIds: ["turksat-4a"]
seoTitle: null
seoDescription: null
faq:
  - question: "Otomatik arama yaptım ama bazı kanallar çıkmadı, neden?"
    answer: "Alıcıdaki hazır transponder listesi eski olabilir, arama yalnızca şifresiz kanallarla sınırlandırılmış olabilir ya da kanal farklı bir uyduda yayın yapıyor olabilir. Kör arama (blind scan) yapmak veya kanalın transponder bilgilerini manuel girmek genellikle sorunu çözer."
  - question: "Kanal araması yapınca eski sıralamam silinir mi?"
    answer: "Alıcıya göre değişir. Bazı cihazlar yeni kanalları listenin sonuna ekler, bazıları 'mevcut listeyi sil' seçeneği işaretliyse sıralamayı sıfırlar. Arama öncesinde bu seçeneği kontrol edin; mümkünse kanal listesini USB belleğe yedekleyin."
  - question: "Kör arama (blind scan) nedir?"
    answer: "Kör arama, alıcının hazır bir transponder listesine bağlı kalmadan uydunun tüm frekans aralığını tarayıp yayınları kendisinin tespit ettiği arama türüdür. Daha uzun sürer ama yeni eklenen veya taşınan kanalları da bulur."
  - question: "Kanal araması ne kadar sürer?"
    answer: "Tek bir transponder araması birkaç saniye sürer. Hazır listeyle yapılan tam uydu araması birkaç dakika, kör arama ise alıcının hızına göre daha uzun sürebilir."
  - question: "Şifreli kanalları listeden nasıl çıkarırım?"
    answer: "Arama ekranında 'Yalnızca FTA' veya 'Şifresiz kanallar' seçeneğini işaretleyerek aramayı yeniden yapın. Mevcut listeden silmek için kanal düzenleme menüsündeki toplu seçim ve silme özelliğini kullanabilirsiniz."
---

**Kısa cevap:** Uydu alıcısında Menü → Kurulum (Installation) → Kanal Arama yolunu izleyin, uydu olarak Türksat 42°E'yi seçin, LNB tipinin "Universal" olduğunu doğrulayın ve arama türü olarak "Otomatik" ya da daha kapsamlı sonuç için "Kör arama (Blind scan)" seçip başlatın. Arama bittikten sonra Kanal Düzenleme menüsünden kanalları taşıyarak, silerek veya favori listelerine ekleyerek sıralamayı düzenleyin.

## Üç arama türü ve farkları

Alıcıların menü adları markaya göre değişse de arama seçenekleri genellikle üç gruba ayrılır:

| Arama türü | Nasıl çalışır | Ne zaman kullanılır |
| --- | --- | --- |
| Otomatik (uydu araması) | Alıcının hafızasındaki hazır transponder listesini sırayla tarar | İlk kurulum, genel güncelleme |
| Kör arama (Blind scan) | Tüm frekans bandını tarayıp yayınları kendisi bulur | Hazır liste eskiyse, yeni kanal eklendiyse |
| Transponder / manuel arama | Yalnızca girdiğiniz frekanstaki servisleri tarar | Tek bir kanalı hızlıca eklemek için |

Otomatik arama hızlıdır ama yalnızca alıcının bildiği frekanslara bakar. Kanallar zaman zaman transponder değiştirdiği için hazır liste eskidiğinde bazı kanallar eksik kalır. Kör arama bu sorunu ortadan kaldırır; her alıcıda bulunmasa da çoğu güncel modelde vardır.

## Arama öncesi kontrol listesi

Arama yapmadan önce şu ayarların doğru olduğundan emin olun. Buradaki bir hata aramanın sonuçsuz kalmasına yol açar.

- **Uydu:** Türksat 42°E (bazı alıcılarda Türksat 3A, 4A veya 6A olarak listelenir; hepsi aynı yörüngededir)
- **LNB tipi:** Universal, alt/üst yerel osilatör 9750/10600 MHz
- **22 kHz:** Universal LNB için "Otomatik"
- **LNB gücü:** Açık (13/18V)
- **DiSEqC:** Tek çanak–tek uydu ise kapalı; DiSEqC anahtarı kullanıyorsanız çanağın bağlı olduğu port

Bu ayarların ne anlama geldiğini merak ediyorsanız [LNB Nedir? Çeşitleri ve Ayarları](/rehber/lnb-nedir-cesitleri/) rehberine göz atın. Ayar ekranında sinyal kalitesi görünmüyorsa önce çanak ayarını kontrol edin: [Çanak Anten Türksat Ayarı](/rehber/canak-anten-ayari-turksat/).

## Adım adım otomatik arama

1. **Kurulum menüsüne girin.** Genellikle Menü → Kurulum / Ayarlar → Anten Ayarları veya Kanal Arama yolundadır. Bazı cihazlar bu menü için PIN ister; varsayılan PIN kılavuzda yazar.
2. **Uyduyu seçin.** Birden fazla uydu tanımlıysa yalnızca Türksat'ı işaretleyin; gereksiz uyduları taramak süreyi uzatır.
3. **Arama türünü seçin.** İlk kez kuruyorsanız otomatik arama yeterlidir. Eksik kanal varsa kör aramayı deneyin.
4. **Filtreleri belirleyin.**
   - *Yalnızca şifresiz (FTA):* Abonelik gerektiren kanalları listeye eklemez.
   - *TV / Radyo:* Uydudaki radyo servislerini de istiyorsanız "Tümü" seçin.
   - *Ağ araması (Network search / NIT):* Açık olduğunda alıcı, transponderlerin yayınladığı ağ bilgisinden yeni frekansları da öğrenir. Genellikle açık bırakmak faydalıdır.
5. **Mevcut listeyi silme seçeneğine dikkat edin.** Sıralamanızı korumak istiyorsanız "Mevcut kanalları sil" seçeneğini kapalı tutun.
6. **Aramayı başlatın** ve tamamlanmasını bekleyin. Bulunan TV ve radyo servisleri ekranda sayılır.
7. **Kaydedin.** Bazı alıcılar sonunda onay ister; kaydetmeden çıkarsanız sonuçlar kaybolur.

## Tek bir kanalı bulmak: transponder araması

Belirli bir kanal eksikse tüm uyduyu yeniden taramak yerine o kanalın transponderini girmek çok daha hızlıdır. Kanalın frekans, polarizasyon ve sembol oranı bilgilerini [TV Frekansları](/tv-frekanslari/) tablosunda veya kanalın profil sayfasında (örneğin [TRT 1](/tv/trt-1/)) bulabilirsiniz. Adım adım anlatım için [Uydu Kanalı Nasıl Eklenir?](/rehber/uydu-kanali-nasil-eklenir/) rehberine bakın.

## Kanal listesini düzenleme

Arama sonrası liste çoğu zaman karışık gelir: aynı kanalın birden fazla kopyası, test yayınları, yabancı kanallar araya girer. Kanal düzenleme menüsünde (Kanal Listesi / Kanal Organizatörü / Program Düzenle) genellikle şu işlemler bulunur:

- **Taşıma (Move):** Kanalı seçip yukarı/aşağı ok veya numara girerek istediğiniz sıraya koyun.
- **Silme (Delete):** İstemediğiniz servisleri kaldırın. Toplu seçim özelliği işi hızlandırır.
- **Atlama (Skip):** Kanalı silmeden, kanal değiştirirken atlanmasını sağlar.
- **Kilitleme (Lock):** PIN olmadan açılmamasını sağlar.
- **Favori listeleri:** Haber, spor, çocuk gibi gruplar oluşturup ana listeyi bozmadan hızlı erişim sağlar.
- **Yeniden adlandırma:** Bazı alıcılar kanal adını düzenlemenize izin verir.

### Pratik sıralama önerisi

Çok kanallı bir listede en kullanışlı yöntem, ilk sıralara sık izlediğiniz ulusal kanalları koymak ve gerisini kategorilere göre gruplamaktır. Türkiye'de ulusal yayın yapan kanalların listesi için [Ulusal TV Kanalları](/rehber/ulusal-tv-kanallari-listesi/) rehberine bakabilirsiniz.

### Listeyi yedekleyin

Pek çok alıcı kanal listesini USB belleğe dışa aktarmaya izin verir. Uzun uğraşla düzenlediğiniz bir listeyi yedeklemek, fabrika ayarlarına dönme veya yazılım güncellemesi sonrası dakikalar içinde geri yüklemenizi sağlar. Bazı markaların bilgisayar üzerinden liste düzenlemeye olanak veren yazılımları da vardır.

## Uydu tuner'lı televizyonlarda farklar

Televizyonların dahili uydu alıcıları da aynı mantıkla çalışır, ancak menü adları farklıdır: "Kanal Kurulumu", "Uydu Kurulumu" veya "Otomatik Ayar". Bazı televizyonlarda "Operatör" seçimi istenir; şifresiz Türksat kanalları için "Diğer" veya "Genel uydu" seçeneğini kullanın. Televizyonun bazı modellerde uydu kurulumu sonrasında kanal sıralamasını kendiliğinden yaptığı (otomatik LCN) da görülür; bu özellik açıkken elle yaptığınız sıralama bir sonraki güncellemede değişebilir.

## Arama sonuçsuz kalırsa

- "Sinyal yok" uyarısı görüyorsanız sorun arama ayarında değil, çanak–LNB–kablo zincirindedir. [Sinyal Yok Hatası](/rehber/sinyal-yok-hatasi-cozumu/) rehberini izleyin.
- Sinyal var ama kanal bulunmuyorsa LNB tipi, 22 kHz ve DiSEqC ayarlarını tekrar kontrol edin.
- Yalnızca belirli transponderler eksikse çanağın ince ayarı sınırda olabilir; kalite göstergesini yükseltmeye çalışın.
