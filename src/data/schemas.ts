/**
 * Zod schemas for every normalized data file under `src/data/*.json`.
 *
 * This module is intentionally framework-agnostic: it only imports `zod`
 * (via `astro/zod`, the exact zod build Astro's content layer uses
 * internally, so schemas defined here are guaranteed compatible with
 * `defineCollection()` in `src/content.config.ts`). It has no dependency on
 * `astro:content` or any other virtual module, which means these schemas
 * -- and the plain TypeScript types inferred from them -- can also be
 * imported directly from Node scripts (scripts/data-*.ts) and from Vitest
 * tests without going through Astro's build pipeline.
 *
 * Design notes / deliberate normalization decisions:
 * - Foreign keys are plain string ids (not Astro's `reference()` helper) so
 *   these schemas stay usable outside `astro:content`. Referential
 *   integrity is instead checked explicitly by `scripts/data-validate.ts`,
 *   which is arguably stricter: it reports every dangling reference by id.
 * - DVB signal parameters (frequency, polarization, symbol rate, FEC,
 *   modulation) live once on `transponders`, not repeated on every
 *   `satellite-services` row, because all services multiplexed on one
 *   transponder genuinely share those carrier-level parameters in DVB-S/S2.
 *   Pages that need "frequency + polarization" on a channel page join
 *   through `transponderId` -- nothing from the spec's field list is lost,
 *   it just has one home instead of many duplicated copies.
 */
import { z } from 'astro/zod';

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                  */
/* ------------------------------------------------------------------ */

/** Lowercase kebab-case, ASCII-only. Enforces the "no Turkish characters in
 * URLs / slugs" rule at the data layer instead of just hoping callers
 * remember to slugify correctly. */
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case ASCII (a-z, 0-9, -)');

export const isoDateSchema = z.iso.date();
export const urlSchema = z.url();
export const idListSchema = z.array(z.string().min(1));
/** Every factual record must cite at least one source. */
export const sourceIdsSchema = idListSchema.min(1, 'at least one sourceId is required');

export const verificationStatusEnum = z.enum([
  'verified',
  'partially-verified',
  'community-reported',
  'outdated',
  'inactive',
  'pending-review',
]);
export type VerificationStatus = z.infer<typeof verificationStatusEnum>;

/** Shared lifecycle status for broadcast entities and individual frequency /
 * service assignments alike. Meaning is contextual: on a station it means
 * "is this brand on air", on a frequency row it means "is this specific
 * assignment currently in force". */
export const statusEnum = z.enum(['active', 'planned', 'inactive', 'discontinued']);
export type EntityStatus = z.infer<typeof statusEnum>;

export const coverageTypeEnum = z.enum(['national', 'regional', 'local', 'international']);
export type CoverageType = z.infer<typeof coverageTypeEnum>;

export const broadcastTypeEnum = z.enum([
  'terrestrial-radio',
  'terrestrial-tv',
  'satellite-radio',
  'satellite-tv',
  'cable-radio',
  'cable-tv',
  'internet-radio',
  'internet-tv',
  'shortwave',
  'dab',
  'dab-plus',
]);
export type BroadcastType = z.infer<typeof broadcastTypeEnum>;

export const broadcastKindEnum = z.enum(['radio', 'tv']);
export type BroadcastKind = z.infer<typeof broadcastKindEnum>;

export const regionEnum = z.enum([
  'marmara',
  'ege',
  'akdeniz',
  'ic-anadolu',
  'karadeniz',
  'dogu-anadolu',
  'guneydogu-anadolu',
]);
export type Region = z.infer<typeof regionEnum>;

const socialLinksSchema = z
  .object({
    instagram: urlSchema.optional(),
    x: urlSchema.optional(),
    youtube: urlSchema.optional(),
    facebook: urlSchema.optional(),
    tiktok: urlSchema.optional(),
    linkedin: urlSchema.optional(),
  })
  .strict();
export type SocialLinks = z.infer<typeof socialLinksSchema>;

/** Recommended content categories. Not a hard enum (editorial reality is
 * messier than any fixed list) but exported so seed data and filter UIs
 * draw from one shared vocabulary. */
export const CONTENT_CATEGORIES = [
  'haber',
  'muzik',
  'spor',
  'genel',
  'cocuk',
  'belgesel',
  'kultur-sanat',
  'ekonomi',
  'din',
  'yerel',
  'dizi-sinema',
] as const;

/* ------------------------------------------------------------------ */
/*  Geography: cities, districts, transmitters                        */
/* ------------------------------------------------------------------ */

export const citySchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  /** Turkish vehicle plate code, 1-81. Stable public reference data. */
  plateCode: z.number().int().min(1).max(81),
  region: regionEnum,
});
export type City = z.infer<typeof citySchema>;
export const citiesFileSchema = z.array(citySchema);

export const districtSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  cityId: z.string().min(1),
});
export type District = z.infer<typeof districtSchema>;
export const districtsFileSchema = z.array(districtSchema);

export const transmitterSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  cityId: z.string().min(1),
  districtId: z.string().min(1).nullable(),
  elevationMeters: z.number().positive().nullable(),
  notes: z.string().nullable(),
});
export type Transmitter = z.infer<typeof transmitterSchema>;
export const transmittersFileSchema = z.array(transmitterSchema);

/* ------------------------------------------------------------------ */
/*  Broadcasters (the legal / editorial entity behind one or more      */
/*  radio / TV brands)                                                 */
/* ------------------------------------------------------------------ */

export const claimStatusEnum = z.enum(['unclaimed', 'claim-pending', 'claimed-verified']);
export type ClaimStatus = z.infer<typeof claimStatusEnum>;

export const broadcasterSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().min(1),
  headquarters: z.string().min(1).nullable(),
  officialWebsite: urlSchema.nullable(),
  foundedYear: z.number().int().min(1900).max(2100).nullable(),
  claimStatus: claimStatusEnum.default('unclaimed'),
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type Broadcaster = z.infer<typeof broadcasterSchema>;
export const broadcastersFileSchema = z.array(broadcasterSchema);

/* ------------------------------------------------------------------ */
/*  Common broadcast-brand fields shared by radio stations and TV      */
/*  channels ("ORTAK VERİ ALANLARI")                                   */
/* ------------------------------------------------------------------ */

const broadcastBrandBase = {
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  alternativeNames: z.array(z.string().min(1)).default([]),
  logo: z.string().min(1).nullable(),
  description: z.string().min(1),
  broadcastType: broadcastTypeEnum,
  coverageType: coverageTypeEnum,
  languages: z.array(z.string().min(1)).min(1),
  categories: z.array(z.string().min(1)).min(1),
  /** cityId of the broadcaster's headquarters, or null if unknown. */
  headquarters: z.string().min(1).nullable(),
  /** broadcasters.id of the owning organisation, or null if unknown. */
  owner: z.string().min(1).nullable(),
  officialWebsite: urlSchema.nullable(),
  officialLiveUrl: urlSchema.nullable(),
  officialSocialLinks: socialLinksSchema.default({}),
  status: statusEnum,
  firstBroadcastDate: isoDateSchema.nullable(),
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
  featured: z.boolean().default(false),
  seoTitle: z.string().min(1).nullable(),
  seoDescription: z.string().min(1).nullable(),
};

export const radioStationSchema = z.object(broadcastBrandBase);
export type RadioStation = z.infer<typeof radioStationSchema>;
export const radioStationsFileSchema = z.array(radioStationSchema);

export const televisionChannelSchema = z.object(broadcastBrandBase);
export type TelevisionChannel = z.infer<typeof televisionChannelSchema>;
export const televisionChannelsFileSchema = z.array(televisionChannelSchema);

/* ------------------------------------------------------------------ */
/*  Terrestrial (FM) radio frequencies                                 */
/* ------------------------------------------------------------------ */

export const frequencyUnitEnum = z.enum(['MHz', 'kHz']);
export type FrequencyUnit = z.infer<typeof frequencyUnitEnum>;

export const terrestrialFrequencySchema = z.object({
  id: slugSchema,
  stationId: z.string().min(1),
  frequency: z.number().positive(),
  unit: frequencyUnitEnum,
  cityId: z.string().min(1),
  districtId: z.string().min(1).nullable(),
  transmitterId: z.string().min(1).nullable(),
  coverageType: coverageTypeEnum,
  status: statusEnum,
  validFrom: isoDateSchema.nullable(),
  validTo: isoDateSchema.nullable(),
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
  notes: z.string().nullable(),
});
export type TerrestrialFrequency = z.infer<typeof terrestrialFrequencySchema>;
export const terrestrialFrequenciesFileSchema = z.array(terrestrialFrequencySchema);

/* ------------------------------------------------------------------ */
/*  Satellites, transponders, satellite services                       */
/* ------------------------------------------------------------------ */

export const satelliteSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  /** Free-text orbital slot, e.g. "42°E". */
  orbitalPosition: z.string().min(1),
  operator: z.string().min(1),
  coverageAreas: z.array(z.string().min(1)).default([]),
  status: statusEnum,
  launchDate: isoDateSchema.nullable(),
  description: z.string().min(1),
  officialWebsite: urlSchema.nullable(),
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type Satellite = z.infer<typeof satelliteSchema>;
export const satellitesFileSchema = z.array(satelliteSchema);

export const polarizationEnum = z.enum(['H', 'V', 'L', 'R']);
export type Polarization = z.infer<typeof polarizationEnum>;

export const satelliteBandEnum = z.enum(['C', 'Ku', 'Ka']);
export type SatelliteBand = z.infer<typeof satelliteBandEnum>;

export const transponderSchema = z.object({
  id: slugSchema,
  satelliteId: z.string().min(1),
  slug: slugSchema,
  frequencyMhz: z.number().positive(),
  polarization: polarizationEnum,
  band: satelliteBandEnum.nullable(),
  symbolRate: z.number().positive(),
  fec: z.string().min(1),
  modulation: z.string().min(1),
  beam: z.string().nullable(),
  status: statusEnum,
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type Transponder = z.infer<typeof transponderSchema>;
export const transpondersFileSchema = z.array(transponderSchema);

export const resolutionEnum = z.enum(['SD', 'HD', 'UHD']);
export type Resolution = z.infer<typeof resolutionEnum>;

export const encryptionEnum = z.enum(['free-to-air', 'encrypted']);
export type Encryption = z.infer<typeof encryptionEnum>;

export const satelliteServiceSchema = z.object({
  id: slugSchema,
  /** radio-stations.id or television-channels.id, disambiguated by broadcastKind. */
  stationId: z.string().min(1),
  broadcastKind: broadcastKindEnum,
  satelliteId: z.string().min(1),
  transponderId: z.string().min(1),
  videoPid: z.number().int().positive().nullable(),
  audioPids: z.array(z.number().int().positive()).default([]),
  pcrPid: z.number().int().positive().nullable(),
  /** MPEG-TS service id (SID), distinct from this record's own `id`. */
  serviceIdNumber: z.number().int().positive().nullable(),
  networkId: z.number().int().positive().nullable(),
  resolution: resolutionEnum.nullable(),
  encryption: encryptionEnum,
  coverage: z.string().nullable(),
  status: statusEnum,
  validFrom: isoDateSchema.nullable(),
  validTo: isoDateSchema.nullable(),
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type SatelliteService = z.infer<typeof satelliteServiceSchema>;
export const satelliteServicesFileSchema = z.array(satelliteServiceSchema);

/* ------------------------------------------------------------------ */
/*  Platforms (cable / IPTV / OTT operators) and channel numbering     */
/* ------------------------------------------------------------------ */

export const platformTypeEnum = z.enum(['satellite-pay-tv', 'cable', 'iptv', 'ott', 'dth']);
export type PlatformType = z.infer<typeof platformTypeEnum>;

export const platformSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  platformType: platformTypeEnum,
  operator: z.string().min(1).nullable(),
  officialWebsite: urlSchema.nullable(),
  description: z.string().min(1),
  coverage: z.string().nullable(),
  status: statusEnum,
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type Platform = z.infer<typeof platformSchema>;
export const platformsFileSchema = z.array(platformSchema);

export const platformChannelSchema = z.object({
  id: slugSchema,
  platformId: z.string().min(1),
  channelId: z.string().min(1),
  broadcastKind: broadcastKindEnum,
  channelNumber: z.number().int().positive(),
  packageName: z.string().nullable(),
  status: statusEnum,
  lastVerifiedAt: isoDateSchema,
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type PlatformChannel = z.infer<typeof platformChannelSchema>;
export const platformChannelsFileSchema = z.array(platformChannelSchema);

/* ------------------------------------------------------------------ */
/*  Frequency / broadcast change log                                   */
/* ------------------------------------------------------------------ */

export const changeTypeEnum = z.enum([
  'new-broadcast',
  'discontinued-broadcast',
  'frequency-changed',
  'satellite-changed',
  'transponder-changed',
  'symbol-rate-changed',
  'broken-official-link',
  'missing-source',
  'stale-verification',
  'other',
]);
export type ChangeType = z.infer<typeof changeTypeEnum>;

export const changedEntityTypeEnum = z.enum([
  'broadcaster',
  'radio-station',
  'television-channel',
  'terrestrial-frequency',
  'satellite',
  'transponder',
  'satellite-service',
  'platform-channel',
]);
export type ChangedEntityType = z.infer<typeof changedEntityTypeEnum>;

export const frequencyUpdateSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  date: isoDateSchema,
  changeType: changeTypeEnum,
  entityType: changedEntityTypeEnum,
  entityId: z.string().min(1).nullable(),
  relatedStationId: z.string().min(1).nullable(),
  relatedChannelId: z.string().min(1).nullable(),
  cityId: z.string().min(1).nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  sourceIds: sourceIdsSchema,
  verificationStatus: verificationStatusEnum,
});
export type FrequencyUpdate = z.infer<typeof frequencyUpdateSchema>;
export const frequencyUpdatesFileSchema = z.array(frequencyUpdateSchema);

/* ------------------------------------------------------------------ */
/*  Sources                                                             */
/* ------------------------------------------------------------------ */

export const sourceTypeEnum = z.enum([
  'regulator',
  'satellite-operator',
  'broadcaster-official',
  'verified-social',
  'secondary',
  'user-submission',
  'editorial-placeholder',
]);
export type SourceType = z.infer<typeof sourceTypeEnum>;

export const sourceReliabilityEnum = z.enum(['high', 'medium', 'low']);
export type SourceReliability = z.infer<typeof sourceReliabilityEnum>;

export const sourceSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  slug: slugSchema,
  type: sourceTypeEnum,
  url: urlSchema.nullable(),
  description: z.string().min(1),
  reliability: sourceReliabilityEnum,
});
export type Source = z.infer<typeof sourceSchema>;
export const sourcesFileSchema = z.array(sourceSchema);

/* ------------------------------------------------------------------ */
/*  Guides (long-form editorial markdown content, /rehber/[slug]/)     */
/* ------------------------------------------------------------------ */

export const faqEntrySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});
export type FaqEntry = z.infer<typeof faqEntrySchema>;

export const guideFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedDate: isoDateSchema,
  updatedDate: isoDateSchema,
  faq: z.array(faqEntrySchema).default([]),
  relatedGuideIds: z.array(z.string().min(1)).default([]),
  relatedStationIds: z.array(z.string().min(1)).default([]),
  relatedChannelIds: z.array(z.string().min(1)).default([]),
  relatedSatelliteIds: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  seoTitle: z.string().min(1).nullable().default(null),
  seoDescription: z.string().min(1).nullable().default(null),
});
export type GuideFrontmatter = z.infer<typeof guideFrontmatterSchema>;
