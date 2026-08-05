/**
 * Central site configuration. Every other module (SEO tags, JSON-LD,
 * sitemaps, robots.txt, footer, badge snippets, forms) reads from this
 * single source instead of hardcoding the domain, name or contact details.
 *
 * The production domain is not known yet, so `siteUrl` falls back to
 * https://example.com as instructed. Set PUBLIC_SITE_URL once a real
 * domain is available -- nothing else needs to change.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export const siteConfig = {
  siteName: 'Frekanslar',
  siteUrl: stripTrailingSlash(process.env.PUBLIC_SITE_URL || 'https://example.com'),
  defaultTitle: 'Türkiye Radyo ve Televizyon Frekansları | Frekanslar',
  defaultDescription:
    'Şehrinizdeki radyo frekanslarını, güncel uydu kanal ayarlarını ve Türkiye’de yayın yapan radyo ve televizyon kuruluşlarını bulun.',
  locale: 'tr-TR',
  language: 'tr',
  timezone: 'Europe/Istanbul',
  organizationName: 'Frekanslar',
  contactEmail: 'iletisim@example.com',
  socialLinks: {
    x: null as string | null,
    instagram: null as string | null,
    youtube: null as string | null,
  },
  /** '' (empty string / falsy) = analytics disabled by default. Privacy-first. */
  analyticsProvider: process.env.PUBLIC_ANALYTICS_PROVIDER || '',
  analyticsDomain: process.env.PUBLIC_ANALYTICS_DOMAIN || '',
  /** Human-readable date format used across verification badges, e.g. "5 Ağustos 2026". */
  verificationDateFormat: 'D MMMM YYYY (tr)',
  forms: {
    /** 'netlify' uses Netlify Forms' zero-JS HTML detection. 'endpoint' posts to correctionEndpointUrl instead. */
    provider: 'netlify' as 'netlify' | 'endpoint',
    correctionEndpointUrl: process.env.PUBLIC_CORRECTION_FORM_ENDPOINT || '',
  },
} as const;

export type SiteConfig = typeof siteConfig;
