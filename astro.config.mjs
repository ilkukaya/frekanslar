// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Central site URL fallback. The real production domain is not known yet,
// so we default to https://example.com as instructed. Override with the
// PUBLIC_SITE_URL environment variable once a real domain is available.
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://example.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  output: 'static',
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'directory',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
