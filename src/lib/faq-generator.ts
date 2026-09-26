/**
 * Generates real, data-backed FAQ entries for profile pages. Every
 * question here only appears when there's an actual answer in the data;
 * nothing is filled in with generic or speculative text, and a question
 * is simply omitted rather than answered with a guess or a flat "no" the
 * dataset can't actually support.
 */
import { COVERAGE_TYPE_LABELS } from './labels';
import { formatFrequencyDisplay } from './format';
import type { Broadcaster, City, RadioStation, TelevisionChannel, TerrestrialFrequency } from '../data/schemas';

export interface FaqItem {
  question: string;
  answer: string;
}

function listCityNames(cities: readonly City[]): string {
  const names = cities.map((city) => city.name);
  if (names.length <= 4) return names.join(', ');
  const shown = names.slice(0, 4);
  return `${shown.join(', ')} ve ${names.length - shown.length} şehir daha`;
}

export function generateStationFaqs(
  station: RadioStation,
  activeCities: readonly City[],
  broadcaster: Broadcaster | null,
  hasSatelliteService: boolean,
): FaqItem[] {
  const faqs: FaqItem[] = [];

  if (activeCities.length > 0) {
    faqs.push({
      question: `${station.name} hangi şehirlerde yayın yapıyor?`,
      answer: `${station.name}, Frekanslar'da doğrulanmış kayıtlara göre şu şehirlerde FM frekansında yayın yapıyor: ${listCityNames(activeCities)}.`,
    });
  }

  faqs.push({
    question: `${station.name} ne tür bir yayın kapsamına sahip?`,
    answer: `${station.name}, ${COVERAGE_TYPE_LABELS[station.coverageType].toLowerCase()} kapsamda yayın yapan bir radyo istasyonudur.`,
  });

  const stationLive = station.officialLiveUrl ?? station.officialWebsite;
  if (stationLive) {
    faqs.push({
      question: `${station.name} canlı nasıl dinlenir?`,
      answer: `${station.name}'i internetten canlı dinlemek için radyonun resmî yayın sayfasını kullanabilirsiniz: ${stationLive}. ${activeCities.length > 0 ? 'Radyo cihazından dinlemek için bulunduğunuz ilin FM frekansını bu sayfadaki listeden bulabilirsiniz.' : ''}`.trim(),
    });
  }

  if (station.officialWebsite) {
    faqs.push({
      question: `${station.name}'in resmî web sitesi nedir?`,
      answer: `${station.name}'in resmî web sitesi ${station.officialWebsite} adresidir.`,
    });
  }

  if (broadcaster) {
    faqs.push({
      question: `${station.name} kime ait?`,
      answer: `${station.name}, ${broadcaster.name} tarafından işletilmektedir.`,
    });
  }

  if (hasSatelliteService) {
    faqs.push({
      question: `${station.name} uydudan da dinlenebiliyor mu?`,
      answer: `Evet, ${station.name}'in Frekanslar'da kayıtlı bir uydu yayını bulunuyor. Ayrıntılar için sayfadaki uydu yayın bilgilerine bakabilirsiniz.`,
    });
  }

  return faqs;
}

export function generateChannelFaqs(
  channel: TelevisionChannel,
  hasSatelliteService: boolean,
  platformCount: number,
  broadcaster: Broadcaster | null,
  terrestrialCityNames: readonly string[] = [],
): FaqItem[] {
  const faqs: FaqItem[] = [];

  const channelLive = channel.officialLiveUrl ?? channel.officialWebsite;
  if (channelLive) {
    faqs.push({
      question: `${channel.name} canlı nasıl izlenir?`,
      answer: `${channel.name} yayınını internetten kanalın resmî sayfası üzerinden canlı izleyebilirsiniz: ${channelLive}.`,
    });
  }

  if (terrestrialCityNames.length > 0) {
    const shown = terrestrialCityNames.slice(0, 5).join(', ');
    const rest = terrestrialCityNames.length - Math.min(5, terrestrialCityNames.length);
    faqs.push({
      question: `${channel.name} karasal (antenle) hangi illerde izlenebilir?`,
      answer: `RTÜK lisans kayıtlarına göre ${channel.name}, ${terrestrialCityNames.length} ilde dijital karasal yayın (DVB-T2) kanal tahsisine sahip: ${shown}${rest > 0 ? ` ve ${rest} il daha` : ''}.`,
    });
  }

  faqs.push({
    question: `${channel.name} ne tür bir yayın kapsamına sahip?`,
    answer: `${channel.name}, ${COVERAGE_TYPE_LABELS[channel.coverageType].toLowerCase()} kapsamda yayın yapan bir televizyon kanalıdır.`,
  });

  if (channel.officialWebsite) {
    faqs.push({
      question: `${channel.name}'nin resmî web sitesi nedir?`,
      answer: `${channel.name}'nin resmî web sitesi ${channel.officialWebsite} adresidir.`,
    });
  }

  if (broadcaster) {
    faqs.push({
      question: `${channel.name} kime ait?`,
      answer: `${channel.name}, ${broadcaster.name} tarafından işletilmektedir.`,
    });
  }

  if (hasSatelliteService) {
    faqs.push({
      question: `${channel.name} nasıl izlenir?`,
      answer: `${channel.name}, sayfada listelenen uydu üzerinden şifresiz ya da şifreli olarak izlenebilir. Kanalı alıcınıza eklemek için sayfadaki transponder bilgilerini kullanabilirsiniz.`,
    });
  }

  if (platformCount > 0) {
    faqs.push({
      question: `${channel.name} hangi platformlarda kanal numarasına sahip?`,
      answer: `${channel.name}, Frekanslar'da kayıtlı ${platformCount} platformda kanal numarasıyla listelenmektedir. Ayrıntılar için sayfadaki platform tablosuna bakabilirsiniz.`,
    });
  }

  return faqs;
}

export function generateCityFaqs(
  city: City,
  stationCount: number,
  frequencies: readonly TerrestrialFrequency[],
): FaqItem[] {
  const faqs: FaqItem[] = [];

  if (stationCount > 0) {
    faqs.push({
      question: `${city.name}'de kaç radyo istasyonu FM frekansında yayın yapıyor?`,
      answer: `Frekanslar'da doğrulanmış kayıtlara göre ${city.name}'de ${stationCount} radyo istasyonu FM frekansında yayın yapıyor.`,
    });
  }

  if (frequencies.length > 0) {
    const sorted = [...frequencies].sort((a, b) => a.frequency - b.frequency);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    if (lowest && highest) {
      faqs.push({
        question: `${city.name}'de FM bandının hangi bölümü kullanılıyor?`,
        answer: `${city.name}'deki kayıtlı frekanslar ${formatFrequencyDisplay(lowest.frequency, lowest.unit)} ile ${formatFrequencyDisplay(highest.frequency, highest.unit)} arasında değişiyor.`,
      });
    }
  }

  faqs.push({
    question: `${city.name}'deki radyo frekansları başka bir şehirle aynı mı?`,
    answer: `Hayır, aynı frekans numarası farklı şehirlerde farklı radyo istasyonlarına ait olabilir. ${city.name} için doğru eşleşmeyi görmek üzere bu sayfadaki tabloyu kullanabilirsiniz.`,
  });

  return faqs;
}

export function generateFrequencyFaqs(
  frequencyLabel: string,
  entries: readonly { stationName: string; cityName: string }[],
): FaqItem[] {
  const faqs: FaqItem[] = [];

  if (entries.length > 0) {
    const list = entries.map((entry) => `${entry.cityName}'de ${entry.stationName}`).slice(0, 6).join(', ');
    faqs.push({
      question: `${frequencyLabel} hangi radyo?`,
      answer: `${frequencyLabel}, şehre göre farklı radyo istasyonlarına ait olabilir. Frekanslar'da kayıtlı eşleşmeler: ${list}.`,
    });
  }

  faqs.push({
    question: `${frequencyLabel} her şehirde aynı radyoya mı ait?`,
    answer: `Hayır. FM frekans planlaması bölgesel yapıldığından ${frequencyLabel} farklı şehirlerde farklı radyo istasyonlarına ait olabilir.`,
  });

  return faqs;
}
