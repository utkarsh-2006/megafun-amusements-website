import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, ContentError } from '../src/lib/resolve.ts';
import { NOW, daysAgo, img, cat, attr, venue, project, capability, credential, article, empty, thinLaunch } from './helpers.ts';

const prod = { preview: false, now: NOW };

test('navigation is always the same five items, even with no content', () => {
  assert.deepEqual(resolve(empty(), prod).nav.map((n) => n.href), ['/', '/attractions/', '/turnkey-engineering/', '/updates/', '/contact/']);
});

test('thin-launch baseline produces the structure required by brief §6.1', () => {
  const r = resolve(thinLaunch(), prod);
  assert.equal(r.attractions.length, 3);
  assert.equal(r.categories.length, 1);
  assert.equal(r.categories[0].hasPage, true, '3 attractions in one category → category page');
  assert.equal(r.projectsLive, false, '2 showcases → no Projects archive');
  assert.equal(r.selectedWork.length, 2, 'homepage Selected Work may show the 2 entries');
  assert.equal(r.solutionsLive, false);
  assert.equal(r.newsLive, true, '1 article → News index exists');
  assert.equal(r.homeNews.length, 0, 'Latest News module stays hidden with 1 article');
  assert.equal(r.credentialsLive, false);
  assert.equal(r.credentials.length, 0);
  assert.equal(r.turnkeyLive, true);
  assert.equal(r.capabilityProfile, null);
  assert.deepEqual(r.nav.map((n) => n.label), ['Home', 'Attractions', 'Turnkey & Engineering', 'Updates', 'Contact']);
});

test('attraction detail gate: 2 stills, or 1 video + 1 still/poster', () => {
  const c = empty();
  c.categories.push(cat('c'));
  c.media.push(img('s1'), img('s2'), img('poster'), { id: 'v', data: { ...img('v').data, kind: 'video', file: undefined, external: { provider: 'youtube', id: 'x' }, poster: 'poster', textAlternative: 't' } });
  c.attractions.push(attr('one-still', 'c', ['s1']), attr('two-stills', 'c', ['s1', 's2']), attr('video-poster', 'c', ['v']), attr('video-only-no-poster', 'c', []));
  const r = resolve(c, prod);
  assert.deepEqual(r.attractions.map((a) => a.id).sort(), ['two-stills', 'video-poster']);
});

test('pending, restricted and expired media never count in production', () => {
  const c = empty();
  c.categories.push(cat('c'));
  c.media.push(img('ok'), img('pend', { rights: 'pending' }), img('restr', { rights: 'restricted' }), img('old', { expires: daysAgo(1) }));
  c.attractions.push(attr('a', 'c', ['ok', 'pend']), attr('b', 'c', ['ok', 'restr']), attr('d', 'c', ['ok', 'old']));
  assert.equal(resolve(c, prod).attractions.length, 0);
  assert.equal(resolve(c, { preview: true, now: NOW }).attractions.length, 1, 'preview accepts pending media only');
});

test('preview shows draft records flagged as drafts; production hides them', () => {
  const c = thinLaunch();
  c.attractions[0].data.status = 'review';
  assert.equal(resolve(c, prod).attractions.length, 2);
  const p = resolve(c, { preview: true, now: NOW });
  assert.equal(p.attractions.length, 3);
  assert.equal(p.attractions.find((a) => a.id === 'a1')!.draft, true);
});

test('non-active attractions are excluded from category counts', () => {
  const c = thinLaunch();
  c.attractions[2].data.operationalStatus = 'temporarily_unavailable';
  const r = resolve(c, prod);
  assert.equal(r.categories[0].hasPage, false, 'only 2 active → category becomes an index section');
  assert.equal(r.attractions.length, 2);
});

test('projects archive at 3 showcases; case study needs archive + 3 media + brief/scope/delivery', () => {
  const c = thinLaunch();
  c.media.push(img('p3-1'), img('p3-2'), img('p3-3'));
  const full = { brief: 'b', scope: ['x'], delivery: [{ stage: 's', detail: 'd', model: 'in_house' as const }] };
  c.projects.push(project('p3', ['p3-1', 'p3-2', 'p3-3'], { depth: 'case-study', slug: 'p3', ...full }));
  const r = resolve(c, prod);
  assert.equal(r.projectsLive, true);
  assert.deepEqual(r.projects.filter((p) => p.hasPage).map((p) => p.id), ['p3']);

  c.projects[2].data.media = ['p3-1', 'p3-2'];
  assert.equal(resolve(c, prod).projects.find((p) => p.id === 'p3')!.hasPage, false, '2 media → shown as showcase only');
});

test('case study cannot have a page while the archive is not live', () => {
  const c = empty();
  c.media.push(img('m1'), img('m2'), img('m3'));
  c.projects.push(project('cs', ['m1', 'm2', 'm3'], { depth: 'case-study', slug: 'cs', brief: 'b', scope: ['s'], delivery: [{ stage: 's', detail: 'd', model: 'in_house' }] }));
  const r = resolve(c, prod);
  assert.equal(r.projectsLive, false);
  assert.equal(r.projects[0].hasPage, false);
});

test('undisclosed projects are withheld in production', () => {
  const c = thinLaunch();
  c.projects[0].data.disclosureApproved = false;
  assert.equal(resolve(c, prod).selectedWork.length, 1);
});

test('solutions gate: 3 attractions across 2 categories + (1 project or 3 verified planning points); nav needs 2 pages', () => {
  const c = empty();
  c.categories.push(cat('x'), cat('y'));
  const planning = [1, 2, 3].map((n) => ({ title: `p${n}`, text: 't', verified: true }));
  c.venues.push(venue('mall', { planning }), venue('park', { planning }), venue('fec', { planning: planning.slice(0, 2) }));
  for (const [id, category] of [['a', 'x'], ['b', 'x'], ['c', 'y']] as const) {
    c.media.push(img(`${id}1`), img(`${id}2`));
    c.attractions.push(attr(id, category, [`${id}1`, `${id}2`], { suitableVenues: ['mall', 'park', 'fec'] }));
  }
  let r = resolve(c, prod);
  assert.equal(r.solutionsLive, true);
  assert.deepEqual(r.venues.filter((v) => v.hasPage).map((v) => v.id), ['mall', 'park'], 'fec has only 2 planning points');

  c.venues[1].data.planning[0].verified = false;
  r = resolve(c, prod);
  assert.equal(r.solutionsLive, false, 'only 1 venue passes → no Solutions pages at all');
  assert.equal(r.venues.some((v) => v.hasPage), false);

  c.attractions[2].data.primaryCategory = 'x';
  assert.equal(resolve(c, { preview: true, now: NOW }).solutionsLive, false, 'one primary category fails the gate');
});

test('homepage Latest News: 2 within 180 days and newest within 90', () => {
  const c = empty();
  c.media.push(img('cov'));
  c.news.push(article('old', daysAgo(170), 'cov'), article('new', daysAgo(95), 'cov'));
  assert.equal(resolve(c, prod).homeNews.length, 0, 'newest is 95 days old');
  c.news.push(article('fresh', daysAgo(10), 'cov'));
  assert.deepEqual(resolve(c, prod).homeNews.map((a) => a.id), ['fresh', 'new', 'old']);
  c.news.push(article('future', daysAgo(-5), 'cov'));
  assert.equal(resolve(c, prod).news[0].id, 'fresh', 'future-dated articles wait for their date');
});

test('credentials page needs 2 current, permitted, verified credentials', () => {
  const c = empty();
  c.credentials.push(credential('a'), credential('b', { expires: daysAgo(1) }), credential('c', { displayPermission: false }));
  assert.equal(resolve(c, prod).credentialsLive, false);
  c.credentials.push(credential('d'));
  const r = resolve(c, prod);
  assert.equal(r.credentialsLive, true);
  assert.deepEqual(r.credentials.map((x) => x.id), ['a', 'd']);
});

test('capability needs a confirmed delivery model; profile CTA needs an approved document', () => {
  const c = empty();
  c.capabilities.push(capability('a', { deliveryModelConfirmed: false }));
  assert.equal(resolve(c, prod).turnkeyLive, false);
  c.media.push(img('pdf', { kind: 'document', file: 'profile.pdf' }));
  assert.equal(resolve(c, { ...prod, capabilityProfileId: 'pdf' }).capabilityProfile?.id, 'pdf');
  c.media[0].data.rights = 'pending';
  assert.equal(resolve(c, { preview: true, now: NOW, capabilityProfileId: 'pdf' }).capabilityProfile?.id, 'pdf');
  c.media[0].data.file = undefined;
  assert.equal(resolve(c, { preview: true, now: NOW, capabilityProfileId: 'pdf' }).capabilityProfile, null, 'no file → no download CTA even in preview');
});

test('project filters need the archive and ≥2 matches', () => {
  const c = thinLaunch();
  c.media.push(img('p3-1'));
  c.projects.push(project('p3', ['p3-1'], { attractions: ['a3'], venues: ['mall'] }));
  c.projects[0].data.venues = ['mall'];
  const r = resolve(c, prod);
  assert.deepEqual(r.filters.byAttraction.map((x) => x.id), ['illusions']);
  assert.deepEqual(r.filters.byVenue.map((x) => x.id), ['mall']);
});

test('validation rejects broken relationships, duplicate and reserved slugs', () => {
  const bad = (mutate: (c: ReturnType<typeof thinLaunch>) => void, pattern: RegExp) => {
    const c = thinLaunch();
    mutate(c);
    assert.throws(() => resolve(c, prod), (e: Error) => e instanceof ContentError && pattern.test(e.message));
  };
  bad((c) => (c.attractions[0].data.primaryCategory = 'nope'), /unknown categories "nope"/);
  bad((c) => (c.attractions[1].data.slug = 'a1'), /slug "a1" used by both/);
  bad((c) => (c.attractions[0].data.slug = 'category'), /reserved slug/);
  bad((c) => c.projects[0].data.attractions.push('ghost'), /unknown attractions "ghost"/);
  bad((c) => (c.media[0].data.file = undefined), /approved but has no file/);
});

test('gallery lists only approved, in-term images flagged for the gallery, in order', () => {
  const c = empty();
  c.media.push(img('g2', { gallery: true, galleryOrder: 2 }), img('g1', { gallery: true, galleryOrder: 1 }), img('gp', { gallery: true, rights: 'pending' }), img('gx', { gallery: true, expires: daysAgo(1) }), img('ng'));
  assert.deepEqual(resolve(c, prod).gallery.map((m) => m.id), ['g1', 'g2']);
  assert.equal(resolve(c, { preview: true, now: NOW }).gallery.length, 3, 'preview adds pending placeholders');
});

test('enquiry categories: visible classifications with at least one non-retired product, names only', () => {
  const c = empty();
  c.categories.push(cat('a', { name: 'A', order: 2 }), cat('b', { name: 'B', order: 1 }), cat('empty', { name: 'Empty' }), cat('hidden', { status: 'review' }), cat('old'));
  c.attractions.push(attr('x', 'a', [], { status: 'review' }), attr('y', 'b', []), attr('z', 'hidden', []), attr('r', 'old', [], { operationalStatus: 'retired' }));
  assert.deepEqual(resolve(c, prod).enquiryCategories, [{ id: 'b', name: 'B' }, { id: 'a', name: 'A' }]);
});
