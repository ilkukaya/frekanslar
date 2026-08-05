#!/usr/bin/env tsx
/**
 * npm run data:report
 *
 * Prints a summary of dataset health: record counts, verification-status
 * breakdown, coverage gaps (cities with no radio stations, districts
 * without a real page, etc.) and stale records (lastVerifiedAt older
 * than STALE_DAYS). Also writes the same report as JSON to
 * reports/data-report.json for tooling/CI to consume.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { VerificationStatus } from '../src/data/schemas';
import { isMainModule } from './lib/is-main';
import { loadAllData } from './lib/load-data';
import { DATA_REPORT_PATH, REPORTS_DIR } from './lib/report-paths';

const STALE_DAYS = 180;

function daysSince(isoDate: string, now: Date): number {
  const then = new Date(`${isoDate}T00:00:00Z`).getTime();
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24));
}

function countByVerification(records: readonly { verificationStatus: VerificationStatus }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const record of records) {
    counts[record.verificationStatus] = (counts[record.verificationStatus] ?? 0) + 1;
  }
  return counts;
}

function main(): void {
  const { data, issues } = loadAllData();
  if (issues.length > 0) {
    console.error('✘ data:report: kaynak veri geçersiz, önce `npm run data:validate` çalıştırın.');
    process.exitCode = 1;
    return;
  }

  const now = new Date();

  const citiesWithoutStations = data.cities.filter(
    (city) => !data.terrestrialFrequencies.some((f) => f.cityId === city.id && f.status === 'active'),
  );

  const staleRecords = [
    ...data.radioStations.map((r) => ({ file: 'radio-stations.json', id: r.id, lastVerifiedAt: r.lastVerifiedAt })),
    ...data.televisionChannels.map((r) => ({ file: 'television-channels.json', id: r.id, lastVerifiedAt: r.lastVerifiedAt })),
    ...data.terrestrialFrequencies.map((r) => ({ file: 'terrestrial-frequencies.json', id: r.id, lastVerifiedAt: r.lastVerifiedAt })),
    ...data.satellites.map((r) => ({ file: 'satellites.json', id: r.id, lastVerifiedAt: r.lastVerifiedAt })),
    ...data.transponders.map((r) => ({ file: 'transponders.json', id: r.id, lastVerifiedAt: r.lastVerifiedAt })),
    ...data.satelliteServices.map((r) => ({ file: 'satellite-services.json', id: r.id, lastVerifiedAt: r.lastVerifiedAt })),
  ].filter((r) => daysSince(r.lastVerifiedAt, now) > STALE_DAYS);

  const report = {
    generatedAt: now.toISOString(),
    counts: {
      cities: data.cities.length,
      districts: data.districts.length,
      transmitters: data.transmitters.length,
      broadcasters: data.broadcasters.length,
      radioStations: data.radioStations.length,
      televisionChannels: data.televisionChannels.length,
      terrestrialFrequencies: data.terrestrialFrequencies.length,
      satellites: data.satellites.length,
      transponders: data.transponders.length,
      satelliteServices: data.satelliteServices.length,
      platforms: data.platforms.length,
      platformChannels: data.platformChannels.length,
      frequencyUpdates: data.frequencyUpdates.length,
      sources: data.sources.length,
    },
    verificationBreakdown: {
      radioStations: countByVerification(data.radioStations),
      televisionChannels: countByVerification(data.televisionChannels),
      terrestrialFrequencies: countByVerification(data.terrestrialFrequencies),
      satellites: countByVerification(data.satellites),
      transponders: countByVerification(data.transponders),
      satelliteServices: countByVerification(data.satelliteServices),
    },
    coverageGaps: {
      citiesWithoutActiveStations: citiesWithoutStations.map((c) => c.id),
    },
    staleRecords: {
      thresholdDays: STALE_DAYS,
      count: staleRecords.length,
      records: staleRecords,
    },
  };

  console.log('Frekanslar veri raporu');
  console.log('=======================');
  console.log(`Oluşturulma: ${report.generatedAt}\n`);

  console.log('Kayıt sayıları:');
  for (const [key, count] of Object.entries(report.counts)) {
    console.log(`  ${key.padEnd(24)} ${count}`);
  }

  console.log('\nDoğrulama durumu dağılımı:');
  for (const [entity, breakdown] of Object.entries(report.verificationBreakdown)) {
    console.log(`  ${entity}: ${JSON.stringify(breakdown)}`);
  }

  console.log('\nKapsam boşlukları:');
  console.log(
    citiesWithoutStations.length === 0
      ? '  Hiçbir şehir aktif radyo kaydından yoksun değil.'
      : `  Aktif radyo kaydı olmayan şehirler: ${citiesWithoutStations.map((c) => c.id).join(', ')}`,
  );

  console.log(`\nUzun süredir doğrulanmamış kayıtlar (> ${STALE_DAYS} gün): ${staleRecords.length}`);
  for (const record of staleRecords.slice(0, 20)) {
    console.log(`  - ${record.file}: ${record.id} (son kontrol: ${record.lastVerifiedAt})`);
  }

  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(DATA_REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`\n✔ JSON rapor yazıldı: ${path.relative(process.cwd(), DATA_REPORT_PATH)}`);
}

if (isMainModule(import.meta.url)) main();
