/**
 * Deterministic, ICU-independent formatting helpers.
 *
 * Dates and numbers are formatted by hand (no `Intl`/`toLocaleString`) so
 * the exact output string is stable across Node versions, CI runners and
 * the Netlify build image, and so it can be unit tested byte-for-byte.
 */
import type { FrequencyUnit } from '../data/schemas';

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Formats an ISO `YYYY-MM-DD` date as a human-readable Turkish long date,
 * e.g. "2026-08-05" -> "5 Ağustos 2026". Used for every "son doğrulama
 * tarihi" / "son kontrol" display across the site.
 */
export function formatDateTr(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) {
    throw new Error(`formatDateTr: "${isoDate}" is not a valid ISO date (YYYY-MM-DD)`);
  }
  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);
  const monthName = TURKISH_MONTHS[monthIndex];
  if (!monthName) {
    throw new Error(`formatDateTr: "${isoDate}" has an invalid month`);
  }
  return `${day} ${monthName} ${year}`;
}

/** Formats an ISO date as a machine-readable `<time datetime>` value (passthrough, validated). */
export function formatDateIso(isoDate: string): string {
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    throw new Error(`formatDateIso: "${isoDate}" is not a valid ISO date (YYYY-MM-DD)`);
  }
  return isoDate;
}

/**
 * Formats a terrestrial (FM/AM) frequency value with a fixed one decimal
 * place, matching how Turkish FM allocations are conventionally written
 * (e.g. 97 -> "97.0", 94.8 -> "94.8").
 */
export function formatFrequencyValue(value: number): string {
  return value.toFixed(1);
}

/** Formats a frequency value with its unit, e.g. "97.2 MHz". */
export function formatFrequencyDisplay(value: number, unit: FrequencyUnit): string {
  return `${formatFrequencyValue(value)} ${unit}`;
}

/**
 * Turns a frequency value into the dash-separated fragment used in
 * `/frekans/[slug]/` URLs, e.g. 97.2 -> "97-2".
 */
export function frequencySlugFragment(value: number): string {
  return formatFrequencyValue(value).replace('.', '-');
}

/** Formats a satellite transponder frequency in MHz, no forced decimals (e.g. 11958 -> "11958 MHz"). */
export function formatTransponderFrequency(frequencyMhz: number): string {
  return `${formatThousands(frequencyMhz)} MHz`;
}

/** Formats a symbol rate with a Turkish-style thousands separator, e.g. 27500 -> "27.500 Sym/s". */
export function formatSymbolRate(symbolRate: number): string {
  return `${formatThousands(symbolRate)} Sym/s`;
}

/** Turkish-style ("." as thousands separator) integer formatting, dependency-free. */
export function formatThousands(value: number): string {
  const rounded = Math.round(value);
  const negative = rounded < 0;
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return negative ? `-${grouped}` : grouped;
}

/** Formats a polarization + frequency + symbol rate triple as shown in transponder listings, e.g. "11958 H 27500". */
export function formatTransponderSignature(
  frequencyMhz: number,
  polarization: string,
  symbolRate: number,
): string {
  return `${Math.round(frequencyMhz)} ${polarization} ${Math.round(symbolRate)}`;
}
