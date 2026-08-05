/**
 * Framework-agnostic search index: build-time construction (consumed by
 * `scripts/data-build-search.ts`, which writes `public/search-index.json`)
 * and the small Fuse.js query wrapper used client-side in
 * `src/components/SearchBox.astro`.
 *
 * Kept dependency-light on the "build" side (no Fuse.js import here) so
 * the Node script that produces the index at build time doesn't need to
 * pull in the browser search runtime at all.
 */
import { formatFrequencyValue, frequencySlugFragment } from './format';
import { districtsByCity, groupFrequenciesByValue } from './relations';
import { foldTurkish } from './slug';
import { paths } from './urls';
import type {
  City,
  District,
  Platform,
  RadioStation,
  Satellite,
  TelevisionChannel,
  TerrestrialFrequency,
  Transponder,
} from '../data/schemas';

export type SearchResultType =
  | 'radio'
  | 'tv'
  | 'city'
  | 'district'
  | 'frequency'
  | 'satellite'
  | 'transponder'
  | 'platform'
  | 'guide'
  | 'category';

export const SEARCH_RESULT_TYPE_LABELS: Record<SearchResultType, string> = {
  radio: 'Radyo',
  tv: 'TV Kanalı',
  city: 'Şehir',
  district: 'İlçe',
  frequency: 'Frekans',
  satellite: 'Uydu',
  transponder: 'Transponder',
  platform: 'Platform',
  guide: 'Rehber',
  category: 'Yayın Türü',
};

export interface SearchIndexEntry {
  type: SearchResultType;
  title: string;
  subtitle: string;
  url: string;
  /** Extra matchable terms not necessarily shown in the result (alt names, digits, etc). */
  keywords: string[];
  /**
   * Turkish-folded, lowercase, whitespace-normalized concatenation of
   * title + subtitle + keywords. This is what the client actually
   * searches against (after folding the user's query the same way), so
   * matching is Turkish-character- and case-insensitive by construction
   * rather than relying on fuzzy-match tolerance to paper over it.
   */
  searchText: string;
}

/** Adds the derived `searchText` field to a partially-built entry. */
function withSearchText(entry: Omit<SearchIndexEntry, 'searchText'>): SearchIndexEntry {
  const searchText = foldTurkish([entry.title, entry.subtitle, ...entry.keywords].join(' '));
  return { ...entry, searchText };
}

export interface GuideSummary {
  slug: string;
  title: string;
  description: string;
}

export interface CategoryPageSummary {
  slug: string;
  title: string;
  resultCount: number;
}

export interface SearchIndexSource {
  cities: City[];
  districts: District[];
  radioStations: RadioStation[];
  televisionChannels: TelevisionChannel[];
  terrestrialFrequencies: TerrestrialFrequency[];
  satellites: Satellite[];
  transponders: Transponder[];
  platforms: Platform[];
  guides: GuideSummary[];
  categoryPages: CategoryPageSummary[];
}

export function buildSearchIndex(source: SearchIndexSource): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];
  const satelliteById = new Map(source.satellites.map((satellite) => [satellite.id, satellite]));

  for (const city of source.cities) {
    entries.push(
      withSearchText({
        type: 'city',
        title: city.name,
        subtitle: 'Şehir',
        url: paths.city(city.slug),
        keywords: [],
      }),
    );

    for (const district of districtsByCity(source.districts, city.id)) {
      entries.push(
        withSearchText({
          type: 'district',
          title: `${district.name}, ${city.name}`,
          subtitle: `${city.name} / İlçe`,
          url: paths.district(city.slug, district.slug),
          keywords: [district.name, city.name],
        }),
      );
    }
  }

  for (const station of source.radioStations) {
    entries.push(
      withSearchText({
        type: 'radio',
        title: station.name,
        subtitle: 'Radyo',
        url: paths.radioStation(station.slug),
        keywords: station.alternativeNames,
      }),
    );
  }

  for (const channel of source.televisionChannels) {
    entries.push(
      withSearchText({
        type: 'tv',
        title: channel.name,
        subtitle: 'Televizyon Kanalı',
        url: paths.televisionChannel(channel.slug),
        keywords: channel.alternativeNames,
      }),
    );
  }

  const frequencyGroups = groupFrequenciesByValue(source.terrestrialFrequencies);
  for (const [value] of frequencyGroups) {
    const slug = frequencySlugFragment(value);
    entries.push(
      withSearchText({
        type: 'frequency',
        title: `${formatFrequencyValue(value)} MHz`,
        subtitle: 'Frekans',
        url: paths.frequency(slug),
        keywords: [String(value)],
      }),
    );
  }

  for (const satellite of source.satellites) {
    entries.push(
      withSearchText({
        type: 'satellite',
        title: satellite.name,
        subtitle: `Uydu · ${satellite.orbitalPosition}`,
        url: paths.satellite(satellite.slug),
        keywords: [satellite.orbitalPosition],
      }),
    );
  }

  for (const transponder of source.transponders) {
    const satellite = satelliteById.get(transponder.satelliteId);
    entries.push(
      withSearchText({
        type: 'transponder',
        title: `${Math.round(transponder.frequencyMhz)} ${transponder.polarization} ${Math.round(transponder.symbolRate)}`,
        subtitle: satellite ? `Transponder · ${satellite.name}` : 'Transponder',
        url: paths.transponder(transponder.slug),
        keywords: [transponder.fec, transponder.modulation],
      }),
    );
  }

  for (const platform of source.platforms) {
    entries.push(
      withSearchText({
        type: 'platform',
        title: platform.name,
        subtitle: 'Platform',
        url: paths.platform(platform.slug),
        keywords: [],
      }),
    );
  }

  for (const guide of source.guides) {
    entries.push(
      withSearchText({
        type: 'guide',
        title: guide.title,
        subtitle: 'Rehber',
        url: paths.guide(guide.slug),
        keywords: [],
      }),
    );
  }

  for (const category of source.categoryPages) {
    entries.push(
      withSearchText({
        type: 'category',
        title: category.title,
        subtitle: `Yayın Türü · ${category.resultCount} sonuç`,
        url: paths.broadcastType(category.slug),
        keywords: [],
      }),
    );
  }

  return entries;
}
