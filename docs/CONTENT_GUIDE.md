# Content guide

Every record is a file. An entry's **ID is its file name**; sub-folders are for organisation only. Add or change files, then run `npm run verify`. The build fails on broken references.

## Statuses

| Field | Values | Effect |
|---|---|---|
| `status` (editorial) | `draft`, `review`, `published`, `archived` | Only `published` renders in production. `draft` and `review` show in preview builds with a flag. |
| `operationalStatus` (attractions) | `active`, `temporarily_unavailable`, `retired` | Only `active` counts toward category and venue gates |
| `rights` (media) | `pending`, `approved`, `restricted`, `expired` | Only `approved` and not past `expires` renders in production |

Publishing checklist (brief §8.1): a person verifies the facts, permissions, image rights, spelling, dates and contact details, then sets `status: published` or `rights: approved` and commits. Open a preview branch first if templates or shared content change.

## Add an attraction — `src/content/attractions/<id>.yaml`

```yaml
name: "Mirror Maze"
slug: mirror-maze               # flat URL /attractions/mirror-maze/ — never reuse a retired slug
operationalStatus: active
status: review                  # → published once approved
primaryCategory: illusion-experiences
secondaryCategories: [themed-walkthroughs]
summary: "One line, what it is."
experience: ["What guests experience and how it operates."]
features: ["Confirmed feature"]
variants: [{ name: "5D" }]
suitableVenues: [malls-multiplexes]   # canonical: Solution pages derive from this
media: [mirror-maze-still-1, mirror-maze-still-2]
specifications:
  - { label: "Minimum area", value: "600 sq ft", verified: true }   # unverified rows show only in preview
related: []                     # optional; same-category attractions fill the rest
seo: { title: "", description: "" }
sourceNote: "Where this came from (never rendered)"
```

An attraction needs **2 approved stills**, or **1 approved video plus 1 still or poster**, before it gets a page.

## Add a category — `src/content/categories/<id>.yaml`

`name`, `slug`, `summary`, `description`, `order`, `status`. Membership is never listed here. It comes from attractions' `primaryCategory` and `secondaryCategories`.

## Add a venue type / solution — `src/content/venues/<id>.yaml`

`name`, `slug`, `summary`, `context[]`, `needs[{title,text}]`, `planning[{title,text,verified}]`, `combinations[{title,text,attractions[],validated}]`, `order`, `status`. Never list relevant attractions here.

## Add a project — `src/content/projects/<id>.md`

```markdown
---
title: "…"
depth: showcase            # or case-study (then add slug, brief, scope, delivery)
status: review
disclosureApproved: false  # client/location/identity cleared for publication
summary: "…"
venues: [family-entertainment-centres]
attractions: [mirror-maze]
client: "…"                # only if disclosed
location: "…"
year: 2025
media: [proj-x-1, proj-x-2, proj-x-3]
# case-study only:
slug: proj-x
brief: "What the venue needed."
scope: ["Supplied …"]
delivery: [{ stage: "Installation", detail: "…", model: in_house }]
outcome: "Only a documented, approved outcome."
---
Optional extra narrative in Markdown.
```

Showcase entries never get a URL. Do not inflate a showcase entry into a case study.

## Add a company update — `src/content/updates/<slug>.md`

```markdown
---
title: "Descriptive title"
date: 2026-11-17
summary: "One or two sentences."
type: "Product update"       # optional
cover: news-slug-cover       # approved image media ID (required)
media: []
relatedAttractions: []
relatedProjects: []
status: review
---
Opening paragraph…

## Descriptive heading
…
```

The file name becomes the URL (`/updates/<slug>/`). Articles dated in the future wait until that date in production builds. No component changes are needed.

**Workflow for a new update.** The owner supplies the text, the date and the photographs. Then:
1. Put each photo in `src/assets/media/updates/<slug>-<n>.jpg` and create a media record for each (`src/content/media/updates/<slug>-<n>.yaml`, with `rights: approved` and `rightsConfirmedBy` once the owner confirms usage rights).
2. Create `src/content/updates/<slug>.md` with `cover` set to the first media ID, `media` listing the rest, and `status: review`. Never invent dates or facts.
3. Open a branch and PR. The Cloudflare preview shows the article with a "Draft" flag. When the owner approves, set `status: published`, merge to `main`, and Cloudflare publishes it.
4. Add the article to `docs/CONTENT_REVIEW.md` §6.

`/updates/` always exists. With no published articles it shows an empty state. The homepage "Latest updates" section appears only when ≥2 articles fall within 180 days and the newest is ≤90 days old.

## Capabilities — `src/content/capabilities/<id>.yaml`

`name`, `kind` (`delivery_stage` | `technical` | `facility` | `service`), `deliveryModel` (`in_house` | `partner` | `external`), `deliveryModelConfirmed`, `description`, `evidence[]` (media IDs), `order`, `status`. Delivery stages render in `order` on Home and Turnkey. Only add stages the company performs or is authorised to deliver.

## Credentials — `src/content/credentials/<id>.yaml`

`name`, `issuer`, `type`, `identifier?`, `issued?`, `expires?`, `document?` (media ID), `displayPermission`, `verifiedOn`, `status`. Expired credentials disappear automatically.

## Homepage copy — `src/config/homepage.ts`

The H1, SEO title and description, and the About, Portfolio, Engineering, Turnkey and Closing sections. Edit the text directly. Set `approved: true` once you have reviewed it; that removes the preview flags. Portfolio groups can list `categories` so each row links to and shows thumbnails from published attraction groups.

## Gallery — media records with `gallery: true`

Add `gallery: true` (and optionally `galleryOrder: <n>`) to an image media record. It appears on `/updates/#gallery` once `rights: approved`. Product photos stay on their attraction; set `gallery: true` on the same record to also feature it in the gallery, without duplicating the record.

## Company facts — `src/config/company.ts`

The company introduction appears only on Home (`#company`): the `descriptor` as its heading, the `about` paragraphs, and facts. Do not repeat it on other pages. The office address and map pin (`contact.address`, `contact.location`) feed the footer, Contact and the map.

Every fact has `confirmed`. Set it to `true` only after the company confirms it. Unconfirmed facts show only in preview builds. Contact email and phone are the exception: they always render, because they are the company's currently published channels.

## Contextual enquiry links

Use `contactHref({ intent, source, item })` from `src/lib/enquiry.ts`. `item` must be a slug. Never put names, emails or free text in URLs.

## Retire or rename

1. Set `operationalStatus: retired`, and `successor` if a confirmed replacement exists. Set `keepRetiredPage: true` only if the page has history or inbound value.
2. Add `{ from: '/attractions/old-slug/', to: ['/attractions/new-slug/', '/attractions/'] }` to `src/config/redirects.ts`.
3. Never reuse the old slug.
