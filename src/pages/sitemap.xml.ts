/**
 * sitemap.xml built from the resolved content graph, so it lists exactly the pages that
 * passed their gates. Filter views (noindex) and the 404 are excluded. Preview builds
 * emit an empty sitemap (they are noindex throughout).
 */
import type { APIRoute } from 'astro';
import { site } from '../lib/content.ts';
import { siteUrl, previewMode } from '../config/build.ts';

export const GET: APIRoute = async () => {
  const r = await site();
  const paths = previewMode
    ? []
    : [
        '/',
        '/attractions/',
        ...r.categories.filter((c) => c.hasPage).map((c) => `/attractions/category/${c.slug}/`),
        ...r.attractions.map((a) => `/attractions/${a.slug}/`),
        ...(r.solutionsLive ? ['/solutions/', ...r.venues.filter((v) => v.hasPage).map((v) => `/solutions/${v.slug}/`)] : []),
        '/turnkey-engineering/',
        ...(r.projectsLive ? ['/projects/', ...r.projects.filter((p) => p.hasPage).map((p) => `/projects/${p.slug}/`)] : []),
        '/updates/',
        ...r.news.map((a) => `/updates/${a.id}/`),
        '/contact/',
        '/privacy/',
      ];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map((p) => `  <url><loc>${new URL(p, siteUrl).href}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
