/**
 * Draft-email builder for the Contact page (brief §7). Pure and dependency-free:
 * used by the contact script in the browser, by Astro pages for static no-JS
 * mailto fallbacks, and by tests.
 *
 * Nothing here sends anything. The visitor's own email client sends the message.
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

export function gmailHref(to: string, d: Draft): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${enc(d.subject)}&body=${enc(d.body)}`;
}

export function outlookHref(to: string, d: Draft): string {
  return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${enc(d.subject)}&body=${enc(d.body)}`;
}

const whatsappIntention: Record<Intent, string> = {
  project: "I'd like to discuss a project.",
  specification: "I'd like to request specifications.",
  service: 'I need support with an installed attraction.',
  general: 'I have a general enquiry.',
};

/**
 * Short WhatsApp message: greeting, intention, enquiry type, attraction and any details
 * supplied. Nothing is sent — WhatsApp opens with the text for the visitor to review.
 */
export function whatsappText(intent: Intent, f: Fields): string {
  const rows: [string, string][] = [
    ['Enquiry type', intentLabels[intent]],
    ['Attraction', clean(f.attraction)],
    ['Name', clean(f.name)],
    ['Company', clean(f.company)],
    ['Venue type', clean(f.venue)],
    ['Location', clean(f.location)],
    ['Timeline', clean(f.timeline)],
    ['Site constraints', clean(f.constraints)],
  ];
  const message = (f.message ?? '').trim();
  return [
    'Hello Mega Fun Amusements,',
    whatsappIntention[intent],
    rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n'),
    message,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** wa.me link; `number` is digits only with country code (e.g. 919566201124). */
export function whatsappHref(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
