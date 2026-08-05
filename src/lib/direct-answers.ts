/**
 * Builds the short, data-backed "direct answer" shown at the top of every
 * profile page (the AEO/GEO pattern: state the channel/station, the city
 * or satellite, and the value in one plain sentence, before any table).
 * Every sentence here is assembled from real fields -- there is no
 * generic filler text.
 */
import { formatDateTr, formatFrequencyDisplay, formatTransponderSignature } from './format';
import type { City, RadioStation, Satellite, SatelliteService, TelevisionChannel, TerrestrialFrequency, Transponder } from '../data/schemas';

export interface DirectAnswer {
  question: string;
  answer: string;
}

export function buildStationDirectAnswer(
  station: RadioStation,
  frequencies: readonly TerrestrialFrequency[],
  cities: readonly City[],
): DirectAnswer {
  const question = `${station.name} kaç frekansında yayın yapıyor?`;
  const activeFrequencies = frequencies.filter((f) => f.status === 'active');

  if (activeFrequencies.length === 0) {
    return {
      question,
      answer: `${station.name} için henüz doğrulanmış bir FM frekans kaydı bulunmuyor.`,
    };
  }

  const cityById = new Map(cities.map((city) => [city.id, city]));
  const istanbulFrequency = activeFrequencies.find((f) => f.cityId === 'istanbul');
  const featured = istanbulFrequency ?? activeFrequencies[0];
  const featuredCity = featured ? cityById.get(featured.cityId) : undefined;

  const cityCount = new Set(activeFrequencies.map((f) => f.cityId)).size;

  if (!featured || !featuredCity) {
    return {
      question,
      answer: `${station.name}, ${cityCount} şehirde FM frekansında yayın yapıyor.`,
    };
  }

  const featuredLine = `${station.name}, ${featuredCity.name}'de ${formatFrequencyDisplay(featured.frequency, featured.unit)} frekansında yayın yapıyor.`;
  const totalLine =
    cityCount > 1 ? ` Toplam ${cityCount} şehirde FM frekans kaydı bulunuyor.` : '';

  return { question, answer: `${featuredLine}${totalLine}` };
}

export function buildChannelDirectAnswer(
  channel: TelevisionChannel,
  services: readonly SatelliteService[],
  transponders: readonly Transponder[],
  satellites: readonly Satellite[],
): DirectAnswer {
  const question = `${channel.name}'nin güncel uydu frekansı nedir?`;
  const activeService = services.find((service) => service.status === 'active');

  if (!activeService) {
    return {
      question,
      answer: `${channel.name} için henüz doğrulanmış bir uydu yayın kaydı bulunmuyor.`,
    };
  }

  const transponder = transponders.find((t) => t.id === activeService.transponderId);
  const satellite = transponder ? satellites.find((s) => s.id === transponder.satelliteId) : undefined;

  if (!transponder || !satellite) {
    return {
      question,
      answer: `${channel.name} için uydu yayın kaydı bulunuyor, ancak transponder bilgisi eksik.`,
    };
  }

  const signature = formatTransponderSignature(transponder.frequencyMhz, transponder.polarization, transponder.symbolRate);
  return {
    question,
    answer: `${channel.name}, ${satellite.name} (${satellite.orbitalPosition}) üzerinden ${signature} transponderinde, ${formatDateTr(activeService.lastVerifiedAt)} tarihinde son kontrol edilen bilgiyle yayın yapıyor.`,
  };
}
