/**
 * Deterministic visual helpers for brands that have no logo asset:
 * readable initials and a stable hue, so the same station always gets the
 * same monogram on every page.
 */

const GENERIC_WORDS = new Set([
  'FM',
  'RADYO',
  'RADIO',
  'RD',
  'TV',
  'RTV',
  'TELEVİZYON',
  'TELEVIZYON',
  'TELEVİZYONU',
  'RADYOSU',
  'THE',
  'VE',
]);

export function brandInitials(name: string): string {
  const words = name
    .replace(/[()'".,]+(?=\s|$)/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = words.filter((w) => !GENERIC_WORDS.has(w.toLocaleUpperCase('tr')));
  const pool = meaningful.length > 0 ? meaningful : words;
  const first = pool[0] ?? '';

  // Frequency- or number-named brands ("100.4 FM", "Kanal 7" -> "7") read best as the number itself.
  if (/^\d/.test(first)) return first.slice(0, 5);

  const letters = pool
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr'))
    .join('');
  return letters || '—';
}

export function brandHue(name: string): number {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 360;
}
