import { describe, expect, it } from 'vitest';
import {
  breadcrumbListSchema,
  collectionPageSchema,
  datasetSchema,
  faqPageSchema,
  organizationSchema,
  radioStationSchema as radioStationJsonLd,
  websiteSchema,
} from '../src/lib/seo/jsonld';

describe('organizationSchema', () => {
  it('produces a valid Organization node', () => {
    const result = organizationSchema();
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Organization');
    expect(typeof result.name).toBe('string');
    expect(typeof result.url).toBe('string');
  });
});

describe('websiteSchema', () => {
  it('produces a WebSite node with a working SearchAction that matches the real search route', () => {
    const result = websiteSchema();
    expect(result['@type']).toBe('WebSite');
    const action = result.potentialAction as Record<string, unknown>;
    expect(action['@type']).toBe('SearchAction');
    const target = action.target as Record<string, unknown>;
    expect(String(target.urlTemplate)).toContain('/ara/?q={search_term_string}');
    expect(action['query-input']).toBe('required name=search_term_string');
  });
});

describe('breadcrumbListSchema', () => {
  it('numbers positions starting at 1 and preserves order', () => {
    const result = breadcrumbListSchema([
      { name: 'Ana Sayfa', url: 'https://example.com/' },
      { name: 'Radyo Frekansları', url: 'https://example.com/radyo-frekanslari/' },
      { name: 'İstanbul', url: 'https://example.com/radyo-frekanslari/istanbul/' },
    ]);
    expect(result['@type']).toBe('BreadcrumbList');
    const items = result.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0]?.position).toBe(1);
    expect(items[2]?.position).toBe(3);
    expect(items[2]?.name).toBe('İstanbul');
  });
});

describe('collectionPageSchema', () => {
  it('embeds an ItemList whose numberOfItems matches the given items', () => {
    const result = collectionPageSchema({
      name: 'İstanbul Radyo Frekansları',
      description: 'test',
      url: 'https://example.com/radyo-frekanslari/istanbul/',
      items: [
        { name: 'Metro FM', url: 'https://example.com/radyo/metro-fm/' },
        { name: 'TRT FM', url: 'https://example.com/radyo/trt-fm/' },
      ],
    });
    expect(result['@type']).toBe('CollectionPage');
    const mainEntity = result.mainEntity as Record<string, unknown>;
    expect(mainEntity['@type']).toBe('ItemList');
    expect(mainEntity.numberOfItems).toBe(2);
  });
});

describe('datasetSchema', () => {
  it('produces a Dataset node with a dateModified and creator', () => {
    const result = datasetSchema({
      name: 'Türkiye Radyo Frekansları Veri Seti',
      description: 'test',
      url: 'https://example.com/radyo-frekanslari/',
      dateModified: '2026-08-05',
    });
    expect(result['@type']).toBe('Dataset');
    expect(result.dateModified).toBe('2026-08-05');
    expect((result.creator as Record<string, unknown>)['@type']).toBe('Organization');
  });
});

describe('faqPageSchema', () => {
  it('maps each FAQ entry to a Question/Answer pair, in order', () => {
    const result = faqPageSchema([
      { question: 'Metro FM İstanbul’da kaç frekansında yayın yapıyor?', answer: '97.2 MHz.' },
      { question: 'Frekans şehre göre değişir mi?', answer: 'Evet, değişebilir.' },
    ]);
    expect(result['@type']).toBe('FAQPage');
    const mainEntity = result.mainEntity as Array<Record<string, unknown>>;
    expect(mainEntity).toHaveLength(2);
    expect(mainEntity[0]?.['@type']).toBe('Question');
    expect((mainEntity[0]?.acceptedAnswer as Record<string, unknown>)['@type']).toBe('Answer');
    expect((mainEntity[0]?.acceptedAnswer as Record<string, unknown>).text).toBe('97.2 MHz.');
  });

  it('produces an empty mainEntity for no FAQs (caller should not render FAQPage when this is empty)', () => {
    const result = faqPageSchema([]);
    expect(result.mainEntity).toEqual([]);
  });
});

describe('radioStationSchema (JSON-LD)', () => {
  it('only includes optional fields (logo, sameAs, areaServed) when provided', () => {
    const minimal = radioStationJsonLd({
      name: 'Metro FM',
      description: 'test',
      url: 'https://example.com/radyo/metro-fm/',
    });
    expect(minimal.logo).toBeUndefined();
    expect(minimal.sameAs).toBeUndefined();
    expect(minimal.areaServed).toBeUndefined();

    const full = radioStationJsonLd({
      name: 'Metro FM',
      description: 'test',
      url: 'https://example.com/radyo/metro-fm/',
      logo: 'https://example.com/logo.png',
      sameAs: ['https://www.metrofm.com.tr'],
      areaServed: 'Türkiye',
    });
    expect(full.logo).toBe('https://example.com/logo.png');
    expect(full.sameAs).toEqual(['https://www.metrofm.com.tr']);
    expect(full.areaServed).toBe('Türkiye');
  });
});
