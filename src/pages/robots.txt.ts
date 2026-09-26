import type { APIRoute } from 'astro';
import { canonicalUrl, paths } from '../lib/urls';

/**
 * Search engines AND AI answer engines are explicitly welcome: being cited
 * by ChatGPT/Perplexity/Gemini/Claude answers is part of the traffic
 * strategy (GEO), so their crawlers get the same access as Googlebot.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'YandexBot',
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'Amazonbot',
  'CCBot',
];

export const GET: APIRoute = () => {
  const disallow = [`Disallow: ${paths.search()}`, 'Disallow: /*?*', `Disallow: ${paths.correctionThanks()}`];
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...disallow,
    '',
    ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', ...disallow, '']),
    `Sitemap: ${canonicalUrl('/sitemap-index.xml')}`,
    '',
    `# LLM özeti: ${canonicalUrl('/llms.txt')}`,
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
