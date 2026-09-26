/**
 * Single source of truth for every URL in the site. Pages, breadcrumbs,
 * sitemaps, JSON-LD and related-content links all build paths through this
 * module so the URL architecture only has to be correct in one place.
 *
 * Every path is ASCII, lowercase, kebab-case and trailing-slash terminated,
 * matching `astro.config.mjs`'s `trailingSlash: 'always'`.
 */
import { siteConfig } from '../config/site';

export const paths = {
  home: (): string => '/',
  radioList: (): string => '/radyo-frekanslari/',
  tvList: (): string => '/televizyon-kanallari/',
  tvFrequencies: (): string => '/tv-frekanslari/',
  satelliteList: (): string => '/uydu-frekanslari/',
  guideList: (): string => '/rehber/',
  updateList: (): string => '/guncellemeler/',
  about: (): string => '/hakkimizda/',
  dataSources: (): string => '/veri-kaynaklari/',
  correction: (): string => '/duzeltme-bildir/',
  correctionThanks: (): string => '/duzeltme-bildir/tesekkurler/',
  contact: (): string => '/iletisim/',
  privacy: (): string => '/gizlilik/',
  terms: (): string => '/kullanim-kosullari/',
  search: (): string => '/ara/',
  radioDirectory: (): string => '/radyolar/',
  broadcasterList: (): string => '/yayin-kuruluslari/',
  broadcaster: (broadcasterSlug: string): string => `/kurulus/${broadcasterSlug}/`,

  city: (citySlug: string): string => `/radyo-frekanslari/${citySlug}/`,
  district: (citySlug: string, districtSlug: string): string =>
    `/radyo-frekanslari/${citySlug}/${districtSlug}/`,
  radioStation: (stationSlug: string): string => `/radyo/${stationSlug}/`,
  radioStationCity: (stationSlug: string, citySlug: string): string =>
    `/radyo/${stationSlug}/${citySlug}/`,
  televisionChannel: (channelSlug: string): string => `/tv/${channelSlug}/`,
  satellite: (satelliteSlug: string): string => `/uydu/${satelliteSlug}/`,
  transponder: (transponderSlug: string): string => `/transponder/${transponderSlug}/`,
  frequency: (frequencySlug: string): string => `/frekans/${frequencySlug}/`,
  broadcastType: (typeSlug: string): string => `/yayin-turu/${typeSlug}/`,
  platform: (platformSlug: string): string => `/platform/${platformSlug}/`,
  guide: (guideSlug: string): string => `/rehber/${guideSlug}/`,
  update: (updateSlug: string): string => `/guncellemeler/${updateSlug}/`,
} as const;

/** Joins a site-relative path onto the configured site origin. */
export function canonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.siteUrl}${normalizedPath}`;
}
