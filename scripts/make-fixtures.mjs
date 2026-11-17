/**
 * Generates the two QA fixture libraries (git-ignored, regenerated on every fixture build
 * so dated content stays fresh):
 *   fixtures/thin – the v0.3 §6.1 thin-launch baseline
 *   fixtures/full – every publication gate passes, so every template renders
 *
 * Every record is labelled "Sample" and all media are development placeholders.
 * Fixture builds always run in preview mode (banner + noindex) and must never be deployed
 * to production.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const day = 86_400_000;
const iso = (daysAgo) => new Date(Date.now() - daysAgo * day).toISOString().slice(0, 10);
const q = (s) => JSON.stringify(s);
const list = (a) => (a.length ? '\n' + a.map((x) => `  - ${q(x)}`).join('\n') : ' []');

function lib(root) {
  rmSync(root, { recursive: true, force: true });
  const w = (path, text) => {
    const p = join(root, path);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, text.trim() + '\n');
  };
  for (const c of ['media', 'categories', 'attractions', 'venues', 'projects', 'capabilities', 'credentials', 'updates']) mkdirSync(join(root, c), { recursive: true });
  const media = (id, what) => w(`media/${id}.yaml`, `kind: image\nrights: pending\nalt: ${q(`Sample image: ${what}`)}\ncaption: ${q(`Sample caption — ${what}`)}\nawaiting: ${q(`Fixture media: ${what}`)}`);
  const category = (id, name, order) =>
    w(`categories/${id}.yaml`, `name: ${q(name)}\nslug: ${id}\nsummary: "Sample category summary for template QA."\ndescription: "Sample category description used to test the category template."\norder: ${order}\nstatus: published`);
  const attraction = (id, name, cat, venues = [], extra = '') => {
    media(`${id}-1`, `${name} wide`);
    media(`${id}-2`, `${name} detail`);
    w(
      `attractions/${id}.yaml`,
      `name: ${q(name)}\nslug: ${id}\noperationalStatus: active\nstatus: published\nprimaryCategory: ${cat}\nsummary: "Sample one-line summary for template QA."\nexperience:\n  - "Sample guest-experience paragraph. Replace with confirmed product information."\nfeatures:\n  - "Sample feature one"\n  - "Sample feature two"\nsuitableVenues:${list(venues)}\nmedia:\n  - ${id}-1\n  - ${id}-2\nspecifications:\n  - label: "Sample footprint"\n    value: "000 sq ft"\n    verified: true\n${extra}`,
    );
  };
  const venue = (id, name, planningVerified) =>
    w(
      `venues/${id}.yaml`,
      `name: ${q(name)}\nslug: ${id}\nsummary: "Sample venue summary."\ncontext:\n  - "Sample venue context paragraph."\nneeds:\n  - title: "Sample need A"\n    text: "Sample text."\n  - title: "Sample need B"\n    text: "Sample text."\nplanning:\n${[1, 2, 3]
        .map((n) => `  - title: "Sample planning point ${n}"\n    text: "Sample text."\n    verified: ${planningVerified}`)
        .join('\n')}\norder: 1\nstatus: published`,
    );
  const project = (id, title, depth, attractions, venues, mediaCount, extra = '') => {
    const ids = Array.from({ length: mediaCount }, (_, i) => `${id}-m${i + 1}`);
    ids.forEach((m, i) => media(m, `${title} image ${i + 1}`));
    w(
      `projects/${id}.md`,
      `---\ntitle: ${q(title)}\ndepth: ${depth}\n${depth === 'case-study' ? `slug: ${id}\n` : ''}status: published\ndisclosureApproved: true\nsummary: "Sample project summary for template QA."\nvenues:${list(venues)}\nattractions:${list(attractions)}\nlocation: "Sample City"\nyear: 2026\nmedia:${list(ids)}\n${extra}---\n`,
    );
  };
  const capability = (id, name, kind, model, order) =>
    w(`capabilities/${id}.yaml`, `name: ${q(name)}\nkind: ${kind}\ndeliveryModel: ${model}\ndeliveryModelConfirmed: true\ndescription: "Sample capability description."\norder: ${order}\nstatus: published`);
  const article = (id, title, daysAgo) => {
    media(`${id}-cover`, `${title} cover`);
    w(`updates/${id}.md`, `---\ntitle: ${q(title)}\ndate: ${iso(daysAgo)}\nsummary: "Sample article summary."\ntype: "Sample update"\ncover: ${id}-cover\nstatus: published\n---\n\nSample opening paragraph for template QA.\n\n## A descriptive heading\n\nSample body copy.\n`);
  };
  return { w, media, category, attraction, venue, project, capability, article };
}

// ── Thin launch (brief §6.1) ────────────────────────────────────────────────
{
  const f = lib('fixtures/thin');
  f.category('sample-illusions', 'Sample category A', 1);
  for (const n of [1, 2, 3]) f.attraction(`sample-attraction-${n}`, `Sample Attraction ${n}`, 'sample-illusions');
  f.venue('sample-venue', 'Sample venue type', false);
  f.project('sample-showcase-1', 'Sample Showcase 1', 'showcase', ['sample-attraction-1'], [], 1);
  f.project('sample-showcase-2', 'Sample Showcase 2', 'showcase', ['sample-attraction-2'], [], 1);
  f.article('sample-news-1', 'Sample news article', 20);
  f.capability('sample-capability', 'Sample verified capability', 'technical', 'in_house', 1);
}

// ── Full library: every gate passes ─────────────────────────────────────────
{
  const f = lib('fixtures/full');
  const cats = ['sample-cat-a', 'sample-cat-b', 'sample-cat-c'];
  cats.forEach((c, i) => f.category(c, `Sample Category ${'ABC'[i]}`, i + 1));
  const venues = ['sample-venue-x', 'sample-venue-y'];
  let n = 0;
  for (const c of cats) for (let i = 0; i < 3; i++) f.attraction(`sample-attraction-${++n}`, `Sample Attraction ${n}`, c, venues);
  f.attraction('sample-attraction-10', 'Sample Attraction 10', 'sample-cat-a', [], 'secondaryCategories:\n  - sample-cat-b\nvariants:\n  - name: "Format A"\n  - name: "Format B"');
  f.venue('sample-venue-x', 'Sample Venue X', true);
  f.venue('sample-venue-y', 'Sample Venue Y', true);
  const cs = `brief: "Sample brief describing what the venue needed."\nscope:\n  - "Sample scope item"\n  - "Sample scope item"\ndelivery:\n  - stage: "Sample stage"\n    detail: "Sample delivery detail."\n    model: in_house\n  - stage: "Sample stage"\n    detail: "Sample delivery detail."\n    model: partner\noutcome: "Sample documented outcome."\n`;
  f.project('sample-case-study-1', 'Sample Case Study 1', 'case-study', ['sample-attraction-1', 'sample-attraction-4'], ['sample-venue-x'], 4, cs);
  f.project('sample-case-study-2', 'Sample Case Study 2', 'case-study', ['sample-attraction-2', 'sample-attraction-7'], ['sample-venue-y'], 3, cs);
  f.project('sample-showcase-1', 'Sample Showcase 1', 'showcase', ['sample-attraction-3'], ['sample-venue-x'], 2);
  f.project('sample-showcase-2', 'Sample Showcase 2', 'showcase', ['sample-attraction-5'], ['sample-venue-y'], 1);
  ['Concept', 'Attraction selection', 'Design & engineering', 'Manufacturing', 'Installation', 'Testing & commissioning'].forEach((s, i) =>
    f.capability(`sample-stage-${i + 1}`, s, 'delivery_stage', i === 3 ? 'partner' : 'in_house', i + 1),
  );
  f.capability('sample-tech', 'Sample technical capability', 'technical', 'in_house', 10);
  f.capability('sample-service', 'Sample externally sourced service', 'service', 'external', 11);
  f.capability('sample-facility', 'Sample facility', 'facility', 'in_house', 20);
  for (const [id, days] of [['sample-news-1', 5], ['sample-news-2', 40], ['sample-news-3', 120]]) f.article(id, `Sample news article ${id.at(-1)}`, days);
  for (let n = 1; n <= 10; n++)
    f.w(`media/gallery-${n}.yaml`, `kind: image
rights: pending
alt: "Sample gallery image ${n}"
caption: "Sample gallery caption ${n}"
awaiting: "Fixture gallery image ${n}"
gallery: true
galleryOrder: ${n}`);
  for (const n of [1, 2])
    f.w(`credentials/sample-credential-${n}.yaml`, `name: "Sample Credential ${n}"\nissuer: "Sample Issuing Body"\ntype: "Sample type"\nidentifier: "SAMPLE-${n}"\nissued: ${iso(300)}\nexpires: ${iso(-300)}\ndisplayPermission: true\nverifiedOn: ${iso(10)}\nstatus: published`);
}

console.log('fixtures/thin and fixtures/full generated');
