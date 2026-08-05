/**
 * Pure, framework-agnostic join/query helpers over the plain arrays that
 * come out of `getCollection(...).map(e => e.data)`. Nothing here touches
 * `astro:content`, so every function is usable from `.astro` pages, from
 * Node scripts and from Vitest tests with plain fixture arrays.
 */
import type {
  City,
  District,
  FrequencyUpdate,
  Platform,
  PlatformChannel,
  RadioStation,
  SatelliteService,
  Source,
  TelevisionChannel,
  TerrestrialFrequency,
  TerrestrialTvChannel,
  Transmitter,
  Transponder,
} from '../data/schemas';

/** Union of the fields shared by radio stations and TV channels. */
type BroadcastBrand = RadioStation | TelevisionChannel;

export function byId<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export function bySlug<T extends { slug: string }>(
  items: readonly T[],
  slug: string,
): T | undefined {
  return items.find((item) => item.slug === slug);
}

export function byIds<T extends { id: string }>(items: readonly T[], ids: readonly string[]): T[] {
  const idSet = new Set(ids);
  return items.filter((item) => idSet.has(item.id));
}

/* ---------------------------- Geography ---------------------------- */

export function districtsByCity(districts: readonly District[], cityId: string): District[] {
  return districts.filter((district) => district.cityId === cityId);
}

export function transmittersByCity(
  transmitters: readonly Transmitter[],
  cityId: string,
): Transmitter[] {
  return transmitters.filter((transmitter) => transmitter.cityId === cityId);
}

export function neighborCities(cities: readonly City[], current: City, limit = 4): City[] {
  return cities
    .filter((city) => city.id !== current.id && city.region === current.region)
    .slice(0, limit);
}

/* ------------------------- Terrestrial (FM) -------------------------- */

export function frequenciesByStation(
  frequencies: readonly TerrestrialFrequency[],
  stationId: string,
): TerrestrialFrequency[] {
  return frequencies.filter((frequency) => frequency.stationId === stationId);
}

export function frequenciesByCity(
  frequencies: readonly TerrestrialFrequency[],
  cityId: string,
): TerrestrialFrequency[] {
  return frequencies.filter((frequency) => frequency.cityId === cityId);
}

export function frequenciesByDistrict(
  frequencies: readonly TerrestrialFrequency[],
  districtId: string,
): TerrestrialFrequency[] {
  return frequencies.filter((frequency) => frequency.districtId === districtId);
}

export function activeFrequencies(
  frequencies: readonly TerrestrialFrequency[],
): TerrestrialFrequency[] {
  return frequencies.filter((frequency) => frequency.status === 'active');
}

/** Stations with at least one (active) frequency in the given city, deduplicated. */
export function stationsActiveInCity(
  stations: readonly RadioStation[],
  frequencies: readonly TerrestrialFrequency[],
  cityId: string,
): RadioStation[] {
  const stationIds = new Set(
    activeFrequencies(frequenciesByCity(frequencies, cityId)).map((frequency) => frequency.stationId),
  );
  return stations.filter((station) => stationIds.has(station.id));
}

/** Cities where a station has at least one (active) frequency, deduplicated. */
export function citiesForStation(
  cities: readonly City[],
  frequencies: readonly TerrestrialFrequency[],
  stationId: string,
): City[] {
  const cityIds = new Set(
    activeFrequencies(frequenciesByStation(frequencies, stationId)).map((frequency) => frequency.cityId),
  );
  return cities.filter((city) => cityIds.has(city.id));
}

/** Groups terrestrial frequencies by their numeric value (rounded to 1 decimal), for `/frekans/[slug]/`. */
export function groupFrequenciesByValue(
  frequencies: readonly TerrestrialFrequency[],
): Map<number, TerrestrialFrequency[]> {
  const groups = new Map<number, TerrestrialFrequency[]>();
  for (const frequency of frequencies) {
    const key = Math.round(frequency.frequency * 10) / 10;
    const existing = groups.get(key);
    if (existing) {
      existing.push(frequency);
    } else {
      groups.set(key, [frequency]);
    }
  }
  return groups;
}

/* --------------------- Terrestrial (digital over-the-air) TV --------------------- */

export function tvChannelsByChannel(
  tvChannels: readonly TerrestrialTvChannel[],
  channelId: string,
): TerrestrialTvChannel[] {
  return tvChannels.filter((entry) => entry.channelId === channelId);
}

export function tvChannelsByCity(
  tvChannels: readonly TerrestrialTvChannel[],
  cityId: string,
): TerrestrialTvChannel[] {
  return tvChannels.filter((entry) => entry.cityId === cityId);
}

export function tvChannelsByDistrict(
  tvChannels: readonly TerrestrialTvChannel[],
  districtId: string,
): TerrestrialTvChannel[] {
  return tvChannels.filter((entry) => entry.districtId === districtId);
}

export function activeTvChannels(
  tvChannels: readonly TerrestrialTvChannel[],
): TerrestrialTvChannel[] {
  return tvChannels.filter((entry) => entry.status === 'active');
}

/** TV channels with at least one (active) terrestrial assignment in the given city, deduplicated. */
export function tvChannelsActiveInCity(
  channels: readonly TelevisionChannel[],
  tvChannels: readonly TerrestrialTvChannel[],
  cityId: string,
): TelevisionChannel[] {
  const channelIds = new Set(
    activeTvChannels(tvChannelsByCity(tvChannels, cityId)).map((entry) => entry.channelId),
  );
  return channels.filter((channel) => channelIds.has(channel.id));
}

/* ------------------------------ Satellite ----------------------------- */

export function transpondersBySatellite(
  transponders: readonly Transponder[],
  satelliteId: string,
): Transponder[] {
  return transponders.filter((transponder) => transponder.satelliteId === satelliteId);
}

export function servicesByTransponder(
  services: readonly SatelliteService[],
  transponderId: string,
): SatelliteService[] {
  return services.filter((service) => service.transponderId === transponderId);
}

export function servicesBySatellite(
  services: readonly SatelliteService[],
  satelliteId: string,
): SatelliteService[] {
  return services.filter((service) => service.satelliteId === satelliteId);
}

export function servicesByStation(
  services: readonly SatelliteService[],
  stationId: string,
): SatelliteService[] {
  return services.filter((service) => service.stationId === stationId);
}

/* ------------------------------ Platforms ------------------------------ */

export function platformChannelsByChannel(
  platformChannels: readonly PlatformChannel[],
  channelId: string,
): PlatformChannel[] {
  return platformChannels.filter((entry) => entry.channelId === channelId);
}

export function platformChannelsByPlatform(
  platformChannels: readonly PlatformChannel[],
  platformId: string,
): PlatformChannel[] {
  return platformChannels.filter((entry) => entry.platformId === platformId);
}

/* -------------------------------- Sources ------------------------------- */

export function sourcesByIds(sources: readonly Source[], ids: readonly string[]): Source[] {
  return byIds(sources, ids);
}

/* ---------------------------- Change history ---------------------------- */

export function updatesForEntity(
  updates: readonly FrequencyUpdate[],
  entityId: string,
): FrequencyUpdate[] {
  return updates
    .filter(
      (update) =>
        update.entityId === entityId ||
        update.relatedStationId === entityId ||
        update.relatedChannelId === entityId,
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function recentUpdates(updates: readonly FrequencyUpdate[], limit = 8): FrequencyUpdate[] {
  return [...updates].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

/* ------------------------------ Broadcasters ----------------------------- */

export function brandsByBroadcaster<T extends BroadcastBrand>(
  brands: readonly T[],
  broadcasterId: string,
): T[] {
  return brands.filter((brand) => brand.owner === broadcasterId);
}

/* -------------------------------- Ranking -------------------------------- */

export function sortByName<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export function sortByFrequencyValue(
  frequencies: readonly TerrestrialFrequency[],
): TerrestrialFrequency[] {
  return [...frequencies].sort((a, b) => a.frequency - b.frequency);
}

export function mostRecentlyVerified<T extends { lastVerifiedAt: string }>(
  items: readonly T[],
  limit = 8,
): T[] {
  return [...items].sort((a, b) => b.lastVerifiedAt.localeCompare(a.lastVerifiedAt)).slice(0, limit);
}

export function featuredFirst<T extends { featured: boolean }>(items: readonly T[]): T[] {
  return [...items].filter((item) => item.featured);
}

/**
 * Picks up to `limit` "related" items sharing at least one category or the
 * same coverage type as `current`, excluding `current` itself. Used for the
 * "İlgili radyo istasyonları" / "İlgili kanallar" blocks.
 */
export function relatedBrands<T extends BroadcastBrand>(
  brands: readonly T[],
  current: T,
  limit = 4,
): T[] {
  const currentCategories = new Set(current.categories);
  return brands
    .filter((brand) => brand.id !== current.id)
    .map((brand) => {
      const sharedCategories = brand.categories.filter((category) =>
        currentCategories.has(category),
      ).length;
      const sameCoverage = brand.coverageType === current.coverageType ? 1 : 0;
      return { brand, score: sharedCategories * 2 + sameCoverage };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.brand);
}

export function relatedPlatforms(platforms: readonly Platform[], excludeId?: string): Platform[] {
  return platforms.filter((platform) => platform.id !== excludeId);
}
