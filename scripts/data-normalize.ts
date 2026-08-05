#!/usr/bin/env tsx
/**
 * npm run data:normalize
 *
 * Re-reads every src/data/*.json file through its Zod schema (which
 * fills in defaulted fields, e.g. a missing `alternativeNames` becomes an
 * explicit `[]`) and rewrites the file sorted by `id` with consistent
 * 2-space JSON formatting. Idempotent -- running it twice in a row
 * produces no further changes. This is also the landing point for future
 * CSV/scraper imports: stage new records into a data file in roughly the
 * right shape, then run this to canonicalize ordering and formatting
 * before committing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isMainModule } from './lib/is-main';
import { DATA_DIR, loadAllData, type LoadedData } from './lib/load-data';

type SortableRecord = { id: string };

function sortById<T extends SortableRecord>(records: readonly T[]): T[] {
  return [...records].sort((a, b) => a.id.localeCompare(b.id));
}

const FILES: { fileName: string; key: keyof LoadedData }[] = [
  { fileName: 'cities.json', key: 'cities' },
  { fileName: 'districts.json', key: 'districts' },
  { fileName: 'terrestrial-transmitters.json', key: 'transmitters' },
  { fileName: 'broadcasters.json', key: 'broadcasters' },
  { fileName: 'radio-stations.json', key: 'radioStations' },
  { fileName: 'television-channels.json', key: 'televisionChannels' },
  { fileName: 'terrestrial-frequencies.json', key: 'terrestrialFrequencies' },
  { fileName: 'satellites.json', key: 'satellites' },
  { fileName: 'transponders.json', key: 'transponders' },
  { fileName: 'satellite-services.json', key: 'satelliteServices' },
  { fileName: 'platforms.json', key: 'platforms' },
  { fileName: 'platform-channels.json', key: 'platformChannels' },
  { fileName: 'frequency-updates.json', key: 'frequencyUpdates' },
  { fileName: 'sources.json', key: 'sources' },
];

function main(): void {
  const { data, issues } = loadAllData();

  if (issues.length > 0) {
    console.error('✘ data:normalize: kaynak veri geçersiz, önce `npm run data:validate` çalıştırın.');
    process.exitCode = 1;
    return;
  }

  let changedCount = 0;

  for (const { fileName, key } of FILES) {
    const filePath = path.join(DATA_DIR, fileName);
    const current = readFileSync(filePath, 'utf8');
    const records = data[key] as SortableRecord[];
    const normalized = JSON.stringify(sortById(records), null, 2) + '\n';

    if (normalized !== current) {
      writeFileSync(filePath, normalized, 'utf8');
      changedCount += 1;
      console.log(`✔ normalized ${fileName}`);
    } else {
      console.log(`  ${fileName} already normalized`);
    }
  }

  console.log('');
  console.log(changedCount === 0 ? 'Tüm dosyalar zaten normalize edilmiş.' : `${changedCount} dosya normalize edildi.`);
}

if (isMainModule(import.meta.url)) main();
