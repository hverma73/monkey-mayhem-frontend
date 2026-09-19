/* =====================================================================
   ENQUIRY CAPTURE — the public site's contact form and chatbot file leads
   through here; the staff console reads them back via api.listLeads().

   These used to be localStorage, which meant an enquiry submitted on a
   visitor's phone was only ever visible in that same browser — i.e. staff
   never saw it. They now go to POST /api/leads (which is public), so the
   front desk sees every enquiry on any device.

   Kept as a thin module rather than calling `api` straight from the pages so
   the SOURCE_* vocabulary — which has to match the CHECK constraint in
   migration 009_lead.sql — lives in exactly one place.
   ===================================================================== */

import { api } from '../api.js';

export const SOURCE_FORM = 'Website form';
export const SOURCE_CHATBOT = 'Chatbot';

// Files one enquiry. REJECTS on network/server failure — callers must catch and
// offer the visitor another way through (both fall back to the club's WhatsApp
// link), because quietly swallowing this loses a real lead.
//
// Note there is deliberately no localStorage fallback: queueing a failed
// enquiry into the browser would recreate the exact bug this replaced — the
// lead sitting somewhere no staff member can ever read it, while looking like
// it succeeded.
// `trap` is the contact form's honeypot: a field a real visitor never sees, so
// anything in it marks the submission as a bot and the server drops it (while
// still answering 201, so the bot learns nothing). The chatbot has no form to
// hide a field in, so it simply omits it.
export function addLead({ name, phone, email = '', interest, source, message = '', trap = '' }) {
  return api.createLead({ name, phone, email, interest, source, message, trap });
}
