/**
 * Shared data-loading + Zod validation used by every `data:*` script.
 * Reads the JSON files directly from disk (no Astro/Vite involved) so
 * these scripts run standalone via `tsx`, independent of the site build.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'astro/zod';
import {
  broadcastersFileSchema,
  citiesFileSchema,
  districtsFileSchema,
  frequencyUpdatesFileSchema,
  platformChannelsFileSchema,
  platformsFileSchema,
  radioStationsFileSchema,
  satelliteServicesFileSchema,
  satellitesFileSchema,
  sourcesFileSchema,
  televisionChannelsFileSchema,
  terrestrialFrequenciesFileSchema,
  transmittersFileSchema,
  transpondersFileSchema,
} from '../../src/data/schemas';
import type {
  Broadcaster,
  City,
  District,
  FrequencyUpdate,
  Platform,
  PlatformChannel,
  RadioStation,
  Satellite,
  SatelliteService,
  Source,
  TelevisionChannel,
  TerrestrialFrequency,
  Transmitter,
  Transponder,
} from '../../src/data/schemas';

export const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/data');
export const GUIDES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/content/guides');

export interface LoadIssue {
  file: string;
  message: string;
}

export interface LoadedData {
  cities: City[];
  districts: District[];
  transmitters: Transmitter[];
  broadcasters: Broadcaster[];
  radioStations: RadioStation[];
  televisionChannels: TelevisionChannel[];
  terrestrialFrequencies: TerrestrialFrequency[];
  satellites: Satellite[];
  transponders: Transponder[];
  satelliteServices: SatelliteService[];
  platforms: Platform[];
  platformChannels: PlatformChannel[];
  frequencyUpdates: FrequencyUpdate[];
  sources: Source[];
}

function loadFile<T>(dataDir: string, fileName: string, schema: z.ZodType<T[]>, issues: LoadIssue[]): T[] {
  const filePath = path.join(dataDir, fileName);
  try {
    const raw = readFileSync(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    for (const issue of result.error.issues) {
      const at = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
      issues.push({ file: fileName, message: `${issue.message}${at}` });
    }
    return [];
  } catch (error) {
    issues.push({ file: fileName, message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

export function loadAllData(dataDir: string = DATA_DIR): { data: LoadedData; issues: LoadIssue[] } {
  const issues: LoadIssue[] = [];

  const data: LoadedData = {
    cities: loadFile(dataDir, 'cities.json', citiesFileSchema, issues),
    districts: loadFile(dataDir, 'districts.json', districtsFileSchema, issues),
    transmitters: loadFile(dataDir, 'terrestrial-transmitters.json', transmittersFileSchema, issues),
    broadcasters: loadFile(dataDir, 'broadcasters.json', broadcastersFileSchema, issues),
    radioStations: loadFile(dataDir, 'radio-stations.json', radioStationsFileSchema, issues),
    televisionChannels: loadFile(dataDir, 'television-channels.json', televisionChannelsFileSchema, issues),
    terrestrialFrequencies: loadFile(dataDir, 'terrestrial-frequencies.json', terrestrialFrequenciesFileSchema, issues),
    satellites: loadFile(dataDir, 'satellites.json', satellitesFileSchema, issues),
    transponders: loadFile(dataDir, 'transponders.json', transpondersFileSchema, issues),
    satelliteServices: loadFile(dataDir, 'satellite-services.json', satelliteServicesFileSchema, issues),
    platforms: loadFile(dataDir, 'platforms.json', platformsFileSchema, issues),
    platformChannels: loadFile(dataDir, 'platform-channels.json', platformChannelsFileSchema, issues),
    frequencyUpdates: loadFile(dataDir, 'frequency-updates.json', frequencyUpdatesFileSchema, issues),
    sources: loadFile(dataDir, 'sources.json', sourcesFileSchema, issues),
  };

  return { data, issues };
}
