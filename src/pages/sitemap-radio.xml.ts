import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { byId, frequenciesByStation } from '../lib/relations';
import { renderSitemapXml, SITEMAP_XML_HEADERS, type SitemapUrlEntry } from '../lib/sitemap';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = async () => {
  const [stationEntries, frequencyEntries, cityEntries] = await Promise.all([
    getCollection('radio-stations'),
    getCollection('terrestrial-frequencies'),
    getCollection('cities'),
  ]);

  const stations = stationEntries.map((e) => e.data);
  const frequencies = frequencyEntries.map((e) => e.data).filter((f) => f.status === 'active');
  const cities = cityEntries.map((e) => e.data);

  const entries: SitemapUrlEntry[] = [];
  for (const station of stations) {
    entries.push({ loc: canonicalUrl(paths.radioStation(station.slug)), lastmod: station.lastVerifiedAt });

    const stationFrequencies = frequenciesByStation(frequencies, station.id);
    const seenCities = new Set<string>();
    for (const freq of stationFrequencies) {
      if (seenCities.has(freq.cityId)) continue;
      seenCities.add(freq.cityId);
      const city = byId(cities, freq.cityId);
      if (!city) continue;
      entries.push({
        loc: canonicalUrl(paths.radioStationCity(station.slug, city.slug)),
        lastmod: freq.lastVerifiedAt,
      });
    }
  }

  return new Response(renderSitemapXml(entries), { headers: SITEMAP_XML_HEADERS });
};
