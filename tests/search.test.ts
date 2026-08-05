import { describe, expect, it } from 'vitest';
import { buildSearchIndex, type SearchIndexSource } from '../src/lib/search';
import { foldTurkish } from '../src/lib/slug';
import { createSearchEngine, queryEntries } from '../src/scripts/search-client';
import type { City, RadioStation, TelevisionChannel } from '../src/data/schemas';

const istanbul: City = { id: 'istanbul', name: 'İstanbul', slug: 'istanbul', plateCode: 34, region: 'marmara' };

function station(overrides: Partial<RadioStation> & { id: string; name: string; slug: string }): RadioStation {
  return {
    alternativeNames: [],
    logo: null,
    description: 'test',
    broadcastType: 'terrestrial-radio',
    coverageType: 'national',
    languages: ['tr'],
    categories: ['muzik'],
    headquarters: null,
    owner: null,
    officialWebsite: null,
    officialLiveUrl: null,
    officialSocialLinks: {},
    status: 'active',
    firstBroadcastDate: null,
    lastVerifiedAt: '2026-08-05',
    sourceIds: ['editorial-placeholder'],
    verificationStatus: 'pending-review',
    featured: false,
    seoTitle: null,
    seoDescription: null,
    ...overrides,
  };
}

function channel(
  overrides: Partial<TelevisionChannel> & { id: string; name: string; slug: string },
): TelevisionChannel {
  return station(overrides) as TelevisionChannel;
}

const source: SearchIndexSource = {
  cities: [istanbul],
  districts: [],
  radioStations: [
    station({ id: 'metro-fm', name: 'Metro FM', slug: 'metro-fm' }),
    station({ id: 'joyturk', name: 'JoyTürk', slug: 'joyturk' }),
  ],
  televisionChannels: [channel({ id: 'show-tv', name: 'Show TV', slug: 'show-tv' })],
  terrestrialFrequencies: [
    {
      id: 'metro-fm-istanbul-97-2',
      stationId: 'metro-fm',
      frequency: 97.2,
      unit: 'MHz',
      cityId: 'istanbul',
      districtId: null,
      transmitterId: null,
      coverageType: 'national',
      status: 'active',
      validFrom: null,
      validTo: null,
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'verified',
      notes: null,
    },
  ],
  satellites: [
    {
      id: 'turksat-4a',
      name: 'Türksat 4A',
      slug: 'turksat-4a',
      orbitalPosition: '42°E',
      operator: 'Türksat A.Ş.',
      coverageAreas: [],
      status: 'active',
      launchDate: null,
      description: 'test',
      officialWebsite: null,
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['turksat'],
      verificationStatus: 'pending-review',
    },
  ],
  transponders: [
    {
      id: 'turksat-4a-11976-h-27500',
      satelliteId: 'turksat-4a',
      slug: '11976-h-27500',
      frequencyMhz: 11976,
      polarization: 'H',
      band: 'Ku',
      symbolRate: 27500,
      fec: '3/4',
      modulation: 'DVB-S2 8PSK',
      beam: null,
      status: 'active',
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
  ],
  platforms: [],
  guides: [{ slug: 'uydu-kanali-nasil-eklenir', title: 'Uydu Kanalı Nasıl Eklenir?', description: 'x' }],
  categoryPages: [{ slug: 'ulusal-radyolar', title: 'Ulusal Radyolar', resultCount: 2 }],
};

describe('buildSearchIndex', () => {
  const index = buildSearchIndex(source);

  it('produces one entry per city, station, channel, satellite, transponder, guide and category page', () => {
    expect(index.filter((e) => e.type === 'city')).toHaveLength(1);
    expect(index.filter((e) => e.type === 'radio')).toHaveLength(2);
    expect(index.filter((e) => e.type === 'tv')).toHaveLength(1);
    expect(index.filter((e) => e.type === 'satellite')).toHaveLength(1);
    expect(index.filter((e) => e.type === 'transponder')).toHaveLength(1);
    expect(index.filter((e) => e.type === 'guide')).toHaveLength(1);
    expect(index.filter((e) => e.type === 'category')).toHaveLength(1);
  });

  it('deduplicates frequency values into a single /frekans/ entry', () => {
    const frequencyEntries = index.filter((e) => e.type === 'frequency');
    expect(frequencyEntries).toHaveLength(1);
    expect(frequencyEntries[0]?.url).toBe('/frekans/97-2/');
  });

  it('every entry links to a real, correctly-shaped URL', () => {
    for (const entry of index) {
      expect(entry.url.startsWith('/')).toBe(true);
      expect(entry.url.endsWith('/')).toBe(true);
    }
  });

  it('carries a Turkish-folded searchText derived from title/subtitle/keywords', () => {
    const joyturkEntry = index.find((e) => e.title === 'JoyTürk');
    expect(joyturkEntry?.searchText).toBe(foldTurkish('JoyTürk Radyo'));
  });
});

describe('search index + Fuse.js end-to-end query behaviour (via the real search-client module)', () => {
  const index = buildSearchIndex(source);
  const engine = createSearchEngine(index);

  function query(raw: string) {
    return queryEntries(engine, raw);
  }

  it('finds a station by its exact name', () => {
    const results = query('Show TV');
    expect(results.some((r) => r.url === '/tv/show-tv/')).toBe(true);
  });

  it('is Turkish-character insensitive: "Istanbul" (ASCII) finds "İstanbul"', () => {
    const results = query('Istanbul');
    expect(results.some((r) => r.url === '/radyo-frekanslari/istanbul/')).toBe(true);
  });

  it('is case-insensitive', () => {
    const results = query('METRO FM');
    expect(results.some((r) => r.url === '/radyo/metro-fm/')).toBe(true);
  });

  it('finds a station typed without Turkish characters: "joyturk" finds "JoyTürk"', () => {
    const results = query('joyturk');
    expect(results.some((r) => r.url === '/radyo/joyturk/')).toBe(true);
  });

  it('finds a frequency by its numeric value', () => {
    const results = query('97.2');
    expect(results.some((r) => r.type === 'frequency')).toBe(true);
  });

  it('finds a satellite by name', () => {
    const results = query('Türksat 4A');
    expect(results.some((r) => r.url === '/uydu/turksat-4a/')).toBe(true);
  });

  it('returns no results for an empty query', () => {
    expect(query('')).toEqual([]);
  });
});
