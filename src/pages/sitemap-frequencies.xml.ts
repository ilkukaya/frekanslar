import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { frequencySlugFragment } from '../lib/format';
import { groupFrequenciesByValue, mostRecentlyVerified } from '../lib/relations';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const frequencyEntries = await getCollection('terrestrial-frequencies');
  const frequencies = frequencyEntries.map((e) => e.data).filter((f) => f.status === 'active');

  const groups = groupFrequenciesByValue(frequencies);
  const entries: SitemapUrlEntry[] = [...groups.entries()].map(([value, group]) => ({
    loc: canonicalUrl(paths.frequency(frequencySlugFragment(value))),
    lastmod: mostRecentlyVerified(group, 1)[0]?.lastVerifiedAt,
  }));

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
