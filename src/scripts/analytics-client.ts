/**
 * Defines `window.frekanslarTrack`, the single entry point every island
 * script uses to report an analytics event. Loaded once from
 * `BaseLayout.astro`. See `src/lib/analytics.ts` for the design rationale.
 *
 * Reads its config from `data-analytics-provider`/`data-analytics-domain`
 * attributes on <body> (set server-side by BaseLayout) rather than an
 * inline bootstrap `<script>` -- this is the one thing that would have
 * required `'unsafe-inline'` in the site's Content-Security-Policy, and
 * a plain external script reading the DOM avoids that entirely.
 */
import type { AnalyticsEvent, AnalyticsPayload, AnalyticsProvider } from '../lib/analytics';

declare global {
  interface Window {
    frekanslarTrack?: (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;
    /** Present only if the site operator has added the Plausible script tag themselves. */
    plausible?: (event: string, options?: { props?: AnalyticsPayload }) => void;
    /** Present only if the site operator has added the Umami script tag themselves. */
    umami?: { track: (event: string, payload?: AnalyticsPayload) => void };
  }
}

function readProvider(): AnalyticsProvider {
  const value = document.body.dataset.analyticsProvider;
  return value === 'plausible' || value === 'umami' ? value : '';
}

function dispatch(event: AnalyticsEvent, payload: AnalyticsPayload | undefined): void {
  const provider = readProvider();
  if (!provider) return;

  if (provider === 'plausible' && typeof window.plausible === 'function') {
    window.plausible(event, payload ? { props: payload } : undefined);
    return;
  }

  if (provider === 'umami' && window.umami) {
    window.umami.track(event, payload);
  }
}

window.frekanslarTrack = dispatch;
