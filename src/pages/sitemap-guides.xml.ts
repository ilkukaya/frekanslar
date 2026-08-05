import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const guideEntries = await getCollection('guides');

  const entries: SitemapUrlEntry[] = guideEntries.map((entry) => ({
    loc: canonicalUrl(paths.guide(entry.id)),
    lastmod: entry.data.updatedDate,
  }));

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
