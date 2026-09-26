import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const broadcasterEntries = await getCollection('broadcasters');

  const entries: SitemapUrlEntry[] = broadcasterEntries.map((entry) => ({
    loc: canonicalUrl(paths.broadcaster(entry.data.slug)),
    lastmod: entry.data.lastVerifiedAt,
  }));

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
