import { describe, expect, it } from 'vitest';
import { foldTurkish, isSlug, slugify } from '../src/lib/slug';

describe('slugify', () => {
  it('lowercases and hyphenates plain ASCII text', () => {
    expect(slugify('Show TV')).toBe('show-tv');
    expect(slugify('Metro FM')).toBe('metro-fm');
  });

  it('converts every Turkish special character to its ASCII base letter', () => {
    expect(slugify('İstanbul')).toBe('istanbul');
    expect(slugify('Üsküdar')).toBe('uskudar');
    expect(slugify('Çamlıca')).toBe('camlica');
    expect(slugify('Bakırköy')).toBe('bakirkoy');
    expect(slugify('Şişli')).toBe('sisli');
    expect(slugify('Kadıköy')).toBe('kadikoy');
    expect(slugify('Ğ ö ü ç ş ı İ')).toBe('g-o-u-c-s-i-i');
  });

  it('turns a decimal frequency into a dash-separated fragment', () => {
    expect(slugify('94.8')).toBe('94-8');
    expect(slugify('97.2')).toBe('97-2');
  });

  it('collapses whitespace and punctuation runs into single hyphens', () => {
    expect(slugify('İstanbul   Üsküdar')).toBe('istanbul-uskudar');
    expect(slugify('A Spor / Spor Kanalı')).toBe('a-spor-spor-kanali');
  });

  it('has no leading or trailing hyphens', () => {
    expect(slugify('  Show TV  ')).toBe('show-tv');
    expect(slugify('---Show TV---')).toBe('show-tv');
  });

  it('strips apostrophes rather than turning them into hyphens', () => {
    expect(slugify("Editor's Pick")).toBe('editors-pick');
  });

  it('produces the exact ids used in the seed data', () => {
    expect(slugify('JoyTürk')).toBe('joyturk');
    expect(slugify('Virgin Radio Türkiye')).toBe('virgin-radio-turkiye');
    expect(slugify('TRT Türkü')).toBe('trt-turku');
  });
});

describe('isSlug', () => {
  it('accepts valid kebab-case ASCII slugs', () => {
    expect(isSlug('istanbul')).toBe(true);
    expect(isSlug('metro-fm-istanbul-97-2')).toBe(true);
    expect(isSlug('94-8')).toBe(true);
  });

  it('rejects uppercase, Turkish characters, spaces and empty strings', () => {
    expect(isSlug('İstanbul')).toBe(false);
    expect(isSlug('Show TV')).toBe(false);
    expect(isSlug('show--tv')).toBe(false);
    expect(isSlug('-show-tv')).toBe(false);
    expect(isSlug('show-tv-')).toBe(false);
    expect(isSlug('')).toBe(false);
  });

  it('agrees with whatever slugify produces', () => {
    const samples = ['İstanbul Üsküdar', 'Show TV', '94.8', "Editor's Pick"];
    for (const sample of samples) {
      expect(isSlug(slugify(sample))).toBe(true);
    }
  });
});

describe('foldTurkish', () => {
  it('folds Turkish characters but keeps word boundaries', () => {
    expect(foldTurkish('İstanbul Üsküdar')).toBe('istanbul uskudar');
    expect(foldTurkish('JoyTürk')).toBe('joyturk');
  });

  it('is case-insensitive', () => {
    expect(foldTurkish('SHOW TV')).toBe(foldTurkish('show tv'));
  });

  it('makes visually different Turkish/ASCII spellings compare equal', () => {
    expect(foldTurkish('İstanbul')).toBe(foldTurkish('istanbul'));
    expect(foldTurkish('Işık FM')).toBe(foldTurkish('isik fm'));
  });

  it('trims and collapses internal whitespace', () => {
    expect(foldTurkish('  Metro   FM  ')).toBe('metro fm');
  });
});
