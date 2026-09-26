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
  siteUrl: stripTrailingSlash(process.env.PUBLIC_SITE_URL || 'https://frekanslar.netlify.app'),
  defaultTitle: 'Türkiye Radyo ve Televizyon Frekansları | Frekanslar',
  defaultDescription:
    'Şehrinizdeki radyo frekanslarını, güncel uydu kanal ayarlarını ve Türkiye’de yayın yapan radyo ve televizyon kuruluşlarını bulun.',
  locale: 'tr-TR',
  language: 'tr',
  timezone: 'Europe/Istanbul',
  organizationName: 'Frekanslar',
  contactEmail: process.env.PUBLIC_CONTACT_EMAIL || 'ilkukaya@gmail.com',
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
  /**
   * Google AdSense. Empty client id = no ad script and no ad slots are
   * rendered at all (no empty boxes, no layout shift). Set
   * PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX once the account is
   * approved; /ads.txt is generated from the same value.
   */
  adsense: {
    client: process.env.PUBLIC_ADSENSE_CLIENT || '',
    /** Optional per-placement slot ids; without them AdSense Auto ads can still be used. */
    slots: {
      inContent: process.env.PUBLIC_ADSENSE_SLOT_INCONTENT || '',
      sidebar: process.env.PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
      listing: process.env.PUBLIC_ADSENSE_SLOT_LISTING || '',
    },
  },
  /** Google Analytics 4 measurement id (G-XXXXXXX). Empty = not loaded. */
  ga4Id: process.env.PUBLIC_GA4_ID || '',
  /** Search-engine ownership verification tokens (content attribute only). */
  verification: {
    google: process.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    bing: process.env.PUBLIC_BING_SITE_VERIFICATION || '',
    yandex: process.env.PUBLIC_YANDEX_VERIFICATION || '',
  },
  /** IndexNow key (Bing/Yandex/Seznam instant indexing). Served at /<key>.txt. */
  indexNowKey: process.env.PUBLIC_INDEXNOW_KEY || '6f1e0a5b9c2d4e7f8a3b1c0d2e4f6a8b',
  /**
   * Affiliate tags. Equipment recommendation blocks (anten, uydu alıcısı,
   * radyo...) link to marketplace search pages; when a tag is set it is
   * appended so clicks earn commission. Links are always rel="sponsored".
   */
  affiliate: {
    amazonTag: process.env.PUBLIC_AMAZON_TAG || '',
    hepsiburadaId: process.env.PUBLIC_HEPSIBURADA_AFF_ID || '',
    trendyolId: process.env.PUBLIC_TRENDYOL_AFF_ID || '',
  },
  forms: {
    /** 'netlify' uses Netlify Forms' zero-JS HTML detection. 'endpoint' posts to correctionEndpointUrl instead. */
    provider: 'netlify' as 'netlify' | 'endpoint',
    correctionEndpointUrl: process.env.PUBLIC_CORRECTION_FORM_ENDPOINT || '',
  },
} as const;

export type SiteConfig = typeof siteConfig;
