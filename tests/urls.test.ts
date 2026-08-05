import { describe, expect, it } from 'vitest';
import { canonicalUrl, paths } from '../src/lib/urls';

describe('paths', () => {
  it('builds every static path with a trailing slash', () => {
    expect(paths.home()).toBe('/');
    expect(paths.radioList()).toBe('/radyo-frekanslari/');
    expect(paths.tvList()).toBe('/televizyon-kanallari/');
    expect(paths.tvFrequencies()).toBe('/tv-frekanslari/');
    expect(paths.satelliteList()).toBe('/uydu-frekanslari/');
    expect(paths.guideList()).toBe('/rehber/');
    expect(paths.updateList()).toBe('/guncellemeler/');
    expect(paths.about()).toBe('/hakkimizda/');
    expect(paths.dataSources()).toBe('/veri-kaynaklari/');
    expect(paths.correction()).toBe('/duzeltme-bildir/');
    expect(paths.contact()).toBe('/iletisim/');
    expect(paths.privacy()).toBe('/gizlilik/');
    expect(paths.terms()).toBe('/kullanim-kosullari/');
    expect(paths.search()).toBe('/ara/');
  });

  it('builds city and district paths matching the specified URL architecture', () => {
    expect(paths.city('istanbul')).toBe('/radyo-frekanslari/istanbul/');
    expect(paths.district('istanbul', 'kadikoy')).toBe('/radyo-frekanslari/istanbul/kadikoy/');
  });

  it('builds radio station paths (brand page and brand-in-city page)', () => {
    expect(paths.radioStation('metro-fm')).toBe('/radyo/metro-fm/');
    expect(paths.radioStationCity('metro-fm', 'istanbul')).toBe('/radyo/metro-fm/istanbul/');
  });

  it('builds television channel paths', () => {
    expect(paths.televisionChannel('show-tv')).toBe('/tv/show-tv/');
  });

  it('builds satellite, transponder and frequency paths', () => {
    expect(paths.satellite('turksat-4a')).toBe('/uydu/turksat-4a/');
    expect(paths.transponder('11976-h-27500')).toBe('/transponder/11976-h-27500/');
    expect(paths.frequency('94-8')).toBe('/frekans/94-8/');
  });

  it('builds broadcast-type, platform, guide and update paths', () => {
    expect(paths.broadcastType('ulusal-radyolar')).toBe('/yayin-turu/ulusal-radyolar/');
    expect(paths.platform('tivibu')).toBe('/platform/tivibu/');
    expect(paths.guide('uydu-kanali-nasil-eklenir')).toBe('/rehber/uydu-kanali-nasil-eklenir/');
    expect(paths.update('now-satellite-service-added')).toBe(
      '/guncellemeler/now-satellite-service-added/',
    );
  });

  it('never contains uppercase letters or Turkish characters for slug-driven paths', () => {
    const dynamicPaths = [
      paths.city('istanbul'),
      paths.radioStation('metro-fm'),
      paths.televisionChannel('show-tv'),
      paths.satellite('turksat-4a'),
    ];
    for (const path of dynamicPaths) {
      expect(path).toMatch(/^[a-z0-9/-]+$/);
    }
  });
});

describe('canonicalUrl', () => {
  it('joins a path onto the configured site origin', () => {
    const url = canonicalUrl('/radyo/metro-fm/');
    expect(url.endsWith('/radyo/metro-fm/')).toBe(true);
    expect(url.startsWith('http')).toBe(true);
  });

  it('adds a leading slash if the caller forgot one', () => {
    const withSlash = canonicalUrl('/radyo/metro-fm/');
    const withoutSlash = canonicalUrl('radyo/metro-fm/');
    expect(withoutSlash).toBe(withSlash);
  });

  it('produces one canonical URL per path (no duplicate-content variants)', () => {
    const a = canonicalUrl(paths.city('istanbul'));
    const b = canonicalUrl(paths.city('istanbul'));
    expect(a).toBe(b);
  });
});
