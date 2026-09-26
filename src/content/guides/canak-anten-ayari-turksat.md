---
title: "Çanak Anten Türksat Ayarı Nasıl Yapılır? Açı, LNB ve Sinyal Rehberi"
description: "Çanak anteni 42° Doğu'daki Türksat uydularına ayarlamak için yükseklik (elevasyon) ve yön (azimut) açılarını, LNB dönüş açısını, test transponderini ve sinyal kalitesiyle ince ayarı adım adım anlatan rehber."
publishedDate: "2026-09-26"
updatedDate: "2026-09-26"
featured: true
relatedGuideIds: ["lnb-nedir-cesitleri", "sinyal-yok-hatasi-cozumu", "uydu-kanali-nasil-eklenir", "otomatik-kanal-aramasi-nasil-yapilir"]
relatedStationIds: []
relatedChannelIds: ["trt-1"]
relatedSatelliteIds: ["turksat-4a", "turksat-3a", "turksat-6a"]
seoTitle: "Çanak Anten Türksat Ayarı: Açı, Yön ve LNB (Adım Adım)"
seoDescription: null
faq:
  - question: "Türksat için çanak hangi yöne bakmalı?"
    answer: "Türksat uyduları 42° Doğu'dadır. Türkiye'nin büyük bölümünden bakıldığında çanak kabaca güneye, batı illerinde biraz güneydoğuya, en doğu illerde ise tam güneye ya da çok az güneybatıya bakar."
  - question: "Çanak anten kaç derece eğik olmalı?"
    answer: "Türkiye'den Türksat'a bakış açısı (elevasyon) bölgeye göre yaklaşık 39° ile 47° arasındadır. Ancak ev tipi ofset çanaklar eğik odaklı olduğu için çanak gövdesi bu açıdan daha dik görünür; bu yüzden çanağın braketindeki elevasyon ölçeğini kullanın."
  - question: "Sinyal var ama kalite yok, ne anlama gelir?"
    answer: "Genellikle çanağın bir uyduya yaklaştığı ama henüz tam hizalanmadığı ya da yanlış uyduya baktığı anlamına gelir. Sinyal gücü LNB'ye gelen toplam enerjiyi, kalite ise doğru uydunun kilitlenmiş sinyalini gösterir; ayarı kalite göstergesine göre yapın."
  - question: "LNB'yi döndürmek gerekir mi?"
    answer: "Batı illerinde LNB'yi birkaç derece döndürmek (skew ayarı) sinyal kalitesini artırabilir. Doğu illerinde gerek yoktur veya çok azdır. En iyi konumu kaliteyi izleyerek küçük adımlarla bulun."
  - question: "Türksat 3A, 4A ve 6A için ayrı çanak gerekir mi?"
    answer: "Hayır. Bu uydular aynı yörünge konumunda (42° Doğu) olduğundan tek bir çanakla hepsinden yayın alınabilir."
---

**Kısa cevap:** Türksat uyduları 42° Doğu'dadır. Türkiye'den çanağı yaklaşık **güney–güneydoğu** yönüne çevirip, braketteki elevasyon ölçeğini bulunduğunuz ile göre yaklaşık **39°–47°** aralığına ayarlayın. Alıcıda bilinen bir Türksat transponderini açıp **sinyal kalitesi** göstergesini izleyerek çanağı önce yatayda, sonra dikeyde birer milimetre oynatın; en yüksek kaliteyi bulunca cıvataları sıkın ve kanal araması yapın.

## Başlamadan önce gerekenler

- Ofset çanak anten ve montaj ayağı (duvar veya çatı)
- Universal LNB (ne olduğunu bilmiyorsanız [LNB Nedir?](/rehber/lnb-nedir-cesitleri/) rehberine bakın)
- 75 ohm koaksiyel kablo ve iki adet F konnektör
- Uydu alıcısı ya da uydu tuner'ı olan televizyon
- İngiliz anahtarı veya uygun lokma
- Mümkünse pusula veya telefonunuzdaki pusula uygulaması

Kurulumu tek başınıza da yapabilirsiniz ama ekranı takip eden ikinci bir kişi işi ciddi şekilde hızlandırır.

## 1. Çanağın yerini seçin

Çanağın **güney–güneydoğu yönünde görüşü tamamen açık** olmalıdır. Ağaç dalları, karşı bina, balkon saçağı veya çatı çıkıntısı sinyal yolunu kesiyorsa ayar ne kadar iyi olursa olsun sonuç alınamaz. Hızlı bir test: çanağın arkasına geçip uydunun olduğu yöne ve açıya baktığınızda gökyüzünü açıkça görebilmelisiniz.

Montaj ayağının borusu **tam dikey (şakulünde)** olmalıdır. Boru eğikse elevasyon ölçeği yanlış değer gösterir ve azimutu çevirdikçe açı da değişir. Bir su terazisiyle kontrol edin.

## 2. Yaklaşık açıları belirleyin

Aşağıdaki tablo, Türksat'ın 42° Doğu'daki konumuna göre hesaplanmış yaklaşık değerlerdir. Azimut **coğrafi kuzeye** göredir; pusula manyetik kuzeyi gösterdiği için birkaç derecelik fark olabilir. Bu değerleri başlangıç noktası olarak kullanın, son ayarı sinyal kalitesiyle yapın.

| Şehir | Elevasyon (yaklaşık) | Azimut (yaklaşık) | LNB dönüşü (yaklaşık) |
| --- | --- | --- | --- |
| Edirne | 39° | 157° | 16–17° |
| İstanbul | 41° | 161° | 14–15° |
| İzmir | 43° | 157° | 18° |
| Antalya | 46° | 162° | 15° |
| Ankara | 43° | 166° | 11° |
| Samsun | 42° | 171° | 6° |
| Adana | 46–47° | 169° | 9° |
| Trabzon | 42–43° | 176–177° | 2–3° |
| Diyarbakır | 46° | 177° | 2° |
| Erzurum | 44° | 179° | 1° |
| Van | 45° | 182° | yaklaşık 2° (ters yöne) |

Tablodan görüldüğü gibi batıya gittikçe çanak güneydoğuya daha çok döner, LNB dönüşü artar; doğuya gittikçe çanak tam güneye yaklaşır.

### Ofset çanak neden "dik" görünür?

Evlerde kullanılan çanakların çoğu **ofset** tiptedir: LNB çanağın tam önünde değil alt kısmındadır ve çanak sinyali yukarı doğru eğik bir açıyla toplar. Bu yüzden 42° elevasyon gerektiren bir çanak, gövdesine bakıldığında neredeyse dik duruyormuş gibi görünür. Çanağın eğimini göz kararı ayarlamak yerine **braket üzerindeki elevasyon ölçeğini** kullanın.

## 3. LNB'yi takın ve alıcıyı hazırlayın

1. LNB'yi kolundaki yuvaya takın, kablo çıkışı aşağı bakacak şekilde konumlandırın. Batı illerindeyseniz tablodaki değere göre LNB'yi hafifçe döndürün; ince ayarı sonra yapacaksınız.
2. Kabloyu LNB'ye ve alıcının "LNB IN" girişine bağlayın. **Kabloyu takıp çıkarırken alıcı kapalı olsun**; LNB hattında voltaj vardır ve kısa devre alıcının tuner'ına zarar verebilir.
3. Alıcıda anten ayarları menüsünü açın:
   - **Uydu:** Türksat 42°E (listede Türksat 3A/4A/6A olarak da görünebilir)
   - **LNB tipi:** Universal (9750/10600 MHz)
   - **LNB gücü:** Açık
   - **DiSEqC:** Tek çanak tek LNB ise kapalı; çoklu uydu anahtarı varsa bağlı olduğu port

## 4. Test transponderi seçin

Ayar yaparken alıcının, Türksat üzerindeki **bilinen ve güçlü bir transponderi** göstermesi gerekir. Alıcılar genellikle uydu listesinde hazır transponderlerle gelir. Güncel bir değer kullanmak isterseniz, izlemek istediğiniz kanalın profil sayfasındaki "Uydu Yayın Bilgileri" bölümüne veya [Türksat 4A](/uydu/turksat-4a/) sayfasındaki transponder listesine bakabilirsiniz. Tüm kanalların uydu parametreleri [TV Frekansları](/tv-frekanslari/) tablosunda da bir arada bulunur.

## 5. Yatay tarama (azimut)

1. Elevasyonu ölçekten ayarlayıp bu cıvatayı elle çevrilemeyecek kadar sıkın.
2. Azimut cıvatalarını çanak zorla dönecek kadar gevşek bırakın.
3. Çanağı tablodaki yönün biraz doğusundan başlatıp **çok yavaş** batıya doğru çevirin. Her birkaç milimetrede 2–3 saniye durun; alıcının göstergesi gecikmeli tepki verir.
4. Kalite göstergesinde ilk sıçramayı gördüğünüzde durun.

> **Dikkat:** Türksat'ın yakınında başka uydular da vardır. Kalite göstergesi dolduğu hâlde test transponderindeki kanallar gelmiyorsa büyük ihtimalle komşu bir uyduya bakıyorsunuz. Aramaya devam edin.

## 6. İnce ayar

Sinyal yakalandıktan sonra:

1. Çanağı sağa-sola milimetrik oynatarak kalitenin en yüksek olduğu noktayı bulun ve azimut cıvatalarını sıkın.
2. Elevasyon cıvatasını hafifçe gevşetip çanağı yukarı-aşağı milimetrik oynatın; en iyi noktada sıkın.
3. LNB'yi yuvasında birkaç derece sağa-sola döndürerek (skew) kaliteyi bir kez daha artırmaya çalışın.
4. Cıvataları sıkarken çanağın kaymadığından emin olmak için kaliteyi izlemeye devam edin.

Hedef, açık havada kalite göstergesini olabildiğince yükseğe çıkarmaktır. Sınırda bir ayar, ilk yağmurda yayının kesilmesine yol açar.

## 7. Kanal araması

Ayar tamamlandığında Türksat için otomatik kanal araması yapın. "Yalnızca şifresiz (FTA)" seçeneğini işaretlerseniz liste daha sade olur. Arama menüleri ve kanal sıralama için [Otomatik Kanal Araması Nasıl Yapılır?](/rehber/otomatik-kanal-aramasi-nasil-yapilir/), belirli bir kanalı tek başına eklemek için [Uydu Kanalı Nasıl Eklenir?](/rehber/uydu-kanali-nasil-eklenir/) rehberlerine bakabilirsiniz.

## Sorun giderme

| Durum | Muhtemel neden |
| --- | --- |
| Sinyal gücü de kalite de sıfır | LNB gücü kapalı, kablo/konnektör hatası, arızalı LNB |
| Güç var, kalite yok | Çanak henüz uyduya kilitlenmemiş veya yanlış uyduda |
| Bazı transponderler var, bazıları yok | LNB tipi yanlış, 22 kHz ayarı hatalı, sınırda hizalama |
| Yağmurda kesiliyor | İnce ayar yetersiz veya çanak çapı küçük |
| Rüzgârda gidip geliyor | Ayak veya cıvatalar gevşek |

Daha ayrıntılı bir kontrol listesi için ["Sinyal Yok" Hatası Nasıl Çözülür?](/rehber/sinyal-yok-hatasi-cozumu/) rehberini izleyin.
