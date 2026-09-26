import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';

/** Authorized Digital Sellers file, generated from PUBLIC_ADSENSE_CLIENT. */
export const GET: APIRoute = () => {
  const publisherId = siteConfig.adsense.client.replace(/^ca-/, '');
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Reklam hesabı henüz bağlanmadı.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
