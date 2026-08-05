/**
 * True when the currently-executing module was the process's entry
 * point (i.e. run directly via `tsx scripts/foo.ts`), false when it was
 * merely `import`-ed by another module. Every script guards its `main()`
 * call with this so importing one script for a shared constant (as
 * `data-diff.ts` does with report paths) never re-triggers another
 * script's side effects.
 */
import { pathToFileURL } from 'node:url';

export function isMainModule(moduleUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return moduleUrl === pathToFileURL(entry).href;
}
