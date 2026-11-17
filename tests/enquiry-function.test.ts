// Tests for the Pages Function with mocked Turnstile, Resend and static-assets binding.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost, onRequest, type Env } from '../functions/api/enquiry.ts';

const realFetch = globalThis.fetch;
let calls: { url: string; init?: RequestInit }[] = [];
let turnstileOk = true;
let resendOk = true;

beforeEach(() => {
  calls = [];
  turnstileOk = true;
  resendOk = true;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    calls.push({ url: u, init });
    if (u.includes('turnstile')) return new Response(JSON.stringify({ success: turnstileOk }));
    if (u.includes('resend')) return new Response('{}', { status: resendOk ? 200 : 500 });
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const env = (o: Partial<Env> = {}): Env => ({
  RESEND_API_KEY: 're_test',
  TURNSTILE_SECRET_KEY: 'ts_secret',
  ENQUIRY_TO: 'inbox@example.com',
  ENQUIRY_FROM: 'Site <site@example.com>',
  ASSETS: { fetch: async () => new Response(JSON.stringify({ categories: [{ id: 'illusion-experiences', name: 'Illusion Experiences' }] })) },
  ...o,
});
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://www.example.com/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://www.example.com', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const edited = 'Hello team,\n\nWe are opening an FEC in Pune and want two illusion rooms.\n\nThanks,\nAsha';
const good = { intent: 'project', category: 'illusion-experiences', name: 'Asha', phone: '+91 98765 43210', message: edited, token: 'tok' };

test('valid enquiry: verifies Turnstile, sends the exact edited message plus structured details', async () => {
  const res = await onRequestPost({ request: req(good), env: env() });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /turnstile\/v0\/siteverify/);
  const sent = JSON.parse(String(calls[1].init!.body));
  assert.deepEqual(sent.to, ['inbox@example.com']);
  assert.equal(sent.subject, 'Project enquiry — Illusion Experiences — Asha');
  assert.ok(sent.text.startsWith(`${edited}\n\n—\nEnquiry details\n`), 'message sent verbatim, first');
  assert.match(sent.text, /Name: Asha\nPhone: \+91 98765 43210\nAttraction category: Illusion Experiences\nEnquiry type: New project enquiry/);
  assert.equal((calls[1].init!.headers as Record<string, string>).Authorization, 'Bearer re_test');
});

test('invalid fields are rejected before any outbound call', async () => {
  const res = await onRequestPost({ request: req({ ...good, name: '', category: 'motion-based', message: '   ' }), env: env() });
  assert.equal(res.status, 422);
  assert.deepEqual(await res.json(), { ok: false, error: 'invalid', fields: ['category', 'name', 'message'] });
  assert.equal(calls.length, 0);
});

test('failed Turnstile check sends nothing', async () => {
  turnstileOk = false;
  const res = await onRequestPost({ request: req(good), env: env() });
  assert.equal(res.status, 400);
  assert.equal(((await res.json()) as { error: string }).error, 'verification');
  assert.equal(calls.filter((c) => c.url.includes('resend')).length, 0);
});

test('missing configuration answers 503 without calling out', async () => {
  const res = await onRequestPost({ request: req(good), env: env({ RESEND_API_KEY: undefined }) });
  assert.equal(res.status, 503);
  assert.equal(calls.length, 0);
});

test('Resend failure is reported as send error', async () => {
  resendOk = false;
  const res = await onRequestPost({ request: req(good), env: env() });
  assert.equal(res.status, 502);
  assert.equal(((await res.json()) as { error: string }).error, 'send');
});

test('cross-origin, non-JSON, oversized and malformed requests are refused', async () => {
  assert.equal((await onRequestPost({ request: req(good, { Origin: 'https://evil.example' }), env: env() })).status, 403);
  assert.equal((await onRequestPost({ request: req(good, { 'Content-Type': 'text/plain' }), env: env() })).status, 415);
  assert.equal((await onRequestPost({ request: req({ ...good, message: 'x'.repeat(13000) }), env: env() })).status, 413);
  assert.equal((await onRequestPost({ request: req('{nope'), env: env() })).status, 400);
  assert.equal((await onRequestPost({ request: req('[1,2]'), env: env() })).status, 400);
  assert.equal(calls.length, 0);
});

test('honeypot submissions get a fake success and send nothing', async () => {
  const res = await onRequestPost({ request: req({ ...good, website: 'http://spam' }), env: env() });
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(calls.length, 0);
});

test('other methods get 405', () => {
  assert.equal(onRequest().status, 405);
});
