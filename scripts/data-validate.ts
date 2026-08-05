#!/usr/bin/env tsx
/**
 * npm run data:validate
 *
 * Validates every file in src/data/*.json against its Zod schema, checks
 * referential integrity across all foreign keys, and validates guide
 * frontmatter. Exits non-zero on any problem, so this is safe to run as
 * a build gate (the `build` script runs this before `astro build`).
 */
import { checkReferentialIntegrity } from './lib/check-integrity';
import { isMainModule } from './lib/is-main';
import { loadAllData } from './lib/load-data';
import { loadAllGuides } from './lib/load-guides';

function main(): void {
  const { data, issues: schemaIssues } = loadAllData();
  const { issues: guideIssues } = loadAllGuides();
  const integrityIssues = checkReferentialIntegrity(data);

  const allIssues = [...schemaIssues, ...guideIssues, ...integrityIssues];

  const counts = {
    cities: data.cities.length,
    districts: data.districts.length,
    transmitters: data.transmitters.length,
    broadcasters: data.broadcasters.length,
    radioStations: data.radioStations.length,
    televisionChannels: data.televisionChannels.length,
    terrestrialFrequencies: data.terrestrialFrequencies.length,
    terrestrialTvChannels: data.terrestrialTvChannels.length,
    satellites: data.satellites.length,
    transponders: data.transponders.length,
    satelliteServices: data.satelliteServices.length,
    platforms: data.platforms.length,
    platformChannels: data.platformChannels.length,
    frequencyUpdates: data.frequencyUpdates.length,
    sources: data.sources.length,
  };

  console.log('Frekanslar veri doğrulama');
  console.log('=========================');
  for (const [key, count] of Object.entries(counts)) {
    console.log(`  ${key.padEnd(24)} ${count}`);
  }
  console.log('');

  if (allIssues.length === 0) {
    console.log('✔ Tüm veri dosyaları geçerli. Referans bütünlüğü sorunu bulunamadı.');
    return;
  }

  console.error(`✘ ${allIssues.length} sorun bulundu:\n`);
  const byFile = new Map<string, string[]>();
  for (const issue of allIssues) {
    const list = byFile.get(issue.file) ?? [];
    list.push(issue.message);
    byFile.set(issue.file, list);
  }
  for (const [file, messages] of byFile) {
    console.error(`  ${file}`);
    for (const message of messages) {
      console.error(`    - ${message}`);
    }
  }

  process.exitCode = 1;
}

if (isMainModule(import.meta.url)) main();
