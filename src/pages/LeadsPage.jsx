import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { waTo } from '../utils.js';
import Pagination from '../components/Pagination.jsx';

const LEADS_PAGE_SIZE = 10;

/* Enquiries captured by the public site's contact form and chatbot.

   These come from the API — POST /api/leads is public, this list is staff-only
   — so an enquiry filed on a visitor's own phone lands here. "Reply" opens
   WhatsApp addressed to the *enquirer*; see waTo() in utils.js for the caveat
   about which account it sends FROM.

   The chatbot takes free text at its "what's your number?" step, so the server
   hands back phone_e164: null whenever what they typed isn't dialable. Those
   rows get a dead Reply button explaining why, rather than a link that opens a
   chat with nobody. */
export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.listLeads()
      .then((rows) => { if (!cancelled) setLeads(rows); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // A new search or a reload changes the result set — back to page 1.
  useEffect(() => { setPage(1); }, [search, refreshKey]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.phone, l.phone_e164, l.email, l.interest, l.source, l.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [leads, search]);

  // Clamp rather than trust `page`: deleting the last row on the last page
  // would otherwise leave us past the end showing an empty table.
  const totalPages = Math.max(1, Math.ceil(rows.length / LEADS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * LEADS_PAGE_SIZE, safePage * LEADS_PAGE_SIZE);

  async function handleDelete(lead) {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`)) return;
    setError('');
    setDeletingId(lead.id);
    try {
      await api.deleteLead(lead.id);
      setRefreshKey((k) => k + 1); // refetch — the server is the source of truth
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="section-head" style={{ marginTop: 0 }}>
        <div>
          <span className="eyebrow">From the website</span>
          <h2>Enquiries</h2>
        </div>
        <div className="toolbar">
          <input
            placeholder="Search name, phone, interest…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn ghost"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Interest</th>
              <th>Source</th>
              <th>When</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((l) => (
              <tr key={l.id}>
                <td>
                  <b>{l.name}</b>
                  {l.email && <div className="muted">{l.email}</div>}
                </td>
                {/* Raw input on top, the dialable form beneath when they differ,
                    so a coach can see the number Reply will actually open. */}
                <td>
                  {l.phone || '—'}
                  {l.phone_e164 && l.phone_e164 !== l.phone && (
                    <div className="muted">{l.phone_e164}</div>
                  )}
                </td>
                <td>{l.interest || '—'}</td>
                <td><span className="chip noplan">{l.source}</span></td>
                <td>{fmtWhen(l.created_at)}</td>
                <td className="muted" style={{ maxWidth: 260 }}>{l.message || '—'}</td>
                <td>
                  <div className="actions-row" style={{ marginTop: 0 }}>
                    <ReplyButton lead={l} />
                    <button
                      className="btn sm danger"
                      onClick={() => handleDelete(l)}
                      disabled={deletingId === l.id}
                    >
                      {deletingId === l.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!pageRows.length && (
              <tr>
                <td colSpan={7} className="empty">
                  {loading
                    ? 'Loading enquiries…'
                    : leads.length
                      ? 'No enquiries match that search.'
                      : 'No enquiries yet. Submit the contact form on the public site to see one land here.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={safePage}
        pageSize={LEADS_PAGE_SIZE}
        total={rows.length}
        onPageChange={setPage}
      />
    </>
  );
}

function ReplyButton({ lead }) {
  const href = waTo(
    lead.phone_e164,
    `Hi ${lead.name}, thanks for reaching out to Monkey Mayhem! When would you like to come in for a trial?`
  );

  if (!href) {
    // A disabled button swallows mouse events, so the tooltip goes on a
    // wrapper that still receives hover.
    return (
      <span title={`“${lead.phone}” isn't a number we can message — call or email them instead.`}>
        <button className="btn sm ghost" disabled>Reply</button>
      </span>
    );
  }

  return (
    <a className="btn sm ghost" target="_blank" rel="noopener noreferrer" href={href}>
      Reply
    </a>
  );
}

/* "Today, 09:14" for anything from today, otherwise "12 Aug, 09:14".
   The `!iso` guard is load-bearing: new Date(null) is the epoch, not Invalid
   Date, so a null column would otherwise render "01 Jan, 00:00". */
function fmtWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const isToday = d.toDateString() === new Date().toDateString();
  if (isToday) return `Today, ${time}`;
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, ${time}`;
}
