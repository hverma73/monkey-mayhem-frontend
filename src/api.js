// Public-site API client. Keep console authentication out of this module so
// the public bundle contains no staff routes, storage keys, or auth code.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  createLead: (payload) => request('/leads', { method: 'POST', body: payload }),
  getReviews: () => request('/reviews'),
};
