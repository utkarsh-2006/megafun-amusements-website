# Deployment — GitHub → Cloudflare Pages

Checked against Cloudflare's docs on 17 Nov 2026 (developers.cloudflare.com/pages: Astro guide, build image, limits, redirects, preview deployments).

## Cloudflare Pages project settings

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | from `.nvmrc` (`22`). The v3 build image defaults to 22.23.4; Astro needs ≥ 22.23.4. You can also set `NODE_VERSION`. The v3 image does **not** read `package.json` `engines`. |
| Functions | `functions/api/enquiry.ts`, built automatically by Pages from the `functions/` folder (the enquiry endpoint only). Everything else is static. |
| Adapter | none (`@astrojs/cloudflare` is only for SSR) |

## Environment variables

| Variable | Production | Preview | Notes |
|---|---|---|---|
| `SITE_MODE` | unset (or `production`) | unset | Preview mode is automatic on any branch other than `main` (from Cloudflare's `CF_PAGES_BRANCH`). `SITE_MODE=production` forces a clean build. |
| `PRODUCTION_BRANCH` | — | — | Only if the production branch is not `main` |
| `PUBLIC_ANALYTICS_PROVIDER` / `PUBLIC_ANALYTICS_DOMAIN` | after approval | unset | Tracking also requires `analytics.approved = true` in code |

| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key | Turnstile test key `1x00000000000000000000AA` (always passes) | Build-time, public |
| `TURNSTILE_SECRET_KEY` | **secret** | test secret `1x0000000000000000000000000000000AA` | Runtime (Function) |
| `RESEND_API_KEY` | **secret** | a separate Resend key, or leave unset (the card then shows "unavailable") | Runtime (Function) |
| `ENQUIRY_TO` | company inbox | a test inbox | Runtime (Function) |
| `ENQUIRY_FROM` | e.g. `Mega Fun Website <enquiries@megafunamusements.com>` (domain verified in Resend) | same | Runtime (Function) |

`CONTENT_ROOT` (fixture libraries) must never be set on Cloudflare. Secrets are set in the Cloudflare dashboard only; never commit them (`.env*` is git-ignored).

### Enquiry email setup (one-time)

1. **Resend:** add and verify the sending domain (DNS records for `megafunamusements.com`). Create an API key limited to sending. Set `RESEND_API_KEY`, `ENQUIRY_FROM` and `ENQUIRY_TO`.
2. **Turnstile:** create a widget for the production hostname(s) in the Cloudflare dashboard. Set `PUBLIC_TURNSTILE_SITE_KEY` (Production, build variable) and `TURNSTILE_SECRET_KEY` (secret).
3. Redeploy. Send a test enquiry from `/contact/`. Until all four runtime values exist, the card responds "Sending from this page isn't available right now…" and keeps the visitor's input; WhatsApp, email and phone still work.

## What each deployment shows

- **Production (`main`)**: only `published` records with `approved`, in-term media. Robots allowed, sitemap populated, `_redirects` emitted.
- **Preview (other branches and PRs)**: drafts and placeholders visible, a yellow preview banner, `noindex` on every page, `robots.txt` set to `Disallow: /`, and an empty sitemap. Cloudflare also sends `X-Robots-Tag: noindex` on `*.pages.dev` previews. Preview URLs are public; protect them with Cloudflare Access if needed.

Review flow: content branch → PR → Cloudflare preview URL → owner review → merge to `main` → production.

## Static files

- `public/_headers`: security headers and immutable caching for `/_astro/*`.
- `dist/_redirects`: generated at build time from `src/config/redirects.ts`. It contains only rules whose destination exists. Limits are 2,000 static plus 100 dynamic rules. Cloudflare `_redirects` supports 301/302/303/307/308 only (no 410). Obsolete URLs without a successor return the custom 404.
- `dist/404.html`: served by Pages for unknown paths.
- `sitemap.xml` and `robots.txt` are generated.

## Limits to watch

20,000 files per site (Free plan) and 25 MiB per file. Astro generates several sizes per image, so check `dist/` file counts after importing the full media library. Keep video on an external host.

## Domain

Add `www.megafunamusements.com` (and the apex, redirecting to `www`) as custom domains in the Pages project. Confirm the canonical host first (`siteUrl` in `src/config/build.ts`). Old-site URLs are redirected by `_redirects` once their destination pages are live.

## First-time setup

1. Create the GitHub repository and push `main`.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose the repo.
3. Enter the settings above. Deploy.
4. Check the `*.pages.dev` URL. Add the custom domains. Re-check canonical, `robots.txt`, `sitemap.xml` and legacy redirects (`/company/` → `/#company`, `/company/news/x/` → `/updates/x/`, `/mapview/x` → `/contact/#office`).

Before deploying, `npm run check:redirects` simulates the generated rules locally. It is a check of our rules file, not of Cloudflare. Verify the real behaviour on the first preview deployment.

## Note: Pages vs Workers

Cloudflare's Pages documentation now says to "Start new projects with Workers" (static assets). The brief specifies Pages, and Pages builds and serves this site as specified. Because the output is a plain static `dist/`, moving to Workers static assets later needs no site changes, only a Wrangler config. This is an owner decision.

## Local troubleshooting (Windows)

If `astro build` fails with "An Application Control policy has blocked this file", run `npm run wasm-fallback`. It installs WebAssembly builds of Astro's compiler and Markdown engine without changing `package.json`.
