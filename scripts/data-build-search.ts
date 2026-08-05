#!/usr/bin/env tsx
/**
 * npm run data:build-search
 *
 * Builds the unified client-side search index and writes it to
 * public/search-index.json, where it's served as a static asset and
 * fetched by src/scripts/search-client.ts. Must run before `astro build`
 * (the `build` npm script does this automatically) so the file exists by
 * the time Astro copies public/ into dist/.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCategoryPages } from '../src/lib/category-pages';
import { buildSearchIndex } from '../src/lib/search';
import { isMainModule } from './lib/is-main';
import { loadAllData } from './lib/load-data';
import { loadAllGuides } from './lib/load-guides';

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const OUTPUT_PATH = path.join(PUBLIC_DIR, 'search-index.json');

function main(): void {
  const { data, issues } = loadAllData();
  const { guides, issues: guideIssues } = loadAllGuides();

  if (issues.length > 0 || guideIssues.length > 0) {
    console.error('✘ data:build-search: kaynak veri geçersiz, önce `npm run data:validate` çalıştırın.');
    process.exitCode = 1;
    return;
  }

  const categoryPages = buildCategoryPages(data.radioStations, data.televisionChannels).map((page) => ({
    slug: page.slug,
    title: page.title,
    resultCount: page.items.length,
  }));

  const index = buildSearchIndex({
    cities: data.cities,
    districts: data.districts,
    radioStations: data.radioStations,
    televisionChannels: data.televisionChannels,
    terrestrialFrequencies: data.terrestrialFrequencies,
    satellites: data.satellites,
    transponders: data.transponders,
    platforms: data.platforms,
    guides: guides.map((guide) => ({ slug: guide.id, title: guide.data.title, description: guide.data.description })),
    categoryPages,
  });

  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(index), 'utf8');

  console.log(`✔ Arama dizini oluşturuldu: ${index.length} kayıt -> ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

if (isMainModule(import.meta.url)) main();
