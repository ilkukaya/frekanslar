/**
 * Turkish-aware text normalization: slugs for URLs/ids, and a looser
 * "folded" form for search matching.
 *
 * Every URL in this project must be ASCII-only, lowercase, kebab-case and
 * free of Turkish characters -- this module is the one place that decides
 * how a Turkish string turns into that form, so every page and script
 * agrees on the same slug for the same input.
 */

/**
 * Explicit map for Turkish letters that don't round-trip through Unicode
 * NFKD decomposition. Most accented Latin letters (ç, ö, ü, ş, â, î, û)
 * decompose into `base letter + combining mark` under NFKD, so stripping
 * combining marks would handle them anyway -- but "ı" (dotless i) and "İ"
 * (dotted capital I) do NOT decompose that way; they need an explicit
 * mapping. Every Turkish special letter is still listed explicitly below
 * for clarity and to keep behaviour independent of Unicode-table subtleties.
 */
const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Î: 'i',
  û: 'u',
  Û: 'u',
};

const COMBINING_MARKS_PATTERN = /[\u0300-\u036f]/g;
const APOSTROPHE_PATTERN = /['’‘`]/g;
const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;
const LEADING_TRAILING_DASH_PATTERN = /^-+|-+$/g;
const MULTI_SPACE_PATTERN = /\s+/g;

/** Maps Turkish letters to their ASCII base letter, character by character. */
function mapTurkishChars(input: string): string {
  return Array.from(input)
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join('');
}

/** Strips any remaining accents via Unicode decomposition (covers non-Turkish diacritics too). */
function stripDiacritics(input: string): string {
  return input.normalize('NFKD').replace(COMBINING_MARKS_PATTERN, '');
}

/**
 * Converts arbitrary (typically Turkish) text into a lowercase, ASCII-only,
 * kebab-case slug suitable for URLs and stable data ids.
 *
 * @example slugify('İstanbul Üsküdar') // 'istanbul-uskudar'
 * @example slugify('Show TV') // 'show-tv'
 * @example slugify('94.8') // '94-8'
 */
export function slugify(input: string): string {
  return stripDiacritics(mapTurkishChars(input))
    .toLowerCase()
    .replace(APOSTROPHE_PATTERN, '')
    .replace(NON_ALPHANUMERIC_PATTERN, '-')
    .replace(LEADING_TRAILING_DASH_PATTERN, '');
}

/** True when `value` is already a valid slug (matches what `slugify` would produce). */
export function isSlug(value: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

/**
 * Folds text for Turkish- and case-insensitive search matching: same
 * character normalization as `slugify`, but word boundaries (spaces) and
 * digits are preserved instead of being collapsed into hyphens, so
 * multi-word queries still tokenize naturally for fuzzy search.
 *
 * @example foldTurkish('İstanbul Üsküdar') // 'istanbul uskudar'
 * @example foldTurkish('JoyTürk') // 'joyturk'
 */
export function foldTurkish(input: string): string {
  return stripDiacritics(mapTurkishChars(input))
    .toLowerCase()
    .replace(APOSTROPHE_PATTERN, '')
    .replace(MULTI_SPACE_PATTERN, ' ')
    .trim();
}
