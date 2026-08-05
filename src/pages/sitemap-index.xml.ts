import type { APIRoute } from 'astro';
import { renderSitemapIndexXml, SITEMAP_XML_HEADERS } from '../lib/sitemap';
import { canonicalUrl } from '../lib/urls';

const SITEMAP_FILES = [
  'sitemap-pages.xml',
  'sitemap-radio.xml',
  'sitemap-tv.xml',
  'sitemap-cities.xml',
  'sitemap-frequencies.xml',
  'sitemap-satellites.xml',
  'sitemap-guides.xml',
  'sitemap-updates.xml',
];

export const GET: APIRoute = async () => {
  const entries = SITEMAP_FILES.map((file) => ({ loc: canonicalUrl(`/${file}`) }));
  return new Response(renderSitemapIndexXml(entries), { headers: SITEMAP_XML_HEADERS });
};
