import type { APIRoute } from 'astro';
import { siteUrl, previewMode } from '../config/build.ts';

// Preview builds (Cloudflare preview deployments) must never be crawled.
export const GET: APIRoute = () =>
  new Response(previewMode ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', siteUrl).href}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
