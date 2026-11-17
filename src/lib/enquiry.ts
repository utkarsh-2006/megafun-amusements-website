/**
 * Enquiry helpers. Pure and dependency-free, shared by:
 * - the Contact page script (live preview, WhatsApp link),
 * - the Cloudflare Pages Function `functions/api/enquiry.ts` (validation + the exact same
 *   email text, so the visitor sees precisely what is sent),
 * - Astro pages (contextual links, mailto fallbacks elsewhere on the site) and tests.
 */
export const intents = ['project', 'specification', 'service', 'general'] as const;
export type Intent = (typeof intents)[number];

export const intentLabels: Record<Intent, string> = {
  project: 'New project enquiry',
  specification: 'Product specification request',
  service: 'Existing customer / service',
  general: 'General enquiry',
};

/** Allowed `source` values (page types). Anything else is ignored. */
export const sources = ['home', 'nav', 'attractions', 'attraction', 'category', 'solution', 'case-study', 'projects', 'turnkey', 'updates', 'contact'] as const;
export type Source = (typeof sources)[number];

export interface Context {
  intent: Intent;
  source?: Source;
  /** A content slug. Never free text, never personal data. */
  item?: string;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,12}$/;

/** Read only the approved, non-sensitive context keys from a query string. */
export function parseContext(search: string): Context {
  const q = new URLSearchParams(search);
  const intent = q.get('intent');
  const source = q.get('source');
  const item = q.get('item');
  return {
    intent: (intents as readonly string[]).includes(intent ?? '') ? (intent as Intent) : 'project',
    source: (sources as readonly string[]).includes(source ?? '') ? (source as Source) : undefined,
    item: item && SLUG.test(item) ? item : undefined,
  };
}

/** Build a /contact/ link carrying context. Values are restricted to known enums/slugs. */
export function contactHref(ctx: Partial<Context>): string {
  const q = new URLSearchParams();
  if (ctx.intent) q.set('intent', ctx.intent);
  if (ctx.source) q.set('source', ctx.source);
  if (ctx.item && SLUG.test(ctx.item)) q.set('item', ctx.item);
  const s = q.toString();
  return '/contact/' + (s ? `?${s}#enquiry` : '');
}

export interface Fields {
  name?: string;
  company?: string;
  venue?: string;
  /** Attraction name of interest. */
  attraction?: string;
  location?: string;
  timeline?: string;
  constraints?: string;
  message?: string;
}

export interface Draft {
  subject: string;
  body: string;
}

const clean = (s?: string) => (s ?? '').replace(/\s+/g, ' ').trim();

/**
 * Compose subject and body. `itemLabel` is the display name of the context item
 * (e.g. an attraction name) and `itemId` its stable identifier for spec requests.
 */
export function composeDraft(intent: Intent, f: Fields, item?: { label: string; id: string }, pageUrl?: string): Draft {
  const attraction = clean(f.attraction) || item?.label || '';
  const subjectParts: Record<Intent, string[]> = {
    project: ['Project enquiry', attraction, clean(f.venue)],
    specification: ['Specification request', attraction, item ? `[${item.id}]` : ''],
    service: ['Existing customer / service', attraction],
    general: ['General enquiry', attraction],
  };
  const subject = subjectParts[intent].filter(Boolean).join(' — ').replace(' — [', ' [');

  const opening: Record<Intent, string> = {
    project: "I'd like to discuss a project with Mega Fun Amusements.",
    specification: `Please share the specifications${attraction ? ` for ${attraction}` : ''}.`,
    service: 'I am contacting you about an installed attraction / service request.',
    general: '',
  };
  const rows: [string, string][] = [
    ['Name', clean(f.name)],
    ['Company', clean(f.company)],
    ['Venue type', clean(f.venue)],
    ['Attraction of interest', attraction],
    ['Location', clean(f.location)],
    ['Timeline', clean(f.timeline)],
    ['Known site constraints', clean(f.constraints)],
  ];
  const details = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
  const message = (f.message ?? '').trim();

  // Paragraphs separated by a blank line; empty ones are dropped.
  const body = [
    'Hello Mega Fun Amusements team,',
    [opening[intent], message].filter(Boolean).join('\n\n'),
    details.join('\n'),
    'Thank you.',
    pageUrl ? `(Prepared on ${pageUrl})` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return { subject, body };
}

const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));

export function mailtoHref(to: string, d: Partial<Draft>): string {
  const q = [d.subject && `subject=${enc(d.subject)}`, d.body && `body=${enc(d.body)}`].filter(Boolean).join('&');
  return `mailto:${to}${q ? `?${q}` : ''}`;
}

// ── Contact-card enquiry (sent by the Pages Function) ─────────────────────────

export interface Enquiry {
  intent: Intent;
  /** Display name of the selected attraction classification, if any. */
  category?: string;
  name: string;
  phone?: string;
}

const subjectLabel: Record<Intent, string> = {
  project: 'Project enquiry',
  specification: 'Specification request',
  service: 'Existing customer / service',
  general: 'General enquiry',
};

/**
 * The email exactly as sent: subject plus paragraphs (rendered as a letter in the preview,
 * joined with blank lines for the plain-text email and for WhatsApp).
 */
export function composeEnquiry(e: Enquiry): { subject: string; paragraphs: string[]; text: string } {
  const cat = clean(e.category);
  const name = clean(e.name);
  const phone = clean(e.phone);
  const intention: Record<Intent, string> = {
    project: cat ? `I'd like to discuss a project involving your ${cat}.` : "I'd like to discuss a project with Mega Fun Amusements.",
    specification: cat ? `I'd like to request specifications for your ${cat}.` : "I'd like to request product specifications.",
    service: cat ? `I'm contacting you about an installed attraction (${cat}).` : "I'm contacting you about an installed attraction.",
    general: cat ? `I have an enquiry about your ${cat}.` : 'I have a general enquiry.',
  };
  const paragraphs = [
    'Hello Mega Fun Amusements team,',
    intention[e.intent],
    phone ? `Please contact me on ${phone} to discuss the details.` : 'Please get in touch to discuss the details.',
    ['Kind regards,', name || '[Your name]', phone].filter(Boolean).join('\n'),
  ];
  const subject = [subjectLabel[e.intent], cat, name].filter(Boolean).join(' — ');
  return { subject, paragraphs, text: paragraphs.join('\n\n') };
}

export interface EnquiryInput {
  intent?: unknown;
  category?: unknown;
  name?: unknown;
  phone?: unknown;
  /** The visitor's final (possibly edited) message — sent verbatim. */
  message?: unknown;
}
export type EnquiryErrors = Partial<Record<'intent' | 'category' | 'name' | 'phone' | 'message', string>>;
export type Validated =
  | { ok: true; value: { intent: Intent; categoryId?: string; categoryName?: string; name: string; phone?: string; message: string } }
  | { ok: false; errors: EnquiryErrors };

export const MESSAGE_MAX = 3000;

/** Normalise a free-text message: unify line endings, drop control characters (keep \n and \t), trim. */
export function cleanMessage(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]{1,79}$/u;
const PHONE = /^\+?[0-9 ()-]{6,24}$/;

/** Validates untrusted input (browser and server use the same rules). Categories must be in the allow-list. */
export function validateEnquiry(input: EnquiryInput, categories: { id: string; name: string }[]): Validated {
  const errors: EnquiryErrors = {};
  const str = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
  const intent = str(input.intent);
  if (!(intents as readonly string[]).includes(intent)) errors.intent = 'Unknown enquiry type.';
  const categoryId = str(input.category);
  const category = categories.find((c) => c.id === categoryId);
  if (categoryId && !category) errors.category = 'Please choose a category from the list.';
  const name = str(input.name);
  if (!name) errors.name = 'Please enter your name.';
  else if (!NAME.test(name)) errors.name = 'Please enter your name using letters only.';
  const phone = str(input.phone);
  const digits = phone.replace(/\D/g, '').length;
  if (phone && (!PHONE.test(phone) || digits < 7 || digits > 15)) errors.phone = 'Please enter a valid phone number, e.g. +91 98765 43210.';
  const message = cleanMessage(input.message);
  if (!message) errors.message = 'Please write a short message.';
  else if (message.length > MESSAGE_MAX) errors.message = `Please keep the message under ${MESSAGE_MAX} characters.`;
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { intent: intent as Intent, name, message, ...(category ? { categoryId: category.id, categoryName: category.name } : {}), ...(phone ? { phone } : {}) },
  };
}

/** Subject line (generated, not editable): enquiry type — category — name. */
export function enquirySubject(e: Pick<Enquiry, 'intent' | 'category' | 'name'>): string {
  return composeEnquiry({ ...e, name: e.name ?? '' }).subject;
}

/** The email the company receives: the visitor's exact message, then structured details. */
export function enquiryEmailText(v: { intent: Intent; categoryName?: string; name: string; phone?: string; message: string }, host: string): string {
  return [
    v.message,
    '',
    '—',
    'Enquiry details',
    `Name: ${v.name}`,
    `Phone: ${v.phone ?? 'not provided'}`,
    `Attraction category: ${v.categoryName ?? 'not specified'}`,
    `Enquiry type: ${intentLabels[v.intent]}`,
    `Sent from the enquiry card at ${host}/contact/`,
  ].join('\n');
}

/** WhatsApp carries the generated message (or pass the visitor's edited text directly). */
export function whatsappText(e: Enquiry): string {
  return composeEnquiry(e).text;
}

/** wa.me link; `number` is digits only with country code (e.g. 919566201124). */
export function whatsappHref(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
