/**
 * Analytics adapter configuration. Tracking is OFF until a provider and the Privacy
 * wording are approved (brief §7.4). Events carry page type/source only — never
 * names, email addresses, phone numbers or message text.
 */
export const analyticsEvents = [
  'contact_page_view',
  'project_cta_click',
  'specification_cta_click',
  /** Contact card: enquiry accepted by the server (never includes the enquiry content). */
  'enquiry_submitted',
  'mailto_open',
  'phone_click',
  'whatsapp_open',
  'capability_profile_download',
] as const;
export type AnalyticsEvent = (typeof analyticsEvents)[number];

/** Property keys an event may carry. Anything else is dropped by the adapter. */
export const allowedEventProps = ['page_type', 'source', 'intent', 'item'] as const;

export const analytics = {
  /** 'plausible' or '' (disabled). Set PUBLIC_ANALYTICS_PROVIDER once approved. */
  provider: (import.meta.env.PUBLIC_ANALYTICS_PROVIDER ?? '') as '' | 'plausible',
  domain: import.meta.env.PUBLIC_ANALYTICS_DOMAIN ?? '',
  /** Must be flipped to true only after company + legal approval of the Privacy page. */
  approved: false,
};

export const analyticsEnabled = analytics.approved && analytics.provider !== '' && analytics.domain !== '';
