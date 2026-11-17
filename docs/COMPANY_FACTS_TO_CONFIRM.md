# Company facts and decisions to confirm

Nothing below is published in production until confirmed, except the contact email and phone. Those are the company's currently published channels and must work from day one. Sources: brief v0.3 §9 and the existing site www.megafunamusements.com (read 17 Nov 2026).

## Contact and identity (`src/config/company.ts`)

| Item | Current value / status | Action |
|---|---|---|
| Enquiry email | `megafunamusements@gmail.com` (from existing site; **rendered**) | Confirm it is the shared enquiry mailbox. A domain address (e.g. enquiries@…) is recommended. |
| Phone | +91 95662 01124 (existing site; **rendered**). The site also lists 080 4803 4870. | Confirm the official number and which one to publish |
| Address | #13D, 4th Street, Reddipalayam Road, Mogappair Industrial Estate, Chennai 600037 (**rendered** with map) | Cross-checked: the site's own map pin (13.086445, 80.167355) reverse-geocodes to "Mogappair West Estate 4th Street", 600037. Confirm the exact wording to publish. |
| Hours | — | **Decided 18 Nov 2026:** working hours are not published anywhere. |
| WhatsApp | +91 95662 01124 (wa.me/919566201124) | **Confirmed 18 Nov 2026** as an official contact number; shown publicly with "WhatsApp Us". |
| Founded | 2010 | **Confirmed 18 Nov 2026**; shown on the homepage. |
| Company description and range | Owner's refined draft in `src/config/homepage.ts` (rendered) | Approve; claims C1–C11 in CONTENT_REVIEW.md §7 |
| Hero headline and lead | Working copy | Approve wording |
| Markets / geographies | Unknown | Supply |
| People / team | None | Supply only if approved for publication |
| Social profiles | None found | Supply official links, if any |
| "What happens next" after an enquiry | Hidden | Confirm the response process |
| Canonical domain | `https://www.megafunamusements.com` (`src/config/build.ts`) | Confirm `www` vs apex |
| Favicon / app icon | Generated from the owner-supplied `favicon.png` (18 Nov 2026) | Done |

## Products (`src/content/attractions/`, all `status: review`)

For every attraction: confirm it is **currently offered**, its name, summary, guest-experience text, features, variants, specifications, suitable venue types, and supply media (see MEDIA_GUIDE).

Specific questions:
- **5D Theatre** and **5D/6D/7D/9D Theatres** are two near-identical pages on the old site. They are merged here as "5D–9D Motion Theatre" with variants 5D, 6D, 7D and 9D. Is that right?
- **9D VR 6-Seater** and **9D VR Egg 2-Seater** both show "Availability: False" on the old site. Are they active? The egg model's text says "six seats".
- **Illusion attractions** (Tilt Room, Kaleidoscope, Infinite Tunnel/Room/Hexagon, Head on a Platter, Face Swap, Ames Room, Beuchet Chair) appear only as "updates" on the old site. Are they products Mega Fun builds and supplies?
- "Motion-based attractions" (hydraulic motion platforms, flying theatres) and "VR simulators" are named in the old About text, but no product pages exist. Should they be added?
- Specifications currently recorded (all `verified: false`): Haunted House 600 sq ft, sensors + PLC; Jungle Safari 800 sq ft+; Mirror Maze min. 600 sq ft, below 1 kW. Confirm them, and confirm which product the "3-phase 415 V, 6 kVA" line belongs to.
- Venue suitability for each attraction is blank. This is needed for any Solutions page.

## Categories (`src/content/categories/`, `review`)

**Decided 18 Nov 2026:** mirror mazes, infinite rooms and infinity tunnels are Illusion experiences. Final groups: Illusion experiences (10), Virtual reality simulators (3), Themed walkthroughs (2), Motion theatres (1), Interactive games (1). No empty category is published. Categories with fewer than 3 attractions appear only as sections on /attractions/.

## Venue types (`src/content/venues/`, `review`)

Amusement & theme parks, Malls & multiplexes, Family entertainment centres. The operator-needs text is general industry context. Approve it, and supply **verified planning points** (space, power, capacity, operations) and/or approved related projects.

## Capabilities (`src/content/capabilities/`, `review`, `deliveryModelConfirmed: false`)

| Record | Claimed on existing site | Confirm |
|---|---|---|
| Delivery stages: Concept, Attraction selection, Design & engineering, Manufacturing, Installation, Testing & commissioning | "from concept development … to testing and commissioning" | Which stages are in-house, partner-delivered or externally sourced |
| Engineering disciplines (hydraulics, pneumatics, mechatronics, electronics, automation, control systems, animatronics) | "in-house technical expertise and R&D" | In-house? Evidence? |
| Sensor and PLC show control | product pages | In-house? |
| FRP moulding facility | "in-house FRP moulding facility" | Location, scope, evidence photos |

Also supply quality, safety, warranty and after-sales information. These sections stay hidden until documents support them.

## Evidence not yet available

Projects and installations (with client disclosure permission), credentials and certifications (issuer, validity, permission to display), news articles, the capability profile PDF, and the full media library and its rights.

## Enquiry sending (owner decision, 18 Nov 2026)

The Contact card now sends enquiries through a Cloudflare Pages Function, Turnstile and Resend. **To do before it works in production:** verify the sending domain in Resend; create the Resend API key and Turnstile widget; set the five environment values (see DEPLOYMENT.md); confirm the receiving inbox (`ENQUIRY_TO`). Note: the card collects a name and an optional phone number only, with no email address, so enquiries sent without a phone number cannot be answered. Consider making the phone number required, or adding an email field.

## Legal / analytics

- The Privacy page (`src/pages/privacy.astro`) describes only how the site works. It needs company and legal review, then set `legalApproved = true`.
- Analytics provider: **Plausible** is recommended (cookieless, custom events, works with static Cloudflare hosting). Approve the provider, add it to Privacy, then set `analytics.approved = true` and the `PUBLIC_ANALYTICS_*` variables.
- News owner and publishing cadence.

## Structural decisions to sign off (brief §9.2)

- The numeric thresholds in `src/config/gates.ts` (the v0.3 defaults, unchanged).
- English only. The hosted-form review trigger (§7.5).
- **Interpretation:** venue pages publish only when the Solutions index is live (at least 2 passing).
- **Owner decision, 17 Nov 2026:** a fixed five-item navigation (Home, Attractions, Turnkey & Engineering, Updates, Contact). The Company page merged into Home. News is now `/updates/`. Credentials moved into Turnkey. This supersedes brief §3 navigation gates for those items.
- **Redirects:** old product URLs 301 to the product page, or to `/attractions/` while that product has no page. Unpublished-section URLs (gallery, updates) are skipped until the destination exists.
- **Hosting:** Cloudflare's docs now recommend Workers static assets for new projects. This static `dist/` deploys to either; Pages is used here as the brief specifies (see DEPLOYMENT.md).
