// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { writeFile } from 'node:fs/promises';
import { redirects } from './src/config/redirects.ts';
import { siteUrl } from './src/config/build.ts';

/**
 * Writes Cloudflare Pages `_redirects` after the build. A redirect is only emitted
 * when its destination was actually built, so a gate that hides a page never
 * leaves a redirect pointing at a 404.
 */
/** @returns {import("astro").AstroIntegration} */
function cloudflareRedirects() {
  return {
    name: 'cloudflare-redirects',
    hooks: {
      'astro:build:done': async ({ pages, dir, logger }) => {
        const built = new Set(pages.map((p) => `/${p.pathname}`.replace(/\/+$/, '') + '/'));
        const lines = [];
        let skipped = 0;
        // Only a destination's path must exist: ignore any #fragment; ':splat' targets check their parent.
        const exists = (/** @type {string} */ t) => built.has(t.split('#')[0].replace(/:splat$/, ''));
        for (const r of redirects) {
          const target = r.to.find(exists);
          if (target) lines.push(`${r.from} ${target} 301`);
          else skipped++;
        }
        // Cloudflare requires static rules before dynamic (splat/placeholder) ones.
        const dynamic = (/** @type {string} */ l) => /[*:]/.test(l.split(' ')[0]);
        lines.sort((x, y) => Number(dynamic(x)) - Number(dynamic(y)));
        await writeFile(new URL('_redirects', dir), lines.join('\n') + '\n');
        logger.info(`_redirects: ${lines.length} rules written, ${skipped} skipped (destination not built)`);
      },
    },
  };
}

export default defineConfig({
  site: siteUrl,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [cloudflareRedirects()],
  vite: { plugins: [tailwindcss()] },
});
