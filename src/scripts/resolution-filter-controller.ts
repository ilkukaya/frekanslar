/**
 * Tiny progressive-enhancement filter for the satellite page's services
 * table: show/hide rows by resolution (SD/HD/UHD). The table is complete
 * and readable with zero JS; this only adds the optional filter chip.
 */
document.querySelectorAll<HTMLElement>('[data-resolution-filter-root]').forEach((root) => {
  const select = root.querySelector<HTMLSelectElement>('[data-resolution-filter]');
  const rows = root.querySelectorAll<HTMLTableRowElement>('tbody tr[data-resolution]');
  if (!select) return;

  select.addEventListener('change', () => {
    const value = select.value;
    rows.forEach((row) => {
      row.hidden = Boolean(value) && row.dataset.resolution !== value;
    });
  });
});
