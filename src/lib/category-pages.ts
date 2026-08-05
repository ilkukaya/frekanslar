/**
 * `/yayin-turu/[slug]/` pages, one per `broadcastType` value.
 *
 * Deliberately keyed by the technical `broadcastType` enum (not a
 * coverage+medium compound like "ulusal-radyolar") so these pages never
 * become near-duplicates of each other: with today's seed data every
 * radio station happens to be both "terrestrial-radio" and "national",
 * so a coverage-based page and a broadcastType-based page would show the
 * identical list -- exactly the "same intent, two weak pages" pattern
 * this project is supposed to avoid. Only genuinely distinct
 * broadcastType values become pages, and only when at least one station
 * or channel actually has that type.
 */
import { BROADCAST_TYPE_LABELS } from './labels';
import type { RadioStation, TelevisionChannel } from '../data/schemas';

export interface CategoryPage {
  slug: string;
  title: string;
  kind: 'radio' | 'tv';
  broadcastType: RadioStation['broadcastType'];
  items: (RadioStation | TelevisionChannel)[];
}

export function buildCategoryPages(
  radioStations: readonly RadioStation[],
  televisionChannels: readonly TelevisionChannel[],
): CategoryPage[] {
  const byType = new Map<string, { kind: 'radio' | 'tv'; items: (RadioStation | TelevisionChannel)[] }>();

  for (const station of radioStations) {
    const bucket = byType.get(station.broadcastType);
    if (bucket) {
      bucket.items.push(station);
    } else {
      byType.set(station.broadcastType, { kind: 'radio', items: [station] });
    }
  }

  for (const channel of televisionChannels) {
    const bucket = byType.get(channel.broadcastType);
    if (bucket) {
      bucket.items.push(channel);
    } else {
      byType.set(channel.broadcastType, { kind: 'tv', items: [channel] });
    }
  }

  return [...byType.entries()].map(([broadcastType, { kind, items }]) => ({
    slug: broadcastType,
    title: BROADCAST_TYPE_LABELS[broadcastType as RadioStation['broadcastType']],
    kind,
    broadcastType: broadcastType as RadioStation['broadcastType'],
    items,
  }));
}
