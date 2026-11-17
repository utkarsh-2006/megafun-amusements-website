// Builders for resolver tests. Defaults are a fully approved, published record.
import type {
  AttractionData,
  CapabilityData,
  CategoryData,
  CredentialData,
  Entry,
  MediaData,
  NewsData,
  ProjectData,
  RawContent,
  VenueData,
} from '../src/lib/resolve.ts';

export const NOW = new Date('2026-11-17T00:00:00Z');
export const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

const e = <T>(id: string, data: T): Entry<T> => ({ id, data });

export const img = (id: string, o: Partial<MediaData> = {}) =>
  e<MediaData>(id, { kind: 'image', file: `${id}.jpg`, alt: id, decorative: false, rights: 'approved', rightsConfirmedBy: 'owner', captionsAvailable: false, gallery: false, galleryOrder: 100, ...o });
export const cat = (id: string, o: Partial<CategoryData> = {}) =>
  e<CategoryData>(id, { name: id, slug: id, summary: '', description: '', order: 1, status: 'published', seo: {}, ...o });
export const attr = (id: string, category: string, mediaIds: string[], o: Partial<AttractionData> = {}) =>
  e<AttractionData>(id, {
    name: id, slug: id, operationalStatus: 'active', status: 'published', primaryCategory: category, secondaryCategories: [],
    summary: 's', experience: [], features: [], variants: [], suitableVenues: [], media: mediaIds, specifications: [], related: [],
    keepRetiredPage: false, seo: {}, ...o,
  });
export const venue = (id: string, o: Partial<VenueData> = {}) =>
  e<VenueData>(id, { name: id, slug: id, summary: '', context: [], needs: [], planning: [], combinations: [], order: 1, status: 'published', seo: {}, ...o });
export const project = (id: string, mediaIds: string[], o: Partial<ProjectData> = {}) =>
  e<ProjectData>(id, {
    title: id, depth: 'showcase', status: 'published', disclosureApproved: true, summary: 's', venues: [], attractions: [],
    scope: [], delivery: [], media: mediaIds, order: 1, seo: {}, ...o,
  });
export const capability = (id: string, o: Partial<CapabilityData> = {}) =>
  e<CapabilityData>(id, { name: id, kind: 'technical', deliveryModel: 'in_house', deliveryModelConfirmed: true, description: '', evidence: [], order: 1, status: 'published', ...o });
export const credential = (id: string, o: Partial<CredentialData> = {}) =>
  e<CredentialData>(id, { name: id, issuer: 'x', type: 'x', displayPermission: true, verifiedOn: daysAgo(10), status: 'published', ...o });
export const article = (id: string, date: Date, cover: string, o: Partial<NewsData> = {}) =>
  e<NewsData>(id, { title: id, date, summary: 's', cover, media: [], relatedAttractions: [], relatedProjects: [], status: 'published', seo: {}, ...o });

export const empty = (): RawContent => ({ media: [], categories: [], attractions: [], venues: [], projects: [], capabilities: [], credentials: [], news: [] });

/** The v0.3 §6.1 thin-launch baseline. */
export function thinLaunch(): RawContent {
  const c = empty();
  c.categories.push(cat('illusions'));
  for (const n of ['a1', 'a2', 'a3']) {
    c.media.push(img(`${n}-1`), img(`${n}-2`));
    c.attractions.push(attr(n, 'illusions', [`${n}-1`, `${n}-2`], { suitableVenues: ['mall'] }));
  }
  c.venues.push(venue('mall'));
  c.media.push(img('p1-1'), img('p2-1'), img('n1-cover'));
  c.projects.push(project('p1', ['p1-1'], { attractions: ['a1'] }), project('p2', ['p2-1'], { attractions: ['a2'] }));
  c.news.push(article('n1', daysAgo(20), 'n1-cover'));
  c.capabilities.push(capability('frp'));
  return c;
}
