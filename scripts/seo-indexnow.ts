/**
 * Submits every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam,
 * Naver share submissions). Run after a deploy:
 *
 *   PUBLIC_SITE_URL=https://frekanslar.netlify.app npm run seo:indexnow
 *
 * Google does not use IndexNow; for Google, submit /sitemap-index.xml once
 * in Search Console -- it is re-read automatically afterwards.
 */
import { siteConfig } from '../src/config/site';

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.trim());
}

async function main(): Promise<void> {
  const site = siteConfig.siteUrl;
  if (site.includes('example.com')) throw new Error('PUBLIC_SITE_URL ayarlanmamış.');
  const sitemaps = locs(await fetchText(`${site}/sitemap-index.xml`));
  const urls = (await Promise.all(sitemaps.map(async (s) => locs(await fetchText(s))))).flat();
  const host = new URL(site).host;
  console.log(`${urls.length} URL gönderiliyor (${host})…`);

  for (let i = 0; i < urls.length; i += 10000) {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: siteConfig.indexNowKey,
        keyLocation: `${site}/${siteConfig.indexNowKey}.txt`,
        urlList: urls.slice(i, i + 10000),
      }),
    });
    console.log(`Parti ${i / 10000 + 1}: HTTP ${res.status}`);
    if (res.status >= 400) process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
