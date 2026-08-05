import type { APIRoute } from 'astro';
import { canonicalUrl, paths } from '../lib/urls';

export const GET: APIRoute = () => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    // Internal search results are client-rendered per query and carry no
    // unique indexable content of their own -- keep them out of the crawl
    // budget entirely, on top of the page's own noindex meta tag.
    `Disallow: ${paths.search()}`,
    'Disallow: /*?*',
    `Disallow: ${paths.correctionThanks()}`,
    '',
    `Sitemap: ${canonicalUrl('/sitemap-index.xml')}`,
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
