import { useEffect, useState } from 'react';
import { api } from '../../adminApi.js';
import { fmtDate, formatMoney, triggerDownload } from '../../utils.js';
import Pagination from '../../components/Pagination.jsx';

const PAGE_SIZE = 10;

function StatusChip({ status }) {
  const cls =
    status === 'Active' ? 'active'
      : status === 'Paused' ? 'paused'
        : status === 'Inactive' ? 'inactive' : 'noplan';
  return <span className={`chip ${cls}`}>{status}</span>;
}

export default function MemberReportTab() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true); // first paint shows Loading…; searches keep old rows
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setError('');
    // Don't blank the table while typing: `loading` starts true for the first
    // paint, and search refetches simply swap rows in when they resolve (never
    // flipping back to "Loading…"), keeping current results visible — matching
    // the Dashboard search's behaviour.
    const t = setTimeout(() => {
      api.listMemberReport({ search })
        .then((r) => !cancelled && setRows(r))
        .catch((e) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [search]);

  // A new search changes the result set — back to page 1.
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleExport() {
    setError(''); setExporting(true);
    try {
      const { blob, filename } = await api.exportMembers({ search });
      triggerDownload(blob, filename || 'member-report.xlsx');
    } catch (err) { setError(err.message); } finally { setExporting(false); }
  }

  return (
    <>
      {error && <div className="notice error">{error}</div>}

      <div className="section-head">
        <div><span className="eyebrow">Roster</span><h2 style={{ marginTop: 8, fontSize: 22 }}>Member Report</h2></div>
        <div className="toolbar">
          <input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn ghost" onClick={handleExport} disabled={exporting || rows.length === 0}>
            {exporting ? 'Exporting…' : 'Export to Excel'}
          </button>
        </div>
      </div>

      {loading ? <div className="card empty">Loading…</div> : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member ID</th><th>Registered</th><th>Name</th><th>Contact</th>
                  <th>Gender</th><th>Email</th><th>Status</th><th>End Date</th><th>Final Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={9} className="muted">No members match.</td></tr>}
                {pageRows.map((r) => (
                  <tr key={r.member_id}>
                    <td>{r.member_id}</td>
                    <td>{fmtDate(r.registration_date)}</td>
                    <td>{r.name}</td>
                    <td>{r.contact}</td>
                    <td>{r.gender || '—'}</td>
                    <td>{r.email || '—'}</td>
                    <td><StatusChip status={r.member_status} /></td>
                    <td>{fmtDate(r.end_date)}</td>
                    <td>{formatMoney(r.final_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={safePage} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
