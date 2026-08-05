/**
 * Loads and validates the markdown guides under `src/content/guides/`
 * outside of Astro's content layer, for scripts that need them (search
 * index, reports). Mirrors the `glob()` loader's default id generation
 * (filename without extension), which is also what `render(entry)` /
 * `entry.id` produce inside Astro pages -- so ids agree everywhere.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { guideFrontmatterSchema, type GuideFrontmatter } from '../../src/data/schemas';
import { GUIDES_DIR } from './load-data';
import type { LoadIssue } from './load-data';

export interface LoadedGuide {
  id: string;
  data: GuideFrontmatter;
}

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n?/;

export function loadAllGuides(guidesDir: string = GUIDES_DIR): { guides: LoadedGuide[]; issues: LoadIssue[] } {
  const issues: LoadIssue[] = [];
  const guides: LoadedGuide[] = [];

  let fileNames: string[];
  try {
    fileNames = readdirSync(guidesDir).filter((name) => name.endsWith('.md'));
  } catch (error) {
    issues.push({ file: guidesDir, message: error instanceof Error ? error.message : String(error) });
    return { guides, issues };
  }

  for (const fileName of fileNames) {
    const id = fileName.replace(/\.md$/, '');
    const filePath = path.join(guidesDir, fileName);
    try {
      const raw = readFileSync(filePath, 'utf8');
      const match = FRONTMATTER_PATTERN.exec(raw);
      if (!match) {
        issues.push({ file: fileName, message: 'Missing YAML frontmatter block' });
        continue;
      }
      const frontmatter: unknown = parseYaml(match[1] ?? '');
      const result = guideFrontmatterSchema.safeParse(frontmatter);
      if (result.success) {
        guides.push({ id, data: result.data });
      } else {
        for (const issue of result.error.issues) {
          const at = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
          issues.push({ file: fileName, message: `${issue.message}${at}` });
        }
      }
    } catch (error) {
      issues.push({ file: fileName, message: error instanceof Error ? error.message : String(error) });
    }
  }

  return { guides, issues };
}
