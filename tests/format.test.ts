import { describe, expect, it } from 'vitest';
import {
  formatDateIso,
  formatDateTr,
  formatFrequencyDisplay,
  formatFrequencyValue,
  formatSymbolRate,
  formatThousands,
  formatTransponderFrequency,
  formatTransponderSignature,
  frequencySlugFragment,
} from '../src/lib/format';

describe('formatDateTr', () => {
  it('formats an ISO date as a Turkish long date', () => {
    expect(formatDateTr('2026-08-05')).toBe('5 Ağustos 2026');
    expect(formatDateTr('2026-01-01')).toBe('1 Ocak 2026');
    expect(formatDateTr('2025-12-31')).toBe('31 Aralık 2025');
  });

  it('throws on a malformed date string', () => {
    expect(() => formatDateTr('not-a-date')).toThrow();
    expect(() => formatDateTr('2026-13-01')).toThrow();
  });
});

describe('formatDateIso', () => {
  it('passes through a valid ISO date', () => {
    expect(formatDateIso('2026-08-05')).toBe('2026-08-05');
  });

  it('rejects a malformed date string', () => {
    expect(() => formatDateIso('05/08/2026')).toThrow();
  });
});

describe('formatFrequencyValue / formatFrequencyDisplay', () => {
  it('always shows exactly one decimal place', () => {
    expect(formatFrequencyValue(97.2)).toBe('97.2');
    expect(formatFrequencyValue(97)).toBe('97.0');
    expect(formatFrequencyValue(94.8)).toBe('94.8');
  });

  it('appends the unit for display', () => {
    expect(formatFrequencyDisplay(97.2, 'MHz')).toBe('97.2 MHz');
  });
});

describe('frequencySlugFragment', () => {
  it('matches the /frekans/[slug]/ URL fragments used across the site', () => {
    expect(frequencySlugFragment(97.2)).toBe('97-2');
    expect(frequencySlugFragment(94.8)).toBe('94-8');
    expect(frequencySlugFragment(100)).toBe('100-0');
  });
});

describe('formatThousands', () => {
  it('groups digits with a Turkish-style thousands separator', () => {
    expect(formatThousands(27500)).toBe('27.500');
    expect(formatThousands(1000)).toBe('1.000');
    expect(formatThousands(999)).toBe('999');
    expect(formatThousands(11958)).toBe('11.958');
  });

  it('handles negative numbers', () => {
    expect(formatThousands(-27500)).toBe('-27.500');
  });
});

describe('formatTransponderFrequency / formatSymbolRate', () => {
  it('formats with unit suffixes', () => {
    expect(formatTransponderFrequency(11958)).toBe('11.958 MHz');
    expect(formatSymbolRate(27500)).toBe('27.500 Sym/s');
  });
});

describe('formatTransponderSignature', () => {
  it('matches the "frequency POL symbolrate" convention', () => {
    expect(formatTransponderSignature(11958, 'H', 27500)).toBe('11958 H 27500');
  });
});
