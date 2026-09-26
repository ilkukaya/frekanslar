import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: `${siteConfig.siteName} – Radyo ve TV Frekansları`,
        short_name: siteConfig.siteName,
        description: siteConfig.defaultDescription,
        lang: 'tr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f7f5f1',
        theme_color: '#17150f',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Tüm Radyolar', url: '/radyolar/' },
          { name: 'Şehre Göre Frekanslar', url: '/radyo-frekanslari/' },
          { name: 'TV Kanalları', url: '/televizyon-kanallari/' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
