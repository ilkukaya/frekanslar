/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Public production site URL, e.g. https://frekanslar.com. Falls back to https://example.com. */
  readonly PUBLIC_SITE_URL?: string;
  /** Optional analytics provider id (e.g. "plausible", "umami"). Empty/undefined = analytics disabled. */
  readonly PUBLIC_ANALYTICS_PROVIDER?: string;
  /** Domain used by the configured analytics provider script, if any. */
  readonly PUBLIC_ANALYTICS_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
