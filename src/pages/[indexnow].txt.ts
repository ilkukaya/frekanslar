import type { APIRoute, GetStaticPaths } from 'astro';
import { siteConfig } from '../config/site';

/** IndexNow ownership key file (Bing, Yandex, Seznam, Naver instant indexing). */
export const getStaticPaths = (() => [{ params: { indexnow: siteConfig.indexNowKey } }]) satisfies GetStaticPaths;

export const GET: APIRoute = () =>
  new Response(siteConfig.indexNowKey, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
