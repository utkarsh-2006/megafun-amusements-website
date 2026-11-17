/**
 * Publication resolver — applies every v0.3 gate (src/config/gates.ts) to the raw
 * content library and derives all reverse relationships.
 *
 * Pure TypeScript with no Astro imports, so tests/*.test.ts can run it directly
 * against fixtures. Shapes mirror src/content.config.ts; `astro check` catches drift
 * where src/lib/content.ts passes collection entries in.
 */
import { gates as defaultGates, type Gates } from '../config/gates.ts';

type Editorial = 'draft' | 'review' | 'published' | 'archived';
type Model = 'in_house' | 'partner' | 'external';
type Seo = { title?: string; description?: string };
export interface Entry<T> {
  id: string;
  data: T;
}

export interface MediaData {
  kind: 'image' | 'video' | 'document';
  file?: string;
  external?: { provider: 'youtube' | 'vimeo'; id: string };
  alt: string;
  decorative: boolean;
  caption?: string;
  credit?: string;
  source?: string;
  rights: 'pending' | 'approved' | 'restricted' | 'expired';
  rightsConfirmedBy?: string;
  expires?: Date;
  poster?: string;
  captionsAvailable: boolean;
  textAlternative?: string;
  awaiting?: string;
  gallery: boolean;
  galleryOrder: number;
}
export interface CategoryData {
  name: string;
  slug: string;
  summary: string;
  description: string;
  order: number;
  status: Editorial;
  seo: Seo;
}
export interface AttractionData {
  name: string;
  slug: string;
  operationalStatus: 'active' | 'temporarily_unavailable' | 'retired';
  status: Editorial;
  primaryCategory: string;
  secondaryCategories: string[];
  summary: string;
  experience: string[];
  features: string[];
  variants: { name: string; description?: string }[];
  suitableVenues: string[];
  media: string[];
  specifications: { label: string; value: string; verified: boolean }[];
  related: string[];
  successor?: string;
  keepRetiredPage: boolean;
  seo: Seo;
}
export interface VenueData {
  name: string;
  slug: string;
  summary: string;
  context: string[];
  needs: { title: string; text: string }[];
  planning: { title: string; text: string; verified: boolean }[];
  combinations: { title: string; text: string; attractions: string[]; validated: boolean }[];
  order: number;
  status: Editorial;
  seo: Seo;
}
export interface ProjectData {
  title: string;
  depth: 'showcase' | 'case-study';
  slug?: string;
  status: Editorial;
  disclosureApproved: boolean;
  summary: string;
  venues: string[];
  attractions: string[];
  client?: string;
  location?: string;
  year?: number;
  brief?: string;
  scope: string[];
  delivery: { stage: string; detail: string; model: Model }[];
  outcome?: string;
  media: string[];
  order: number;
  seo: Seo;
}
export interface CapabilityData {
  name: string;
  kind: 'delivery_stage' | 'technical' | 'facility' | 'service';
  deliveryModel: Model;
  deliveryModelConfirmed: boolean;
  description: string;
  evidence: string[];
  order: number;
  status: Editorial;
}
export interface CredentialData {
  name: string;
  issuer: string;
  type: string;
  identifier?: string;
  issued?: Date;
  expires?: Date;
  document?: string;
  displayPermission: boolean;
  verifiedOn?: Date;
  status: Editorial;
}
export interface NewsData {
  title: string;
  date: Date;
  summary: string;
  type?: string;
  cover: string;
  media: string[];
  relatedAttractions: string[];
  relatedProjects: string[];
  status: Editorial;
  seo: Seo;
}

export interface RawContent {
  media: Entry<MediaData>[];
  categories: Entry<CategoryData>[];
  attractions: Entry<AttractionData>[];
  venues: Entry<VenueData>[];
  projects: Entry<ProjectData>[];
  capabilities: Entry<CapabilityData>[];
  credentials: Entry<CredentialData>[];
  news: Entry<NewsData>[];
}

export interface Options {
  /** Preview builds treat draft/review records and pending media as publishable (flagged as drafts). */
  preview: boolean;
  now: Date;
  gates?: Gates;
  /** Company capability-profile media ID, if any. */
  capabilityProfileId?: string | null;
}

/** A usable media item. `placeholder` is true when no file/host exists yet (preview only). */
export interface Media extends MediaData {
  id: string;
  draft: boolean;
  placeholder: boolean;
}
type Out<T> = T & { id: string; draft: boolean };

export type Attraction = Out<AttractionData> & {
  stills: Media[];
  videos: Media[];
  /** Has a detail page. */
  publishable: boolean;
  retired: boolean;
};
export type Category = Out<CategoryData> & { attractions: Attraction[]; secondary: Attraction[]; hasPage: boolean };
export type Venue = Out<VenueData> & {
  attractions: Attraction[];
  projects: Project[];
  verifiedPlanning: VenueData['planning'];
  hasPage: boolean;
};
export type Project = Out<ProjectData> & { mediaItems: Media[]; categories: string[]; hasPage: boolean };
export type Capability = Out<CapabilityData> & { evidenceItems: Media[] };
export type Credential = Out<CredentialData>;
export type Article = Out<NewsData> & { coverItem: Media; mediaItems: Media[] };

export interface NavItem {
  label: string;
  href: string;
}

export interface Resolved {
  preview: boolean;
  media: Map<string, Media>;
  attractions: Attraction[];
  attractionById: Map<string, Attraction>;
  categories: Category[];
  categoryById: Map<string, Category>;
  venues: Venue[];
  venueById: Map<string, Venue>;
  solutionsLive: boolean;
  projects: Project[];
  projectsLive: boolean;
  selectedWork: Project[];
  filters: { byAttraction: Category[]; byVenue: Venue[] };
  capabilities: Capability[];
  turnkeyLive: boolean;
  credentials: Credential[];
  credentialsLive: boolean;
  news: Article[];
  newsLive: boolean;
  homeNews: Article[];
  capabilityProfile: Media | null;
  /** Curated gallery images (approved; pending placeholders in preview). */
  gallery: Media[];
  /**
   * Classifications offered in the Contact enquiry: visible category records that have at least
   * one non-retired product record. Names only — no product details are exposed.
   */
  enquiryCategories: { id: string; name: string }[];
  nav: NavItem[];
  /** Non-fatal findings (hidden content, expired media). */
  warnings: string[];
}

export class ContentError extends Error {}

const DAY = 86_400_000;

export function resolve(raw: RawContent, opts: Options): Resolved {
  const g = opts.gates ?? defaultGates;
  const { preview, now } = opts;
  const errors: string[] = [];
  const warnings: string[] = [];

  /** Editorial gate: published always; draft/review only in preview. */
  const visible = (s: Editorial) => s === 'published' || (preview && (s === 'draft' || s === 'review'));
  const isDraft = (s: Editorial) => s !== 'published';

  // ── Integrity checks ────────────────────────────────────────────────────────
  const idSet = <T>(list: Entry<T>[]) => new Set(list.map((e) => e.id));
  const known = {
    media: idSet(raw.media),
    categories: idSet(raw.categories),
    attractions: idSet(raw.attractions),
    venues: idSet(raw.venues),
    projects: idSet(raw.projects),
  };
  const ref = (owner: string, kind: keyof typeof known, list: (string | undefined)[]) => {
    for (const id of list) if (id && !known[kind].has(id)) errors.push(`${owner} references unknown ${kind} "${id}"`);
  };
  const uniqueSlugs = (kind: string, list: { id: string; slug?: string }[], reserved: string[] = []) => {
    const seen = new Map<string, string>();
    for (const e of list) {
      if (!e.slug) continue;
      if (reserved.includes(e.slug)) errors.push(`${kind} "${e.id}" uses reserved slug "${e.slug}"`);
      const prev = seen.get(e.slug);
      if (prev) errors.push(`${kind} slug "${e.slug}" used by both "${prev}" and "${e.id}"`);
      seen.set(e.slug, e.id);
    }
  };
  uniqueSlugs('attraction', raw.attractions.map((e) => ({ id: e.id, slug: e.data.slug })), ['category']);
  uniqueSlugs('category', raw.categories.map((e) => ({ id: e.id, slug: e.data.slug })));
  uniqueSlugs('venue', raw.venues.map((e) => ({ id: e.id, slug: e.data.slug })));
  uniqueSlugs('case study', raw.projects.map((e) => ({ id: e.id, slug: e.data.slug })), ['by-attraction', 'by-venue']);

  for (const { id, data: a } of raw.attractions) {
    const o = `attraction "${id}"`;
    ref(o, 'categories', [a.primaryCategory, ...a.secondaryCategories]);
    ref(o, 'venues', a.suitableVenues);
    ref(o, 'media', a.media);
    ref(o, 'attractions', [...a.related, a.successor]);
    if (a.secondaryCategories.includes(a.primaryCategory)) errors.push(`${o} lists its primary category as secondary`);
  }
  for (const { id, data: v } of raw.venues) for (const c of v.combinations) ref(`venue "${id}"`, 'attractions', c.attractions);
  for (const { id, data: p } of raw.projects) {
    ref(`project "${id}"`, 'attractions', p.attractions);
    ref(`project "${id}"`, 'venues', p.venues);
    ref(`project "${id}"`, 'media', p.media);
  }
  for (const { id, data: c } of raw.capabilities) ref(`capability "${id}"`, 'media', c.evidence);
  for (const { id, data: c } of raw.credentials) ref(`credential "${id}"`, 'media', [c.document]);
  for (const { id, data: n } of raw.news) {
    ref(`article "${id}"`, 'media', [n.cover, ...n.media]);
    ref(`article "${id}"`, 'attractions', n.relatedAttractions);
    ref(`article "${id}"`, 'projects', n.relatedProjects);
  }
  for (const { id, data: m } of raw.media) {
    ref(`media "${id}"`, 'media', [m.poster]);
    if (m.kind === 'video' && m.file) errors.push(`media "${id}": videos must use an external host, not a repository file`);
    if (m.rights === 'approved' && !m.file && !m.external) errors.push(`media "${id}" is approved but has no file or external reference`);
  }
  if (errors.length) throw new ContentError('Content validation failed:\n  - ' + errors.join('\n  - '));

  // ── Media ───────────────────────────────────────────────────────────────────
  const media = new Map<string, Media>();
  for (const { id, data: m } of raw.media) {
    const expired = m.rights === 'expired' || (m.expires && m.expires.getTime() <= now.getTime());
    const ok = !expired && (m.rights === 'approved' || (preview && m.rights === 'pending'));
    if (!ok) continue;
    media.set(id, { ...m, id, draft: m.rights !== 'approved', placeholder: !m.file && !m.external });
  }
  const pick = (ids: string[], owner: string, ownerVisible: boolean) =>
    ids.flatMap((id) => {
      const m = media.get(id);
      if (!m && ownerVisible) warnings.push(`${owner}: media "${id}" withheld (rights not approved, restricted or expired)`);
      return m ? [m] : [];
    });

  // ── Attractions ─────────────────────────────────────────────────────────────
  const attractions: Attraction[] = raw.attractions.map(({ id, data: a }) => {
    const shown = visible(a.status);
    const items = pick(a.media, `attraction "${id}"`, shown);
    const stills = items.filter((m) => m.kind === 'image');
    const videos = items.filter((m) => m.kind === 'video');
    const posters = videos.filter((v) => v.poster && media.get(v.poster)?.kind === 'image');
    const mediaOk =
      stills.length >= g.attraction.minStills ||
      (videos.length >= g.attraction.minVideos && stills.length + posters.length >= g.attraction.minStillsWithVideo);
    const retired = a.operationalStatus === 'retired';
    const opOk = a.operationalStatus === 'active' || (retired && a.keepRetiredPage);
    const publishable = shown && opOk && mediaOk;
    if (shown && opOk && !mediaOk) warnings.push(`attraction "${id}" has no page: needs ${g.attraction.minStills} approved stills or an approved video + still`);
    return { ...a, id, draft: isDraft(a.status) || items.some((m) => m.draft), stills, videos, publishable, retired };
  });
  const live = attractions.filter((a) => a.publishable);
  const active = live.filter((a) => a.operationalStatus === 'active');
  const attractionById = new Map(live.map((a) => [a.id, a]));
  const byName = (x: { name: string }, y: { name: string }) => x.name.localeCompare(y.name);

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories: Category[] = raw.categories
    .filter((c) => visible(c.data.status))
    .map(({ id, data: c }) => {
      const members = active.filter((a) => a.primaryCategory === id).sort(byName);
      const secondary = active.filter((a) => a.secondaryCategories.includes(id)).sort(byName);
      return { ...c, id, draft: isDraft(c.status), attractions: members, secondary, hasPage: members.length >= g.category.minAttractions };
    })
    .filter((c) => c.attractions.length > 0)
    .sort((x, y) => x.order - y.order || byName(x, y));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  // Live attractions whose primary category record is hidden would be orphaned on the index.
  for (const a of active) if (!categoryById.has(a.primaryCategory)) warnings.push(`attraction "${a.id}": primary category "${a.primaryCategory}" is not published`);

  // ── Projects ────────────────────────────────────────────────────────────────
  const primaryOf = new Map(raw.attractions.map((a) => [a.id, a.data.primaryCategory]));
  const showcaseGrade = raw.projects
    .map(({ id, data: p }) => {
      const shown = visible(p.status) && (p.disclosureApproved || preview);
      const mediaItems = pick(p.media, `project "${id}"`, shown);
      const categoriesOf = [...new Set(p.attractions.map((a) => primaryOf.get(a)!).filter(Boolean))];
      const draft = isDraft(p.status) || !p.disclosureApproved || mediaItems.some((m) => m.draft);
      return { ...p, id, draft, mediaItems, categories: categoriesOf, hasPage: false, shown };
    })
    .filter((p) => p.shown && p.mediaItems.length >= g.projects.minMediaPerShowcase)
    .map(({ shown: _s, ...p }) => p);
  const projectsLive = showcaseGrade.length >= g.projects.minShowcases;
  const projects: Project[] = showcaseGrade
    .map((p) => ({
      ...p,
      hasPage:
        projectsLive &&
        p.depth === 'case-study' &&
        !!p.brief &&
        p.scope.length > 0 &&
        p.delivery.length > 0 &&
        p.mediaItems.length >= g.caseStudy.minMedia,
    }))
    .sort((x, y) => x.order - y.order || (y.year ?? 0) - (x.year ?? 0));
  const selectedWork = projects.slice(0, projectsLive ? g.selectedWork.maxWithArchive : g.selectedWork.maxWithoutArchive);

  // ── Venues / Solutions ──────────────────────────────────────────────────────
  const venueCandidates = raw.venues
    .filter((v) => visible(v.data.status))
    .map(({ id, data: v }) => {
      const suitable = active.filter((a) => a.suitableVenues.includes(id)).sort(byName);
      const related = projects.filter((p) => p.venues.includes(id));
      const verifiedPlanning = v.planning.filter((p) => p.verified || preview);
      const primaries = new Set(suitable.map((a) => a.primaryCategory));
      const pass =
        suitable.length >= g.solution.minAttractions &&
        primaries.size >= g.solution.minPrimaryCategories &&
        (related.length >= g.solution.minRelatedProjects || verifiedPlanning.length >= g.solution.minPlanningPoints);
      return { ...v, id, draft: isDraft(v.status) || v.planning.some((p) => !p.verified), attractions: suitable, projects: related, verifiedPlanning, pass };
    })
    .sort((x, y) => x.order - y.order);
  // A lone passing venue page has no index to belong to, so pages publish only with the index (docs/ARCHITECTURE.md).
  const solutionsLive = venueCandidates.filter((v) => v.pass).length >= g.solutionsNav.minPages;
  const venues: Venue[] = venueCandidates.map(({ pass, ...v }) => ({ ...v, hasPage: solutionsLive && pass }));
  const venueById = new Map(venues.map((v) => [v.id, v]));

  // ── Project filters (only meaningful once the archive is live) ──────────────
  const filters = {
    byAttraction: projectsLive
      ? categories.filter((c) => projects.filter((p) => p.categories.includes(c.id)).length >= g.projectFilter.minMatches)
      : [],
    byVenue: projectsLive ? venues.filter((v) => projects.filter((p) => p.venues.includes(v.id)).length >= g.projectFilter.minMatches) : [],
  };

  // ── Capabilities ────────────────────────────────────────────────────────────
  const capabilities: Capability[] = raw.capabilities
    .filter((c) => visible(c.data.status) && (c.data.deliveryModelConfirmed || preview))
    .map(({ id, data: c }) => {
      const evidenceItems = pick(c.evidence, `capability "${id}"`, true);
      return { ...c, id, draft: isDraft(c.status) || !c.deliveryModelConfirmed, evidenceItems };
    })
    .sort((x, y) => x.order - y.order);
  const turnkeyLive = capabilities.length >= g.turnkey.minCapabilities;

  // ── Credentials ─────────────────────────────────────────────────────────────
  const credentials: Credential[] = raw.credentials
    .filter(({ data: c }) => visible(c.status) && c.displayPermission && (!!c.verifiedOn || preview) && !(c.expires && c.expires <= now))
    .map(({ id, data: c }) => ({ ...c, id, draft: isDraft(c.status) || !c.verifiedOn }))
    .sort(byName);
  const credentialsLive = credentials.length >= g.credentials.minCurrent;

  // ── News ────────────────────────────────────────────────────────────────────
  const news: Article[] = raw.news
    .filter(({ data: n }) => visible(n.status) && (preview || n.date.getTime() <= now.getTime()))
    .flatMap(({ id, data: n }) => {
      const coverItem = media.get(n.cover);
      if (!coverItem || coverItem.kind !== 'image') {
        warnings.push(`article "${id}" hidden: cover image not approved`);
        return [];
      }
      const mediaItems = pick(n.media, `article "${id}"`, true);
      return [{ ...n, id, draft: isDraft(n.status) || coverItem.draft, coverItem, mediaItems }];
    })
    .sort((x, y) => y.date.getTime() - x.date.getTime());
  const newsLive = news.length >= g.newsIndex.minArticles;
  const age = (a: Article) => (now.getTime() - a.date.getTime()) / DAY;
  const recent = news.filter((a) => age(a) <= g.homeNews.windowDays);
  const homeNews =
    recent.length >= g.homeNews.minArticles && age(recent[0]) <= g.homeNews.newestMaxAgeDays ? recent.slice(0, g.homeNews.show) : [];

  // ── Capability profile ──────────────────────────────────────────────────────
  const profile = opts.capabilityProfileId ? media.get(opts.capabilityProfileId) : undefined;
  const capabilityProfile = profile && profile.kind === 'document' && profile.file ? profile : null;

  // ── Navigation: fixed five items (owner decision, 17 Nov 2026). Attractions, Turnkey and
  // Updates pages always exist and show a deliberate empty state when nothing is published.
  const nav: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Attractions', href: '/attractions/' },
    { label: 'Turnkey & Engineering', href: '/turnkey-engineering/' },
    { label: 'Updates', href: '/updates/' },
    { label: 'Contact', href: '/contact/' },
  ];

  return {
    preview,
    media,
    attractions: live.sort(byName),
    attractionById,
    categories,
    categoryById,
    venues,
    venueById,
    solutionsLive,
    projects,
    projectsLive,
    selectedWork,
    filters,
    capabilities,
    turnkeyLive,
    credentials,
    credentialsLive,
    news,
    newsLive,
    homeNews,
    capabilityProfile,
    enquiryCategories: raw.categories
      .filter((c) => visible(c.data.status) && raw.attractions.some((a) => a.data.primaryCategory === c.id && a.data.operationalStatus !== 'retired'))
      .sort((x, y) => x.data.order - y.data.order || x.data.name.localeCompare(y.data.name))
      .map((c) => ({ id: c.id, name: c.data.name })),
    gallery: [...media.values()].filter((m) => m.gallery && m.kind === 'image').sort((a, b) => a.galleryOrder - b.galleryOrder || a.id.localeCompare(b.id)),
    nav,
    warnings,
  };
}

/** Related attractions: authored links first, then same primary category, never itself. */
export function relatedAttractions(r: Resolved, a: Attraction, max = 3): Attraction[] {
  const out = a.related.map((id) => r.attractionById.get(id)).filter((x): x is Attraction => !!x && x.operationalStatus === 'active');
  for (const b of r.categoryById.get(a.primaryCategory)?.attractions ?? []) if (out.length < max && b.id !== a.id && !out.includes(b)) out.push(b);
  return out.slice(0, max);
}
