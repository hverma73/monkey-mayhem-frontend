// Thin fetch wrapper. Reads the token from localStorage and prefixes /api.
const BASE = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  const token = window.localStorage.getItem('mm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Token expired/invalid: clear storage AND tell AuthContext (which listens for
// this event) so ProtectedRoute redirects to /login instead of leaving the user
// on broken authed pages.
function handleUnauthorized() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('mm_token');
    window.localStorage.removeItem('mm_user');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mm-logout'));
  }
}

// `auth: false` opts a call out of the Bearer header entirely. Needed for the
// public enquiry POST: the site and the console share one origin and therefore
// one localStorage, so a signed-in coach who clicks "View site" and fills in
// the contact form would otherwise attach their staff token to an endpoint that
// doesn't want it — and any 401 it provoked would sign them out of the console
// from the marketing site.
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    if (res.status === 401 && auth) handleUnauthorized();
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

// Fetch a binary file (PDF / xlsx) WITH the Bearer header — a plain <a href> or
// window.open can't attach it. Returns { blob, filename } (filename from the
// Content-Disposition header, which the API exposes via CORS).
async function requestBlob(path) {
  const res = await fetch(`${BASE}/api${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    let msg = `Download failed (${res.status})`;
    try { const j = await res.json(); msg = j?.error || msg; } catch { /* binary/no body */ }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const m = /filename="?([^"]+)"?/.exec(cd);
  return { blob, filename: m ? m[1] : null };
}

export const api = {
  // auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),

  // members
  listMembers: (search = '', status = '') =>
    request(`/members?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),
  getMember: (id) => request(`/members/${id}`),
  createMember: (payload) => request('/members', { method: 'POST', body: payload }),
  updateMember: (id, payload) => request(`/members/${id}`, { method: 'PUT', body: payload }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  renewMember: (id, payload) => request(`/members/${id}/renew`, { method: 'POST', body: payload }),
  // Edit / delete one membership period (a renewal). end_date is recomputed
  // server-side from the package duration; payment receipts are left untouched.
  updateMembership: (id, membershipId, payload) =>
    request(`/members/${id}/membership/${membershipId}`, { method: 'PUT', body: payload }),
  deleteMembership: (id, membershipId) =>
    request(`/members/${id}/membership/${membershipId}`, { method: 'DELETE' }),

  // leads (public-site enquiries)
  // POST is deliberately unauthenticated — see the `auth` note on request().
  createLead: (payload) => request('/leads', { method: 'POST', body: payload, auth: false }),

  // Live Google reviews for the public site. Unauthenticated for the same
  // reason createLead is: a signed-in coach browsing the marketing site must
  // not attach a staff token to it. Answers { configured: false } rather than
  // an error when no API key is set, so the caller falls back quietly.
  getReviews: () => request('/reviews', { auth: false }),
  listLeads: () => request('/leads'),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),

  // dashboard helpers
  stats: () => request('/members/stats'),
  expiring: (days = 7) => request(`/members/expiring?days=${days}`),
  exportExpiring: (days = 7) => requestBlob(`/members/expiring/export?days=${days}`),
  calendar: (year, month) => request(`/members/calendar?year=${year}&month=${month}`),
  packages: (gender = '') =>
    request(`/members/packages${gender ? `?gender=${encodeURIComponent(gender)}` : ''}`),
  createPackage: (payload) => request('/members/packages', { method: 'POST', body: payload }),

  // import
  // No page calls this anymore (the UI imports Excel) — kept for scripted /
  // console use against the still-live JSON endpoint POST /api/import.
  importMembers: (records) => request('/import', { method: 'POST', body: records }),
  importTemplate: () => requestBlob('/import/template'),
  // The filled template goes up as raw bytes (not JSON), so this bypasses request().
  importMembersExcel: async (file) => {
    const res = await fetch(`${BASE}/api/import/excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', ...authHeaders() },
      body: file,
    });
    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) {
      if (res.status === 401) handleUnauthorized();
      // A proxy may answer 413 before our server's JSON error handler can.
      if (res.status === 413) throw new Error(data?.error || 'That file is too large to upload (limit 10 MB).');
      throw new Error(data?.error || `Import failed (${res.status})`);
    }
    return data;
  },

  // payments
  listPayments: ({ status = 'all', search = '' } = {}) =>
    request(`/payments?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`),
  createPayment: (payload) => request('/payments', { method: 'POST', body: payload }),
  updatePayment: (id, payload) => request(`/payments/${id}`, { method: 'PUT', body: payload }),
  deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),
  createCustomPlan: (payload) => request('/payments/custom-plan', { method: 'POST', body: payload }),
  downloadInvoice: (membershipId) => requestBlob(`/payments/invoice/${membershipId}`),
  exportPayments: ({ status = 'all', search = '' } = {}) =>
    requestBlob(`/payments/export?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`),
  listReceiptsForMembership: (membershipId) =>
    request(`/payments?membership_id=${encodeURIComponent(membershipId)}`),

  // reports (the three Payments tabs)
  paymentsSummary: () => request('/reports/payments-summary'),
  paymentsSummaryDetail: (kind) => request(`/reports/payments-summary/detail?kind=${encodeURIComponent(kind)}`),
  exportPendingPayments: () => requestBlob('/reports/pending/export'),
  listInvoices: ({ search = '' } = {}) => request(`/reports/invoices?search=${encodeURIComponent(search)}`),
  exportInvoices: ({ search = '' } = {}) => requestBlob(`/reports/invoices/export?search=${encodeURIComponent(search)}`),
  paymentHistory: (year) => request(`/reports/payment-history?year=${encodeURIComponent(year)}`),
  exportPaymentHistory: (year) => requestBlob(`/reports/payment-history/export?year=${encodeURIComponent(year)}`),
  listMemberReport: ({ search = '' } = {}) => request(`/reports/members?search=${encodeURIComponent(search)}`),
  exportMembers: ({ search = '' } = {}) => requestBlob(`/reports/members/export?search=${encodeURIComponent(search)}`),

  // membership pause
  pauseInfo: (memberId) => request(`/members/${memberId}/pause-info`),
  pauseMembership: (memberId, payload) => request(`/members/${memberId}/pause`, { method: 'POST', body: payload }),
  resumeMembership: (memberId) => request(`/members/${memberId}/resume`, { method: 'POST' }),
  cancelPause: (memberId, pauseId) => request(`/members/${memberId}/pause/${pauseId}`, { method: 'DELETE' }),
};
