import { describe, expect, it } from 'vitest';
import {
  citySchema,
  radioStationSchema,
  satelliteServiceSchema,
  slugSchema,
  sourceSchema,
  terrestrialFrequencySchema,
  transponderSchema,
} from '../src/data/schemas';

const validCity = {
  id: 'istanbul',
  name: 'İstanbul',
  slug: 'istanbul',
  plateCode: 34,
  region: 'marmara',
};

const validStation = {
  id: 'metro-fm',
  name: 'Metro FM',
  slug: 'metro-fm',
  alternativeNames: [],
  logo: null,
  description: 'Test description',
  broadcastType: 'terrestrial-radio',
  coverageType: 'national',
  languages: ['tr'],
  categories: ['muzik'],
  headquarters: 'istanbul',
  owner: null,
  officialWebsite: 'https://www.metrofm.com.tr',
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
};

const validFrequency = {
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
};

const validTransponder = {
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
};

const validSatelliteService = {
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
  coverage: 'Türkiye ve Avrupa',
  status: 'active',
  validFrom: null,
  validTo: null,
  lastVerifiedAt: '2026-08-05',
  sourceIds: ['editorial-placeholder'],
  verificationStatus: 'pending-review',
};

describe('slugSchema', () => {
  it('accepts lowercase kebab-case ASCII', () => {
    expect(slugSchema.safeParse('metro-fm').success).toBe(true);
    expect(slugSchema.safeParse('94-8').success).toBe(true);
  });

  it('rejects uppercase letters, Turkish characters, spaces and double dashes', () => {
    expect(slugSchema.safeParse('Metro-FM').success).toBe(false);
    expect(slugSchema.safeParse('metro fm').success).toBe(false);
    expect(slugSchema.safeParse('İstanbul').success).toBe(false);
    expect(slugSchema.safeParse('metro--fm').success).toBe(false);
    expect(slugSchema.safeParse('-metro-fm').success).toBe(false);
    expect(slugSchema.safeParse('').success).toBe(false);
  });
});

describe('citySchema', () => {
  it('accepts a well-formed city record', () => {
    const result = citySchema.safeParse(validCity);
    expect(result.success).toBe(true);
  });

  it('rejects a plate code outside 1-81', () => {
    expect(citySchema.safeParse({ ...validCity, plateCode: 0 }).success).toBe(false);
    expect(citySchema.safeParse({ ...validCity, plateCode: 82 }).success).toBe(false);
  });

  it('rejects an unknown region', () => {
    expect(citySchema.safeParse({ ...validCity, region: 'not-a-region' }).success).toBe(false);
  });

  it('rejects a missing required field', () => {
    const { name: _name, ...withoutName } = validCity;
    expect(citySchema.safeParse(withoutName).success).toBe(false);
  });
});

describe('radioStationSchema', () => {
  it('accepts a well-formed station record', () => {
    expect(radioStationSchema.safeParse(validStation).success).toBe(true);
  });

  it('rejects an empty sourceIds array (every record must cite a source)', () => {
    const result = radioStationSchema.safeParse({ ...validStation, sourceIds: [] });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid verificationStatus value', () => {
    const result = radioStationSchema.safeParse({
      ...validStation,
      verificationStatus: 'definitely-real-trust-me',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid broadcastType value', () => {
    const result = radioStationSchema.safeParse({ ...validStation, broadcastType: 'fm-radio' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed officialWebsite URL', () => {
    const result = radioStationSchema.safeParse({ ...validStation, officialWebsite: 'metrofm.com.tr' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty categories array', () => {
    const result = radioStationSchema.safeParse({ ...validStation, categories: [] });
    expect(result.success).toBe(false);
  });

  it('defaults alternativeNames and officialSocialLinks when omitted', () => {
    const { alternativeNames: _alt, officialSocialLinks: _social, ...minimal } = validStation;
    const result = radioStationSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alternativeNames).toEqual([]);
      expect(result.data.officialSocialLinks).toEqual({});
    }
  });
});

describe('terrestrialFrequencySchema', () => {
  it('accepts a well-formed frequency record matching the spec example', () => {
    expect(terrestrialFrequencySchema.safeParse(validFrequency).success).toBe(true);
  });

  it('rejects a non-positive frequency value', () => {
    expect(terrestrialFrequencySchema.safeParse({ ...validFrequency, frequency: 0 }).success).toBe(
      false,
    );
    expect(terrestrialFrequencySchema.safeParse({ ...validFrequency, frequency: -97.2 }).success).toBe(
      false,
    );
  });

  it('rejects an invalid ISO date in lastVerifiedAt', () => {
    expect(
      terrestrialFrequencySchema.safeParse({ ...validFrequency, lastVerifiedAt: '05-08-2026' }).success,
    ).toBe(false);
  });

  it('accepts a null districtId and transmitterId (city-level assignment)', () => {
    const result = terrestrialFrequencySchema.safeParse({
      ...validFrequency,
      districtId: null,
      transmitterId: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('transponderSchema', () => {
  it('accepts a well-formed transponder record', () => {
    expect(transponderSchema.safeParse(validTransponder).success).toBe(true);
  });

  it('rejects an invalid polarization value', () => {
    expect(transponderSchema.safeParse({ ...validTransponder, polarization: 'X' }).success).toBe(false);
  });

  it('rejects a non-positive symbol rate', () => {
    expect(transponderSchema.safeParse({ ...validTransponder, symbolRate: 0 }).success).toBe(false);
  });
});

describe('satelliteServiceSchema', () => {
  it('accepts a well-formed TV service record', () => {
    expect(satelliteServiceSchema.safeParse(validSatelliteService).success).toBe(true);
  });

  it('accepts a radio (audio-only) service with a null videoPid and resolution', () => {
    const radioService = {
      ...validSatelliteService,
      id: 'trt-fm-turksat-4a-service',
      stationId: 'trt-fm',
      broadcastKind: 'radio',
      videoPid: null,
      resolution: null,
    };
    expect(satelliteServiceSchema.safeParse(radioService).success).toBe(true);
  });

  it('rejects an invalid encryption value', () => {
    expect(
      satelliteServiceSchema.safeParse({ ...validSatelliteService, encryption: 'maybe' }).success,
    ).toBe(false);
  });

  it('rejects a non-integer PID', () => {
    expect(satelliteServiceSchema.safeParse({ ...validSatelliteService, videoPid: 512.5 }).success).toBe(
      false,
    );
  });
});

describe('sourceSchema', () => {
  it('accepts a well-formed source record', () => {
    const result = sourceSchema.safeParse({
      id: 'rtuk',
      name: 'RTÜK',
      slug: 'rtuk',
      type: 'regulator',
      url: 'https://www.rtuk.gov.tr',
      description: 'Regulator',
      reliability: 'high',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown source type', () => {
    const result = sourceSchema.safeParse({
      id: 'mystery',
      name: 'Mystery Source',
      slug: 'mystery',
      type: 'rumor',
      url: null,
      description: 'x',
      reliability: 'low',
    });
    expect(result.success).toBe(false);
  });
});
