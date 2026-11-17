# Content review

Every piece of copy and every factual claim on the site, with where it lives, where it came from and its approval state. It is written for the owner's personal review. Snapshot: 18 November 2026 (fourth pass: owner decisions on working hours, WhatsApp, establishment year and illusion categorisation).

**Legend**
- ✅ **Verified**: cross-checked against a primary source (still yours to approve).
- ⚠️ **Awaiting verification**: from the existing website or your supplied draft, not yet confirmed.
- ✍️ **Working copy**: written for this site (headings, interface text). It contains no new facts, but needs your approval of wording.
- 🚫 **Not available**: no source exists; the section stays hidden.

**Sources**
- **[S1]** Existing site www.megafunamusements.com: home and About text, product pages, updates list (read 17 Nov 2026).
- **[S2]** The existing site's map link `/mapview/13-086445395696511/80-16735468059778`.
- **[S3]** OpenStreetMap Nominatim reverse geocode of the [S2] coordinates.
- **[S4]** Existing site WhatsApp widget: `<span id="whatsapp-number">919566201124</span>` (home page HTML).
- **[D]** Owner decisions, 18 Nov 2026: no working hours; WhatsApp +91 95662 01124 official; established 2010; mirror mazes, infinite rooms and infinity tunnels are Illusion Experiences.
- **[D]** Owner decisions, 18 Nov 2026: no working hours; WhatsApp +91 95662 01124 official; established 2010; mirror mazes, infinite rooms and infinity tunnels are Illusion Experiences.
- **[O]** Your refined company draft, supplied 17 Nov 2026. It is based on [S1].
- **[B]** Project brief v0.3.

**Where to edit**
| What | File |
|---|---|
| Homepage company copy, H1, SEO title and description | `src/config/homepage.ts` (`approved: false` → `true` removes the preview flags) |
| Contact details, address, map pin, WhatsApp, founding year | `src/config/company.ts` (`confirmed: true` per fact) |
| Products, categories, venue types, capabilities | `src/content/**` (`status: published`) |
| Gallery images | `src/content/media/**` (`gallery: true`, `rights: approved`) |
| Other page headings and leads | the page files named below |

**What renders in production today:** Home (all company copy, including Established 2010), Attractions (empty state), Turnkey & Engineering (empty state), Updates (empty updates and gallery states), Contact (email, phone, WhatsApp, address, map, enquiry), Privacy. Preview builds also show the 17 products, categories, venue types, capability records and gallery placeholders. Working hours are not shown anywhere [D].

---

## 1. SEO titles, meta descriptions and headings (extracted from the built pages)

| Page (URL) | SEO title | Meta description | H1 | H2 headings |
|---|---|---|---|---|
| `/` | Amusement Attractions Manufacturer & Turnkey Projects \| Mega Fun Amusements | Chennai-based amusement attractions manufacturer: immersive theatres, virtual reality attractions and amusement equipment, with turnkey solutions from concept to commissioning. | Amusement Attractions Manufacturer \| Innovative Entertainment Solutions \| Turnkey Projects | About Mega Fun Amusements · Our Attraction Portfolio · Planned around the venue · Engineering Expertise & Innovation · Complete Turnkey Amusement Solutions · Creating Memorable Entertainment Experiences · Have a venue or project in mind? |
| `/attractions/` | Attractions \| Mega Fun Amusements | The attractions Mega Fun Amusements manufactures and supplies, grouped by format, with details for each attraction. | Attractions built around the guest experience | Immersive Theatre Systems · Virtual Reality Attractions · Illusion Experiences · Themed Indoor Attractions · Interactive Entertainment Machines · Not sure which attraction fits? |
| `/attractions/category/illusion-experiences/` | Illusion Experiences \| Mega Fun Amusements | Walk-in illusion rooms and photo installations that play with perspective, reflection and scale. | Illusion Experiences | Ames Room · Beuchet Chair · Face Swap Illusion · Head on a Platter · Infinite Hexagon · Infinite Room · Infinite Tunnel · Kaleidoscope Illusion · Mirror Maze · Tilt Room · Have a venue or project in mind? |
| `/attractions/mirror-maze/` | Mirror Maze \| Mega Fun Amusements | A walk-through maze where mirrors multiply every path and reflection. | Mirror Maze | What guests experience · Planning and installation · Related attractions · Planning a venue with Mirror Maze? |
| `/turnkey-engineering/` | Turnkey & Engineering \| Mega Fun Amusements | How Mega Fun Amusements delivers attraction projects, from concept and attraction selection to manufacturing, installation and commissioning. | A project partner from first idea to opening day | How a project runs · Technical capabilities · Where it’s made · Have a venue or project in mind? |
| `/updates/` | Updates & Gallery \| Mega Fun Amusements | Company updates, announcements and a photo gallery from Mega Fun Amusements. | Company updates | No updates published yet · Gallery · Have a venue or project in mind? |
| `/contact/` | Contact \| Mega Fun Amusements | Contact Mega Fun Amusements: send an enquiry from this page, email, phone or WhatsApp us, and find our Chennai office. | Discuss a project, or just get in touch | Your enquiry · Office location |
| `/privacy/` | Privacy \| Mega Fun Amusements | How the Mega Fun Amusements website handles information. | Privacy | Enquiries sent from the contact page · WhatsApp · Cookies · Analytics · Videos · Map · Hosting · Questions |
| `/(404)` | Page not found \| Mega Fun Amusements | The page you were looking for could not be found. | This ride doesn’t exist. |  |


Product, category and article pages take their title and description from each record (`seo` fields, otherwise name + summary).

---

## 2. Homepage `/` — body copy (`src/config/homepage.ts`)

The supplied draft is used as written. Its six parts map to these sections:

| # | Section | Copy | Status |
|---|---|---|---|
| 1 | Hero — H1 | "Amusement Attractions Manufacturer \| Innovative Entertainment Solutions \| Turnkey Projects" (the large visual line below it, "Attractions, engineered to thrill.", is a styled tagline, not a heading) | [S1] page title / ✍️ |
| 1 | Hero — lead | "Engineering Innovation. Creating Extraordinary Entertainment Experiences." | [S1] tagline, ⚠️ |
| 2 | About Mega Fun Amusements | "Mega Fun Amusements is an amusement attractions manufacturer and turnkey solutions provider based in Chennai, India. The company specialises in the design, engineering, manufacturing, installation and commissioning of amusement attractions and entertainment systems." / "Serving amusement parks, theme parks, shopping malls, multiplexes, Family Entertainment Centres (FECs) and other leisure destinations, we develop entertainment solutions suited to different spaces, audiences and operational requirements." | [O] ⚠️ claims C1–C3 |
| 2 | — facts panel | Established 2010 · Based in Chennai, India · Attractions listed (count, once products publish) | 2010 ✅ [D]; Chennai ✅ [S1][S2][S3]; count is derived |
| 3 | Our Attraction Portfolio | Intro: "Our product portfolio covers a diverse range of immersive and interactive entertainment experiences, including:" then 6 groups: **Immersive Theatre Systems** — 3D, 5D and 7D theatres, simulation theatres and immersive cinema experiences…; **Motion-Based Attractions** — hydraulic motion platforms, flying theatres and advanced motion simulation systems…; **Themed Indoor Attractions** — "Haunted houses, jungle safari experiences and other themed walkthrough attractions."; **Illusion Experiences** — "Mirror mazes, infinite rooms, infinity tunnels and other illusion attractions." (split out of your Themed Indoor text per [D]); **Virtual Reality Attractions** — The Walk VR, 9D VR equipment, VR simulators…; **Interactive Entertainment Machines** — hunter shooting games and specialised amusement and arcade attractions… | [O] ⚠️ C4. Rows link to attraction groups only when those groups are published. |
| — | Where they go (preview only, from venue records) | "Planned around the venue" / "Different venues ask different questions about space, guest flow and operation." | ✍️ |
| 4 | Engineering Expertise & Innovation | Three paragraphs: engineering and product development; in-house hydraulics, pneumatics, mechatronics, electronics, automation, control systems and animatronics; integration of disciplines; in-house FRP moulding facility | [O] ⚠️ C5, C6 |
| 5 | Complete Turnkey Amusement Solutions | Two paragraphs: concept development and attraction selection through design, engineering, manufacturing, installation, testing and commissioning; working with customers on space, audience, operations and objectives. Followed by the stage names (from capability records). | [O] ⚠️ C2, C7 |
| 6 | Creating Memorable Entertainment Experiences | Two paragraphs: "We believe successful entertainment destinations bring together…" / "By combining attraction development, technical expertise and turnkey project capabilities, Mega Fun Amusements aims to help operators, developers and investors…" | [O] statement of aim, ✍️ |
| — | Enquiry close (shared) | "Have a venue or project in mind?" / "Tell us about the site, the audience and the timeline. We will prepare a draft email you can review and send." | ✍️ |

The closing tagline of your draft ("Mega Fun Amusements — Engineering Innovation. Creating Extraordinary Entertainment Experiences.") appears once, as the hero lead, rather than twice.

**Repetition check (automated scan of every built page):** in the production build, no paragraph over 70 characters appears on more than one page, apart from the shared enquiry call to action. In the preview build, the only repeats are the development-placeholder labels on image slots. The Attractions index now shows a category's short summary when that category has its own page, so the full description appears only once. Home carries the company overview; Turnkey & Engineering shows stage and capability *records* (one line each), not the homepage paragraphs; Attractions shows products.

---

## 3. Other pages — body copy

### Attractions `/attractions/`
- Lead: "What we manufacture and supply. Each group brings together attractions that share a format; open any attraction for how it works, its formats and what to plan for." ✍️ ("manufacture and supply" ⚠️ C1)
- Empty state (production today): "Our attraction catalogue is being prepared" / "Detailed attraction pages will appear here once product information and photographs are approved. Ask us about a specific attraction in the meantime." ✍️
- The separate Gallery section was removed from attraction pages. Product photographs now sit with each product: the lead image plus a row of thumbnails under it, all opening in the image viewer.

### Attraction detail `/attractions/{slug}/`
Fixed headings ✍️: "What guests experience", "Available formats and variants", "Planning and installation", "Need full technical specifications?", "Suitable venues", "Where it's installed", "Related attractions". All product facts are in §4.

### Turnkey & Engineering `/turnkey-engineering/`
- H1 "A project partner from first idea to opening day" ✍️. Lead: "For venue owners and developers who want one accountable partner for their attractions. Below is each stage and capability we deliver, labelled by who delivers it." ✍️/⚠️
- Sections from records: "How a project runs" (stages), "Technical capabilities", "Where it's made" (facility), "Current credentials" (when ≥2).
- Empty state (production today): "Delivery details are being confirmed" ✍️

### Updates `/updates/` — two sections
1. **Company updates**: H1 "Company updates"; lead "Dated announcements on new attractions, projects and company developments, followed by our photo gallery."; empty state "No updates published yet". No articles exist 🚫.
2. **Gallery**: H2 "Gallery"; text "Photographs of our attractions, workshop and installations. Select any image to view it larger."; empty state "Photographs coming soon" (production today). Ten awaited images from the old site's gallery page (unlabelled, rights unknown) are recorded as `gallery-01…10` with `rights: pending`, so they show only as placeholders in preview. "Workshop" in the gallery text assumes facility photos will be supplied; edit if not.

### Contact `/contact/` — two sections (18 Nov redesign)
1. **Contact & enquiry**
   - **Left (information only):** H1 "Discuss a project, or just get in touch"; paragraph "Choose the type of attraction you're interested in, add your name and send your enquiry straight from this page. Or reach us directly by email, phone or WhatsApp."; email, phone, WhatsApp (+91 95662 01124).
   - **Right (enquiry card):** "Your enquiry". "Select attraction category" lists the five classifications (§4); "Any / not sure yet" is the default. Then Your name * and Phone number (optional), To "Mega Fun Amusements team", the Subject, a letter-style preview, **Send Enquiry** and **WhatsApp Us**.
   - **Note under the buttons:** "Your enquiry is sent directly to our team from this page. Add a phone number so we can call or message you back. WhatsApp opens with the same message for you to send."
   - **Generated email** (example): Subject "Project enquiry — Illusion Experiences — Asha Rao". Body: "Hello Mega Fun Amusements team," / "I'd like to discuss a project involving your Illusion Experiences." / "Please contact me on +91 98765 43210 to discuss the details." / "Kind regards, Asha Rao, +91 98765 43210". The wording varies with the enquiry type passed from the linking page (project, specification, existing customer, general). ✍️
   - **Status messages:** "Sending your enquiry…", "Thank you, {name}. Your enquiry has been sent to our team.", "Please check the highlighted fields.", "We couldn't verify the request…", "Sending from this page isn't available right now…", "Your enquiry couldn't be delivered…" ✍️
2. **Office location**: H2 "Office location", plus the map, address, Google Maps directions and the OpenStreetMap link. No working hours [D].

### Privacy `/privacy/`
Describes how the site works: the enquiry card (what is sent when the visitor presses Send Enquiry, routed through Cloudflare and Resend to the company inbox, no copy kept by the site, and Cloudflare Turnstile's human check), the WhatsApp option [D], no cookies of its own, analytics off, click-to-load video, the OpenStreetMap map and hosting. **Legal review still pending** for the page as a whole; it makes no compliance claims.

---

## 4. Products, classifications and categories

All 17 records are `status: review`. Their text is paraphrased from [S1].

**Final categorisation [D]** (one primary category per product; categories with no products are never published). On 18 Nov the category records were renamed to match your classification labels; URLs and slugs are unchanged:

| Category | Products |
|---|---|
| Illusion Experiences (10) | Mirror Maze, Infinite Room, Infinite Tunnel, Infinite Hexagon, Kaleidoscope Illusion, Tilt Room, Ames Room, Beuchet Chair, Head on a Platter, Face Swap Illusion |
| Virtual Reality Attractions (3) | The Walk VR, 9D VR Simulator — 6 Seats, 9D VR Egg — 2 Seats |
| Themed Indoor Attractions (2) | Haunted House, Jungle Safari |
| Immersive Theatre Systems (1) | 5D–9D Motion Theatre |
| Interactive Entertainment Machines (1) | Hunter Shooting Simulator (secondary: Virtual Reality Attractions) |

Mirror Maze no longer carries a secondary *Themed walkthroughs* tag, so it appears only under Illusion experiences (its primary category, filters and related links). The homepage portfolio row *Motion-Based Attractions* is your copy, with no product records behind it. It is not a category, has no page and is not linked; no products were invented for it (claim C4).

| # | Attraction (`slug`) | Primary / secondary category | Summary (as written) | Guest experience (as written) | Features / variants | Specifications (all unverified) | Source note |
|---|---|---|---|---|---|---|---|
| 1 | 9D VR Simulator — 6 Seats (`9d-vr-6-seater`) | Virtual Reality Attractions | A six-seat virtual-reality motion simulator on an electric motion base. | Up to six guests ride together, each wearing a VR headset, while an electric motion base moves the seats in sync with the virtual ride. | Six seats; Electric motion base; VR headset per rider | — | Existing site — Existing site shows "Availability: False"; confirm operational status. |
| 2 | 9D VR Egg — 2 Seats (`9d-vr-egg-2-seater`) | Virtual Reality Attractions | A two-seat, egg-shaped virtual-reality motion simulator. | Two guests sit in an egg-shaped capsule wearing VR headsets while an electric motion base moves the capsule with the ride. | Two seats; Egg-shaped capsule; Electric motion base | — | Existing site — Existing site text says "six seats" for this two-seat model and shows "Availability: False"; confirm. |
| 3 | Ames Room (`ames-room`) | Illusion Experiences | A distorted room that makes guests appear to grow or shrink as they cross it. | Seen from a fixed viewpoint the room looks rectangular, but its trapezoid shape makes a guest in one corner look like a giant and in the other like a miniature. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |
| 4 | Beuchet Chair (`beuchet-chair`) | Illusion Experiences | A forced-perspective chair that makes one guest look tiny beside another. | The chair is built in separated parts that line up from one viewpoint, so a guest on the seat appears miniature next to someone standing behind it. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |
| 5 | Face Swap Illusion (`face-swap-illusion`) | Illusion Experiences | An illusion installation that appears to swap two guests’ faces. | Two guests take their places and, through the installation’s optics, appear to trade faces. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. Confirm how it works. |
| 6 | Haunted House (`haunted-house`) | Themed Indoor Attractions | A horror-themed walkthrough with sensor-triggered effects. | Guests follow a route through themed horror scenes; sensors detect them and trigger lighting, sound and figure effects along the way. | Sensor-triggered effects; PLC-controlled show sequence | Carpet area: 600 sq ft; Control: Sensors and PLC | Existing site |
| 7 | Head on a Platter (`head-on-a-platter`) | Illusion Experiences | A classic photo illusion: a guest’s head appears served on a plate. | A hidden mirror arrangement conceals the guest’s body so only the head appears, resting on a platter. | — | — | Existing site — Two "update" pages on the existing site (/55, /56); confirm it is an active product. |
| 8 | Hunter Shooting Simulator (`hunter-shooting-simulator`) | Interactive Entertainment Machines / Virtual Reality Attractions | A shooting-game simulator with omni-directional motion control and environmental effects. | Players aim at targets in a simulated hunt while motion control and environmental effects react to the game. | Omni-directional motion control; Environmental effects | — | Existing site |
| 9 | Infinite Hexagon (`infinite-hexagon`) | Illusion Experiences | A six-sided mirrored chamber that multiplies guests into endless rings. | Six mirrored faces reflect each other so guests see themselves repeated in rings that recede into the distance. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |
| 10 | Infinite Room (`infinite-room`) | Illusion Experiences | A mirrored room where light and reflections seem to extend in every direction. | Mirrored walls and lighting repeat into the distance so the room appears to have no boundaries. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |
| 11 | Infinite Tunnel (`infinite-tunnel`) | Illusion Experiences | A tunnel of mirrors and light that appears to stretch on without end. | Facing mirrors and lighting create a tunnel that seems to continue endlessly ahead of the guest. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |
| 12 | Jungle Safari (`jungle-safari`) | Themed Indoor Attractions | A jungle-themed walkthrough with dinosaur, crocodile, gorilla and tiger scenes. | Guests walk through jungle scenery past themed animal and dinosaur scenes. | Dinosaur, crocodile, gorilla and tiger scenes | Area: 800 sq ft or more | Existing site |
| 13 | Kaleidoscope Illusion (`kaleidoscope-illusion`) | Illusion Experiences | A walk-in kaleidoscope of mirrored surfaces that repeats guests into patterns. | Angled mirrors repeat the guest and the space into symmetrical kaleidoscope patterns. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |
| 14 | Mirror Maze (`mirror-maze`) | Illusion Experiences | A walk-through maze where mirrors multiply every path and reflection. | Guests find their way through corridors lined with mirrors, where reflections make the maze appear far larger than it is. | — | Minimum area: 600 sq ft; Power: Below 1 kW | Existing site |
| 15 | 5D–9D Motion Theatre (`motion-theatre`) | Immersive Theatre Systems | A 3D cinema on a motion seating base, with in-theatre effects, offered in 5D, 6D, 7D and 9D formats. | Guests watch a 3D film through polarised glasses while the seating base moves in time with the action. Physical effects such as smoke, snow and bubbles are triggered during the film. | Motion seating base with three degrees of freedom; Polarised 3D projection; Smoke, snow and bubble effects; Variants: 5D, 6D, 7D, 9D | — | Existing site — Existing site has two near-identical pages (/products/5d-theatre/4 and /products/5d-6d-7d-9d-theatre/5); merged here pending confirmation. |
| 16 | The Walk VR (`the-walk-vr`) | Virtual Reality Attractions | A virtual-reality challenge: walk a narrow plank high above a city skyline. | Wearing a VR headset, a guest steps onto a plank that appears to hang 400 metres above a city and tries to walk its length. | VR headset experience; Single-guest walk-through format | — | Existing site |
| 17 | Tilt Room (`tilt-room`) | Illusion Experiences | A room built on a slant that makes balance and gravity feel wrong. | The room is built at an angle while its contents appear level, so guests seem to lean impossibly and objects appear to roll uphill. | — | — | Existing site — Published as an "update" on the existing site; confirm it is an active product. |


| Category (`id`) | Summary | Description |
|---|---|---|
| Illusion Experiences (`illusion-experiences`) | Rooms and installations built on optical and perspective illusions. | Walk-in illusion rooms and photo installations that play with perspective, reflection and scale. |
| Immersive Theatre Systems (`immersive-theatres`) | 3D films with moving seats and in-theatre effects. | Cinema-format attractions that combine 3D projection with a motion seating base and physical effects, in formats from 5D upward. |
| Interactive Entertainment Machines (`interactive-games`) | Skill-based shooting and simulator games. | Interactive amusement equipment in which guests play, aim and compete. |
| Themed Indoor Attractions (`themed-walkthroughs`) | Story-led indoor attractions guests walk through. | Indoor themed attractions that guests walk through, with scenery, figures and triggered effects that tell a story along the route. |
| Virtual Reality Attractions (`virtual-reality`) | Headset-based experiences, many on electric motion bases. | Virtual-reality attractions in which guests wear a headset, from seated motion simulators to walk-through experiences. |


| Capability | Kind | Delivery model (claimed) | Description (as written) |
|---|---|---|---|
| Concept | delivery_stage | in_house (unconfirmed) | Shaping the attraction or venue idea with the client: audience, story and the space available. |
| Attraction selection | delivery_stage | in_house (unconfirmed) | Choosing the attractions that suit the venue, its visitors and its space. |
| Design & engineering | delivery_stage | in_house (unconfirmed) | Developing the design and engineering for the selected attractions and the site. |
| Manufacturing | delivery_stage | in_house (unconfirmed) | Producing the attraction systems, structures and themed elements. |
| Installation | delivery_stage | in_house (unconfirmed) | Installing the attraction on site. |
| Testing & commissioning | delivery_stage | in_house (unconfirmed) | Testing the attraction and commissioning it for operation. |
| Engineering disciplines | technical | in_house (unconfirmed) | Hydraulics, pneumatics, mechatronics, electronics, automation, control systems and animatronics. |
| Sensor and PLC show control | technical | in_house (unconfirmed) | Attraction effects triggered by sensors and run on programmable logic controllers (PLCs). |
| FRP moulding facility | facility | in_house (unconfirmed) | Fibre-reinforced plastic moulding for attraction components, themed structures and decorative elements. |


| Venue type | Summary | Context paragraphs | Operator needs |
|---|---|---|---|
| Amusement & theme parks | Outdoor and indoor parks adding new attractions or themed zones. | Park operators plan attractions around guest flow, ride capacity and how a new attraction fits an existing themed zone. They need a supplier that can take an attraction from selection through installation and commissioning on an operating site. | Throughput — Attractions sized for park visitor volumes.; Theming — Attractions that fit an existing zone or story.; Delivery on a live site — Installation and commissioning planned around park operations. |
| Family entertainment centres | A mixed set of attractions under one roof for families and groups. | FEC owners and investors build a mix of attractions that appeal across ages and keep guests on site longer. They need help choosing a coherent combination and planning the space it needs. | Attraction mix — A balanced combination across ages and interests.; Repeat visits — Experiences guests want to return to.; Project support — Help from selection through to opening. |
| Malls & multiplexes | Indoor entertainment for retail and cinema destinations. | Mall and multiplex developers look for compact indoor attractions that draw footfall and fit within a defined floor plate. Space, ceiling height, power supply and operating hours shape which attractions are practical. | Compact footprint — Attractions that fit leased indoor space.; Footfall — Experiences that bring visitors into the centre.; Site constraints — Clear space, power and ceiling requirements early in planning. |


---

## 5. Contact information

| Item | Value on site | Source | Status | Renders in production |
|---|---|---|---|---|
| Email | megafunamusements@gmail.com | [S1] | ⚠️ confirm it is the shared enquiry mailbox | Yes |
| Phone | +91 95662 01124 | [S1] (the site also lists 080 4803 4870) | ⚠️ confirm which number to show | Yes |
| WhatsApp | +91 95662 01124 → wa.me/919566201124 (prefilled message: greeting, intention, enquiry type, attraction, any details given) | [S4], [D] | ✅ confirmed official | Yes ("WhatsApp Us" + contact list) |
| Office address | #13D, 4th Street, Reddipalayam Road, Mogappair Industrial Estate, Chennai 600037, India | [S1]; "Chennai" from the old site's footer and map page title | ✅ cross-checked with [S2][S3] | Yes |
| Map pin | 13.086445395696511, 80.16735468059778 | [S2] | ✅ [S3] places it on "Mogappair West Estate 4th Street", postcode 600037. The rendered map shows it beside Reddipalayam Road. | Yes |
| Working hours | — | [D] | Not published anywhere (removed from config) | No |
| Response process | — | — | 🚫 | No |

---

## 6. Updates and gallery

- **Articles:** none. None have been written or dated on the company's behalf.
- **Gallery:** 10 awaited images (old-site gallery). Each needs a subject, caption and usage rights before `rights: approved`.

---

## 7. Claims needing verification

| # | Claim | Appears in | Source | Status |
|---|---|---|---|---|
| C1 | Mega Fun Amusements is an amusement attractions **manufacturer** | Home About, Attractions lead, SEO title and description | [S1] [O] | ⚠️ |
| C2 | Turnkey solutions provider covering design, engineering, manufacturing, installation and commissioning (and concept development, attraction selection and testing) | Home About and Turnkey sections, Turnkey stages | [S1] [O] | ⚠️ Which stages are in-house? |
| C3 | Serves amusement parks, theme parks, shopping malls, multiplexes, FECs and other leisure destinations | Home About | [O] | ⚠️ (no projects published as evidence yet) |
| C4 | Portfolio includes 3D/5D/7D theatres, simulation theatres, hydraulic motion platforms, flying theatres, VR simulators, arcade attractions | Home Portfolio | [S1] [O] | ⚠️ Flying theatres, hydraulic platforms and arcade attractions have no product records |
| C5 | **In-house** hydraulics, pneumatics, mechatronics, electronics, automation, control systems and animatronics | Home Engineering, capability record | [S1] [O] | ⚠️ owner to verify separately; not marked verified |
| C6 | **In-house FRP moulding facility** | Home Engineering, capability record | [S1] [O] | ⚠️ owner to verify separately; location, scope, evidence photos |
| C7 | Works with customers on space, audience, operations and objectives | Home Turnkey | [O] | ✍️ process description |
| C8 | Established 2010 | Home facts panel | [S1], [D] | ✅ confirmed by owner |
| C9 | Product facts and specifications (§4) | Attraction pages | [S1] | ⚠️ all unverified |
| C10 | Two VR products currently available | Attraction pages | [S1] shows "Availability: False" | ⚠️ |
| C11 | Nine illusion attractions are company products | Attraction pages | [S1] lists them as "updates" | ⚠️ |

No statistics, clients, installations, certifications or testimonials are claimed anywhere.

---

## 8. Changes made in the 18 Nov contact pass

- Contact card redesigned: category selector (classification names only), name (required) and phone (optional), live letter preview, **Send Enquiry** sending directly via Cloudflare Pages Function + Turnstile + Resend, and WhatsApp Us with the same text. Gmail, Outlook and copy buttons removed. The left column now holds information only.
- Category records renamed to your labels: Immersive Theatre Systems, Virtual Reality Attractions, Illusion Experiences, Themed Indoor Attractions, Interactive Entertainment Machines. Motion-Based Attractions has no products, so it is not offered.
- Privacy page updated to describe the enquiry card and its processors (no compliance claims).
- Favicon and app icons regenerated from the newly supplied mark.
- **Open point:** with no email field, an enquiry sent without a phone number has no reply route.

## 8a. Changes made in the 18 Nov decisions pass

- Working hours removed from the site and from config [D].
- WhatsApp confirmed and shown without a draft flag [D]. The Privacy page now describes the WhatsApp option [D].
- Established 2010 confirmed and now shown in production [D].
- Illusion categorisation [D]: Mirror Maze's secondary *Themed walkthroughs* tag removed; homepage portfolio split into *Themed Indoor Attractions* and *Illusion Experiences* (text drawn from your draft, no new claims).
- Engineering claims C1–C7 left unchanged and still flagged.

## 9. Changes made in the 17 Nov pass

- Homepage company content replaced with your draft (six parts, about the same length as the original), with a descriptive H1, a unique SEO title and a unique meta description.
- Contact is now two sections. The product selector and the "Attraction of interest" field share one state, the message is editable, and "WhatsApp Us" was added.
- The Gallery moved from attraction pages to Updates (paginated carousel, four per desktop page).
- On the Attractions index, a category with its own page now shows its short summary instead of the full description.
