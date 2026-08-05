import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { buildCategoryPages } from '../lib/category-pages';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const [radioEntries, tvEntries] = await Promise.all([
    getCollection('radio-stations'),
    getCollection('television-channels'),
  ]);

  const categoryPages = buildCategoryPages(
    radioEntries.map((e) => e.data),
    tvEntries.map((e) => e.data),
  );

  const staticPaths = [
    paths.home(),
    paths.radioList(),
    paths.tvList(),
    paths.tvFrequencies(),
    paths.satelliteList(),
    paths.guideList(),
    paths.updateList(),
    paths.about(),
    paths.dataSources(),
    paths.correction(),
    paths.contact(),
    paths.privacy(),
    paths.terms(),
  ];

  const entries: SitemapUrlEntry[] = [
    ...staticPaths.map((path) => ({ loc: canonicalUrl(path) })),
    ...categoryPages.map((page) => ({ loc: canonicalUrl(paths.broadcastType(page.slug)) })),
  ];

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
