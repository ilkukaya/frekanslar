---
title: "LNB Nedir? Single, Twin, Quad LNB Çeşitleri, 22 kHz ve DiSEqC"
description: "Çanak antendeki LNB'nin ne işe yaradığı, universal LNB'nin çalışma mantığı, single–twin–quad–quattro LNB farkları, 13/18V ve 22 kHz sinyallerinin görevi ve DiSEqC ayarlarını anlatan rehber."
publishedDate: "2026-09-26"
updatedDate: "2026-09-26"
featured: false
relatedGuideIds: ["canak-anten-ayari-turksat", "sinyal-yok-hatasi-cozumu", "otomatik-kanal-aramasi-nasil-yapilir", "uydu-kanali-nasil-eklenir"]
relatedStationIds: []
relatedChannelIds: []
relatedSatelliteIds: ["turksat-4a", "turksat-3a"]
seoTitle: null
seoDescription: null
faq:
  - question: "LNB ne işe yarar?"
    answer: "LNB (Low Noise Block downconverter), çanağın topladığı çok yüksek frekanslı uydu sinyalini yükseltir ve koaksiyel kabloyla taşınabilecek daha düşük bir ara frekansa dönüştürür. LNB olmadan uydu alıcısı sinyali işleyemez."
  - question: "Twin LNB ile quad LNB arasındaki fark nedir?"
    answer: "Twin LNB'nin birbirinden bağımsız iki çıkışı vardır ve iki alıcıyı besler; quad LNB'nin dört bağımsız çıkışı vardır ve dört alıcıyı besler. Her çıkış, bağlı alıcının istediği polarizasyonu ve bandı ayrı ayrı seçebilir."
  - question: "Quad ve quattro LNB aynı şey mi?"
    answer: "Hayır. Quad LNB'nin dört çıkışı doğrudan alıcılara bağlanır. Quattro LNB'nin dört çıkışı ise her biri sabit bir bant ve polarizasyon taşır ve yalnızca multiswitch (çoklu anahtar) ile kullanılır; doğrudan alıcıya bağlanırsa kanalların bir kısmı gelmez."
  - question: "22 kHz ayarı ne işe yarar?"
    answer: "Universal LNB'de 22 kHz ton sinyali, alt bant ile üst bant arasında geçiş yapar. Ton yokken LNB alt bandı, ton varken üst bandı alıcıya iletir. Universal LNB kullanıyorsanız bu ayarı 'Otomatik' bırakmalısınız."
  - question: "Tek çanakla birden fazla televizyona yayın verebilir miyim?"
    answer: "Evet. İki alıcı için twin, dört alıcı için quad LNB kullanmak en basit yoldur. Daha fazla alıcı gereken apartman sistemlerinde quattro LNB ile multiswitch veya tek kablo (Unicable) sistemleri tercih edilir."
  - question: "LNB bozulduğunu nasıl anlarım?"
    answer: "Kablo ve alıcı sağlamken sinyal gücü ve kalitesi tamamen sıfırsa ya da yalnızca tek polarizasyondaki kanallar geliyorsa LNB arızası olasıdır. Kesin sonuç için bilinen sağlam bir LNB ile değiştirerek test edin."
---

**Kısa cevap:** LNB, çanak antenin odağına takılan ve uydudan gelen yaklaşık 10,7–12,75 GHz'lik sinyali güçlendirip kabloyla taşınabilecek 950–2150 MHz aralığına dönüştüren parçadır. Ev tipi kurulumlarda **universal LNB** kullanılır; kaç alıcı bağlanacağına göre **single (1), twin (2), quad (4)** veya multiswitch sistemleri için **quattro** tipi seçilir. Alıcı, LNB'ye gönderdiği **13/18 V** voltajla polarizasyonu, **22 kHz** tonla da bandı seçer.

## LNB ne yapar?

Uydudan gelen sinyal Dünya'ya ulaştığında son derece zayıftır. Çanak anten bu zayıf sinyali geniş bir yüzeyde toplayıp odak noktasına yansıtır; odakta duran LNB ise üç iş yapar:

1. **Düşük gürültüyle yükseltir** (Low Noise): Sinyali, üzerine olabildiğince az gürültü ekleyerek güçlendirir.
2. **Frekansı düşürür** (Block Downconverter): 10–12 GHz'lik sinyal koaksiyel kabloda çok hızlı zayıflar. LNB, sinyali yerel osilatör (LO) frekansını çıkararak 950–2150 MHz aralığına indirir.
3. **Polarizasyon ve bant seçer:** Alıcıdan gelen komutlara göre yatay/dikey polarizasyonu ve alt/üst bandı seçer.

## Universal LNB nasıl çalışır?

Ku bandındaki uydu yayınları geniş bir frekans aralığına yayılır. Universal LNB bu aralığı ikiye böler:

| Bant | Uydu frekansı | Yerel osilatör (LO) | Kabloya çıkan frekans |
| --- | --- | --- | --- |
| Alt bant (Low) | 10,70–11,70 GHz | 9.750 MHz | 950–1.950 MHz |
| Üst bant (High) | 11,70–12,75 GHz | 10.600 MHz | 1.100–2.150 MHz |

Alıcı, seçtiğiniz kanalın frekansına bakıp LNB'ye hangi bandı ve polarizasyonu istediğini iki basit sinyalle bildirir:

| Alıcının gönderdiği | Anlamı |
| --- | --- |
| 13 V | Dikey (V) polarizasyon |
| 18 V | Yatay (H) polarizasyon |
| 22 kHz ton yok | Alt bant |
| 22 kHz ton var | Üst bant |

Bu yüzden alıcının LNB ayarında **LNB tipi "Universal" (9750/10600)** ve **22 kHz "Otomatik"** seçili olmalıdır. Bu ayarlardan biri yanlışsa belirli frekans aralığındaki veya belirli polarizasyondaki kanallar gelmez. Frekanslar'daki transponder bilgilerinde gördüğünüz "H" ve "V" harfleri bu polarizasyonu ifade eder; örnek değerler için [TV Frekansları](/tv-frekanslari/) tablosuna bakabilirsiniz.

## LNB çeşitleri

### Çıkış sayısına göre

| Tür | Çıkış | Kullanım |
| --- | --- | --- |
| Single | 1 | Tek alıcı |
| Twin | 2 bağımsız | İki alıcı veya çift tuner'lı kayıt cihazı |
| Quad | 4 bağımsız | Dört alıcı |
| Octo | 8 bağımsız | Sekiz alıcı |
| Quattro | 4 sabit (VL, VH, HL, HH) | Yalnızca multiswitch ile |

**Twin, quad ve octo** LNB'lerde her çıkış kendi alıcısının komutlarına göre bağımsız çalışır. Salondaki alıcı yatay polarizasyonda bir kanal izlerken yatak odasındaki dikey polarizasyonda başka bir kanal izleyebilir.

**Quattro** LNB farklıdır: dört çıkışın her biri sabit olarak bir bant–polarizasyon kombinasyonunu taşır. Bu çıkışlar bir **multiswitch** cihazına bağlanır; multiswitch de her daireye/alıcıya istenen kombinasyonu yönlendirir. Apartman ve site sistemlerinde yaygın olarak kullanılır. Quattro LNB'yi doğrudan bir alıcıya bağlamak en sık yapılan hatalardandır.

### Özel türler

- **Tek kablo (Unicable / SCR / dCSS) LNB:** Birden fazla alıcıyı tek bir koaksiyel kablo üzerinden besler. Her alıcıya ayrı bir "kullanıcı bandı" atanır. Alıcının bu teknolojiyi desteklemesi gerekir.
- **Monoblok LNB:** Birbirine yakın iki uyduyu tek çanakla almak için iki LNB'nin tek gövdede birleştirildiği modeldir. Uydular arasındaki açı LNB'nin tasarımına uygun olmalıdır.
- **C bandı ve Ka bandı LNB'ler:** Farklı frekans bantları için tasarlanmıştır ve ev tipi Ku bandı kurulumlarda kullanılmaz.

## DiSEqC nedir?

DiSEqC (Digital Satellite Equipment Control), alıcının kablo üzerinden LNB'ye veya anahtarlama cihazlarına dijital komutlar göndermesini sağlayan bir protokoldür. Birden fazla çanak veya LNB'yi tek alıcıya bağlamak için kullanılır.

| Sürüm | Ne yapar |
| --- | --- |
| DiSEqC 1.0 | 4 girişe kadar anahtar (4 LNB/uydu) |
| DiSEqC 1.1 | 16 girişe kadar anahtar (kademeli bağlantı) |
| DiSEqC 1.2 | Motorlu çanak kontrolü |
| USALS | Konum bilgisine göre motoru otomatik yönlendirme (DiSEqC 1.2 tabanlı) |

**Pratik kurallar:**

- Tek çanak, tek LNB, doğrudan alıcıya bağlıysa DiSEqC ayarını **kapalı** bırakın.
- 4'lü DiSEqC anahtarı kullanıyorsanız, her uydu için alıcıda **anahtarın bağlı olduğu portu** (A/B/C/D veya 1/2/3/4) seçin. Yanlış port seçilirse alıcı başka bir çanağı dinler ve "Sinyal yok" uyarısı alırsınız.
- Türksat 3A, 4A ve 6A aynı yörünge konumunda (42° Doğu) olduğu için bunlar için ayrı çanak ve DiSEqC portu gerekmez.

## LNB seçerken nelere bakılmalı?

1. **Kaç alıcı bağlanacak?** Bugünkü ve yakın gelecekteki ihtiyacı düşünün; ikinci bir televizyon eklemeyi planlıyorsanız single yerine twin almak kablo çekme işini baştan çözer.
2. **Gürültü değeri (noise figure):** Daha düşük değer teorik olarak daha iyidir, ancak etiketlerdeki çok düşük değerler pazarlama amaçlı olabilir. Bilinen markaları tercih edin.
3. **Çanağa uyum:** LNB'nin boyun çapı çanağın LNB kolundaki yuvaya uymalıdır (ev tipi LNB'lerde genellikle 40 mm).
4. **Dış ortam dayanımı:** Kapak ve konnektör girişlerinin su geçirmez olması, uzun ömür için önemlidir.

## LNB montajı ve bakım

- Kablo çıkışı **aşağı** bakacak şekilde takılmalı; aksi hâlde yağmur suyu konnektöre dolar.
- Konnektörleri su geçirmez kılıf veya bantla koruyun.
- LNB'yi takıp çıkarırken **alıcıyı kapatın**. Kablo ucunda LNB besleme voltajı bulunur ve kısa devre alıcının tuner'ına zarar verebilir.
- Batı illerinde LNB'nin kendi ekseninde birkaç derece döndürülmesi (skew) sinyal kalitesini artırır. Değerler için [Çanak Anten Türksat Ayarı](/rehber/canak-anten-ayari-turksat/) rehberindeki tabloya bakın.

## LNB kaynaklı tipik arızalar

| Belirti | Olası neden |
| --- | --- |
| Yalnızca dikey (V) veya yalnızca yatay (H) kanallar geliyor | LNB'nin bir polarizasyon devresi arızalı veya alıcı voltajı sorunlu |
| Yalnızca alt bant (düşük frekanslı) kanallar geliyor | 22 kHz kapalı veya LNB tipi yanlış seçilmiş |
| Hiç sinyal yok | LNB gücü kapalı, kablo kopuk, LNB arızalı |
| Quattro LNB ile bazı kanallar yok | Multiswitch yerine doğrudan alıcıya bağlanmış |

Arıza tespitine adım adım yaklaşmak için ["Sinyal Yok" Hatası Nasıl Çözülür?](/rehber/sinyal-yok-hatasi-cozumu/) rehberini izleyebilirsiniz. LNB ve çanak doğruysa kanalları bulmak için [Otomatik Kanal Araması](/rehber/otomatik-kanal-aramasi-nasil-yapilir/) rehberine geçin.
