import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const channelEntries = await getCollection('television-channels');

  const entries: SitemapUrlEntry[] = channelEntries.map((entry) => ({
    loc: canonicalUrl(paths.televisionChannel(entry.data.slug)),
    lastmod: entry.data.lastVerifiedAt,
  }));

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
