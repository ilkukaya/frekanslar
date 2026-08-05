/**
 * DOM wiring for the header search box: a WAI-ARIA combobox pattern
 * (role="combobox" input + role="listbox" results) backed by the Fuse.js
 * engine in `search-client.ts`. The search index itself is fetched lazily
 * on first keystroke, not on page load, to keep the header cheap on pages
 * nobody searches from.
 *
 * Progressive enhancement: the input lives inside a real
 * `<form action="/ara/" method="get">`, so pressing Enter before this
 * script has run (or if it fails to load) still submits a normal
 * navigation to the search results page.
 */
import { createSearchEngine, fetchSearchIndex, queryEntries } from './search-client';
import { SEARCH_RESULT_TYPE_LABELS } from '../lib/search';
import type { SearchIndexEntry } from '../lib/search';

const RESULT_LIMIT = 8;
const DEBOUNCE_MS = 120;

function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function initSearchRoot(root: HTMLElement): void {
  const formNode = root.querySelector<HTMLFormElement>('form[data-search-form]');
  const inputNode = root.querySelector<HTMLInputElement>('input[data-search-input]');
  const resultsNode = root.querySelector<HTMLUListElement>('[data-search-results]');
  const statusNode = root.querySelector<HTMLElement>('[data-search-status]');
  if (!formNode || !inputNode || !resultsNode) return;

  // Re-bind as freshly-typed non-null consts: TypeScript's control-flow
  // narrowing from the guard above does not carry into the closures
  // defined below, but a `const` whose *declared* type is already
  // non-nullable does stay non-nullable inside them.
  const form: HTMLFormElement = formNode;
  const input: HTMLInputElement = inputNode;
  const resultsList: HTMLUListElement = resultsNode;
  const status: HTMLElement | null = statusNode;

  let engine: ReturnType<typeof createSearchEngine> | null = null;
  let indexLoadFailed = false;
  let currentResults: SearchIndexEntry[] = [];
  let activeIndex = -1;

  async function ensureEngine(): Promise<ReturnType<typeof createSearchEngine> | null> {
    if (engine || indexLoadFailed) return engine;
    try {
      const entries = await fetchSearchIndex();
      engine = createSearchEngine(entries);
    } catch {
      indexLoadFailed = true;
      if (status) status.textContent = 'Arama dizini yüklenemedi. Enter tuşuyla arama sayfasına gidebilirsiniz.';
    }
    return engine;
  }

  function closeResults(): void {
    resultsList.hidden = true;
    resultsList.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
    currentResults = [];
  }

  function setActive(index: number): void {
    const options = resultsList.querySelectorAll<HTMLLIElement>('[role="option"]');
    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === index;
      option.setAttribute('aria-selected', isActive ? 'true' : 'false');
      option.classList.toggle('bg-primary-50', isActive);
    });
    activeIndex = index;
    const active = options.item(index);
    if (active) {
      input.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function renderResults(results: SearchIndexEntry[]): void {
    currentResults = results;
    activeIndex = -1;
    resultsList.replaceChildren();

    if (results.length === 0) {
      closeResults();
      return;
    }

    results.forEach((result, index) => {
      const item = document.createElement('li');
      item.id = `search-option-${index}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.className = 'border-b border-border last:border-b-0';

      const link = document.createElement('a');
      link.href = result.url;
      link.className = 'flex flex-col gap-0.5 px-4 py-2.5 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none';

      const titleEl = document.createElement('span');
      titleEl.className = 'font-medium text-ink';
      titleEl.textContent = result.title;

      const subtitleEl = document.createElement('span');
      subtitleEl.className = 'text-xs text-ink-faint';
      subtitleEl.textContent = `${SEARCH_RESULT_TYPE_LABELS[result.type]} · ${result.subtitle}`;

      link.append(titleEl, subtitleEl);
      link.addEventListener('click', () => {
        window.frekanslarTrack?.('search_result_clicked', { url: result.url, resultType: result.type });
      });

      item.appendChild(link);
      resultsList.appendChild(item);
    });

    resultsList.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  const runQuery = debounce(async (rawQuery: string) => {
    if (!rawQuery.trim()) {
      closeResults();
      return;
    }
    const activeEngine = await ensureEngine();
    if (!activeEngine) return;
    renderResults(queryEntries(activeEngine, rawQuery, RESULT_LIMIT));
  }, DEBOUNCE_MS);

  input.addEventListener('input', () => {
    void runQuery(input.value);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) void runQuery(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (resultsList.hidden && event.key !== 'Enter') return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (currentResults.length === 0) return;
        setActive((activeIndex + 1) % currentResults.length);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (currentResults.length === 0) return;
        setActive((activeIndex - 1 + currentResults.length) % currentResults.length);
        break;
      }
      case 'Escape': {
        closeResults();
        break;
      }
      case 'Enter': {
        if (activeIndex >= 0) {
          const target = currentResults[activeIndex];
          if (target) {
            event.preventDefault();
            window.frekanslarTrack?.('search_result_clicked', {
              url: target.url,
              resultType: target.type,
            });
            window.location.href = target.url;
          }
        }
        // Otherwise let the form submit naturally to /ara/?q=...
        break;
      }
      default:
        break;
    }
  });

  form.addEventListener('submit', () => {
    window.frekanslarTrack?.('search_submitted', { query: input.value });
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node)) return;
    if (!root.contains(event.target)) closeResults();
  });
}

document.querySelectorAll<HTMLElement>('[data-search-root]').forEach(initSearchRoot);
