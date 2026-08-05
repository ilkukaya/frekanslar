#!/usr/bin/env tsx
/**
 * npm run data:diff [-- --old <dir> | --ref <gitref>]
 *
 * Compares the current src/data/*.json against a previous snapshot and
 * reports: new broadcasts, closed broadcasts, changed frequencies,
 * changed satellites/transponders/symbol rates, missing sources, stale
 * records, and (if `data:check-links` has been run recently) broken
 * official links.
 *
 * The "previous snapshot" is, in order of preference:
 *   1. `--old <dir>`      an explicit directory with the same *.json files
 *   2. `--ref <gitref>`   `git show <gitref>:src/data/<file>.json` (default ref: HEAD)
 *   3. nothing            if neither is usable (e.g. a brand-new repo with
 *                         no commits yet), every current record is reported
 *                         as new and the script says so explicitly rather
 *                         than silently producing a misleading empty diff.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { isMainModule } from './lib/is-main';
import { DATA_DIR, loadAllData, type LoadedData } from './lib/load-data';
import { LINK_CHECK_REPORT_PATH } from './lib/report-paths';
import type {
  RadioStation,
  SatelliteService,
  TelevisionChannel,
  TerrestrialFrequency,
  Transponder,
} from '../src/data/schemas';

const DATA_FILE_NAMES = [
  'cities.json',
  'districts.json',
  'terrestrial-transmitters.json',
  'broadcasters.json',
  'radio-stations.json',
  'television-channels.json',
  'terrestrial-frequencies.json',
  'satellites.json',
  'transponders.json',
  'satellite-services.json',
  'platforms.json',
  'platform-channels.json',
  'frequency-updates.json',
  'sources.json',
];

const NON_AUTHORITATIVE_SOURCE_IDS = new Set(['editorial-placeholder', 'user-report']);
const STALE_DAYS = 180;

function parseArgs(argv: string[]): { oldDir?: string; ref: string } {
  let oldDir: string | undefined;
  let ref = 'HEAD';
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--old' && argv[i + 1]) oldDir = argv[i + 1];
    if (argv[i] === '--ref' && argv[i + 1]) ref = argv[i + 1] as string;
  }
  return { oldDir, ref };
}

function gitRefExists(ref: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', ref], { cwd: DATA_DIR, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Materializes `git show <ref>:src/data/<file>` for every known data file into a temp dir. */
function snapshotFromGit(ref: string): string | null {
  if (!gitRefExists(ref)) return null;

  const tempDir = mkdtempSync(path.join(tmpdir(), 'frekanslar-data-diff-'));
  for (const fileName of DATA_FILE_NAMES) {
    try {
      const content = execFileSync('git', ['show', `${ref}:src/data/${fileName}`], {
        cwd: DATA_DIR,
        encoding: 'utf8',
      });
      writeFileSync(path.join(tempDir, fileName), content, 'utf8');
    } catch {
      // File didn't exist at that ref -- treat as an empty collection.
      writeFileSync(path.join(tempDir, fileName), '[]\n', 'utf8');
    }
  }
  return tempDir;
}

function byId<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((r) => [r.id, r]));
}

function reportSection(title: string, lines: string[]): void {
  console.log(`\n${title} (${lines.length})`);
  if (lines.length === 0) {
    console.log('  (yok)');
    return;
  }
  for (const line of lines.slice(0, 50)) console.log(`  - ${line}`);
  if (lines.length > 50) console.log(`  ... ve ${lines.length - 50} kayıt daha`);
}

function diffNewAndClosed(
  label: string,
  oldRecords: readonly { id: string; name: string }[],
  newRecords: readonly { id: string; name: string }[],
): { added: string[]; removed: string[] } {
  const oldIds = new Set(oldRecords.map((r) => r.id));
  const newIds = new Set(newRecords.map((r) => r.id));
  const added = newRecords.filter((r) => !oldIds.has(r.id)).map((r) => `${label}: ${r.name} (${r.id})`);
  const removed = oldRecords.filter((r) => !newIds.has(r.id)).map((r) => `${label}: ${r.name} (${r.id})`);
  return { added, removed };
}

function diffFrequencies(oldF: readonly TerrestrialFrequency[], newF: readonly TerrestrialFrequency[]): string[] {
  const changes: string[] = [];
  // Correlate by (stationId, cityId, districtId) rather than id, because
  // this project's frequency ids embed the frequency value itself -- a
  // changed frequency is otherwise indistinguishable from "old row
  // removed, unrelated new row added".
  const key = (f: TerrestrialFrequency) => `${f.stationId}::${f.cityId}::${f.districtId ?? ''}`;
  const oldByKey = new Map(oldF.map((f) => [key(f), f]));
  for (const freq of newF) {
    const previous = oldByKey.get(key(freq));
    if (previous && previous.frequency !== freq.frequency) {
      changes.push(`${freq.stationId} / ${freq.cityId}: ${previous.frequency} ${previous.unit} -> ${freq.frequency} ${freq.unit}`);
    }
  }
  return changes;
}

function diffSatelliteServices(
  oldS: readonly SatelliteService[],
  newS: readonly SatelliteService[],
): { satelliteChanges: string[]; transponderChanges: string[] } {
  const oldById = byId(oldS);
  const satelliteChanges: string[] = [];
  const transponderChanges: string[] = [];

  for (const service of newS) {
    const previous = oldById.get(service.id);
    if (!previous) continue;
    if (previous.satelliteId !== service.satelliteId) {
      satelliteChanges.push(`${service.stationId}: ${previous.satelliteId} -> ${service.satelliteId}`);
    }
    if (previous.transponderId !== service.transponderId) {
      transponderChanges.push(`${service.stationId}: ${previous.transponderId} -> ${service.transponderId}`);
    }
  }

  return { satelliteChanges, transponderChanges };
}

function diffSymbolRates(oldT: readonly Transponder[], newT: readonly Transponder[]): string[] {
  const oldById = byId(oldT);
  const changes: string[] = [];
  for (const transponder of newT) {
    const previous = oldById.get(transponder.id);
    if (previous && previous.symbolRate !== transponder.symbolRate) {
      changes.push(`${transponder.id}: ${previous.symbolRate} -> ${transponder.symbolRate}`);
    }
  }
  return changes;
}

function findMissingSources(data: LoadedData): string[] {
  const missing: string[] = [];
  const checkAll = (
    file: string,
    records: readonly { id: string; sourceIds: readonly string[] }[],
  ): void => {
    for (const record of records) {
      const hasAuthoritativeSource = record.sourceIds.some((id) => !NON_AUTHORITATIVE_SOURCE_IDS.has(id));
      if (!hasAuthoritativeSource) missing.push(`${file}: ${record.id}`);
    }
  };
  checkAll('radio-stations.json', data.radioStations);
  checkAll('television-channels.json', data.televisionChannels);
  checkAll('terrestrial-frequencies.json', data.terrestrialFrequencies);
  checkAll('satellite-services.json', data.satelliteServices);
  checkAll('transponders.json', data.transponders);
  return missing;
}

function findStaleRecords(data: LoadedData): string[] {
  const now = Date.now();
  const stale: string[] = [];
  const check = (file: string, records: readonly { id: string; lastVerifiedAt: string }[]): void => {
    for (const record of records) {
      const ageDays = Math.floor((now - new Date(`${record.lastVerifiedAt}T00:00:00Z`).getTime()) / 86_400_000);
      if (ageDays > STALE_DAYS) stale.push(`${file}: ${record.id} (${ageDays} gün)`);
    }
  };
  check('radio-stations.json', data.radioStations);
  check('television-channels.json', data.televisionChannels);
  check('terrestrial-frequencies.json', data.terrestrialFrequencies);
  return stale;
}

function loadBrokenLinksFromReport(): string[] {
  if (!existsSync(LINK_CHECK_REPORT_PATH)) return [];
  try {
    const report: { results: { url: string; ok: boolean; context: string }[] } = JSON.parse(
      readFileSync(LINK_CHECK_REPORT_PATH, 'utf8'),
    );
    return report.results.filter((r) => !r.ok).map((r) => `${r.url} (${r.context})`);
  } catch {
    return [];
  }
}

function stationOrChannelLabel(record: RadioStation | TelevisionChannel): { id: string; name: string } {
  return { id: record.id, name: record.name };
}

function main(): void {
  const { oldDir: explicitOldDir, ref } = parseArgs(process.argv.slice(2));

  let oldDir = explicitOldDir;
  let cleanupDir: string | null = null;
  let usedFallback = false;

  if (!oldDir) {
    const gitSnapshot = snapshotFromGit(ref);
    if (gitSnapshot) {
      oldDir = gitSnapshot;
      cleanupDir = gitSnapshot;
    } else {
      usedFallback = true;
    }
  }

  const { data: newData, issues: newIssues } = loadAllData();
  if (newIssues.length > 0) {
    console.error('✘ data:diff: mevcut veri geçersiz, önce `npm run data:validate` çalıştırın.');
    process.exitCode = 1;
    return;
  }

  const oldData: LoadedData = oldDir
    ? loadAllData(oldDir).data
    : {
        cities: [],
        districts: [],
        transmitters: [],
        broadcasters: [],
        radioStations: [],
        televisionChannels: [],
        terrestrialFrequencies: [],
        satellites: [],
        transponders: [],
        satelliteServices: [],
        platforms: [],
        platformChannels: [],
        frequencyUpdates: [],
        sources: [],
      };

  console.log('Frekanslar veri karşılaştırması (data:diff)');
  console.log('============================================');
  if (explicitOldDir) {
    console.log(`Karşılaştırma kaynağı: --old ${explicitOldDir}`);
  } else if (usedFallback) {
    console.log(
      `Karşılaştırma kaynağı bulunamadı ("${ref}" git referansı yok). Tüm mevcut kayıtlar "yeni" olarak gösteriliyor.`,
    );
  } else {
    console.log(`Karşılaştırma kaynağı: git ${ref}:src/data/`);
  }

  const radioDiff = diffNewAndClosed(
    'Radyo',
    oldData.radioStations.map(stationOrChannelLabel),
    newData.radioStations.map(stationOrChannelLabel),
  );
  const tvDiff = diffNewAndClosed(
    'TV',
    oldData.televisionChannels.map(stationOrChannelLabel),
    newData.televisionChannels.map(stationOrChannelLabel),
  );

  reportSection('Yeni yayın', [...radioDiff.added, ...tvDiff.added]);
  reportSection('Kapanan yayın', [...radioDiff.removed, ...tvDiff.removed]);
  reportSection('Değişen frekans', diffFrequencies(oldData.terrestrialFrequencies, newData.terrestrialFrequencies));

  const { satelliteChanges, transponderChanges } = diffSatelliteServices(oldData.satelliteServices, newData.satelliteServices);
  reportSection('Değişen uydu', satelliteChanges);
  reportSection('Değişen transponder', transponderChanges);
  reportSection('Değişen sembol oranı', diffSymbolRates(oldData.transponders, newData.transponders));
  reportSection('Çalışmayan resmî bağlantı (son data:check-links raporundan)', loadBrokenLinksFromReport());
  reportSection('Eksik kaynak (yalnızca editöryal/kullanıcı kaynağına dayanan kayıtlar)', findMissingSources(newData));
  reportSection(`Uzun süredir doğrulanmamış kayıt (> ${STALE_DAYS} gün)`, findStaleRecords(newData));

  if (cleanupDir) rmSync(cleanupDir, { recursive: true, force: true });
}

if (isMainModule(import.meta.url)) main();
