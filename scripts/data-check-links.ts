#!/usr/bin/env tsx
/**
 * npm run data:check-links
 *
 * Sends a HEAD (falling back to GET) request to every officialWebsite /
 * officialLiveUrl / source URL in the dataset and reports broken links.
 * Network-dependent and best-effort: a network error is reported as a
 * check failure, not treated as fatal, since this script commonly runs
 * in environments with restricted outbound access.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isMainModule } from './lib/is-main';
import { loadAllData } from './lib/load-data';
import { LINK_CHECK_REPORT_PATH, REPORTS_DIR } from './lib/report-paths';

interface LinkCheckTarget {
  url: string;
  context: string;
}

interface LinkCheckResult extends LinkCheckTarget {
  ok: boolean;
  status: number | null;
  error: string | null;
}

const TIMEOUT_MS = 8000;

function collectTargets(data: ReturnType<typeof loadAllData>['data']): LinkCheckTarget[] {
  const targets: LinkCheckTarget[] = [];

  for (const station of data.radioStations) {
    if (station.officialWebsite) targets.push({ url: station.officialWebsite, context: `radio-stations.json: ${station.id} (officialWebsite)` });
    if (station.officialLiveUrl) targets.push({ url: station.officialLiveUrl, context: `radio-stations.json: ${station.id} (officialLiveUrl)` });
  }

  for (const channel of data.televisionChannels) {
    if (channel.officialWebsite) targets.push({ url: channel.officialWebsite, context: `television-channels.json: ${channel.id} (officialWebsite)` });
    if (channel.officialLiveUrl) targets.push({ url: channel.officialLiveUrl, context: `television-channels.json: ${channel.id} (officialLiveUrl)` });
  }

  for (const broadcaster of data.broadcasters) {
    if (broadcaster.officialWebsite) targets.push({ url: broadcaster.officialWebsite, context: `broadcasters.json: ${broadcaster.id} (officialWebsite)` });
  }

  for (const platform of data.platforms) {
    if (platform.officialWebsite) targets.push({ url: platform.officialWebsite, context: `platforms.json: ${platform.id} (officialWebsite)` });
  }

  for (const satellite of data.satellites) {
    if (satellite.officialWebsite) targets.push({ url: satellite.officialWebsite, context: `satellites.json: ${satellite.id} (officialWebsite)` });
  }

  for (const source of data.sources) {
    if (source.url) targets.push({ url: source.url, context: `sources.json: ${source.id} (url)` });
  }

  return targets;
}

// Many sites 403 a bare HEAD request with no User-Agent as basic bot
// filtering; identifying as a normal browser avoids tripping that over
// what is, functionally, a courtesy uptime check.
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; FrekanslarLinkChecker/1.0; +https://example.com/veri-kaynaklari/)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

async function checkUrl(target: LinkCheckTarget): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response = await fetch(target.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: REQUEST_HEADERS,
    });
    if (!response.ok) {
      // Some servers don't support HEAD (405/501) or block it outright;
      // retry with GET before concluding the link is actually broken.
      response = await fetch(target.url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: REQUEST_HEADERS,
      });
    }
    return { ...target, ok: response.ok, status: response.status, error: null };
  } catch (error) {
    return { ...target, ok: false, status: null, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function main(): Promise<void> {
  const { data, issues } = loadAllData();
  if (issues.length > 0) {
    console.error('✘ data:check-links: kaynak veri geçersiz, önce `npm run data:validate` çalıştırın.');
    process.exitCode = 1;
    return;
  }

  const targets = collectTargets(data);
  // De-duplicate by URL so a domain shared across many records is only
  // fetched once.
  const uniqueByUrl = new Map<string, LinkCheckTarget>();
  for (const target of targets) {
    if (!uniqueByUrl.has(target.url)) uniqueByUrl.set(target.url, target);
  }

  console.log(`${uniqueByUrl.size} benzersiz bağlantı kontrol ediliyor...\n`);

  const results = await Promise.all([...uniqueByUrl.values()].map(checkUrl));
  const broken = results.filter((r) => !r.ok);

  for (const result of results) {
    const marker = result.ok ? '✔' : '✘';
    const statusLabel = result.status ?? result.error ?? 'bilinmiyor';
    console.log(`${marker} ${result.url} — ${statusLabel} (${result.context})`);
  }

  console.log('');
  console.log(`${results.length - broken.length}/${results.length} bağlantı erişilebilir.`);

  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(
    LINK_CHECK_REPORT_PATH,
    JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n',
    'utf8',
  );
  console.log(`✔ JSON rapor yazıldı: ${path.relative(process.cwd(), LINK_CHECK_REPORT_PATH)}`);
  console.log('  (npm run data:diff bu raporu varsa "çalışmayan resmî bağlantı" bölümünde kullanır.)');

  if (broken.length > 0) {
    console.log(`\n${broken.length} bağlantı kontrol edilemedi. Bu durum ağ kısıtlaması nedeniyle de oluşabilir;`);
    console.log('sonuçları manuel olarak teyit edin.');
    process.exitCode = 1;
  }
}

if (isMainModule(import.meta.url)) main();
