/**
 * Contact enquiry card: live preview, validation, sending via /api/enquiry (Pages Function,
 * Turnstile-protected) and the WhatsApp link — all from one state (category, name, phone).
 * Reads only approved context parameters (intent, source, slug item) from the URL.
 */
import { parseContext, composeEnquiry, validateEnquiry, whatsappHref, type Enquiry } from '../lib/enquiry.ts';
import { track } from './analytics.ts';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
    mfTurnstileReady?: () => void;
  }
}

const form = document.querySelector<HTMLFormElement>('form[data-enquiry]');

if (form) {
  const $ = <T extends Element>(sel: string) => form.querySelector<T>(sel);
  const category = $<HTMLSelectElement>('select[name=category]');
  const name = $<HTMLInputElement>('input[name=name]')!;
  const phone = $<HTMLInputElement>('input[name=phone]')!;
  const honeypot = $<HTMLInputElement>('input[name=website]')!;
  const out = {
    subject: $<HTMLElement>('[data-out-subject]')!,
    body: $<HTMLTextAreaElement>('textarea[data-out-body]')!,
    restore: $<HTMLButtonElement>('[data-restore]')!,
    whatsapp: $<HTMLAnchorElement>('[data-out-whatsapp]'),
    send: $<HTMLButtonElement>('[data-send]')!,
    sendLabel: $<HTMLElement>('[data-send-label]')!,
    status: $<HTMLElement>('[data-status]')!,
    turnstile: $<HTMLElement>('[data-turnstile]')!,
  };
  const waNumber = out.whatsapp ? new URL(out.whatsapp.href).pathname.slice(1) : '';
  const allowed = category ? [...category.options].filter((o) => o.value).map((o) => ({ id: o.value, name: o.text })) : [];
  const ctx = parseContext(location.search);

  // Preselect the classification from context (a category slug, or a product slug mapped to its category).
  if (category && ctx.item) {
    const map = JSON.parse(form.dataset.productCategory || '{}') as Record<string, string>;
    const id = allowed.some((c) => c.id === ctx.item) ? ctx.item : map[ctx.item];
    if (id && allowed.some((c) => c.id === id)) category.value = id;
  }

  const state = (): Enquiry => ({
    intent: ctx.intent,
    category: category?.value ? category.selectedOptions[0].text : undefined,
    name: name.value,
    phone: phone.value,
  });

  let sent = false;
  // Dirty-state: the suggested draft follows category/name/phone until the visitor edits the
  // message; from then on their text is never overwritten ("Restore" brings the draft back).
  let edited = false;
  const suggested = () => composeEnquiry(state()).text.replace('\n[Your name]', '');
  function render() {
    out.subject.textContent = composeEnquiry(state()).subject;
    if (!edited) out.body.value = suggested();
    out.restore.hidden = !edited;
    if (out.whatsapp && waNumber) out.whatsapp.href = whatsappHref(waNumber, out.body.value.trim());
  }

  function showErrors(errors: Record<string, string | undefined>) {
    for (const f of ['name', 'phone', 'message'] as const) {
      const el = f === 'name' ? name : f === 'phone' ? phone : out.body;
      const msg = errors[f] ?? '';
      el.setAttribute('aria-invalid', String(!!msg));
      $<HTMLElement>(`[data-error=${f}]`)!.textContent = msg;
    }
  }

  function setStatus(text: string, tone: 'info' | 'ok' | 'error') {
    out.status.textContent = text;
    out.status.className = `mt-4 min-h-5 text-[0.875rem] font-semibold ${tone === 'error' ? 'text-red-700' : tone === 'ok' ? 'text-emerald-700' : 'text-brand-deep'}`;
    out.status.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  }

  // ── Turnstile (only when a site key is configured) ───────────────────────────
  const siteKey = form.dataset.turnstileKey ?? '';
  let widgetId: string | undefined;
  if (siteKey) {
    window.mfTurnstileReady = () => {
      widgetId = window.turnstile!.render(out.turnstile, { sitekey: siteKey, appearance: 'interaction-only', action: 'enquiry' });
    };
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=mfTurnstileReady';
    s.async = true;
    s.defer = true;
    document.head.append(s);
  }
  const token = async (): Promise<string> => {
    if (!siteKey) return '';
    // In interaction-only mode the token usually arrives within a moment; wait briefly for it.
    for (let i = 0; i < 40; i++) {
      const t = window.turnstile?.getResponse(widgetId);
      if (t) return t;
      await new Promise((r) => setTimeout(r, 150));
    }
    return '';
  };

  const messages: Record<string, string> = {
    invalid: 'Please check the highlighted fields.',
    verification: "We couldn't verify the request. Please try again, or use WhatsApp.",
    unavailable: "Sending from this page isn't available right now. Please use WhatsApp, email or phone.",
    send: "Your enquiry couldn't be delivered. Please try again, or use WhatsApp.",
  };

  const payload = () => {
    const e = state();
    return { intent: e.intent, category: category?.value ?? '', name: e.name, phone: e.phone, message: out.body.value };
  };

  form.addEventListener('input', (ev) => {
    // Typing in the message marks it as the visitor's own (unless it matches the suggestion again).
    if (ev.target === out.body) edited = out.body.value !== suggested();
    render();
    // Re-check fields already flagged so their messages clear as soon as they are fixed.
    const flagged = [name, phone, out.body].filter((el) => el.getAttribute('aria-invalid') === 'true');
    if (flagged.length) {
      const v = validateEnquiry(payload(), allowed);
      const errs = v.ok ? {} : v.errors;
      showErrors({
        name: flagged.includes(name) ? errs.name : undefined,
        phone: flagged.includes(phone) ? errs.phone : undefined,
        message: flagged.includes(out.body) ? errs.message : undefined,
      });
      if (v.ok) setStatus('', 'info');
    }
    if (sent) {
      sent = false;
      out.sendLabel.textContent = 'Send Enquiry';
      out.send.disabled = false;
      setStatus('', 'info');
    }
  });
  form.addEventListener('change', render);
  out.restore.addEventListener('click', () => {
    edited = false;
    render();
    out.body.focus();
    setStatus('Suggested message restored.', 'info');
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (out.send.disabled) return;
    const e = state();
    const body = payload();
    const v = validateEnquiry(body, allowed);
    if (!v.ok) {
      showErrors(v.errors);
      setStatus(messages.invalid, 'error');
      (v.errors.name ? name : v.errors.phone ? phone : out.body).focus();
      return;
    }
    showErrors({});
    out.send.disabled = true;
    out.send.setAttribute('aria-busy', 'true');
    out.sendLabel.textContent = 'Sending…';
    setStatus('Sending your enquiry…', 'info');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The exact current message, as typed — the server sends it verbatim.
        body: JSON.stringify({ ...body, website: honeypot.value, token: await token() }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: string[] };
      if (res.ok && data.ok) {
        sent = true;
        out.sendLabel.textContent = 'Enquiry sent';
        setStatus(`Thank you, ${v.value.name}. Your enquiry has been sent to our team.`, 'ok');
        track('enquiry_submitted', { intent: e.intent, item: category?.value || undefined });
        return; // inputs stay as sent; editing re-enables the button
      }
      if (data.error === 'invalid' && data.fields) showErrors(Object.fromEntries(data.fields.map((f) => [f, 'Please check this field.'])));
      setStatus(messages[data.error ?? ''] ?? messages.send, 'error');
    } catch {
      setStatus(messages.send, 'error');
    } finally {
      out.send.removeAttribute('aria-busy');
      if (!sent) {
        out.send.disabled = false;
        out.sendLabel.textContent = 'Send Enquiry';
      }
      if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    }
  });

  render();
  form.hidden = false;
  track('contact_page_view', { intent: ctx.intent, source: ctx.source, item: ctx.item });
}
