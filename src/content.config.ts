/**
 * Content collections — canonical records (brief §5).
 * Relationships are authored once, on the record listed in docs/CONTENT_GUIDE.md,
 * and every reverse link is derived in src/lib/resolve.ts.
 */
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { contentRoot } from './config/build.ts';

const base = (name: string) => `${contentRoot}/${name}`;
// Sub-folders are for organisation only: an entry's ID is its file name.
const generateId = ({ entry }: { entry: string }) => entry.split('/').pop()!.replace(/\.(ya?ml|md)$/, '');
const yaml = (name: string) => glob({ pattern: '**/[^_]*.yaml', base: base(name), generateId });
const md = (name: string) => glob({ pattern: '**/[^_]*.md', base: base(name), generateId });

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase-kebab-case slug');
const editorial = z.enum(['draft', 'review', 'published', 'archived']);
const seo = z.object({ title: z.string().optional(), description: z.string().max(170).optional() }).default({});
const ids = z.array(z.string()).default([]);

const media = defineCollection({
  loader: yaml('media'),
  schema: z
    .object({
      kind: z.enum(['image', 'video', 'document']),
      /** Images: path under src/assets/media/. Documents: path under public/documents/. */
      file: z.string().optional(),
      /** Videos live on an external host, never in the repository. */
      external: z.object({ provider: z.enum(['youtube', 'vimeo']), id: z.string() }).optional(),
      alt: z.string().default(''),
      decorative: z.boolean().default(false),
      caption: z.string().optional(),
      credit: z.string().optional(),
      source: z.string().optional(),
      rights: z.enum(['pending', 'approved', 'restricted', 'expired']),
      rightsConfirmedBy: z.string().optional(),
      rightsConfirmedOn: z.coerce.date().optional(),
      expires: z.coerce.date().optional(),
      /** Video: poster image media ID. */
      poster: z.string().optional(),
      captionsAvailable: z.boolean().default(false),
      /** Video: text alternative describing what the video shows. */
      textAlternative: z.string().optional(),
      /** What the awaited asset should show — drives the development placeholder. */
      awaiting: z.string().optional(),
      /** Curated into the Updates page gallery (images only). The record stays canonical. */
      gallery: z.boolean().default(false),
      galleryOrder: z.number().default(100),
    })
    .refine((m) => m.rights !== 'approved' || !!m.rightsConfirmedBy, { message: 'approved media needs rightsConfirmedBy' })
    .refine((m) => m.decorative || m.kind === 'document' || m.alt.length > 0 || m.rights === 'pending', {
      message: 'informative media needs alt text',
    })
    .refine((m) => m.kind !== 'video' || m.rights === 'pending' || !!m.textAlternative, { message: 'video needs a text alternative' }),
});

const categories = defineCollection({
  loader: yaml('categories'),
  schema: z.object({
    name: z.string(),
    slug,
    /** One-line description for cards. */
    summary: z.string(),
    /** What the visitor can discover in this group (category page intro). */
    description: z.string(),
    order: z.number().default(100),
    status: editorial,
    seo,
  }),
});

const spec = z.object({ label: z.string(), value: z.string(), verified: z.boolean().default(false) });

const attractions = defineCollection({
  loader: yaml('attractions'),
  schema: z.object({
    name: z.string(),
    slug,
    operationalStatus: z.enum(['active', 'temporarily_unavailable', 'retired']),
    status: editorial,
    primaryCategory: z.string(),
    secondaryCategories: ids,
    /** One line: what it is. */
    summary: z.string(),
    /** Guest experience: what visitors experience and how it operates. */
    experience: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    variants: z.array(z.object({ name: z.string(), description: z.string().optional() })).default([]),
    /** Canonical venue suitability — Solution pages derive from this. */
    suitableVenues: ids,
    media: ids,
    specifications: z.array(spec).default([]),
    related: ids,
    /** Retired only: confirmed successor attraction ID. */
    successor: z.string().optional(),
    /** Retired only: keep the page (labelled as no longer offered) when it has history or inbound value. */
    keepRetiredPage: z.boolean().default(false),
    seo,
    /** Internal note on where the information came from. Never rendered. */
    sourceNote: z.string().optional(),
  }),
});

const venues = defineCollection({
  loader: yaml('venues'),
  schema: z.object({
    name: z.string(),
    slug,
    summary: z.string(),
    /** Venue context and operator needs — specific to this venue type. */
    context: z.array(z.string()).default([]),
    needs: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    planning: z.array(z.object({ title: z.string(), text: z.string(), verified: z.boolean().default(false) })).default([]),
    combinations: z.array(z.object({ title: z.string(), text: z.string(), attractions: ids, validated: z.boolean().default(false) })).default([]),
    order: z.number().default(100),
    status: editorial,
    seo,
  }),
});

const projects = defineCollection({
  loader: md('projects'),
  schema: z
    .object({
      title: z.string(),
      depth: z.enum(['showcase', 'case-study']),
      /** Case studies only. Showcase entries never get a public URL. */
      slug: slug.optional(),
      status: editorial,
      /** Project identity, client and location disclosure approved by the company/client. */
      disclosureApproved: z.boolean().default(false),
      summary: z.string(),
      venues: ids,
      attractions: ids,
      client: z.string().optional(),
      location: z.string().optional(),
      year: z.number().optional(),
      brief: z.string().optional(),
      scope: z.array(z.string()).default([]),
      delivery: z
        .array(z.object({ stage: z.string(), detail: z.string(), model: z.enum(['in_house', 'partner', 'external']) }))
        .default([]),
      /** Only a documented, approved outcome. */
      outcome: z.string().optional(),
      media: ids,
      order: z.number().default(100),
      seo,
    })
    .refine((p) => (p.depth === 'case-study') === !!p.slug, { message: 'case studies need a slug; showcase entries must not have one' }),
});

const capabilities = defineCollection({
  loader: yaml('capabilities'),
  schema: z.object({
    name: z.string(),
    kind: z.enum(['delivery_stage', 'technical', 'facility', 'service']),
    deliveryModel: z.enum(['in_house', 'partner', 'external']),
    /** In-house/partner/external status confirmed by the company (brief §6). */
    deliveryModelConfirmed: z.boolean().default(false),
    description: z.string(),
    evidence: ids,
    order: z.number().default(100),
    status: editorial,
  }),
});

const credentials = defineCollection({
  loader: yaml('credentials'),
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    type: z.string(),
    identifier: z.string().optional(),
    issued: z.coerce.date().optional(),
    expires: z.coerce.date().optional(),
    document: z.string().optional(),
    displayPermission: z.boolean().default(false),
    verifiedOn: z.coerce.date().optional(),
    status: editorial,
  }),
});

const updates = defineCollection({
  loader: md('updates'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    type: z.string().optional(),
    cover: z.string(),
    media: ids,
    relatedAttractions: ids,
    relatedProjects: ids,
    status: editorial,
    seo,
  }),
});

export const collections = { media, categories, attractions, venues, projects, capabilities, credentials, updates };
