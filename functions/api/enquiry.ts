/**
 * POST /api/enquiry — Cloudflare Pages Function (owner decision, 18 Nov 2026).
 * Astro contact card → this function → Turnstile verification → Resend → company inbox.
 *
 * - Validates every field server-side with the same rules as the browser (src/lib/enquiry.ts) and
 *   checks the category against the build's allow-list (/enquiry-options.json).
 * - Sends the visitor's exact (possibly edited) message, followed by structured details (name,
 *   phone, category, enquiry type). The subject is generated server-side, as shown in the card.
 * - Secrets live in Cloudflare environment variables; nothing here reaches the browser.
 * - Nothing is stored. Responses never echo submitted values.
 *
 * Environment (Cloudflare Pages → Settings → Variables and secrets):
 *   RESEND_API_KEY        secret   Resend API key
 *   TURNSTILE_SECRET_KEY  secret   Turnstile secret key
 *   ENQUIRY_TO            plain    company inbox that receives enquiries
 *   ENQUIRY_FROM          plain    verified Resend sender, e.g. "Mega Fun Website <enquiries@megafunamusements.com>"
 */
import { enquiryEmailText, enquirySubject, validateEnquiry } from '../../src/lib/enquiry.ts';

export interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
  /** Static assets binding provided by Cloudflare Pages. */
  ASSETS?: { fetch: (input: Request | string) => Promise<Response> };
}

type Ctx = { request: Request; env: Env };
type Fail = 'invalid' | 'verification' | 'unavailable' | 'send' | 'bad-request';

const MAX_BODY = 12_000; // characters; the message itself is capped at MESSAGE_MAX (3000)

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const fail = (status: number, error: Fail, extra: Record<string, unknown> = {}) => json(status, { ok: false, error, ...extra });

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  // Same-origin only (the contact card is the only intended caller).
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return fail(403, 'bad-request');
  if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) return fail(415, 'bad-request');

  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail(413, 'bad-request');
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(400, 'bad-request');
    input = parsed as Record<string, unknown>;
  } catch {
    return fail(400, 'bad-request');
  }

  // Honeypot: a filled hidden field means an automated submission. Pretend success, send nothing.
  if (typeof input.website === 'string' && input.website.trim() !== '') return json(200, { ok: true });

  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY || !env.ENQUIRY_TO || !env.ENQUIRY_FROM || !env.ASSETS) {
    return fail(503, 'unavailable');
  }

  // Category allow-list from this deployment's own static build.
  let categories: { id: string; name: string }[] = [];
  try {
    const res = await env.ASSETS.fetch(new URL('/enquiry-options.json', request.url).toString());
    if (res.ok) categories = ((await res.json()) as { categories?: { id: string; name: string }[] }).categories ?? [];
  } catch {
    return fail(503, 'unavailable');
  }

  const v = validateEnquiry(input, categories);
  if (!v.ok) return fail(422, 'invalid', { fields: Object.keys(v.errors) });

  // Turnstile verification.
  const token = typeof input.token === 'string' ? input.token : '';
  if (!token || token.length > 2048) return fail(400, 'verification');
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);
  try {
    const t = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const outcome = (await t.json()) as { success?: boolean };
    if (!outcome.success) return fail(400, 'verification');
  } catch {
    return fail(502, 'verification');
  }

  // The visitor's exact message, then structured details; subject generated as shown in the card.
  const { intent, categoryName, name } = v.value;
  const subject = enquirySubject({ intent, category: categoryName, name });
  const text = enquiryEmailText(v.value, new URL(request.url).host);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM,
        to: [env.ENQUIRY_TO],
        subject,
        text,
      }),
    });
    if (!res.ok) return fail(502, 'send');
  } catch {
    return fail(502, 'send');
  }
  return json(200, { ok: true });
}

/** Anything other than POST. */
export function onRequest(): Response {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
}
