import { describe, expect, it } from 'vitest';
import { renderSitemapIndexXml, renderSitemapXml } from '../src/lib/sitemap';

describe('renderSitemapXml', () => {
  it('produces a valid urlset with loc and lastmod', () => {
    const xml = renderSitemapXml([
      { loc: 'https://example.com/radyo/metro-fm/', lastmod: '2026-08-05' },
      { loc: 'https://example.com/radyo/trt-fm/' },
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com/radyo/metro-fm/</loc>');
    expect(xml).toContain('<lastmod>2026-08-05</lastmod>');
    // Entry without lastmod must not emit an empty <lastmod> tag.
    expect(xml).toContain('<loc>https://example.com/radyo/trt-fm/</loc>\n  </url>');
  });

  it('escapes XML-significant characters in URLs', () => {
    const xml = renderSitemapXml([{ loc: 'https://example.com/ara/?q=a&b' }]);
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('?q=a&b<');
  });

  it('produces an empty urlset for no entries', () => {
    const xml = renderSitemapXml([]);
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });
});

describe('renderSitemapIndexXml', () => {
  it('produces a valid sitemapindex referencing every sub-sitemap', () => {
    const xml = renderSitemapIndexXml([
      { loc: 'https://example.com/sitemap-radio.xml' },
      { loc: 'https://example.com/sitemap-tv.xml' },
    ]);
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com/sitemap-radio.xml</loc>');
    expect(xml).toContain('<loc>https://example.com/sitemap-tv.xml</loc>');
  });
});
