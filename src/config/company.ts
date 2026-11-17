/**
 * Company facts — the single source for name, contact routes and company information.
 *
 * Every fact carries `confirmed`. Unconfirmed facts render only in preview builds
 * (with a "Needs confirmation" flag) and are listed in docs/COMPANY_FACTS_TO_CONFIRM.md.
 * Values marked `source: 'existing-site'` were read from www.megafunamusements.com on
 * 2026-11-17; they are the company's own published details, not invented values.
 *
 * Contact email and phone are the exception: they render in production even before
 * confirmation, because they are the company's currently published channels and the
 * site must always offer a working contact route. Replace them here once a dedicated
 * enquiry mailbox is confirmed.
 */
export interface Fact<T> {
  value: T;
  confirmed: boolean;
  source?: 'existing-site' | 'company' | 'brief';
}

export const company = {
  name: 'Mega Fun Amusements',
  /** Shown in titles and structured data. */
  shortName: 'Mega Fun',

  /** Working positioning line (approved copy pending). */
  descriptor: {
    value: 'Amusement attractions manufacturer and turnkey project partner',
    confirmed: false,
    source: 'existing-site',
  } satisfies Fact<string>,

  /** Confirmed by the owner, 18 Nov 2026. */
  founded: { value: 2010, confirmed: true, source: 'company' } satisfies Fact<number>,

  /** The homepage company overview copy lives in src/config/homepage.ts. */

  /** Markets and geographies served. None confirmed. */
  markets: { value: [] as string[], confirmed: false } satisfies Fact<string[]>,

  contact: {
    /** Shared enquiry mailbox. Published on the existing site; a domain mailbox is recommended. */
    email: { value: 'megafunamusements@gmail.com', confirmed: false, source: 'existing-site' } satisfies Fact<string>,
    /** E.164 for tel: links, plus the display form. */
    phone: {
      value: { tel: '+919566201124', display: '+91 95662 01124' },
      confirmed: false,
      source: 'existing-site',
    } satisfies Fact<{ tel: string; display: string }>,
    address: {
      value: ['#13D, 4th Street, Reddipalayam Road', 'Mogappair Industrial Estate', 'Chennai 600037, India'],
      confirmed: false,
      source: 'existing-site',
    } satisfies Fact<string[]>,
    /**
     * Office map pin. Taken from the company's own published map URL
     * (megafunamusements.com/mapview/13-086445395696511/80-16735468059778) and cross-checked on
     * 2026-11-17 with an OpenStreetMap Nominatim reverse geocode, which places the point on
     * "Mogappair West Estate 4th Street", Chennai 600037 — consistent with "#13D, 4th Street … 600037".
     * `verified` = cross-checked against the official site; the company should still sign off.
     * The written address and map render publicly only while `verified` is true.
     */
    location: {
      lat: 13.086445395696511,
      lon: 80.16735468059778,
      label: 'Mega Fun Amusements — office',
      verified: true,
      sources: [
        'https://www.megafunamusements.com/mapview/13-086445395696511/80-16735468059778',
        'https://nominatim.openstreetmap.org/reverse?lat=13.086445395696511&lon=80.16735468059778&format=jsonv2&zoom=18',
      ],
    },
    // Working hours are deliberately not published (owner decision, 18 Nov 2026).
    /**
     * WhatsApp destination (digits only, country code first, for wa.me links): +91 95662 01124.
     * Confirmed by the owner as an official contact number, approved for public display and
     * WhatsApp enquiries (18 Nov 2026).
     */
    whatsapp: { value: '919566201124', confirmed: true, source: 'company' } satisfies Fact<string>,
    /** "What happens next" copy for the contact page. Hidden until the response process is confirmed. */
    responseProcess: { value: '', confirmed: false } satisfies Fact<string>,
  },

  /** Official social profiles. None found on the existing site. */
  social: [] as { label: string; href: string }[],

  /**
   * Capability profile PDF. Set to a media record ID whose kind is `document`.
   * The download CTA renders only when that record is approved and in-term.
   */
  capabilityProfileMediaId: null as string | null,
} as const;

/** Contact details that may render publicly (see header comment). */
export const publicContact = {
  email: company.contact.email.value,
  phone: company.contact.phone.value,
};
