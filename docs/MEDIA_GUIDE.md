# Media guide

Media records are canonical (brief §5.2). A product photo belongs to one record in `src/content/media/`. Attractions, projects and articles reference it by ID and never copy it.

## Adding a supplied asset

1. **Image**: put the optimised original (JPEG/PNG/WebP, long edge ≤ 3000 px) at `src/assets/media/<area>/<file>`. Astro generates responsive WebP sizes at build time.
2. **Video**: upload it to the approved external host (YouTube or Vimeo). Never commit video files; the build rejects a video with `file`.
3. **Document** (PDF): put it in `public/documents/<file>.pdf`.
4. Edit the existing media record (e.g. `src/content/media/attractions/mirror-maze-still-1.yaml`) or create one:

```yaml
kind: image                     # image | video | document
file: attractions/mirror-maze-01.jpg      # images: under src/assets/media/; documents: under public/documents/
# external: { provider: youtube, id: "VIDEO_ID" }   # videos only
alt: "Guests walking through the mirror maze corridors"   # required for informative images
decorative: false
caption: "Mirror Maze installation"
credit: "Mega Fun Amusements"
source: "Company media library"
rights: approved                # pending | approved | restricted | expired
rightsConfirmedBy: "Name / role who confirmed usage rights"   # required when approved
rightsConfirmedOn: 2026-11-20
expires: 2028-01-01             # if the licence or release expires
# videos: poster: <image media id>, captionsAvailable: true, textAlternative: "…"
```

5. Remove the `awaiting` line once the file exists. Run `npm run verify`.

The attraction page and its card switch from the placeholder to the real asset with no layout change, because every slot has a fixed aspect ratio. Recommended crops: attraction lead 4:3, card 4:3, hero tiles 4:5 and 3:4, project 3:2, case-study hero 21:9, news cover 16:9. Keep the subject centred, since frames crop with `object-cover`.

## Placeholders

A media record with `rights: pending` and no file renders as a hatched **"Development placeholder"** panel showing its `awaiting` text, and only in preview builds. Production builds never include pending media. An `approved` record without a file fails the build. Stock or generated images must never be recorded as `approved` evidence of Mega Fun products or installations.

## Expiry

When `expires` passes, the asset disappears at the next build. Any page that then falls below its gate (for example an attraction with fewer than 2 stills) is withheld automatically, and the build log lists it.

## Inventory: awaited assets (as of 17 November 2026)

None of the company's media library has been supplied yet. The existing website has product tiles and unlabelled gallery images (hosted by NowFloats/withfloats). Their rights, resolution and subjects must be confirmed before use. They have **not** been downloaded.

| Needed for | Records awaiting | Minimum to publish |
|---|---|---|
| 5D–9D Motion Theatre | `motion-theatre-still-1/2` | 2 stills, or 1 video + poster |
| 9D VR Simulator — 6 Seats | `9d-vr-6-seater-still-1/2` | same |
| 9D VR Egg — 2 Seats | `9d-vr-egg-2-seater-still-1/2` | same |
| The Walk VR | `the-walk-vr-still-1/2` | same |
| Hunter Shooting Simulator | `hunter-shooting-simulator-still-1/2` | same |
| Haunted House | `haunted-house-still-1/2` | same |
| Jungle Safari | `jungle-safari-still-1/2` | same |
| Mirror Maze | `mirror-maze-still-1/2` | same |
| Tilt Room | `tilt-room-still-1/2` | same |
| Kaleidoscope Illusion | `kaleidoscope-illusion-still-1/2` | same |
| Infinite Tunnel | `infinite-tunnel-still-1/2` | same |
| Infinite Room | `infinite-room-still-1/2` | same |
| Infinite Hexagon | `infinite-hexagon-still-1/2` | same |
| Head on a Platter | `head-on-a-platter-still-1/2` | same |
| Face Swap Illusion | `face-swap-illusion-still-1/2` | same |
| Ames Room | `ames-room-still-1/2` | same |
| Beuchet Chair | `beuchet-chair-still-1/2` | same |
| Projects / Selected Work | none yet | 1 approved image per showcase; 3 for a case study |
| Capability evidence (FRP facility, engineering) | none yet | optional evidence images |
| Capability profile PDF | none | 1 approved PDF, then set `company.capabilityProfileMediaId` |
| News covers | none | 1 approved image per article |
| Demonstration videos | none | external host + poster + text alternative |
| Updates gallery | `gallery-01` … `gallery-10` (`src/content/media/gallery/`): the 10 unlabelled images on the old site's gallery page | Subject, caption and usage rights per image; then `file` + `rights: approved` |

Brochures, historical photographs and installation photographs: awaited. Record each one as a media record when supplied.
