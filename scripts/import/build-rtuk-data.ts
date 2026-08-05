#!/usr/bin/env tsx
/**
 * npm run data:import-rtuk -- <path-to-raw-extracted.json>
 *
 * Turns a pre-extracted RTÜK "il bazında yayın lisans listesi" export into
 * this project's normalized src/data/*.json files.
 *
 * RTÜK (Radyo ve Televizyon Üst Kurulu, Turkey's broadcasting regulator)
 * publishes, per province, a PDF table of every licensed radio and TV
 * broadcaster with its brand name, license tier, band, frequency/channel
 * and transmitter district. That PDF export is not something this script
 * reads directly -- see `scripts/import/extract-rtuk-pdfs.py` for the
 * PyMuPDF-based table extraction that turns a folder of
 * "<İL>_RADYO.pdf" / "<İL>_TV.pdf" files (plus RTÜK's own
 * "_indirme_ozeti.csv" download summary) into the flat JSON this script
 * consumes. Splitting the pipeline there is deliberate: PDF table
 * extraction and schema-aware entity resolution are different concerns,
 * and keeping them in different scripts/languages means a future
 * re-import only needs to re-run the PDF step before landing back here.
 *
 * What this script does NOT touch: satellites.json, transponders.json,
 * satellite-services.json, platforms.json, platform-channels.json --
 * RTÜK's terrestrial license lists say nothing about satellite/cable
 * distribution, so that data stays whatever it was before this import.
 * A handful of stationId/channelId references in those files that used to
 * point at this project's old *sample* radio-stations/television-channels
 * ids are explicitly remapped at the end (see REMAP_STATION_IDS) so they
 * keep resolving to the real entities this import produces.
 *
 * Design decisions (see also DATA_SOURCES.md / EDITORIAL_POLICY.md):
 * - A "station"/"channel" is identified by (brand name, licensee legal
 *   entity) together, not brand name alone -- unrelated local stations in
 *   different provinces sometimes share a generic brand name (e.g. two
 *   completely unrelated "Akdeniz FM"s), and grouping by brand name alone
 *   would silently merge them into one fictitious multi-city station.
 * - Brand names and licensee ("Ünvanı") legal names are kept byte-for-byte
 *   as RTÜK printed them (only whitespace-trimmed) rather than
 *   auto-recased -- these are registered names/trademarks, and guessing a
 *   "nicer" casing risks being wrong in a way plain preservation can't be.
 *   City and district names, which are ordinary geographic proper nouns
 *   rather than stylized brand marks, ARE title-cased for a consistent,
 *   readable result.
 * - Every generated record's officialWebsite/officialLiveUrl/social links
 *   are left null and description text is a short factual template, not
 *   carried over from this project's old hand-written sample copy -- RTÜK
 *   licenses don't cover websites, so asserting one under a `verified`
 *   record sourced to `rtuk` would misattribute an unverified guess to the
 *   regulator. That enrichment is a legitimate candidate for a *later*,
 *   separately-sourced pass (see DATA_SOURCES.md).
 * - `terrestrial-tv-channels.json` is a new file, not folded into
 *   `terrestrial-frequencies.json`: Turkish digital terrestrial TV is
 *   licensed by band group + logical multiplex channel number, not by an
 *   RF frequency in MHz, and conflating the two would misrepresent RTÜK's
 *   own data. See the schema comment in src/data/schemas.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  broadcastersFileSchema,
  citiesFileSchema,
  districtsFileSchema,
  radioStationsFileSchema,
  televisionChannelsFileSchema,
  terrestrialFrequenciesFileSchema,
  terrestrialTvChannelsFileSchema,
  transmittersFileSchema,
  type Broadcaster,
  type City,
  type CoverageType,
  type District,
  type RadioStation,
  type Region,
  type TelevisionChannel,
  type TerrestrialFrequency,
  type TerrestrialTvChannel,
  type Transmitter,
} from '../../src/data/schemas';
import { frequencySlugFragment } from '../../src/lib/format';
import { slugify } from '../../src/lib/slug';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/data');
const TODAY = '2026-08-05';
const RTUK_SOURCE_ID = 'rtuk';

/* ------------------------------------------------------------------ */
/*  Raw input shape (produced by extract-rtuk-pdfs.py)                 */
/* ------------------------------------------------------------------ */

interface RawRecord {
  province_stem: string;
  province_name: string;
  sehir_id: string;
  kind: 'RADYO' | 'TV';
  row_index: string;
  unvan: string;
  lisans: string;
  brand: string;
  band: string;
  kanal: string;
  ilce: string;
  address: string;
}

interface RawExtract {
  records: RawRecord[];
  anomalies: string[];
}

/* ------------------------------------------------------------------ */
/*  Turkish text helpers                                               */
/* ------------------------------------------------------------------ */

const TR_UPPER_TO_LOWER: Record<string, string> = {
  İ: 'i', I: 'ı', Ç: 'ç', Ğ: 'ğ', Ö: 'ö', Ş: 'ş', Ü: 'ü',
};
const TR_LOWER_TO_UPPER: Record<string, string> = {
  i: 'İ', ı: 'I', ç: 'Ç', ğ: 'Ğ', ö: 'Ö', ş: 'Ş', ü: 'Ü',
};

function turkishLowerChar(char: string): string {
  return TR_UPPER_TO_LOWER[char] ?? char.toLowerCase();
}
function turkishUpperFirstChar(char: string): string {
  return TR_LOWER_TO_UPPER[char] ?? char.toUpperCase();
}
function turkishLower(input: string): string {
  return Array.from(input).map(turkishLowerChar).join('');
}
/** Turkish-aware title case for ordinary proper nouns (city/district names). Not used for brand/legal names -- see file doc comment. */
function turkishTitleCase(input: string): string {
  return input.replace(/\p{L}+/gu, (word) => {
    const lower = turkishLower(word);
    return lower.length === 0 ? lower : turkishUpperFirstChar(lower[0] ?? '') + lower.slice(1);
  });
}
/** Collapses whitespace and trims -- the one normalization applied to every text field, verbatim-preserved or not. */
function cleanWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
/** Case-insensitive (Turkish-aware), whitespace-normalized grouping key. Never used for display. */
function lightNormKey(input: string): string {
  return turkishLower(cleanWhitespace(input));
}

/* ------------------------------------------------------------------ */
/*  Reference geography: province -> region (not in RTÜK's export)     */
/* ------------------------------------------------------------------ */

/** Keyed by RTÜK's own ALL-CAPS province spelling (from _indirme_ozeti.csv). */
const PROVINCE_REGION: Record<string, Region> = {
  İSTANBUL: 'marmara', BURSA: 'marmara', KOCAELİ: 'marmara', SAKARYA: 'marmara', TEKİRDAĞ: 'marmara',
  EDİRNE: 'marmara', KIRKLARELİ: 'marmara', BALIKESİR: 'marmara', ÇANAKKALE: 'marmara', YALOVA: 'marmara', BİLECİK: 'marmara',
  İZMİR: 'ege', MANİSA: 'ege', AYDIN: 'ege', DENİZLİ: 'ege', MUĞLA: 'ege', UŞAK: 'ege', KÜTAHYA: 'ege', AFYONKARAHİSAR: 'ege',
  ANTALYA: 'akdeniz', ADANA: 'akdeniz', MERSİN: 'akdeniz', HATAY: 'akdeniz', 'K.MARAŞ': 'akdeniz',
  OSMANİYE: 'akdeniz', ISPARTA: 'akdeniz', BURDUR: 'akdeniz',
  ANKARA: 'ic-anadolu', KONYA: 'ic-anadolu', KAYSERİ: 'ic-anadolu', SİVAS: 'ic-anadolu', YOZGAT: 'ic-anadolu',
  ÇORUM: 'ic-anadolu', KIRIKKALE: 'ic-anadolu', KIRŞEHİR: 'ic-anadolu', NEVŞEHİR: 'ic-anadolu', NİĞDE: 'ic-anadolu',
  AKSARAY: 'ic-anadolu', KARAMAN: 'ic-anadolu', ESKİŞEHİR: 'ic-anadolu',
  TRABZON: 'karadeniz', SAMSUN: 'karadeniz', ORDU: 'karadeniz', GİRESUN: 'karadeniz', RİZE: 'karadeniz',
  ARTVİN: 'karadeniz', GÜMÜŞHANE: 'karadeniz', BAYBURT: 'karadeniz', AMASYA: 'karadeniz', TOKAT: 'karadeniz',
  ÇANKIRI: 'karadeniz', KASTAMONU: 'karadeniz', SİNOP: 'karadeniz', ZONGULDAK: 'karadeniz', BARTIN: 'karadeniz',
  KARABÜK: 'karadeniz', DÜZCE: 'karadeniz', BOLU: 'karadeniz',
  ERZURUM: 'dogu-anadolu', ERZİNCAN: 'dogu-anadolu', VAN: 'dogu-anadolu', AĞRI: 'dogu-anadolu', KARS: 'dogu-anadolu',
  IĞDIR: 'dogu-anadolu', ARDAHAN: 'dogu-anadolu', MUŞ: 'dogu-anadolu', BİTLİS: 'dogu-anadolu', BİNGÖL: 'dogu-anadolu',
  ELAZIĞ: 'dogu-anadolu', TUNCELİ: 'dogu-anadolu', MALATYA: 'dogu-anadolu', HAKKARİ: 'dogu-anadolu',
  GAZİANTEP: 'guneydogu-anadolu', ŞANLIURFA: 'guneydogu-anadolu', DİYARBAKIR: 'guneydogu-anadolu', MARDİN: 'guneydogu-anadolu',
  SİİRT: 'guneydogu-anadolu', ŞIRNAK: 'guneydogu-anadolu', BATMAN: 'guneydogu-anadolu', ADIYAMAN: 'guneydogu-anadolu', KİLİS: 'guneydogu-anadolu',
};

/** RTÜK's province column uses this abbreviation; expand it before display-casing. */
const PROVINCE_NAME_OVERRIDES: Record<string, string> = {
  'K.MARAŞ': 'KAHRAMANMARAŞ',
};

/* ------------------------------------------------------------------ */
/*  A handful of this project's pre-existing *sample* station/channel  */
/*  ids that satellite-services.json / platform-channels.json /        */
/*  frequency-updates.json reference, but whose RTÜK-derived slug       */
/*  differs from the old hand-picked id (RTÜK's own registered brand    */
/*  text is longer/different, e.g. "JOYTÜRK FM" not "JoyTürk"). Old ids */
/*  not listed here either match the new slug unchanged (verified       */
/*  against the real export before writing this list) or -- "a-spor" -- */
/*  have no terrestrial RTÜK listing at all and are left as they were.  */
/* ------------------------------------------------------------------ */
const REMAP_STATION_IDS: Record<string, string> = {
  joyturk: 'joyturk-fm',
  'radyo-1': 'trt-radyo-1',
};

/** Small, purely editorial "well-known brand" allowlist for the homepage's featured sections -- not a data-accuracy claim. */
const FEATURED_BRAND_KEYS = new Set(
  [
    'TRT 1', 'ATV', 'KANAL D', 'SHOW TV', 'STAR TV', 'TV8', 'NOW', 'CNN TÜRK', 'HABER TÜRK', 'A HABER',
    'TRT FM', 'METRO FM', 'SÜPER FM', 'JOYTÜRK FM', 'KRAL FM', 'POWER FM', 'TRT TÜRKÜ', 'TRT RADYO 1', 'VIRGIN RADIO TÜRKİYE',
  ].map(lightNormKey),
);

/* ------------------------------------------------------------------ */
/*  Small generic helpers                                              */
/* ------------------------------------------------------------------ */

function ensureUniqueId(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  const finalId = `${base}-${n}`;
  used.add(finalId);
  return finalId;
}

function deriveCoverageType(lisans: string, kind: 'RADYO' | 'TV'): CoverageType {
  const prefix = kind === 'RADYO' ? 'R' : 'T';
  const match = new RegExp(`${prefix}(\\d)`).exec(lisans);
  const tier = match?.[1];
  if (tier === '2') return 'regional';
  if (tier === '3') return 'local';
  return 'national';
}

function unvanBase(unvan: string): string {
  return cleanWhitespace(unvan.replace(/\s*\([^)]*\)\s*$/, ''));
}

/** The trailing "(...)" on an Ünvanı, e.g. "TRT KURUMU (TRT 1-RADYO 1)" -> "TRT 1-RADYO 1". */
function extractParenthetical(unvan: string): string | null {
  const match = /\(([^)]*)\)\s*$/.exec(unvan);
  return match ? cleanWhitespace(match[1] ?? '') : null;
}

const HABER_KEYWORDS = /\bhaber\b/;
const SPOR_KEYWORDS = /\bspor\b/;
const COCUK_KEYWORDS = /\bcocuk\b/;
const DIN_KEYWORDS = /diyanet|kuran|ilahi|risalet|dini\b/;
const KULTUR_KEYWORDS = /universite|kultur|sanat/;

/** Very small, conservative keyword inference from the brand name itself -- RTÜK gives no genre/format field. */
function inferCategories(brandName: string, kind: 'RADYO' | 'TV'): string[] {
  const folded = lightNormKey(brandName)
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  const categories: string[] = [];
  if (HABER_KEYWORDS.test(folded)) categories.push('haber');
  if (SPOR_KEYWORDS.test(folded)) categories.push('spor');
  if (COCUK_KEYWORDS.test(folded)) categories.push('cocuk');
  if (DIN_KEYWORDS.test(folded)) categories.push('din');
  if (KULTUR_KEYWORDS.test(folded)) categories.push('kultur-sanat');
  if (categories.length === 0) categories.push(kind === 'RADYO' ? 'muzik' : 'genel');
  return categories;
}

const COVERAGE_LABEL: Record<CoverageType, string> = {
  national: 'ulusal', regional: 'bölgesel', local: 'yerel', international: 'uluslararası',
};

function buildBrandDescription(
  name: string,
  kind: 'RADYO' | 'TV',
  coverageType: CoverageType,
  cityCount: number,
  ownerName: string | null,
): string {
  const medium = kind === 'RADYO' ? 'radyo' : 'televizyon';
  const scope =
    cityCount > 1
      ? `RTÜK lisans kayıtlarına göre ${cityCount} ilde yayın ${kind === 'RADYO' ? 'frekansı' : 'ataması'} bulunmaktadır.`
      : 'RTÜK lisans kayıtlarına göre yayını tek bir ilde bulunmaktadır.';
  const ownerPart = ownerName ? ` ${ownerName} tarafından işletilmektedir.` : '';
  return `${name}, ${COVERAGE_LABEL[coverageType]} ölçekte karasal ${medium} yayını yapan bir ${medium} markasıdır.${ownerPart} ${scope}`;
}

function buildBroadcasterDescription(name: string, brandCount: number): string {
  return `${name}, RTÜK (Radyo ve Televizyon Üst Kurulu) tarafından lisanslanmış bir yayın kuruluşudur. RTÜK kayıtlarına göre ${brandCount} radyo/televizyon markasının lisans sahibidir.`;
}

/** Extracts the trailing "/İL" segment of an RTÜK licensee address and resolves it to a cityId, or null if unresolvable. */
function extractHeadquartersCityId(address: string, provinceNameToCityId: ReadonlyMap<string, string>): string | null {
  const match = /\/\s*([A-ZÇĞİIÖŞÜ][A-ZÇĞİIÖŞÜ\s.]*)\s*$/u.exec(address);
  if (!match) return null;
  const raw = cleanWhitespace(match[1] ?? '').toUpperCase();
  return provinceNameToCityId.get(raw) ?? null;
}

function mostCommon<T>(values: readonly T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best: T | undefined;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  Main                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Kullanım: tsx scripts/import/build-rtuk-data.ts <raw_extracted.json yolu>');
    process.exitCode = 1;
    return;
  }

  const raw = JSON.parse(readFileSync(inputPath, 'utf8')) as RawExtract;
  const records = raw.records.map((r) => {
    const unvan = cleanWhitespace(r.unvan);
    // A handful of RTÜK's own rows (observed: one TRT university-affiliated
    // station) have a blank brand-name cell. Fall back to the licensee's
    // parenthetical brand hint, then the bare licensee name, rather than
    // producing a record with an empty (schema-invalid) name.
    const brand = cleanWhitespace(r.brand) || extractParenthetical(unvan) || unvanBase(unvan);
    return { ...r, unvan, brand, ilce: cleanWhitespace(r.ilce), address: cleanWhitespace(r.address) };
  });
  console.log(`Girdi: ${records.length} kayıt, ${raw.anomalies.length} bilinen anomali (${inputPath})`);

  /* ---- 1. Cities ---- */
  const cityByProvinceKey = new Map<string, City>(); // key: RTÜK ALL-CAPS spelling e.g. "İSTANBUL"
  for (const record of records) {
    if (cityByProvinceKey.has(record.province_name)) continue;
    const overridden = PROVINCE_NAME_OVERRIDES[record.province_name] ?? record.province_name;
    const properName = turkishTitleCase(turkishLower(overridden));
    const region = PROVINCE_REGION[record.province_name];
    if (!region) throw new Error(`No region mapping for province "${record.province_name}" -- add it to PROVINCE_REGION.`);
    cityByProvinceKey.set(record.province_name, {
      id: slugify(properName),
      name: properName,
      slug: slugify(properName),
      plateCode: Number(record.sehir_id),
      region,
    });
  }
  const cities = [...cityByProvinceKey.values()];
  if (cities.length !== 81) throw new Error(`Expected 81 provinces, got ${cities.length}`);
  const provinceNameToCityId = new Map<string, string>();
  for (const [provinceKey, city] of cityByProvinceKey) provinceNameToCityId.set(provinceKey, city.id);

  /* ---- 2. Districts + transmitters (one per unique (city, İlçe) pair) ---- */
  const districtByKey = new Map<string, District>(); // key: `${cityId}::${lightNorm(district)}`
  const transmitterByKey = new Map<string, Transmitter>();
  const usedDistrictIds = new Set<string>();
  const usedTransmitterIds = new Set<string>();
  for (const record of records) {
    if (!record.ilce) continue;
    const cityId = provinceNameToCityId.get(record.province_name);
    if (!cityId) continue;
    const city = cityByProvinceKey.get(record.province_name);
    if (!city) continue;
    const districtName = turkishTitleCase(turkishLower(record.ilce));
    const key = `${cityId}::${lightNormKey(districtName)}`;
    if (!districtByKey.has(key)) {
      const districtSlug = slugify(districtName);
      const id = ensureUniqueId(`${cityId}-${districtSlug}`, usedDistrictIds);
      districtByKey.set(key, { id, name: districtName, slug: districtSlug, cityId });
    }
    if (!transmitterByKey.has(key)) {
      const district = districtByKey.get(key);
      if (!district) continue;
      const id = ensureUniqueId(`${cityId}-${district.slug}-verici`, usedTransmitterIds);
      transmitterByKey.set(key, {
        id,
        name: `${city.name} ${district.name} Vericisi`,
        slug: id,
        cityId,
        districtId: district.id,
        elevationMeters: null,
        notes: null,
      });
    }
  }
  const districts = [...districtByKey.values()];
  const transmitters = [...transmitterByKey.values()];

  /* ---- 3. Broadcasters (dedupe by unvan_base) ---- */
  interface BroadcasterGroup {
    displayName: string;
    addresses: string[];
    brandCount: number;
  }
  const broadcasterGroups = new Map<string, BroadcasterGroup>(); // key: lightNormKey(unvanBase)
  for (const record of records) {
    const base = unvanBase(record.unvan);
    const key = lightNormKey(base);
    const existing = broadcasterGroups.get(key);
    if (existing) {
      existing.addresses.push(record.address);
    } else {
      broadcasterGroups.set(key, { displayName: base, addresses: [record.address], brandCount: 0 });
    }
  }

  const TRT_KEY = lightNormKey('TRT KURUMU');
  const usedBroadcasterIds = new Set<string>();
  const broadcasterIdByKey = new Map<string, string>();
  for (const [key, group] of broadcasterGroups) {
    const id =
      key === TRT_KEY ? 'trt' : ensureUniqueId(slugify(group.displayName) || `yayin-kurulusu-${broadcasterIdByKey.size + 1}`, usedBroadcasterIds);
    if (key === TRT_KEY) usedBroadcasterIds.add(id);
    broadcasterIdByKey.set(key, id);
  }

  /* ---- 4. Stations / channels (dedupe by brand + unvan_base compound key) ---- */
  interface BrandGroup {
    brandName: string;
    kind: 'RADYO' | 'TV';
    unvanKey: string;
    coverageType: CoverageType;
    cityIds: Set<string>;
    addresses: string[];
    rows: (typeof records)[number][];
  }
  const brandGroups = new Map<string, BrandGroup>(); // key: `${kind}::${lightNorm(brand)}::${unvanKey}`
  for (const record of records) {
    const unvanKey = lightNormKey(unvanBase(record.unvan));
    const brandKey = `${record.kind}::${lightNormKey(record.brand)}::${unvanKey}`;
    const cityId = provinceNameToCityId.get(record.province_name);
    let group = brandGroups.get(brandKey);
    if (!group) {
      group = {
        brandName: record.brand,
        kind: record.kind,
        unvanKey,
        coverageType: deriveCoverageType(record.lisans, record.kind),
        cityIds: new Set(),
        addresses: [],
        rows: [],
      };
      brandGroups.set(brandKey, group);
    }
    if (cityId) group.cityIds.add(cityId);
    group.addresses.push(record.address);
    group.rows.push(record);
  }

  // Broadcasters' brandCount, now that brand groups are known.
  for (const group of brandGroups.values()) {
    const broadcasterGroup = broadcasterGroups.get(group.unvanKey);
    if (broadcasterGroup) broadcasterGroup.brandCount += 1;
  }

  const broadcasters: Broadcaster[] = [...broadcasterGroups.entries()].map(([key, group]) => {
    const id = broadcasterIdByKey.get(key);
    if (!id) throw new Error(`Missing broadcaster id for key ${key}`);
    if (id === 'trt') {
      return {
        id: 'trt',
        name: 'TRT (Türkiye Radyo Televizyon Kurumu)',
        slug: 'trt',
        description:
          "TRT, Türkiye'nin kamu radyo ve televizyon kurumudur. RTÜK lisans kayıtlarına göre ulusal ölçekte çok sayıda radyo ve televizyon markası işletir. Bu profil, TRT'ye bağlı marka sayfalarını tek bir kurumsal kimlik altında ilişkilendirmek için tutulur.",
        headquarters: 'ankara',
        officialWebsite: 'https://www.trt.net.tr',
        foundedYear: 1964,
        claimStatus: 'unclaimed',
        lastVerifiedAt: TODAY,
        sourceIds: [RTUK_SOURCE_ID],
        verificationStatus: 'verified',
      };
    }
    const resolvedAddresses = group.addresses.map((a) => extractHeadquartersCityId(a, provinceNameToCityId)).filter((c): c is string => c !== null);
    return {
      id,
      name: group.displayName,
      slug: id,
      description: buildBroadcasterDescription(group.displayName, group.brandCount),
      headquarters: mostCommon(resolvedAddresses) ?? null,
      officialWebsite: null,
      foundedYear: null,
      claimStatus: 'unclaimed',
      lastVerifiedAt: TODAY,
      sourceIds: [RTUK_SOURCE_ID],
      verificationStatus: 'verified',
    };
  });

  const usedRadioIds = new Set<string>();
  const usedTvIds = new Set<string>();
  const radioStations: RadioStation[] = [];
  const televisionChannels: TelevisionChannel[] = [];
  const brandGroupId = new Map<string, string>(); // brandKey -> assigned station/channel id

  for (const [brandKey, group] of brandGroups) {
    const isRadio = group.kind === 'RADYO';
    const idSet = isRadio ? usedRadioIds : usedTvIds;
    const id = ensureUniqueId(slugify(group.brandName) || `yayin-${idSet.size + 1}`, idSet);
    brandGroupId.set(brandKey, id);

    const broadcasterId = broadcasterIdByKey.get(group.unvanKey) ?? null;
    const ownerName = broadcasterId ? (broadcasterId === 'trt' ? 'TRT' : broadcasterGroups.get(group.unvanKey)?.displayName ?? null) : null;
    const resolvedAddresses = group.addresses.map((a) => extractHeadquartersCityId(a, provinceNameToCityId)).filter((c): c is string => c !== null);
    const headquarters = mostCommon(resolvedAddresses) ?? null;
    const featured = FEATURED_BRAND_KEYS.has(lightNormKey(group.brandName));

    // RadioStation and TelevisionChannel are structurally identical (both
    // inferred from the same `broadcastBrandBase`); this one explicit
    // annotation is what lets the same literal be pushed into either array
    // below without TypeScript narrowing any field (e.g. `officialWebsite:
    // null`, `alternativeNames: []`) to something stricter than the schema.
    const common: RadioStation = {
      id,
      name: group.brandName,
      slug: id,
      alternativeNames: [],
      logo: null,
      description: buildBrandDescription(group.brandName, group.kind, group.coverageType, group.cityIds.size, ownerName),
      broadcastType: isRadio ? 'terrestrial-radio' : 'terrestrial-tv',
      coverageType: group.coverageType,
      languages: ['tr'],
      categories: inferCategories(group.brandName, group.kind),
      headquarters,
      owner: broadcasterId,
      officialWebsite: null,
      officialLiveUrl: null,
      officialSocialLinks: {},
      status: 'active',
      firstBroadcastDate: null,
      lastVerifiedAt: TODAY,
      sourceIds: [RTUK_SOURCE_ID],
      verificationStatus: 'verified',
      featured,
      seoTitle: null,
      seoDescription: null,
    };

    if (isRadio) radioStations.push(common);
    else televisionChannels.push(common);
  }

  /* ---- 5/6. terrestrial-frequencies.json + terrestrial-tv-channels.json ---- */
  const usedFreqIds = new Set<string>();
  const usedTvChannelIds = new Set<string>();
  const terrestrialFrequencies: TerrestrialFrequency[] = [];
  const terrestrialTvChannels: TerrestrialTvChannel[] = [];

  for (const record of records) {
    const cityId = provinceNameToCityId.get(record.province_name);
    if (!cityId) continue;
    const districtKey = `${cityId}::${lightNormKey(turkishTitleCase(turkishLower(record.ilce)))}`;
    const district = districtByKey.get(districtKey) ?? null;
    const transmitter = transmitterByKey.get(districtKey) ?? null;
    const unvanKey = lightNormKey(unvanBase(record.unvan));
    const brandKey = `${record.kind}::${lightNormKey(record.brand)}::${unvanKey}`;
    const entityId = brandGroupId.get(brandKey);
    if (!entityId) throw new Error(`Missing station/channel id for brand key ${brandKey}`);
    const coverageType = deriveCoverageType(record.lisans, record.kind);
    const citySlug = cities.find((c) => c.id === cityId)?.slug ?? cityId;

    if (record.kind === 'RADYO') {
      const frequency = Number(record.kanal);
      const baseId = `${entityId}-${citySlug}-${frequencySlugFragment(frequency)}`;
      const id = usedFreqIds.has(baseId) && district
        ? ensureUniqueId(`${baseId}-${district.slug}`, usedFreqIds)
        : ensureUniqueId(baseId, usedFreqIds);
      terrestrialFrequencies.push({
        id,
        stationId: entityId,
        frequency,
        unit: 'MHz',
        cityId,
        districtId: district?.id ?? null,
        transmitterId: transmitter?.id ?? null,
        coverageType,
        status: 'active',
        validFrom: null,
        validTo: null,
        lastVerifiedAt: TODAY,
        sourceIds: [RTUK_SOURCE_ID],
        verificationStatus: 'verified',
        notes: null,
      });
    } else {
      const channelNumber = Number(record.kanal);
      const baseId = `${entityId}-${citySlug}-${record.band.toLowerCase()}-${channelNumber}`;
      const id = usedTvChannelIds.has(baseId) && district
        ? ensureUniqueId(`${baseId}-${district.slug}`, usedTvChannelIds)
        : ensureUniqueId(baseId, usedTvChannelIds);
      terrestrialTvChannels.push({
        id,
        channelId: entityId,
        band: record.band,
        channelNumber,
        cityId,
        districtId: district?.id ?? null,
        transmitterId: transmitter?.id ?? null,
        coverageType,
        status: 'active',
        validFrom: null,
        validTo: null,
        lastVerifiedAt: TODAY,
        sourceIds: [RTUK_SOURCE_ID],
        verificationStatus: 'verified',
        notes: null,
      });
    }
  }

  /* ---- 7. Preserve the one TV channel RTÜK's terrestrial data has no record of ---- */
  const oldTelevisionChannels = JSON.parse(readFileSync(path.join(DATA_DIR, 'television-channels.json'), 'utf8')) as TelevisionChannel[];
  const aSpor = oldTelevisionChannels.find((c) => c.id === 'a-spor');
  if (aSpor && !televisionChannels.some((c) => c.id === 'a-spor')) {
    televisionChannels.push(aSpor);
  }

  /* ---- 8. Validate + write ---- */
  const toWrite: { fileName: string; data: unknown; schema: { parse: (v: unknown) => unknown } }[] = [
    { fileName: 'cities.json', data: cities, schema: citiesFileSchema },
    { fileName: 'districts.json', data: districts, schema: districtsFileSchema },
    { fileName: 'terrestrial-transmitters.json', data: transmitters, schema: transmittersFileSchema },
    { fileName: 'broadcasters.json', data: broadcasters, schema: broadcastersFileSchema },
    { fileName: 'radio-stations.json', data: radioStations, schema: radioStationsFileSchema },
    { fileName: 'television-channels.json', data: televisionChannels, schema: televisionChannelsFileSchema },
    { fileName: 'terrestrial-frequencies.json', data: terrestrialFrequencies, schema: terrestrialFrequenciesFileSchema },
    { fileName: 'terrestrial-tv-channels.json', data: terrestrialTvChannels, schema: terrestrialTvChannelsFileSchema },
  ];

  for (const { fileName, data, schema } of toWrite) {
    schema.parse(data); // throws with a detailed Zod error on any mismatch, deliberately uncaught
    const sorted = Array.isArray(data) ? [...(data as { id: string }[])].sort((a, b) => a.id.localeCompare(b.id)) : data;
    writeFileSync(path.join(DATA_DIR, fileName), JSON.stringify(sorted, null, 2) + '\n', 'utf8');
    console.log(`✔ ${fileName}: ${Array.isArray(data) ? data.length : '?'} kayıt yazıldı`);
  }

  /* ---- 9. Remap old sample-data station ids in the files this import doesn't own ---- */
  for (const fileName of ['satellite-services.json', 'platform-channels.json'] as const) {
    const filePath = path.join(DATA_DIR, fileName);
    const entries = JSON.parse(readFileSync(filePath, 'utf8')) as { stationId?: string; channelId?: string }[];
    let changed = false;
    for (const entry of entries) {
      const field = 'stationId' in entry ? 'stationId' : 'channelId';
      const current = entry[field];
      if (current && REMAP_STATION_IDS[current]) {
        entry[field] = REMAP_STATION_IDS[current];
        changed = true;
      }
    }
    if (changed) {
      writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
      console.log(`✔ ${fileName}: eski örnek id referansları güncellendi`);
    }
  }

  // frequency-updates.json referenced the old sample stations' invented
  // change history -- with real RTÜK data landing, that fabricated history
  // no longer corresponds to anything real, and this import has no genuine
  // "what changed since last time" signal (RTÜK's export is a single
  // snapshot, not a diff). Starting the change log empty here is the
  // honest choice; `npm run data:diff` will populate real entries from now
  // on as this data is re-imported over time.
  writeFileSync(path.join(DATA_DIR, 'frequency-updates.json'), '[]\n', 'utf8');
  console.log('✔ frequency-updates.json: sıfırlandı (artık gerçek olmayan örnek geçmiş taşınmadı)');

  console.log('\nÖzet:');
  console.log(`  şehir: ${cities.length}, ilçe: ${districts.length}, verici: ${transmitters.length}`);
  console.log(`  yayın kuruluşu: ${broadcasters.length}`);
  console.log(`  radyo markası: ${radioStations.length}, tv markası: ${televisionChannels.length}`);
  console.log(`  karasal FM frekansı: ${terrestrialFrequencies.length}, karasal TV ataması: ${terrestrialTvChannels.length}`);
}

main();
