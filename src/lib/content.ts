/**
 * Astro-side content access. Loads every collection once, runs the publication
 * resolver and caches the result for the whole build. Pages import `site()`.
 */
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { resolve, type Resolved, type Media } from './resolve.ts';
import { previewMode } from '../config/build.ts';
import { company } from '../config/company.ts';

let cached: Promise<Resolved> | undefined;

export function site(): Promise<Resolved> {
  cached ??= (async () => {
    const [media, categories, attractions, venues, projects, capabilities, credentials, updates] = await Promise.all([
      getCollection('media'),
      getCollection('categories'),
      getCollection('attractions'),
      getCollection('venues'),
      getCollection('projects'),
      getCollection('capabilities'),
      getCollection('credentials'),
      getCollection('updates'),
    ]);
    const r = resolve(
      { media, categories, attractions, venues, projects, capabilities, credentials, news: updates },
      { preview: previewMode, now: new Date(), capabilityProfileId: company.capabilityProfileMediaId },
    );
    if (!previewMode) for (const w of r.warnings) console.warn(`[content] ${w}`);
    return r;
  })();
  return cached;
}

/** Update and case-study entries keep their Markdown bodies; fetch the entry to render it. */
export { getEntry, render } from 'astro:content';

// Every image under src/assets/media/ is available to media records by relative path.
const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/media/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export function imageFor(m: Media): ImageMetadata | undefined {
  if (m.kind !== 'image' || !m.file) return undefined;
  const hit = images[`/src/assets/media/${m.file}`];
  if (!hit) throw new Error(`media "${m.id}": file src/assets/media/${m.file} not found`);
  return hit.default;
}

/** Shared date formatting (en-GB, e.g. 17 November 2026). */
export const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
