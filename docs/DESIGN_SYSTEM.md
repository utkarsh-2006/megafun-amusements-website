# Design system — "Premium Playful Engineering"

## Logo

- Source files (workspace root): `logo no background.png` (3808×3696 RGBA) and `logo with bg.jpg`.
- Web asset: `src/assets/brand/megafun-logo.png`. This is the transparent version, trimmed to its visible bounds (3477×1150) and resized to 1600 px wide. Nothing else is changed.
- The logo's purple wordmark is designed for light backgrounds, so the site header and footer are light. On dark panels use `<Logo plate />` (a white plate). Never recolour, outline or redraw it.
- Favicon and app icons (`public/favicon.png`, `apple-touch-icon.png`, `icon-512.png`) are generated from the owner-supplied `favicon.png` at the project root (the swirl mark, centred on white).
- `public/og-default.png` is the full logo centred on the paper colour (1200×630).

## Colour

Sampled from the logo by averaging saturated pixels per hue band:

| Token | Hex | Sampled from | Use |
|---|---|---|---|
| `brand-blue` | `#1983f1` | "MegaFun" wordmark | Graphics, ribbon, focus ring, large accents |
| `brand-violet` | `#a352ed` | swirl underside | Graphics, bullets |
| `brand-magenta` | `#e332f1` | swirl | Graphics, ribbon end |
| `brand-deep` | `#3f057b` | "Amusements" | Primary buttons, text accents (AA on light) |
| `blue-700` | `#0a62c2` | derived | Links and eyebrows on light (≈5.3:1 on paper) |
| `blue-300` | `#7cbcff` | derived | Links and eyebrows on dark |
| `ink-900` / `ink-950` | `#160f2b` / `#0e0a1c` | derived (deep purple-black) | Dark "stage" panels |
| `paper` | `#f6f5fa` | — | Page background |
| `mist` / `line` / `line-strong` | `#eeecf5` / `#e3dfee` / `#c9c2dc` | — | Surfaces and rules |
| `text` / `muted` | `#150e29` / `#595270` | — | Body text (muted ≈7:1 on paper) |
| `on-dark` / `on-dark-muted` | `#f4f2fb` / `#b4adca` | — | Text on stage panels |

Rules: brand blue, violet and magenta fail text contrast on light surfaces, so use them for graphics only. The three-colour gradient is reserved for the **track ribbon** and the single accent word in the hero. There are no gradients elsewhere.

## Type

- **Display**: Bricolage Grotesque Variable, with optical sizing and tight tracking. Its slightly quirky letterforms carry the "playful" side.
- **Text**: Instrument Sans Variable, 17 px base, 1.6 line height.
- Scale (fluid `clamp`): `.t-hero` (to 102 px), `.t-display` (to 74 px), `.t-h2` (to 52 px), `.t-h3` (to 28 px), `.t-lead` (to 22 px).
- `.eyebrow`: 12.5 px uppercase with tracking, a leading hairline and an optional section index ("01"). This is the engineering-drawing cue.

## Layout

- `.wrap`: max 1360 px, gutters 20 / 32 / 48 px.
- 12-column grids, with an asymmetric 5/7 or 4/8 split for text against content.
- **Stage**: an inset dark panel with 28 px radius, used for the hero, Selected Work, the enquiry close and the 404. It alternates with light sections to give the page rhythm.
- Section padding 96 to 144 px on desktop. Each section opens with an indexed eyebrow and a heading.

## Signature elements

- **Track ribbon** (`Ribbon.astro`): a ride-track sweep that resolves into the logo's swirl, with a dashed "rail" alongside. It draws in on load in the hero and on the 404.
- **Process track** (`ProcessTrack.astro`): numbered stage nodes on a rail that fills with scroll progress. It runs horizontally on desktop and vertically on mobile.
- **Spec sheet** (`CapabilityList`, attraction specifications): definition-list rows with hairlines, plus a delivery-model tag (In-house / Partner-delivered / Externally sourced).
- **Category index rows** (home): oversized names with a thumbnail strip that fans out on hover.

## Components

`Header` (sticky; popover mobile menu that works without JS), `Footer`, `Logo`, `SectionHead`, `PageHeader`, `Breadcrumbs`, `MediaFrame`, `VideoEmbed`, `AttractionCard`, `ProjectCard`, `NewsCard`, `ProcessTrack`, `CapabilityList`, `ModelTag`, `EnquiryClose`, `EmailLink`, `Lightbox`, `DraftFlag`, `ProjectsArchive`, `Ribbon`, `OfficeMap`. `ProcessTrack compact` shows stage names only (the Home preview).

Buttons: `.btn` plus `.btn-primary` (deep purple), `.btn-light`, `.btn-outline` and `.btn-ghost-dark`. All are at least 48 px high.

## Motion (`src/scripts/motion.ts`)

| Hook | Effect |
|---|---|
| `data-hero-line` | Staggered rise of the hero and page-header lines on load |
| `data-draw` | Ribbon stroke draws on load (2.2 s) |
| `data-draw-scroll` / `data-progress` | Scrubbed with section scroll |
| `data-parallax="0.1"` | Subtle drift |
| `data-reveal` | Batched fade and rise once, when scrolled into view |

- Reduced motion: GSAP is never downloaded and content renders statically.
- No JS: nothing is hidden. The `motion-ok` class that hides reveal targets is added only when motion will run, and it is removed after 2.5 s if `motion.ts` fails to load.

## Responsive

Designed and checked at 390 px and 1440 px. The rules for every breakpoint: the mobile menu is a full-screen sheet; the hero stacks media below the copy; grids collapse 3 → 2 → 1; the process track turns vertical; the contact draft panel moves below the form. Nothing scrolls horizontally (checked at 390 px).
