import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContext, contactHref, composeDraft, mailtoHref, composeEnquiry, validateEnquiry, whatsappText, whatsappHref, cleanMessage, enquiryEmailText } from '../src/lib/enquiry.ts';

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

test('mailto links are fully encoded with CRLF line breaks', () => {
  const d = { subject: 'A & B?', body: 'line 1\nline #2' };
  assert.equal(mailtoHref('x@y.com', d), 'mailto:x@y.com?subject=A%20%26%20B%3F&body=line%201%0D%0Aline%20%232');
  assert.equal(mailtoHref('x@y.com', {}), 'mailto:x@y.com');
});

test('composeEnquiry: greeting, category, name and optional phone', () => {
  const e = composeEnquiry({ intent: 'project', category: 'Illusion Experiences', name: '  Asha  Rao ', phone: '+91 98765 43210' });
  assert.equal(e.subject, 'Project enquiry — Illusion Experiences — Asha Rao');
  assert.deepEqual(e.paragraphs, [
    'Hello Mega Fun Amusements team,',
    "I'd like to discuss a project involving your Illusion Experiences.",
    'Please contact me on +91 98765 43210 to discuss the details.',
    'Kind regards,\nAsha Rao\n+91 98765 43210',
  ]);
  assert.equal(e.text, e.paragraphs.join('\n\n'));
  const bare = composeEnquiry({ intent: 'general', name: 'Asha' });
  assert.equal(bare.subject, 'General enquiry — Asha');
  assert.match(bare.text, /I have a general enquiry\.\n\nPlease get in touch/);
  assert.doesNotMatch(bare.text, /undefined/);
});

const cats = [{ id: 'illusion-experiences', name: 'Illusion Experiences' }];

test('validateEnquiry accepts good input and resolves the category name from the allow-list', () => {
  const v = validateEnquiry({ intent: 'specification', category: 'illusion-experiences', name: 'Ána O’Neil-Smith', phone: '(044) 2345-6789', message: ' Hi\r\nthere ' }, cats);
  assert.deepEqual(v, { ok: true, value: { intent: 'specification', name: 'Ána O’Neil-Smith', message: 'Hi\nthere', categoryId: 'illusion-experiences', categoryName: 'Illusion Experiences', phone: '(044) 2345-6789' } });
  assert.equal(validateEnquiry({ intent: 'general', category: '', name: 'Ravi', phone: '', message: 'Hello' }, cats).ok, true);
});

test('validateEnquiry rejects missing/invalid fields and unknown categories', () => {
  const v = validateEnquiry({ intent: 'hack', category: 'motion-based', name: 'https://spam.example', phone: '12' }, cats);
  assert.equal(v.ok, false);
  if (!v.ok) assert.deepEqual(Object.keys(v.errors).sort(), ['category', 'intent', 'message', 'name', 'phone']);
  const empty = validateEnquiry({ intent: 'project', name: '   ', message: 'Hi' }, cats);
  assert.equal(!empty.ok && empty.errors.name, 'Please enter your name.');
  assert.equal(validateEnquiry({ intent: 'project', name: { toString: () => 'x' }, message: 'Hi' }, cats).ok, false, 'non-strings rejected');
  const long = validateEnquiry({ intent: 'project', name: 'Asha', message: 'x'.repeat(3001) }, cats);
  assert.equal(!long.ok && !!long.errors.message, true, 'message length capped');
});

test('cleanMessage keeps line breaks, drops control characters', () => {
  assert.equal(cleanMessage('a\u0000b\r\n\n\n\n\nc\t'), 'ab\n\n\nc');
});

test('company email = the exact message, then structured details', () => {
  const t = enquiryEmailText({ intent: 'general', name: 'Ravi', message: 'My own words.' }, 'example.com');
  assert.equal(t, 'My own words.\n\n—\nEnquiry details\nName: Ravi\nPhone: not provided\nAttraction category: not specified\nEnquiry type: General enquiry\nSent from the enquiry card at example.com/contact/');
});

test('WhatsApp carries the same text as the email preview', () => {
  const e = { intent: 'project' as const, category: 'Illusion Experiences', name: 'Asha' };
  assert.equal(whatsappText(e), composeEnquiry(e).text);
  assert.equal(whatsappHref('+91 95662-01124', 'Hi & bye\nok'), 'https://wa.me/919566201124?text=Hi%20%26%20bye%0Aok');
});
