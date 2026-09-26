import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const [allSatelliteEntries, transponderEntries, allPlatformEntries, platformChannelEntries] = await Promise.all([
    getCollection('satellites'),
    getCollection('transponders'),
    getCollection('platforms'),
    getCollection('platform-channels'),
  ]);
  // Satellite/platform pages without any verified listing are noindex --
  // keep them out of the sitemap too.
  const satelliteEntries = allSatelliteEntries.filter((s) => transponderEntries.some((t) => t.data.satelliteId === s.data.id));
  const platformEntries = allPlatformEntries.filter((p) => platformChannelEntries.some((c) => c.data.platformId === p.data.id));

  const entries: SitemapUrlEntry[] = [
    ...satelliteEntries.map((entry) => ({
      loc: canonicalUrl(paths.satellite(entry.data.slug)),
      lastmod: entry.data.lastVerifiedAt,
    })),
    ...transponderEntries.map((entry) => ({
      loc: canonicalUrl(paths.transponder(entry.data.slug)),
      lastmod: entry.data.lastVerifiedAt,
    })),
    ...platformEntries.map((entry) => ({
      loc: canonicalUrl(paths.platform(entry.data.slug)),
      lastmod: entry.data.lastVerifiedAt,
    })),
  ];

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
