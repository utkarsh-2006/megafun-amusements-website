/**
 * Build-time switches. Read from the environment once, here, and nowhere else.
 * Imported by astro.config.mjs and by the content resolver.
 */
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

/** Canonical production origin (no trailing slash). Confirm with the company before launch. */
export const siteUrl = 'https://www.megafunamusements.com';

/** Folder the content collections load from. Fixture libraries are for template QA only. */
export const contentRoot = env.CONTENT_ROOT || 'src/content';
export const usingFixtures = contentRoot !== 'src/content';

const isDevServer = env.npm_lifecycle_event === 'dev' || env.npm_lifecycle_event === 'start';
/** Cloudflare Pages injects CF_PAGES_BRANCH; any branch other than production is a preview deployment. */
const isCloudflarePreview = !!env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== (env.PRODUCTION_BRANCH || 'main');

/**
 * Preview builds render draft/review content and pending media as labelled placeholders.
 * They are never valid for the production domain. SITE_MODE=production forces a production
 * build, except for fixture libraries, which are always previews.
 */
export const previewMode =
  usingFixtures || (env.SITE_MODE !== 'production' && (env.SITE_MODE === 'preview' || isDevServer || isCloudflarePreview));
