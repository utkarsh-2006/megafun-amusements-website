# Mega Fun Amusements — website

Static website for Mega Fun Amusements. Navigation: Home · Attractions · Turnkey & Engineering · Updates · Contact. The Contact page has an office map and a guided draft-email builder. Built with Astro 7 and Tailwind CSS v4, and deployed to Cloudflare Pages from GitHub.

## Quick start

```bash
nvm use            # Node 22 (see .nvmrc; Astro requires ≥ 22.23.4)
npm ci
npm run dev        # http://localhost:4321, in preview mode with drafts and placeholders visible
```

If Windows blocks Astro's native binaries ("An Application Control policy has blocked this file"), run `npm run wasm-fallback` once after `npm ci`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server in preview mode |
| `npm run build` | Production build to `dist/`. Only approved content is included. |
| `npm run build:preview` | Build with draft content visible (preview banner, noindex) |
| `npm run build:thin` / `build:full` | Template QA against generated fixture libraries |
| `npm run check` | Type check |
| `npm test` | Unit tests for publication gates, relationships and enquiry links |
| `npm run verify` | check + test + build |

## Where things live

```
src/config/        company facts, gates (thresholds), analytics, redirects, build mode
src/content/       canonical records: attractions, categories, venues, projects, capabilities,
                   credentials, news, media
src/lib/           resolve.ts (gates + relationships), content.ts (Astro loader), enquiry.ts
src/components/    Header, Footer, MediaFrame, cards, ProcessTrack, Lightbox, EnquiryClose, …
src/pages/         routes (gated routes use [...index].astro)
src/scripts/       motion (GSAP), analytics adapter, contact builder
docs/              architecture, design system, content, media, facts to confirm, deployment
```

## Current state

All product, venue and capability records come from the existing website and sit at `status: review`, with media `rights: pending`. A production build therefore publishes Home (with the company section), Attractions, Turnkey & Engineering and Updates (each with an empty state), Contact (with the office map), Privacy and the 404 page. Content appears automatically once its records are approved and its media is supplied. To review every claim and its source, see `docs/CONTENT_REVIEW.md`; for what is outstanding, see `docs/COMPANY_FACTS_TO_CONFIRM.md` and `docs/MEDIA_GUIDE.md`.

More detail: [CLAUDE.md](CLAUDE.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
