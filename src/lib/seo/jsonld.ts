/**
 * JSON-LD builders. Every function returns a plain object matching a real
 * schema.org type used the way schema.org defines it -- nothing here
 * claims a guaranteed Google rich-result feature (Google only ships rich
 * result UI for a subset of schema.org types); the goal is accurate,
 * machine-readable structured data that mirrors what's actually visible
 * on the page, which is what both classic SEO crawlers and AI answer
 * engines (AEO/GEO) rely on.
 */
import { siteConfig } from '../../config/site';
import { canonicalUrl, paths } from '../urls';

export type JsonLdObject = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function organizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organizationName,
    url: siteConfig.siteUrl,
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    inLanguage: siteConfig.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalUrl(paths.search())}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbListSchema(items: readonly BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webPageSchema(options: {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.name,
    description: options.description,
    url: options.url,
    inLanguage: siteConfig.language,
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
    },
  };
}

export function collectionPageSchema(options: {
  name: string;
  description: string;
  url: string;
  items: readonly BreadcrumbItem[];
  dateModified?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url,
    inLanguage: siteConfig.language,
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.items.length,
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function datasetSchema(options: {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  keywords?: readonly string[];
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: options.name,
    description: options.description,
    url: options.url,
    dateModified: options.dateModified,
    inLanguage: siteConfig.language,
    ...(options.keywords && options.keywords.length > 0 ? { keywords: options.keywords.join(', ') } : {}),
    creator: {
      '@type': 'Organization',
      name: siteConfig.organizationName,
      url: siteConfig.siteUrl,
    },
    license: canonicalUrl(paths.terms()),
  };
}

export function faqPageSchema(faqs: readonly { question: string; answer: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface RadioStationJsonLdInput {
  name: string;
  description: string;
  url: string;
  logo?: string | null;
  sameAs?: readonly string[];
  areaServed?: string;
}

export function radioStationSchema(input: RadioStationJsonLdInput): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.logo ? { logo: input.logo } : {}),
    ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
    ...(input.areaServed ? { areaServed: input.areaServed } : {}),
    broadcastAffiliateOf: {
      '@type': 'Organization',
      name: siteConfig.organizationName,
    },
  };
}

export interface TelevisionStationJsonLdInput {
  name: string;
  description: string;
  url: string;
  logo?: string | null;
  sameAs?: readonly string[];
  areaServed?: string;
}

export function televisionStationSchema(input: TelevisionStationJsonLdInput): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'TelevisionStation',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.logo ? { logo: input.logo } : {}),
    ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
    ...(input.areaServed ? { areaServed: input.areaServed } : {}),
  };
}

export function broadcasterOrganizationSchema(input: {
  name: string;
  description: string;
  url: string;
  website: string | null;
  city: string | null;
  brands: readonly { name: string; url: string; kind: 'radio' | 'tv' }[];
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    legalName: input.name,
    description: input.description,
    url: input.url,
    ...(input.website ? { sameAs: [input.website] } : {}),
    ...(input.city ? { address: { '@type': 'PostalAddress', addressLocality: input.city, addressCountry: 'TR' } } : {}),
    ...(input.brands.length > 0
      ? {
          brand: input.brands.map((b) => ({
            '@type': b.kind === 'radio' ? 'RadioStation' : 'TelevisionStation',
            name: b.name,
            url: b.url,
          })),
        }
      : {}),
  };
}
