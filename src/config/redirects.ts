/**
 * Redirect & retired-slug registry (brief §3.2, §5.4).
 *
 * `to` is an ordered list of candidate destinations. At build time the first one
 * that was actually built wins and becomes a 301 in Cloudflare's `_redirects`.
 * If none were built the rule is skipped (no redirect to a 404, no blanket
 * redirect to the homepage). Cloudflare Pages `_redirects` cannot return 410;
 * obsolete URLs with no successor fall through to the custom 404.
 *
 * Legacy paths below come from the existing site's sitemap and navigation (2026-11-17).
 * When an attraction is retired with a successor, add it here; never reuse its slug.
 * Destinations may carry a #fragment or Cloudflare's :splat; only the path part is checked.
 * Rules are written static-first, as Cloudflare requires.
 */
export interface Redirect {
  from: string;
  to: string[];
  note?: string;
}

const product = (slug: string) => [`/attractions/${slug}/`, '/attractions/'];

export const redirects: Redirect[] = [
  // Product pages (old IDs are path segments; both the linked and sitemap spellings are listed)
  { from: '/products/haunted-house/1', to: product('haunted-house') },
  { from: '/products/mirror-maze/2', to: product('mirror-maze') },
  { from: '/products/jungle-safari/3', to: product('jungle-safari') },
  { from: '/products/5d-theatre/4', to: product('motion-theatre'), note: 'Merged with the 5D/6D/7D/9D page' },
  { from: '/products/5d-6d-7d-9d-theatre/5', to: product('motion-theatre') },
  { from: '/products/5d-6d-7d-9d-theatres/5', to: product('motion-theatre') },
  { from: '/products/9d-vr-2-seater-egg/6', to: product('9d-vr-egg-2-seater') },
  { from: '/products/9d-vr-2-seater-egg-model/6', to: product('9d-vr-egg-2-seater') },
  { from: '/products/9d-vr-6-seater/7', to: product('9d-vr-6-seater') },
  { from: '/products/hunter-shooting-simu/8', to: product('hunter-shooting-simulator') },
  { from: '/products/hunter-shooting-simulator/8', to: product('hunter-shooting-simulator') },
  { from: '/products/the-walk-vr/9', to: product('the-walk-vr') },

  // Illusion attractions were published as "updates" on the old site
  { from: '/latest-update/tilt-room-the-tilt/61', to: product('tilt-room') },
  { from: '/latest-update/kaleidoscope-illusio/60', to: product('kaleidoscope-illusion') },
  { from: '/latest-update/infinite-tunnel-the/59', to: product('infinite-tunnel') },
  { from: '/latest-update/infinite-room-the-i/58', to: product('infinite-room') },
  { from: '/latest-update/infinite-hexagon-th/57', to: product('infinite-hexagon') },
  { from: '/latest-update/head-platter-illusio/56', to: product('head-on-a-platter') },
  { from: '/latest-update/head-platter-illusio/55', to: product('head-on-a-platter') },
  { from: '/latest-update/face-swapping-illusi/54', to: product('face-swap-illusion') },
  { from: '/latest-update/ames-room-the-ames/53', to: product('ames-room') },
  { from: '/latest-update/beuchet-chair-effect/52', to: product('beuchet-chair') },

  // Former Company namespace (removed 17 Nov 2026: company content now lives on Home, news is /updates/)
  { from: '/company/', to: ['/#company'] },
  { from: '/company', to: ['/#company'] },
  { from: '/company/news/', to: ['/updates/'] },
  { from: '/company/credentials/', to: ['/turnkey-engineering/#credentials', '/turnkey-engineering/'] },
  { from: '/company/news/*', to: ['/updates/:splat'], note: 'Article slugs are unchanged' },

  // Old-site pages
  { from: '/about-us', to: ['/#company'] },

  // Section listings
  { from: '/all-products/*', to: ['/attractions/'] },
  { from: '/image-gallery/*', to: ['/updates/#gallery'] },
  { from: '/latest-updates/*', to: ['/updates/'] },
  { from: '/mapview/*', to: ['/contact/#office', '/contact/'] },
];
