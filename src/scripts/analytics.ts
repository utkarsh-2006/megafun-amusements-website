/**
 * Replaceable analytics adapter (brief §7.4). Every CTA declares its event with
 * `data-track="<event>"` and an optional `data-track-source`; this file is the only
 * place that talks to a provider. Only whitelisted, non-personal properties are sent.
 */
import { analytics, analyticsEnabled, analyticsEvents, allowedEventProps, type AnalyticsEvent } from '../config/analytics.ts';

type Props = Partial<Record<(typeof allowedEventProps)[number], string>>;
declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
    mfTrack?: (event: AnalyticsEvent, props?: Props) => void;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (!(analyticsEvents as readonly string[]).includes(event)) return;
  const clean: Record<string, string> = { page_type: document.body.dataset.pageType ?? 'unknown' };
  for (const k of allowedEventProps) {
    const v = props[k];
    // Values are short enums/slugs only; anything else (e.g. free text) is dropped.
    if (v && /^[a-z0-9_-]{1,64}$/.test(v)) clean[k] = v;
  }
  if (!analyticsEnabled) {
    if (import.meta.env.DEV) console.debug('[analytics:disabled]', event, clean);
    return;
  }
  if (analytics.provider === 'plausible') window.plausible?.(event, { props: clean });
}

window.mfTrack = track;

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (!el) return;
  track(el.dataset.track as AnalyticsEvent, {
    source: el.dataset.trackSource,
    intent: el.dataset.trackIntent,
    item: el.dataset.trackItem,
  });
});
