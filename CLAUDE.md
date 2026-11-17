# CLAUDE.md

Guidance for Claude (and people) maintaining the Mega Fun Amusements website.

Static Astro 7 site, TypeScript, Tailwind CSS v4, GSAP for motion, Lucide icons, Astro Content Collections. Hosted on Cloudflare Pages from GitHub. The only server-side code is the owner-approved (18 Nov 2026) enquiry endpoint `functions/api/enquiry.ts` (Pages Function → Turnstile → Resend). No database, CMS, accounts or store; do not add other backend code without a separately approved requirement.

The structural source of truth is `Mega_Fun_Amusements_Website_Project_Brief_v0.3.docx` (in the project workspace; git-ignored). Section references below (§) point to it.

## Commands

```bash
npm run dev          # dev server (preview mode: drafts + placeholders visible), http://localhost:4321
npm run build        # PRODUCTION build → dist/  (only approved content)
npm run build:preview  # production-shaped build with drafts visible (what Cloudflare preview branches build)
npm run build:thin   # regenerate fixtures + build the §6.1 thin-launch library → dist-thin/
npm run build:full   # regenerate fixtures + build a library where every gate passes → dist-full/
npm run check        # astro check (types)
npm test             # node:test over tests/*.test.ts (gates, relationships, enquiry encoding)
npm run verify       # check + test + build + check:redirects
npm run check:redirects  # simulate dist/_redirects for legacy URLs (after a build)
npm run wasm-fallback  # only if Windows Smart App Control blocks Astro's native binaries locally
```

Tests run TypeScript directly with `--experimental-strip-types`: files they import (`src/lib/resolve.ts`, `src/lib/enquiry.ts`, `src/config/gates.ts`) must use relative imports with explicit `.ts` extensions and no TS-only runtime syntax (enums, namespaces, parameter properties).

## How the site decides what to publish

1. `src/content/**` holds canonical records (YAML for structured records, Markdown for news and case studies). Schemas: `src/content.config.ts`.
2. `src/lib/resolve.ts` is a **pure function** that validates relationships, applies every publication gate and derives every reverse relationship. It throws on broken references, duplicate or reserved slugs, and approved media without a file.
3. `src/config/gates.ts` holds every numeric threshold (§6). Never hard-code a count in a component.
4. `src/lib/content.ts` loads the collections once and calls the resolver; pages call `await site()`.
5. Gated index pages (`/solutions/`, `/projects/`) use `[...index].astro` + `getStaticPaths()` returning `[]` when the gate fails, so the route is never generated. Detail pages only get paths for records that pass.

## Information architecture (owner decision, 17 Nov 2026 — supersedes brief §3 navigation)

- Primary navigation is **exactly five items**, in this order, desktop and mobile: Home · Attractions · Turnkey & Engineering · Updates · Contact (`nav` in `src/lib/resolve.ts`). The logo also links home. Do not add items.
- `/attractions/`, `/turnkey-engineering/` and `/updates/` **always exist** and show a deliberate empty state when nothing is publishable.
- There is no Company page. The company introduction lives only on Home (`#company`). `/company/*` redirects to it, to `/updates/` or to `/turnkey-engineering/#credentials`.
- Updates live at `/updates/{slug}/` (collection `updates`, folder `src/content/updates/`).
- Credentials render as a section of Turnkey & Engineering (`#credentials`) once ≥2 are current; there is no standalone page.
- Solutions and Projects keep their v0.3 gates and are linked from content (Home sections, attraction pages), not from the navigation.
- **Homepage company copy** (About, Portfolio, Engineering, Turnkey, Closing, H1, SEO) lives in `src/config/homepage.ts`: the owner's draft, rendered in production, flagged in preview until `approved`. Never copy these paragraphs onto other pages.
- **Contact has exactly two sections:** `#enquiry` and `#office` (map). LEFT column is informational only (intro, email, phone, WhatsApp; no fields). RIGHT is the enquiry card: "Select attraction category" (classification names from `resolve().enquiryCategories`, never individual products, never empty classifications), Your name (required), Phone (optional), the live email preview, **Send Enquiry** (POST `/api/enquiry`) and **WhatsApp Us** (same text). `composeEnquiry()`/`validateEnquiry()` in `src/lib/enquiry.ts` are shared by browser and server, so the server recomposes exactly the previewed email; the category allow-list reaches the function via the generated `/enquiry-options.json`. No mailto/Gmail/Outlook in the card.
- **Header**: "Attractions" is a link plus a separate chevron that opens the mega-menu (published categories → published products). Never make the text itself only a toggle. See docs/ARCHITECTURE.md → Header mega-menu.
- **`.mf-glow`** is the animated card border; use it only on attraction/product cards.
- **Enquiry message** is editable; the server sends it verbatim (plus a details block). Do not regenerate it after the visitor edits it.
- **Gallery** lives only on `/updates/#gallery`: media records with `gallery: true` (approved; pending ones show as placeholders in preview), rendered by the reusable `Gallery.astro` (4/2/1 per page, buttons, arrow keys, drag, lightbox). Attraction pages show their own photos in the hero thumbnails, not in a gallery section.
- **One responsibility per page; no repeated copy.** Home introduces the company and previews; Attractions = what we make; attraction pages = the product; Turnkey = how we deliver (full stage/capability descriptions live only here); Updates = announcements; Contact = contact, office, enquiry. Home sections show names and link out; they never reproduce inner-page descriptions.

Build modes (`src/config/build.ts`):
- **production** (`npm run build`, Cloudflare `main`): only `status: published` records, only `rights: approved` and in-term media. Unconfirmed company facts are hidden.
- **preview** (`npm run dev`, `build:preview`, any non-`main` Cloudflare branch): also renders `draft`/`review` records and `pending` media as labelled **development placeholders**, adds a yellow banner, `noindex` everywhere and an empty sitemap.

## Content rules (do not break)

- **Never invent facts**: no specs, clients, projects, certifications, statistics, testimonials, dates or contact details. Missing → `docs/COMPANY_FACTS_TO_CONFIRM.md`, keep the record at `status: review`.
- Relationships are authored once: `Attraction.suitableVenues` (Solutions derive from it), `Project.attractions` / `Project.venues` (attraction "installed at", filters and venue projects derive from them). Never add a second list on the other side.
- Every attraction has exactly one `primaryCategory`. Product slugs are flat (`/attractions/{slug}/`); `category` is reserved.
- Only `depth: case-study` projects have a `slug` and page. Showcase entries never get a URL.
- Media is canonical in `src/content/media/`. Reference media by ID; never duplicate a media record.
- Company facts live in `src/config/company.ts` with a `confirmed` flag. The office address and map pin render publicly while `contact.location.verified` is true (cross-checked against the company's own published map link). Capability/facility facts live only in capability records; credentials only in credential records.
- Every page's copy and every claim, with its source, is listed in `docs/CONTENT_REVIEW.md`. Update it when copy or facts change.
- Retiring a product: set `operationalStatus: retired`, optionally `successor`, add the old URL to `src/config/redirects.ts`. Never reuse a retired slug.

See `docs/CONTENT_GUIDE.md` (how to add things) and `docs/MEDIA_GUIDE.md` (assets).

## Design rules

- Tokens in `src/styles/global.css` `@theme` (from the logo; see `docs/DESIGN_SYSTEM.md`). Brand blue/violet/magenta are for graphics and large display accents only — use `text-blue-700` / `text-brand-deep` for text on light surfaces.
- The logo is used unaltered (`Logo.astro`) on light surfaces only; on dark surfaces use `<Logo plate />`. Do not recolour or redraw it.
- One `<h1>` per page; sections are `aria-labelledby` their heading.
- Every media slot has a fixed aspect ratio (`MediaFrame`) so real assets cause no layout shift.
- Motion lives only in `src/scripts/motion.ts` via `data-*` hooks; nothing may depend on JS to be visible, and nothing runs under `prefers-reduced-motion`.
- No decorative-only controls. Showcase images open the `Lightbox` only when JS is present.

## Enquiries and analytics

- `src/lib/enquiry.ts` composes drafts and mailto / Gmail / Outlook links. Context travels in `?intent=&source=&item=` — slugs and enums only, never personal data. Link to Contact with `contactHref()`.
- Every contact CTA carries `data-track="<event>"`; `src/scripts/analytics.ts` is the only provider integration. Tracking stays off until `analytics.approved` is true **and** the Privacy page is approved (`src/pages/privacy.astro` `legalApproved`).

## Gotchas

- Astro 7's compiler and Markdown engine ship native `.node` binaries; on this Windows machine Smart App Control blocks them. `npm run wasm-fallback` installs the WASM builds without touching `package.json` (Cloudflare's Linux builders use the native ones).
- `_redirects` is generated after the build and only contains rules whose destination was built (a `#fragment` or `:splat` is allowed; only the path is checked). Static rules are sorted before dynamic ones. Cloudflare `_redirects` cannot return 410.
- Cloudflare's local runtime (`wrangler pages dev`) is blocked on this machine too (`spawn UNKNOWN`); use `npm run check:redirects` instead.
- The `AGENTS.md`/Next.js guidance in the sibling Saptaveda project does **not** apply here.
