/**
 * Browser-side search engine: wraps Fuse.js configured to match against
 * each entry's pre-folded `searchText` (see `src/lib/search.ts`), after
 * folding the user's own query the same way. That's what makes matching
 * Turkish-character- and case-insensitive; Fuse's fuzziness on top of that
 * absorbs genuine typos.
 */
import Fuse, { type IFuseOptions } from 'fuse.js';
import { foldTurkish } from '../lib/slug';
import type { SearchIndexEntry } from '../lib/search';

const FUSE_OPTIONS: IFuseOptions<SearchIndexEntry> = {
  keys: [{ name: 'searchText', weight: 1 }],
  threshold: 0.34,
  ignoreLocation: true,
  minMatchCharLength: 1,
};

export async function fetchSearchIndex(): Promise<SearchIndexEntry[]> {
  const response = await fetch('/search-index.json');
  if (!response.ok) {
    throw new Error(`search index fetch failed with status ${response.status}`);
  }
  return (await response.json()) as SearchIndexEntry[];
}

export function createSearchEngine(entries: SearchIndexEntry[]): Fuse<SearchIndexEntry> {
  return new Fuse(entries, FUSE_OPTIONS);
}

export function queryEntries(
  engine: Fuse<SearchIndexEntry>,
  rawQuery: string,
  limit = 8,
): SearchIndexEntry[] {
  const query = foldTurkish(rawQuery);
  if (!query) {
    return [];
  }
  return engine.search(query, { limit }).map((result) => result.item);
}
