import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatMoney, triggerDownload } from '../../utils.js';
import Pagination from '../../components/Pagination.jsx';

const THIS_YEAR = Number(new Date().toISOString().slice(0, 4));
const YEARS = [THIS_YEAR - 2, THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];
const PAGE_SIZE = 10;

export default function PaymentHistoryTab() {
  const [year, setYear] = useState(THIS_YEAR);
  const [data, setData] = useState({ year: THIS_YEAR, monthLabels: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.paymentHistory(year)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [year]);

  // A new year reloads the register — back to page 1.
  useEffect(() => { setPage(1); }, [year]);

  async function handleExport() {
    setError(''); setExporting(true);
    try {
      const { blob, filename } = await api.exportPaymentHistory(year);
      triggerDownload(blob, filename || `payment-history-${year}.xlsx`);
    } catch (err) { setError(err.message); } finally { setExporting(false); }
  }

  const { monthLabels, rows } = data;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE; // also the offset for the SL column
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  function dueOn(r) {
    if (!r.due_month) return '—';
    const label = `${monthLabels[r.due_month - 1] || ''} ${r.due_year || ''}`.trim();
    return r.due_balance > 0 ? `${label} · ${formatMoney(r.due_balance)}` : label;
  }

  return (
    <>
      {error && <div className="notice error">{error}</div>}

      <div className="section-head">
        <div><span className="eyebrow">Collection Register</span><h2 style={{ marginTop: 8, fontSize: 22 }}>Payment History</h2></div>
        <div className="toolbar">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn ghost" onClick={handleExport} disabled={exporting || rows.length === 0}>
            {exporting ? 'Exporting…' : 'Export to Excel'}
          </button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 0 }}>
        ₹ collected per month in {year}. The Excel export also includes the full month-by-month “Due on” grid.
      </p>

      {loading ? <div className="card empty">Loading…</div> : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SL</th><th>MEM ID</th><th>Name</th>
                  {monthLabels.map((m) => <th key={m}>{m}</th>)}
                  <th>Total</th><th>Due On</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={17} className="muted">No members.</td></tr>}
                {pageRows.map((r, i) => (
                  <tr key={r.member_id}>
                    <td>{start + i + 1}</td>
                    <td>{r.member_id}</td>
                    <td>{r.full_name}</td>
                    {r.months.map((v, mi) => <td key={mi}>{v > 0 ? formatMoney(v) : '—'}</td>)}
                    <td>{formatMoney(r.year_total)}</td>
                    <td>{dueOn(r)}</td>
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
