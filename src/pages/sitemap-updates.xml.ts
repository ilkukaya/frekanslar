import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const updateEntries = await getCollection('frequency-updates');

  const entries: SitemapUrlEntry[] = updateEntries.map((entry) => ({
    loc: canonicalUrl(paths.update(entry.data.slug)),
    lastmod: entry.data.date,
  }));

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
