/**
 * Contact page enhancement: guided draft builder (brief §7.2–7.3).
 * - One product state: every `[data-product]` select (the "Attraction of interest" field and
 *   the card's "Select a product") mirrors the same value; it persists across intent changes
 *   until the visitor clears it.
 * - The message is editable; once edited it is kept (subject and links still update) until
 *   the visitor chooses "Rebuild from form".
 * Reads only approved context parameters, never personal data, from the URL.
 */
import { parseContext, composeDraft, mailtoHref, gmailHref, outlookHref, whatsappHref, whatsappText, type Intent, type Fields } from '../lib/enquiry.ts';
import { track } from './analytics.ts';

const root = document.getElementById('enquiry');
const controls = root?.querySelector<HTMLElement>('[data-builder-controls]');
const card = root?.querySelector<HTMLElement>('[data-builder-card]');
const staticRoutes = root?.querySelector<HTMLElement>('[data-static-routes]');
// The address comes from the (entity-encoded) mailto link already on the page.
const email = document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')?.href.replace(/^mailto:/, '').split('?')[0] ?? '';

if (root && controls && card && email) {
  const $ = <T extends Element>(sel: string) => card.querySelector<T>(sel);
  const out = {
    to: $<HTMLElement>('[data-out-to]')!,
    subject: $<HTMLElement>('[data-out-subject]')!,
    body: $<HTMLTextAreaElement>('[data-out-body]')!,
    mailto: $<HTMLAnchorElement>('[data-out-mailto]')!,
    gmail: $<HTMLAnchorElement>('[data-out-gmail]')!,
    outlook: $<HTMLAnchorElement>('[data-out-outlook]')!,
    whatsapp: $<HTMLAnchorElement>('[data-out-whatsapp]'),
    reset: $<HTMLButtonElement>('[data-reset]')!,
    status: $<HTMLElement>('[data-status]')!,
  };
  const waNumber = out.whatsapp ? new URL(out.whatsapp.href).pathname.slice(1) : '';
  const productSelects = [...root.querySelectorAll<HTMLSelectElement>('select[data-product]')];
  const el = (name: string) => controls.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`);
  const text = (name: string) => {
    const e = el(name);
    if (!e) return '';
    if (e instanceof HTMLSelectElement) return e.value === 'other' ? 'Other' : e.value ? e.selectedOptions[0].text : '';
    return e.value;
  };

  let product = '';
  let bodyEdited = false;
  const productName = () => (product ? (productSelects[0]?.querySelector<HTMLOptionElement>(`option[value="${product}"]`)?.text ?? '') : '');
  function setProduct(slug: string) {
    product = productSelects.some((s) => [...s.options].some((o) => o.value === slug)) ? slug : '';
    for (const s of productSelects) s.value = product;
  }

  // Apply context from the source page.
  const ctx = parseContext(location.search);
  root.querySelector<HTMLInputElement>(`input[name=intent][value=${ctx.intent}]`)!.checked = true;
  if (ctx.item) {
    setProduct(ctx.item);
    const venue = el('venue') as HTMLSelectElement | null;
    if (venue && [...venue.options].some((o) => o.value === ctx.item)) venue.value = ctx.item;
  }

  const intent = () => (root.querySelector<HTMLInputElement>('input[name=intent]:checked')?.value ?? 'project') as Intent;

  function update() {
    const i = intent();
    for (const e of controls!.querySelectorAll<HTMLElement>('[data-for]')) e.hidden = !e.dataset.for!.split(' ').includes(i);
    const fields: Fields = {
      name: text('name'),
      company: text('company'),
      attraction: productName(),
      ...(i === 'project' ? { venue: text('venue'), location: text('location'), timeline: text('timeline'), constraints: text('constraints') } : {}),
      ...(i !== 'project' ? { message: text('message') } : {}),
    };
    const item = product ? { label: productName(), id: product } : undefined;
    const draft = composeDraft(i, fields, i === 'specification' ? item : undefined);
    if (!bodyEdited) out.body.value = draft.body;
    const final = { subject: draft.subject, body: out.body.value };
    out.to.textContent = email;
    out.subject.textContent = final.subject;
    out.mailto.href = mailtoHref(email, final);
    out.gmail.href = gmailHref(email, final);
    out.outlook.href = outlookHref(email, final);
    if (out.whatsapp && waNumber) out.whatsapp.href = whatsappHref(waNumber, bodyEdited ? `${out.body.value}` : whatsappText(i, fields));
    out.reset.hidden = !bodyEdited;
    for (const a of card!.querySelectorAll<HTMLElement>('[data-track]')) {
      a.dataset.trackIntent = i;
      if (product) a.dataset.trackItem = product;
      else delete a.dataset.trackItem;
    }
  }

  async function copy(value: string, what: string) {
    try {
      await navigator.clipboard.writeText(value);
      out.status.textContent = `${what} copied.`;
    } catch {
      // Clipboard unavailable: leave the text selected so it can be copied manually.
      if (what === 'Message') {
        out.body.focus();
        out.body.select();
      }
      out.status.textContent = `Copy isn't available here — select the ${what.toLowerCase()} and copy it manually.`;
    }
  }

  const onChange = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLSelectElement && t.hasAttribute('data-product')) setProduct(t.value);
    update();
  };
  for (const scope of [controls, card]) {
    scope.addEventListener('input', onChange);
    scope.addEventListener('change', onChange);
  }
  root.querySelectorAll('input[name=intent]').forEach((r) => r.addEventListener('change', update));
  out.body.addEventListener('input', () => {
    bodyEdited = true;
    out.reset.hidden = false;
  });
  out.reset.addEventListener('click', () => {
    bodyEdited = false;
    update();
    out.status.textContent = 'Message rebuilt from the form.';
  });
  card.querySelector('[data-copy=email]')!.addEventListener('click', () => copy(email, 'Email address'));
  card.querySelector('[data-copy=message]')!.addEventListener('click', () => copy(`Subject: ${out.subject.textContent}\n\n${out.body.value}`, 'Message'));
  out.mailto.addEventListener('click', () => {
    out.status.textContent = 'Your email app should open with the draft. Remember to press send.';
  });
  out.whatsapp?.addEventListener('click', () => {
    out.status.textContent = 'WhatsApp should open with your message. Review it and press send.';
  });

  update();
  controls.hidden = false;
  card.hidden = false;
  if (staticRoutes) staticRoutes.hidden = true;
  track('contact_page_view', { intent: ctx.intent, source: ctx.source, item: ctx.item });
} else {
  track('contact_page_view');
}
