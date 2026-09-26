/**
 * Tiny, dependency-free filter for long A–Z lists (radios, broadcasters).
 * Markup contract:
 *   [data-filter-root]
 *     input[data-filter-input]
 *     button[data-filter-chip="<group>|all"]
 *     [data-filter-item][data-name="..."][data-group="..."]
 *     [data-filter-section] (optional; hidden when all its items are hidden)
 *     [data-filter-count] (optional; receives the visible count)
 */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i');
}

document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
  const input = root.querySelector<HTMLInputElement>('[data-filter-input]');
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-chip]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')].map((el) => ({
    el,
    name: normalize(el.dataset.name ?? ''),
    group: el.dataset.group ?? '',
  }));
  const sections = [...root.querySelectorAll<HTMLElement>('[data-filter-section]')];
  const counter = root.querySelector<HTMLElement>('[data-filter-count]');
  let group = 'all';

  const apply = () => {
    const q = normalize(input?.value.trim() ?? '');
    let visible = 0;
    for (const item of items) {
      const show = (group === 'all' || item.group === group) && (!q || item.name.includes(q));
      item.el.hidden = !show;
      if (show) visible++;
    }
    for (const section of sections) {
      section.hidden = !section.querySelector('[data-filter-item]:not([hidden])');
    }
    if (counter) counter.textContent = String(visible);
  };

  input?.addEventListener('input', apply);
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      group = chip.dataset.filterChip ?? 'all';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      apply();
    }),
  );
});
