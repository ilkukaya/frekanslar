/**
 * Progressive-enhancement controller for `FrequencyTable.astro`: client-side
 * sort (by clicking a column header) and filter (by station name /
 * broadcast type / district), all as DOM show/hide + reordering over the
 * already-fully-rendered table. No fetch, no new URLs, nothing to index.
 */
import { foldTurkish } from '../lib/slug';

type SortDirection = 'asc' | 'desc';
type SortType = 'number' | 'string';

function applyFilters(root: HTMLElement): void {
  const textInput = root.querySelector<HTMLInputElement>('[data-filter-text]');
  const typeSelect = root.querySelector<HTMLSelectElement>('[data-filter-broadcast-type]');
  const districtSelect = root.querySelector<HTMLSelectElement>('[data-filter-district]');
  const countLabel = root.querySelector<HTMLElement>('[data-filter-result-count]');
  const rows = root.querySelectorAll<HTMLTableRowElement>('tbody tr[data-row]');

  const textQuery = foldTurkish(textInput?.value ?? '');
  const typeQuery = typeSelect?.value ?? '';
  const districtQuery = districtSelect?.value ?? '';

  let visibleCount = 0;
  rows.forEach((row) => {
    const matchesText = !textQuery || (row.dataset.searchText ?? '').includes(textQuery);
    const matchesType = !typeQuery || row.dataset.broadcastType === typeQuery;
    const matchesDistrict = !districtQuery || row.dataset.district === districtQuery;
    const visible = matchesText && matchesType && matchesDistrict;
    row.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (countLabel) {
    countLabel.textContent = `${visibleCount} / ${rows.length} kayıt gösteriliyor`;
  }
}

function sortRows(root: HTMLElement, sortKey: string, sortType: SortType, direction: SortDirection): void {
  const tbody = root.querySelector('tbody');
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr[data-row]'));

  const getValue = (row: HTMLTableRowElement): string | number => {
    const cell = row.querySelector<HTMLElement>(`[data-sort-col="${sortKey}"]`);
    const raw = cell?.dataset.sortValue ?? '';
    return sortType === 'number' ? Number(raw) : raw;
  };

  rows.sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);
    let comparison: number;
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    } else {
      comparison = String(valueA).localeCompare(String(valueB), 'tr');
    }
    return direction === 'asc' ? comparison : -comparison;
  });

  for (const row of rows) {
    tbody.appendChild(row);
  }
}

function initTable(root: HTMLElement): void {
  root.querySelector('[data-filter-text]')?.addEventListener('input', () => applyFilters(root));
  root.querySelector('[data-filter-broadcast-type]')?.addEventListener('change', () => applyFilters(root));
  root.querySelector('[data-filter-district]')?.addEventListener('change', () => applyFilters(root));
  applyFilters(root);

  const sortButtons = root.querySelectorAll<HTMLButtonElement>('button[data-sort-key]');
  sortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sortKey = button.dataset.sortKey;
      const sortType = button.dataset.sortType === 'number' ? 'number' : 'string';
      if (!sortKey) return;

      const currentDirection = button.dataset.sortDirection === 'asc' ? 'asc' : 'desc';
      const nextDirection: SortDirection = currentDirection === 'asc' ? 'desc' : 'asc';

      sortButtons.forEach((other) => {
        delete other.dataset.sortDirection;
        other.setAttribute('aria-sort', 'none');
      });
      button.dataset.sortDirection = nextDirection;
      button.setAttribute('aria-sort', nextDirection === 'asc' ? 'ascending' : 'descending');

      sortRows(root, sortKey, sortType, nextDirection);
    });
  });
}

document.querySelectorAll<HTMLElement>('[data-frequency-table-root]').forEach(initTable);
