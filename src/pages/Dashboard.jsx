import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDate, daysClass, daysLabel, triggerDownload } from '../utils.js';
import Pagination from '../components/Pagination.jsx';

const ROSTER_PAGE_SIZE = 10;
const STATUS_CLASS = { Active: 'active', Inactive: 'inactive', Paused: 'paused', Upcoming: 'upcoming' };
function StatusChip({ status }) {
  const cls = STATUS_CLASS[status] || 'noplan';
  return <span className={`chip ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [expPage, setExpPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.all([api.stats(), api.expiring(7)]);
        setStats(s);
        setExpiring(e);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Debounced search/filter. The cancelled flag drops any response that lands
  // after a newer query fired (or after unmount) — without it a slow "jo"
  // response could overwrite the fresh "john" results. Same pattern as
  // MemberReportTab.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      api.listMembers(search, status)
        .then((rows) => { if (!cancelled) setMembers(rows); })
        .catch((err) => { if (!cancelled) setError(err.message); });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [search, status]);

  // A new search/filter changes the result set — jump back to the first page.
  useEffect(() => { setPage(1); }, [search, status]);

  // Download the weekly "On the Ropes" report (same 7-day window as the list).
  async function handleExportExpiring() {
    setError('');
    setExporting(true);
    try {
      const { blob, filename } = await api.exportExpiring(7);
      triggerDownload(blob, filename || 'expiring-report.xlsx');
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="empty">Loading the gym floor…</div>;

  // Clamp the page so a shrunk roster (after filtering/deletion) never shows an
  // empty page while `page` still points past the end.
  const rosterPages = Math.max(1, Math.ceil(members.length / ROSTER_PAGE_SIZE));
  const safePage = Math.min(page, rosterPages);
  const expPages = Math.max(1, Math.ceil(expiring.length / ROSTER_PAGE_SIZE));
  const safeExpPage = Math.min(expPage, expPages);

  return (
    <>
      {error && <div className="notice error">{error}</div>}

      <span className="eyebrow">The Card Tonight</span>
      <div className="section-head" style={{ margin: '8px 0 16px' }}>
        <h2>Dashboard</h2>
        <button className="btn brass" onClick={() => navigate('/admin/members/new')}>+ New Member</button>
      </div>

      <div className="stats">
        <div className="stat"><div className="num">{stats?.total ?? 0}</div><div className="lbl">Total Members</div></div>
        <div className="stat"><div className="num">{stats?.active ?? 0}</div><div className="lbl">Active</div></div>
        <div className="stat warn"><div className="num">{stats?.expiring_week ?? 0}</div><div className="lbl">Expiring ≤ 7 days</div></div>
        <div className="stat blood"><div className="num">₹{Number(stats?.revenue_this_month ?? 0).toLocaleString('en-IN')}</div><div className="lbl">Revenue this month</div></div>
      </div>

      {/* On the ropes — expiring within 7 days */}
      <div className="section-head">
        <div>
          <span className="eyebrow">Final Round</span>
          <h2 style={{ marginTop: 8 }}>On the Ropes</h2>
        </div>
        <div className="toolbar">
          <span className="muted">Memberships ending in the next 7 days — or lapsed in the last 7 — ring them for a renewal.</span>
          <button className="btn ghost" onClick={handleExportExpiring} disabled={exporting || expiring.length === 0}>
            {exporting ? 'Exporting…' : 'Download report'}
          </button>
        </div>
      </div>

      {expiring.length === 0 ? (
        <div className="card empty">Nobody's on the ropes. Every fighter is current.</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Phone</th><th>Package</th><th>Expires</th><th>Time Left</th><th></th></tr>
              </thead>
              <tbody>
                {expiring
                  .slice((safeExpPage - 1) * ROSTER_PAGE_SIZE, safeExpPage * ROSTER_PAGE_SIZE)
                  .map((m) => (
                    <tr key={m.member_id} className="row-link" onClick={() => navigate(`/admin/members/${m.member_id}`)}>
                      <td>
                        {m.full_name}
                        {m.upcoming_count > 0 && <span className="chip upcoming" style={{ marginLeft: 8 }}>Renewal queued</span>}
                      </td>
                      <td>{m.mobile_no1}</td>
                      <td>{m.package_name || '—'}</td>
                      <td>{fmtDate(m.end_date)}</td>
                      <td><span className={daysClass(m.days_to_expiry)}>{daysLabel(m.days_to_expiry)}</span></td>
                      <td><button className="btn sm ghost" onClick={(e) => { e.stopPropagation(); navigate(`/admin/members/${m.member_id}`); }}>Renew</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination page={safeExpPage} pageSize={ROSTER_PAGE_SIZE} total={expiring.length} onPageChange={setExpPage} />
        </>
      )}

      {/* Roster — all members with filters */}
      <div className="section-head">
        <div>
          <span className="eyebrow">The Roster</span>
          <h2 style={{ marginTop: 8 }}>All Members</h2>
        </div>
        <div className="toolbar">
          <input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Paused">Paused</option>
            <option value="Inactive">Inactive</option>
            <option value="No Plan">No plan</option>
          </select>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="card empty">No members match. Adjust the search, or add a new fighter.</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th><th>Age</th><th>Phone</th><th>Membership No.</th>
                  <th>Package</th><th>Expires</th><th>Left</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members
                  .slice((safePage - 1) * ROSTER_PAGE_SIZE, safePage * ROSTER_PAGE_SIZE)
                  .map((m) => (
                    <tr key={m.member_id} className="row-link" onClick={() => navigate(`/admin/members/${m.member_id}`)}>
                      <td>{m.full_name}</td>
                      <td>{m.age ?? '—'}</td>
                      <td>{m.mobile_no1}</td>
                      <td>{m.membership_no || '—'}</td>
                      <td>{m.package_name || '—'}</td>
                      <td>{fmtDate(m.end_date)}</td>
                      <td><span className={daysClass(m.days_to_expiry)}>{daysLabel(m.days_to_expiry)}</span></td>
                      <td><StatusChip status={m.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination page={safePage} pageSize={ROSTER_PAGE_SIZE} total={members.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
