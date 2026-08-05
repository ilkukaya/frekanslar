/**
 * Drives the `/ara/` results page: reads `?q=` from the URL, fetches the
 * search index once, and renders every match (no 8-item cap like the
 * header dropdown). Also keeps the URL in sync as the user edits the
 * on-page query box, so results stay shareable/bookmarkable.
 */
import { createSearchEngine, fetchSearchIndex, queryEntries } from './search-client';
import { SEARCH_RESULT_TYPE_LABELS } from '../lib/search';
import type { SearchIndexEntry } from '../lib/search';

const root = document.querySelector<HTMLElement>('[data-search-page-root]');
if (root) {
  const input = root.querySelector<HTMLInputElement>('[data-search-page-input]');
  const resultsList = root.querySelector<HTMLUListElement>('[data-search-page-results]');
  const summary = root.querySelector<HTMLElement>('[data-search-page-summary]');
  const emptyState = root.querySelector<HTMLElement>('[data-search-page-empty]');
  const errorState = root.querySelector<HTMLElement>('[data-search-page-error]');

  function renderResults(query: string, results: SearchIndexEntry[]): void {
    if (!resultsList || !summary || !emptyState) return;
    resultsList.replaceChildren();

    if (!query.trim()) {
      summary.textContent = 'Aramaya başlamak için bir terim yazın.';
      emptyState.hidden = true;
      return;
    }

    summary.textContent = `"${query}" için ${results.length} sonuç bulundu.`;
    emptyState.hidden = results.length > 0;

    for (const result of results) {
      const item = document.createElement('li');
      item.className = 'border-b border-border last:border-b-0';

      const link = document.createElement('a');
      link.href = result.url;
      link.className = 'flex flex-col gap-0.5 px-4 py-3 hover:bg-surface-subtle';

      const title = document.createElement('span');
      title.className = 'font-medium text-ink';
      title.textContent = result.title;

      const subtitle = document.createElement('span');
      subtitle.className = 'text-sm text-ink-faint';
      subtitle.textContent = `${SEARCH_RESULT_TYPE_LABELS[result.type]} · ${result.subtitle}`;

      link.append(title, subtitle);
      item.appendChild(link);
      resultsList.appendChild(item);
    }
  }

  async function run(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') ?? '';
    if (input) input.value = query;

    try {
      const entries = await fetchSearchIndex();
      const engine = createSearchEngine(entries);
      renderResults(query, query.trim() ? queryEntries(engine, query, 50) : []);
    } catch {
      if (errorState) errorState.hidden = false;
    }
  }

  input?.addEventListener('input', () => {
    const url = new URL(window.location.href);
    if (input.value) {
      url.searchParams.set('q', input.value);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
    void run();
  });

  void run();
}
