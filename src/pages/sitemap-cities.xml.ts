import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { mostRecentlyVerified } from '../lib/relations';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const [cityEntries, districtEntries, transmitterEntries, frequencyEntries] = await Promise.all([
    getCollection('cities'),
    getCollection('districts'),
    getCollection('transmitters'),
    getCollection('terrestrial-frequencies'),
  ]);

  const cities = cityEntries.map((e) => e.data);
  const districts = districtEntries.map((e) => e.data);
  const transmitters = transmitterEntries.map((e) => e.data);
  const frequencies = frequencyEntries.map((e) => e.data).filter((f) => f.status === 'active');

  const entries: SitemapUrlEntry[] = [];
  for (const city of cities) {
    const cityFrequencies = frequencies.filter((f) => f.cityId === city.id);
    const lastmod = mostRecentlyVerified(cityFrequencies, 1)[0]?.lastVerifiedAt;
    entries.push({ loc: canonicalUrl(paths.city(city.slug)), lastmod });
  }

  // Only districts that actually host a transmitter get a page -- keep the
  // sitemap in lockstep with `getStaticPaths` in the district page itself.
  for (const district of districts) {
    const transmitter = transmitters.find((t) => t.districtId === district.id);
    if (!transmitter) continue;
    const city = cities.find((c) => c.id === district.cityId);
    if (!city) continue;
    entries.push({ loc: canonicalUrl(paths.district(city.slug, district.slug)) });
  }

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
