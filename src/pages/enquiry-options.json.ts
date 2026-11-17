/**
 * Allow-list of enquiry categories for the Pages Function (functions/api/enquiry.ts), which
 * reads it through the static-assets binding. Generated from the same resolver as the Contact
 * page, so the browser and the server always agree. Names only.
 */
import type { APIRoute } from 'astro';
import { site } from '../lib/content.ts';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ categories: (await site()).enquiryCategories }), {
    headers: { 'Content-Type': 'application/json' },
  });
