import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContext, contactHref, composeDraft, mailtoHref, gmailHref, outlookHref, whatsappText, whatsappHref } from '../src/lib/enquiry.ts';

test('parseContext keeps only whitelisted intent/source and slug-shaped items', () => {
  assert.deepEqual(parseContext('?intent=specification&source=attraction&item=mirror-maze'), {
    intent: 'specification', source: 'attraction', item: 'mirror-maze',
  });
  assert.deepEqual(parseContext('?intent=hack&source=evil&item=jane%40example.com'), { intent: 'project', source: undefined, item: undefined });
  assert.equal(parseContext('?item=<script>').item, undefined);
});

test('contactHref never carries non-slug items', () => {
  assert.equal(contactHref({ intent: 'specification', source: 'attraction', item: 'the-walk-vr' }), '/contact/?intent=specification&source=attraction&item=the-walk-vr#enquiry');
  assert.equal(contactHref({ intent: 'project', item: 'Jane Doe' }), '/contact/?intent=project#enquiry');
  assert.equal(contactHref({}), '/contact/');
});

test('specification subject carries the product identifier', () => {
  const d = composeDraft('specification', {}, { label: 'Mirror Maze', id: 'mirror-maze' });
  assert.equal(d.subject, 'Specification request — Mirror Maze [mirror-maze]');
  assert.match(d.body, /specifications for Mirror Maze/);
});

test('project draft lists only filled fields', () => {
  const d = composeDraft('project', { name: ' Asha ', venue: 'Mall', timeline: '' });
  assert.equal(d.subject, 'Project enquiry — Mall');
  assert.match(d.body, /Name: Asha\nVenue type: Mall/);
  assert.doesNotMatch(d.body, /Timeline/);
  assert.doesNotMatch(d.body, /\n{3,}/);
});

test('links are fully encoded with CRLF line breaks', () => {
  const d = { subject: 'A & B?', body: 'line 1\nline #2' };
  assert.equal(mailtoHref('x@y.com', d), 'mailto:x@y.com?subject=A%20%26%20B%3F&body=line%201%0D%0Aline%20%232');
  assert.match(gmailHref('x@y.com', d), /^https:\/\/mail\.google\.com\/mail\/\?view=cm&fs=1&to=x%40y\.com&su=A%20%26%20B%3F&body=/);
  assert.match(outlookHref('x@y.com', d), /^https:\/\/outlook\.office\.com\/mail\/deeplink\/compose\?to=x%40y\.com&subject=/);
  assert.equal(mailtoHref('x@y.com', {}), 'mailto:x@y.com');
});

test('WhatsApp text carries greeting, intent, attraction and supplied details only', () => {
  const t = whatsappText('specification', { attraction: 'Mirror Maze', name: 'Asha', company: '' });
  assert.equal(t, "Hello Mega Fun Amusements,\n\nI'd like to request specifications.\n\nEnquiry type: Product specification request\nAttraction: Mirror Maze\nName: Asha");
  assert.doesNotMatch(whatsappText('general', {}), /Attraction|Name/);
});

test('WhatsApp link is wa.me with digits only and encoded text', () => {
  assert.equal(whatsappHref('+91 95662-01124', 'Hi & bye\nok'), 'https://wa.me/919566201124?text=Hi%20%26%20bye%0Aok');
});
