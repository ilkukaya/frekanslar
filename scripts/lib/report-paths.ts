/**
 * Shared output paths for the report-producing data scripts. Kept in
 * lib/ (not in the executable scripts themselves) so other scripts can
 * import just the path -- e.g. `data-diff.ts` reading the last
 * `data-check-links.ts` run -- without pulling in and re-running an
 * executable script's side effects.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPORTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../reports');
export const LINK_CHECK_REPORT_PATH = path.join(REPORTS_DIR, 'link-check.json');
export const DATA_REPORT_PATH = path.join(REPORTS_DIR, 'data-report.json');
