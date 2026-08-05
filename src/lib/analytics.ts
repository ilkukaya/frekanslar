/**
 * Privacy-friendly analytics abstraction.
 *
 * No analytics vendor is wired into components directly (per the brief:
 * "Analytics sağlayıcısını doğrudan bileşenlere gömme. Merkezi helper
 * kullan."). Components only ever call `window.frekanslarTrack(event,
 * payload)`, a single global function defined once by
 * `src/scripts/analytics-client.ts` and loaded from `BaseLayout`. That
 * script decides, based on `siteConfig.analyticsProvider`, whether to
 * forward the event to a configured provider or drop it entirely.
 *
 * With no provider configured (the default), every event is a no-op --
 * nothing is sent anywhere, no third-party script is loaded, no cookies
 * are set. This module only defines the shared vocabulary both sides
 * (server-rendered config + client dispatcher) agree on.
 */
import { siteConfig } from '../config/site';

export const ANALYTICS_EVENTS = [
  'search_submitted',
  'search_result_clicked',
  'official_listen_clicked',
  'official_watch_clicked',
  'official_website_clicked',
  'correction_submitted',
  'city_selected',
  'frequency_selected',
  'badge_code_copied',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsPayload = Record<string, string | number | boolean>;

export type AnalyticsProvider = 'plausible' | 'umami' | '';

export interface AnalyticsRuntimeConfig {
  provider: AnalyticsProvider;
  domain: string;
}

/** Server-side: the small, non-secret config object embedded once per page for the client dispatcher. */
export function analyticsRuntimeConfig(): AnalyticsRuntimeConfig {
  const provider = siteConfig.analyticsProvider;
  const isKnownProvider = provider === 'plausible' || provider === 'umami';
  return {
    provider: isKnownProvider ? provider : '',
    domain: siteConfig.analyticsDomain,
  };
}
