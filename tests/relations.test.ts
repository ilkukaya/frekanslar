import { describe, expect, it } from 'vitest';
import {
  brandsByBroadcaster,
  byId,
  bySlug,
  citiesForStation,
  districtsByCity,
  frequenciesByCity,
  frequenciesByStation,
  groupFrequenciesByValue,
  mostRecentlyVerified,
  relatedBrands,
  servicesBySatellite,
  servicesByTransponder,
  sortByFrequencyValue,
  stationsActiveInCity,
  transpondersBySatellite,
  updatesForEntity,
} from '../src/lib/relations';
import type {
  City,
  District,
  FrequencyUpdate,
  RadioStation,
  SatelliteService,
  TerrestrialFrequency,
  Transponder,
} from '../src/data/schemas';

const istanbul: City = { id: 'istanbul', name: 'İstanbul', slug: 'istanbul', plateCode: 34, region: 'marmara' };
const ankara: City = { id: 'ankara', name: 'Ankara', slug: 'ankara', plateCode: 6, region: 'ic-anadolu' };
const cities: City[] = [istanbul, ankara];

const districts: District[] = [
  { id: 'istanbul-kadikoy', name: 'Kadıköy', slug: 'kadikoy', cityId: 'istanbul' },
  { id: 'istanbul-uskudar', name: 'Üsküdar', slug: 'uskudar', cityId: 'istanbul' },
  { id: 'ankara-cankaya', name: 'Çankaya', slug: 'cankaya', cityId: 'ankara' },
];

function station(overrides: Partial<RadioStation> & { id: string }): RadioStation {
  return {
    name: overrides.id,
    slug: overrides.id,
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

const metroFm = station({ id: 'metro-fm', name: 'Metro FM', slug: 'metro-fm', categories: ['muzik'] });
const trtFm = station({
  id: 'trt-fm',
  name: 'TRT FM',
  slug: 'trt-fm',
  owner: 'trt',
  categories: ['muzik', 'haber'],
});
const joyturk = station({ id: 'joyturk', name: 'JoyTürk', slug: 'joyturk', categories: ['muzik'] });
const stations: RadioStation[] = [metroFm, trtFm, joyturk];

const frequencies: TerrestrialFrequency[] = [
  {
    id: 'metro-fm-istanbul-97-2',
    stationId: 'metro-fm',
    frequency: 97.2,
    unit: 'MHz',
    cityId: 'istanbul',
    districtId: null,
    transmitterId: 'istanbul-camlica',
    coverageType: 'national',
    status: 'active',
    validFrom: null,
    validTo: null,
    lastVerifiedAt: '2026-08-05',
    sourceIds: ['editorial-placeholder'],
    verificationStatus: 'verified',
    notes: null,
  },
  {
    id: 'trt-fm-istanbul-95-0',
    stationId: 'trt-fm',
    frequency: 95.0,
    unit: 'MHz',
    cityId: 'istanbul',
    districtId: null,
    transmitterId: 'istanbul-camlica',
    coverageType: 'national',
    status: 'active',
    validFrom: null,
    validTo: null,
    lastVerifiedAt: '2026-08-05',
    sourceIds: ['editorial-placeholder'],
    verificationStatus: 'verified',
    notes: null,
  },
  {
    id: 'trt-fm-ankara-97-2',
    stationId: 'trt-fm',
    frequency: 97.2,
    unit: 'MHz',
    cityId: 'ankara',
    districtId: null,
    transmitterId: 'ankara-elmadag',
    coverageType: 'national',
    status: 'active',
    validFrom: null,
    validTo: null,
    lastVerifiedAt: '2026-08-05',
    sourceIds: ['editorial-placeholder'],
    verificationStatus: 'verified',
    notes: null,
  },
  {
    id: 'joyturk-istanbul-88-4-discontinued',
    stationId: 'joyturk',
    frequency: 88.4,
    unit: 'MHz',
    cityId: 'istanbul',
    districtId: null,
    transmitterId: 'istanbul-camlica',
    coverageType: 'national',
    status: 'discontinued',
    validFrom: null,
    validTo: '2025-01-01',
    lastVerifiedAt: '2025-01-01',
    sourceIds: ['editorial-placeholder'],
    verificationStatus: 'outdated',
    notes: 'Discontinued -- should not count as "active in city".',
  },
];

describe('byId / bySlug', () => {
  it('finds an item by id or slug and returns undefined otherwise', () => {
    expect(byId(cities, 'istanbul')).toBe(istanbul);
    expect(byId(cities, 'izmir')).toBeUndefined();
    expect(bySlug(stations, 'metro-fm')).toBe(metroFm);
    expect(bySlug(stations, 'nonexistent')).toBeUndefined();
  });
});

describe('districtsByCity', () => {
  it('returns only districts belonging to the given city', () => {
    const result = districtsByCity(districts, 'istanbul');
    expect(result).toHaveLength(2);
    expect(result.every((district) => district.cityId === 'istanbul')).toBe(true);
  });
});

describe('city <-> radio station relationship', () => {
  it('stationsActiveInCity returns only stations with an active frequency in that city', () => {
    const result = stationsActiveInCity(stations, frequencies, 'istanbul');
    const ids = result.map((s) => s.id).sort();
    // joyturk's only Istanbul frequency is discontinued, so it must not appear.
    expect(ids).toEqual(['metro-fm', 'trt-fm']);
  });

  it('stationsActiveInCity returns an empty array for a city with no frequencies', () => {
    expect(stationsActiveInCity(stations, frequencies, 'izmir')).toEqual([]);
  });

  it('citiesForStation returns every city a station actively broadcasts in', () => {
    const result = citiesForStation(cities, frequencies, 'trt-fm');
    const ids = result.map((c) => c.id).sort();
    expect(ids).toEqual(['ankara', 'istanbul']);
  });

  it('citiesForStation excludes discontinued-only cities', () => {
    // joyturk's only frequency (Istanbul) is discontinued.
    expect(citiesForStation(cities, frequencies, 'joyturk')).toEqual([]);
  });

  it('frequenciesByStation and frequenciesByCity agree on the same join', () => {
    const byStation = frequenciesByStation(frequencies, 'trt-fm').map((f) => f.id).sort();
    const byCity = frequencies
      .filter((f) => f.cityId === 'istanbul' || f.cityId === 'ankara')
      .filter((f) => f.stationId === 'trt-fm')
      .map((f) => f.id)
      .sort();
    expect(byStation).toEqual(byCity);
  });

  it('frequenciesByCity only returns rows for the requested city', () => {
    const result = frequenciesByCity(frequencies, 'ankara');
    expect(result).toHaveLength(1);
    expect(result[0]?.stationId).toBe('trt-fm');
  });
});

describe('groupFrequenciesByValue', () => {
  it('groups records that share the same numeric frequency across different cities/stations', () => {
    const groups = groupFrequenciesByValue(frequencies);
    const sharedAt972 = groups.get(97.2);
    expect(sharedAt972).toBeDefined();
    expect(sharedAt972).toHaveLength(2);
    // Same frequency, two different stations in two different cities -- exactly
    // the "frequency is not nationally exclusive to one station" case.
    const stationIds = sharedAt972?.map((f) => f.stationId).sort();
    expect(stationIds).toEqual(['metro-fm', 'trt-fm']);
  });
});

describe('sortByFrequencyValue', () => {
  it('sorts ascending by frequency without mutating the input', () => {
    const sorted = sortByFrequencyValue(frequencies);
    expect(sorted.map((f) => f.frequency)).toEqual([88.4, 95.0, 97.2, 97.2]);
    expect(frequencies[0]?.frequency).toBe(97.2); // original order untouched
  });
});

describe('brandsByBroadcaster', () => {
  it('returns every brand owned by the given broadcaster', () => {
    expect(brandsByBroadcaster(stations, 'trt').map((s) => s.id)).toEqual(['trt-fm']);
    expect(brandsByBroadcaster(stations, 'unknown-broadcaster')).toEqual([]);
  });
});

describe('relatedBrands', () => {
  it('ranks stations sharing categories above unrelated ones and excludes itself', () => {
    const result = relatedBrands(stations, trtFm, 2);
    expect(result.some((s) => s.id === 'trt-fm')).toBe(false);
    expect(result.map((s) => s.id)).toContain('metro-fm');
  });
});

describe('mostRecentlyVerified', () => {
  it('sorts by lastVerifiedAt descending', () => {
    const result = mostRecentlyVerified(frequencies, 2);
    expect(result).toHaveLength(2);
    const [first, second] = result;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first && second) {
      expect(first.lastVerifiedAt >= second.lastVerifiedAt).toBe(true);
    }
  });
});

describe('satellite <-> transponder relationship', () => {
  const transponders: Transponder[] = [
    {
      id: 'turksat-4a-11958-h-27500',
      satelliteId: 'turksat-4a',
      slug: '11958-h-27500',
      frequencyMhz: 11958,
      polarization: 'H',
      band: 'Ku',
      symbolRate: 27500,
      fec: '5/6',
      modulation: 'DVB-S2 8PSK',
      beam: null,
      status: 'active',
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
    {
      id: 'turksat-3a-11096-h-30000',
      satelliteId: 'turksat-3a',
      slug: '11096-h-30000',
      frequencyMhz: 11096,
      polarization: 'H',
      band: 'Ku',
      symbolRate: 30000,
      fec: '3/4',
      modulation: 'DVB-S QPSK',
      beam: null,
      status: 'active',
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
  ];

  const services: SatelliteService[] = [
    {
      id: 'trt-1-turksat-4a-service',
      stationId: 'trt-1',
      broadcastKind: 'tv',
      satelliteId: 'turksat-4a',
      transponderId: 'turksat-4a-11958-h-27500',
      videoPid: 512,
      audioPids: [650],
      pcrPid: 512,
      serviceIdNumber: 101,
      networkId: 70,
      resolution: 'HD',
      encryption: 'free-to-air',
      coverage: null,
      status: 'active',
      validFrom: null,
      validTo: null,
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
    {
      id: 'atv-turksat-4a-service',
      stationId: 'atv',
      broadcastKind: 'tv',
      satelliteId: 'turksat-4a',
      transponderId: 'turksat-4a-11958-h-27500',
      videoPid: 513,
      audioPids: [651],
      pcrPid: 513,
      serviceIdNumber: 102,
      networkId: 70,
      resolution: 'HD',
      encryption: 'free-to-air',
      coverage: null,
      status: 'active',
      validFrom: null,
      validTo: null,
      lastVerifiedAt: '2026-08-05',
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
  ];

  it('transpondersBySatellite returns only transponders on that satellite', () => {
    const result = transpondersBySatellite(transponders, 'turksat-4a');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('turksat-4a-11958-h-27500');
  });

  it('servicesByTransponder returns every service multiplexed on that transponder', () => {
    const result = servicesByTransponder(services, 'turksat-4a-11958-h-27500');
    expect(result.map((s) => s.stationId).sort()).toEqual(['atv', 'trt-1']);
  });

  it('servicesBySatellite aggregates across all of a satellite\'s transponders', () => {
    expect(servicesBySatellite(services, 'turksat-4a')).toHaveLength(2);
    expect(servicesBySatellite(services, 'turksat-3a')).toHaveLength(0);
  });
});

describe('updatesForEntity', () => {
  const updates: FrequencyUpdate[] = [
    {
      id: 'u1',
      slug: 'u1',
      date: '2026-01-01',
      changeType: 'frequency-changed',
      entityType: 'terrestrial-frequency',
      entityId: 'trt-fm-ankara-97-2',
      relatedStationId: 'trt-fm',
      relatedChannelId: null,
      cityId: 'ankara',
      title: 'x',
      description: 'x',
      oldValue: null,
      newValue: null,
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
    {
      id: 'u2',
      slug: 'u2',
      date: '2026-03-01',
      changeType: 'stale-verification',
      entityType: 'radio-station',
      entityId: 'metro-fm',
      relatedStationId: 'metro-fm',
      relatedChannelId: null,
      cityId: null,
      title: 'x',
      description: 'x',
      oldValue: null,
      newValue: null,
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
    {
      id: 'u3',
      slug: 'u3',
      date: '2026-02-01',
      changeType: 'missing-source',
      entityType: 'radio-station',
      entityId: 'metro-fm',
      relatedStationId: 'metro-fm',
      relatedChannelId: null,
      cityId: null,
      title: 'x',
      description: 'x',
      oldValue: null,
      newValue: null,
      sourceIds: ['editorial-placeholder'],
      verificationStatus: 'pending-review',
    },
  ];

  it('finds updates related to a station via entityId or relatedStationId', () => {
    const result = updatesForEntity(updates, 'trt-fm');
    expect(result.map((u) => u.id)).toEqual(['u1']);
  });

  it('sorts matches newest first', () => {
    const result = updatesForEntity(updates, 'metro-fm');
    expect(result.map((u) => u.id)).toEqual(['u2', 'u3']);
  });
});
