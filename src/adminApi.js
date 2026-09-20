// Staff-console API client. This module is imported only by the separately built admin app.
const BASE = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = window.localStorage.getItem('mm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized() {
  window.localStorage.removeItem('mm_token');
  window.localStorage.removeItem('mm_user');
  window.dispatchEvent(new Event('mm-logout'));
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) },
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

async function requestBlob(path) {
  const res = await fetch(`${BASE}/api${path}`, { headers: authHeaders() });
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    let message = `Download failed (${res.status})`;
    try { const data = await res.json(); message = data?.error || message; } catch { /* binary/no body */ }
    throw new Error(message);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return { blob, filename: match ? match[1] : null };
}

export const api = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  listMembers: (search = '', status = '') => request(`/members?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),
  getMember: (id) => request(`/members/${id}`),
  createMember: (payload) => request('/members', { method: 'POST', body: payload }),
  updateMember: (id, payload) => request(`/members/${id}`, { method: 'PUT', body: payload }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  renewMember: (id, payload) => request(`/members/${id}/renew`, { method: 'POST', body: payload }),
  updateMembership: (id, membershipId, payload) => request(`/members/${id}/membership/${membershipId}`, { method: 'PUT', body: payload }),
  deleteMembership: (id, membershipId) => request(`/members/${id}/membership/${membershipId}`, { method: 'DELETE' }),
  createLead: (payload) => request('/leads', { method: 'POST', body: payload, auth: false }),
  getReviews: () => request('/reviews', { auth: false }),
  listLeads: () => request('/leads'),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  stats: () => request('/members/stats'),
  expiring: (days = 7) => request(`/members/expiring?days=${days}`),
  exportExpiring: (days = 7) => requestBlob(`/members/expiring/export?days=${days}`),
  calendar: (year, month) => request(`/members/calendar?year=${year}&month=${month}`),
  packages: (gender = '') => request(`/members/packages${gender ? `?gender=${encodeURIComponent(gender)}` : ''}`),
  createPackage: (payload) => request('/members/packages', { method: 'POST', body: payload }),
  importMembers: (records) => request('/import', { method: 'POST', body: records }),
  importTemplate: () => requestBlob('/import/template'),
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
      if (res.status === 413) throw new Error(data?.error || 'That file is too large to upload (limit 10 MB).');
      throw new Error(data?.error || `Import failed (${res.status})`);
    }
    return data;
  },
  listPayments: ({ status = 'all', search = '' } = {}) => request(`/payments?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`),
  createPayment: (payload) => request('/payments', { method: 'POST', body: payload }),
  updatePayment: (id, payload) => request(`/payments/${id}`, { method: 'PUT', body: payload }),
  deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),
  createCustomPlan: (payload) => request('/payments/custom-plan', { method: 'POST', body: payload }),
  downloadInvoice: (membershipId) => requestBlob(`/payments/invoice/${membershipId}`),
  exportPayments: ({ status = 'all', search = '' } = {}) => requestBlob(`/payments/export?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`),
  listReceiptsForMembership: (membershipId) => request(`/payments?membership_id=${encodeURIComponent(membershipId)}`),
  paymentsSummary: () => request('/reports/payments-summary'),
  paymentsSummaryDetail: (kind) => request(`/reports/payments-summary/detail?kind=${encodeURIComponent(kind)}`),
  exportPendingPayments: () => requestBlob('/reports/pending/export'),
  listInvoices: ({ search = '' } = {}) => request(`/reports/invoices?search=${encodeURIComponent(search)}`),
  exportInvoices: ({ search = '' } = {}) => requestBlob(`/reports/invoices/export?search=${encodeURIComponent(search)}`),
  paymentHistory: (year) => request(`/reports/payment-history?year=${encodeURIComponent(year)}`),
  exportPaymentHistory: (year) => requestBlob(`/reports/payment-history/export?year=${encodeURIComponent(year)}`),
  listMemberReport: ({ search = '' } = {}) => request(`/reports/members?search=${encodeURIComponent(search)}`),
  exportMembers: ({ search = '' } = {}) => requestBlob(`/reports/members/export?search=${encodeURIComponent(search)}`),
  pauseInfo: (memberId) => request(`/members/${memberId}/pause-info`),
  pauseMembership: (memberId, payload) => request(`/members/${memberId}/pause`, { method: 'POST', body: payload }),
  resumeMembership: (memberId) => request(`/members/${memberId}/resume`, { method: 'POST' }),
  cancelPause: (memberId, pauseId) => request(`/members/${memberId}/pause/${pauseId}`, { method: 'DELETE' }),
};
