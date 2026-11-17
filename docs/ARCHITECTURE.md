# Architecture

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro 7, `output: 'static'`, `trailingSlash: 'always'` | Every page is prerendered to `dist/` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | Tokens in `src/styles/global.css` |
| Content | Astro Content Collections (`glob` loader) | YAML records, Markdown for news/case studies |
| Motion | GSAP 3 + ScrollTrigger, lazy-loaded | Skipped entirely under reduced motion |
| Icons | `@lucide/astro` | Rendered to inline SVG at build time |
| Fonts | Bricolage Grotesque Variable (display), Instrument Sans Variable (text) | Self-hosted via Fontsource |
| Hosting | Cloudflare Pages (static, no Functions) | `_headers` in `public/`, `_redirects` generated |

## Data flow

```
src/content/**  ──getCollection──▶  src/lib/content.ts  ──▶  resolve()  ──▶  Resolved graph  ──▶  pages/components
                                                         ▲
                                         src/config/gates.ts, build.ts
```

`resolve()` (`src/lib/resolve.ts`) is pure and unit-tested. It:

1. **Validates**: unknown references, duplicate slugs, reserved slugs (`category`, `by-attraction`, `by-venue`), a primary category repeated as secondary, videos stored in the repo, and approved media with no file. Any of these fails the build.
2. **Filters media**: `approved` and not past `expires` (plus `pending` in preview builds).
3. **Applies gates** from `gates.ts`. Each gate is listed below.
4. **Derives** category membership, venue → attractions, venue → projects, attraction → projects, project categories, filter values and navigation.
5. Collects **warnings** for hidden content. Production builds print them to the console.

### Gates (brief §6; thresholds in `src/config/gates.ts`)

| Output | Rule |
|---|---|
| Attraction page | visible + `active` (or `retired` + `keepRetiredPage`) + ≥2 stills, or ≥1 video + ≥1 still/poster |
| Category page | ≥3 active publishable attractions with it as primary category |
| Attractions index | always built (top-level nav); empty state with 0 publishable attractions |
| Solution page | ≥3 suitable attractions across ≥2 primary categories, AND (≥1 related project OR ≥3 verified planning points), AND Solutions live |
| Solutions index / nav | ≥2 venue pages pass |
| Projects archive / nav | ≥3 showcase-grade projects (approved disclosure + ≥1 approved media) |
| Case study page | archive live + case-study depth + brief + scope + delivery + ≥3 media |
| Project filter value | archive live + ≥2 matching projects |
| Turnkey page | always built (top-level nav); "being confirmed" state with 0 publishable capabilities |
| Credentials section (Turnkey `#credentials`) | ≥2 current, permitted, verified credentials |
| Updates index | always built (top-level nav); empty state with 0 published articles (article needs an approved cover) |
| Homepage Latest Updates | ≥2 articles within 180 days and the newest ≤90 days old |
| Office address + map | `company.contact.location.verified` |

**Navigation** is fixed (owner decision, 17 Nov 2026): Home · Attractions · Turnkey & Engineering · Updates · Contact. Solutions and Projects are linked from content only.
| Capability profile CTA | approved document media with a file, referenced by `company.capabilityProfileMediaId` |

**Interpretation recorded:** a venue page that passes on its own is not published while the Solutions index is hidden (fewer than 2 passing). A lone venue page would have no parent index or navigation entry. This is the only point where the brief was ambiguous.

## Routes

| Route | File |
|---|---|
| `/` | `pages/index.astro` |
| `/attractions/` | `pages/attractions/index.astro` (always) |
| `/attractions/{slug}/` | `pages/attractions/[slug].astro` |
| `/attractions/category/{slug}/` | `pages/attractions/category/[slug].astro` |
| `/solutions/`, `/solutions/{slug}/` | `pages/solutions/` |
| `/turnkey-engineering/` | `pages/turnkey-engineering/index.astro` (always; includes `#credentials`) |
| `/projects/`, `/projects/{case-study}/` | `pages/projects/` |
| `/projects/by-attraction/{cat}/`, `/projects/by-venue/{venue}/` | noindex, canonical `/projects/` |
| `/updates/`, `/updates/{slug}/` | `pages/updates/` (index always) |
| `/contact/` | canonical `/contact/`; query variants get `noindex` at runtime; `#office` map |
| `/company/*` (removed) | 301 → `/#company`, `/updates/:splat`, `/turnkey-engineering/#credentials` |
| `/privacy/`, `/404.html`, `/sitemap.xml`, `/robots.txt` | utility |

## SEO

- `Base.astro` sets the title, description, canonical, robots, Open Graph and Twitter tags. It also emits Organization JSON-LD, which includes email, phone and founding date only once those facts are confirmed.
- Breadcrumbs emit BreadcrumbList JSON-LD. Attraction pages emit Product and articles emit NewsArticle.
- `sitemap.xml` is generated from the resolved graph, so it contains only live, indexable pages. Preview builds get an empty sitemap and `Disallow: /`.
- `_redirects` is generated by the `cloudflare-redirects` integration in `astro.config.mjs` from `src/config/redirects.ts`. Each rule uses the first candidate destination that was actually built; static rules are written before splat rules. `npm run check:redirects` simulates the rules for the legacy URLs and checks the destinations exist in `dist/`.

## Gallery

`Gallery.astro` takes any list of Media records. Desktop shows 4 per page, tablet 2 and mobile 1. Only the first item of each page is a scroll-snap point, so swiping, mouse drag, the previous and next buttons, the dots and ←/→ (with the track focused) all move one page at a time. Hidden filler slots complete the last page so it starts on a group boundary. The status reads "Page x of y · Images a–b of n". Images open in the shared `Lightbox`. Without JS it is a native scrollable strip, and the controls stay hidden. The data comes from `resolve().gallery`: images with `gallery: true`, approved and in-term (pending ones too in preview), ordered by `galleryOrder`.

## Contact enquiry state

One product state is shared by every `select[data-product]`, and it persists across intent changes until cleared. The draft body is editable. Once the visitor edits it, it is kept (subject and links still update), and "Rebuild from form" restores the generated text. Mailto, Gmail, Outlook and WhatsApp links are rebuilt on every change. WhatsApp text comes from `whatsappText()`, or from the edited body once the visitor has edited it.

## Office map

`OfficeMap.astro` embeds `openstreetmap.org/export/embed.html` (free, no key) with a marker at `company.contact.location`, lazy-loaded (`loading="lazy"`), with a label chip, the written address, Google Maps directions and an OpenStreetMap link. A fallback panel with the same links sits behind the iframe and stays visible if the map fails to load. Coordinates come from the company's own map link and were cross-checked by OSM reverse geocoding (sources recorded in `company.ts`).

## Enquiries

- `src/lib/enquiry.ts` (pure, tested): `parseContext()`, `contactHref()`, `composeDraft()`, `mailtoHref()`, `gmailHref()`, `outlookHref()`.
- Contact page without JS: four static mailto routes with prefilled subjects, plus the email and phone. With JS, `src/scripts/contact.ts` reveals the builder, preselects intent, attraction and venue from the query, and updates a live draft with mailto, copy, Gmail and Outlook actions.
- Source pages also print a direct `mailto:` with a contextual subject, so context survives without JS.
- `EmailLink.astro` entity-encodes the address as basic protection against naive scrapers. It does not prevent harvesting.

## Analytics

`src/config/analytics.ts` defines the event names and allowed properties (`page_type`, `source`, `intent`, `item`, all slug-shaped). `src/scripts/analytics.ts` listens for `[data-track]` clicks and forwards events to the provider, but only when `analytics.approved` is true and a provider and domain are configured. Recommended provider: Plausible, which is cookieless, supports custom events and works on static hosting. Cloudflare Web Analytics does not support custom events. The adapter is the only file to change if a different provider is chosen.

## Performance

- Images go through `astro:assets` (WebP, responsive `widths`/`sizes`, lazy below the fold, `fetchpriority=high` on the hero). Aspect ratios are fixed.
- JS: about 1 KB of analytics on every page. GSAP (about 45 KB gz) is dynamically imported only when motion is allowed. The contact builder is about 2 KB gz, on `/contact/` only.
- CSS: one stylesheet, about 10 KB gz. Fonts use `font-display: swap` with unicode-range subsets.
- Third-party video loads only after the visitor presses play.
