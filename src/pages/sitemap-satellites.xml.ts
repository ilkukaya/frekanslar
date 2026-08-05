import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const [satelliteEntries, transponderEntries, platformEntries] = await Promise.all([
    getCollection('satellites'),
    getCollection('transponders'),
    getCollection('platforms'),
  ]);

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
