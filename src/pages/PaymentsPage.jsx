import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoicesTab from './payments/InvoicesTab.jsx';
import PaymentHistoryTab from './payments/PaymentHistoryTab.jsx';
import MemberReportTab from './payments/MemberReportTab.jsx';
import Pagination from '../components/Pagination.jsx';
import { api } from '../adminApi.js';
import { fmtDate, formatMoney, plural, triggerDownload } from '../utils.js';

const TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'history', label: 'Payment History' },
  { key: 'members', label: 'Member Report' },
];

const DETAIL_PAGE_SIZE = 10;

// The Total Payments chip is a calendar-month figure — label it with the month
// so "resets on the 1st" is visible at a glance (e.g. "Total Payments (Jul)").
const MONTH_NAME = new Date().toLocaleString('en-GB', { month: 'short' });

export default function PaymentsPage() {
  const [tab, setTab] = useState('invoices');
  const [summary, setSummary] = useState(null);
  const [detailKind, setDetailKind] = useState(null); // 'paid' | 'pending' | null
  // Bumped whenever a tab mutates billing data (payment recorded/edited/deleted,
  // plan created) so the header chips + open drill-down re-fetch and never
  // contradict the tables below them.
  const [summaryKey, setSummaryKey] = useState(0);

  // Load the two header chips. Failure just hides the chips — it never blocks
  // the tabs.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await api.paymentsSummary();
        if (!cancelled) setSummary(s);
      } catch { /* chips optional */ }
    })();
    return () => { cancelled = true; };
  }, [summaryKey]);

  const handleBillingChanged = () => setSummaryKey((k) => k + 1);

  // Click a chip to toggle its drill-down list; clicking the open one closes it.
  const toggleDetail = (kind) => setDetailKind((k) => (k === kind ? null : kind));

  return (
    <>
      <span className="eyebrow">The Books</span>
      <div className="section-head" style={{ margin: '8px 0 18px' }}>
        <h2>Payments</h2>
        {summary && (
          <div className="toolbar">
            <button
              type="button"
              className={`chip chip-btn active${detailKind === 'paid' ? ' chip-open' : ''}`}
              aria-pressed={detailKind === 'paid'}
              title="Payments received this calendar month (resets on the 1st) — click to see the receipts"
              onClick={() => toggleDetail('paid')}
            >
              Total Payments ({MONTH_NAME}): {plural(summary.paid_receipts, 'receipt')} · {formatMoney(summary.paid_amount)}
            </button>
            <button
              type="button"
              className={`chip chip-btn upcoming${detailKind === 'overall' ? ' chip-open' : ''}`}
              aria-pressed={detailKind === 'overall'}
              title="All money ever received — click to see every receipt"
              onClick={() => toggleDetail('overall')}
            >
              Overall Earnings: {formatMoney(summary.overall_amount)}
            </button>
            <button
              type="button"
              className={`chip chip-btn inactive${detailKind === 'pending' ? ' chip-open' : ''}`}
              aria-pressed={detailKind === 'pending'}
              title="Invoices that still owe fees — click to see what's remaining"
              onClick={() => toggleDetail('pending')}
            >
              Pending Payments: {plural(summary.pending_invoices, 'invoice')} · {formatMoney(summary.pending_amount)}
            </button>
          </div>
        )}
      </div>

      {detailKind && (
        <SummaryDetail kind={detailKind} refreshKey={summaryKey} onClose={() => setDetailKind(null)} />
      )}

      <div className="actions-row" role="tablist" aria-label="Payments reports" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`btn ${tab === t.key ? '' : 'ghost'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'invoices' && <InvoicesTab onChanged={handleBillingChanged} />}
      {tab === 'history' && <PaymentHistoryTab />}
      {tab === 'members' && <MemberReportTab />}
    </>
  );
}

// The drill-down panel shown when a chip is clicked:
//   kind='paid'    → this month's payment receipts (who paid, when, how much)
//   kind='overall' → every receipt ever taken (all-time earnings)
//   kind='pending' → invoices still owing (who's remaining to pay)
// Rows link to the member's detail page. refreshKey re-fetches the list when
// billing data changes elsewhere on the page.
function SummaryDetail({ kind, refreshKey, onClose }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const isPending = kind === 'pending';

  // Download the pending list as .xlsx — same rows/filter as the table below,
  // for chasing collections offline (mirrors the other report exports).
  async function handleExport() {
    setError(''); setExporting(true);
    try {
      const { blob, filename } = await api.exportPendingPayments();
      triggerDownload(blob, filename || 'pending-payments.xlsx');
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.paymentsSummaryDetail(kind)
      .then((r) => !cancelled && setRows(r))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [kind, refreshKey]);

  // Switching chips or reloading changes the list — back to page 1.
  useEffect(() => { setPage(1); }, [kind, refreshKey]);

  // Paginate at 10 rows/page (the footer hides itself when there's only one
  // page, so short lists look exactly as before). safePage clamps a stale page.
  const detailPages = Math.max(1, Math.ceil(rows.length / DETAIL_PAGE_SIZE));
  const safePage = Math.min(page, detailPages);
  const pageRows = rows.slice((safePage - 1) * DETAIL_PAGE_SIZE, safePage * DETAIL_PAGE_SIZE);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-head" style={{ marginTop: 0 }}>
        <div>
          <span className="eyebrow">
            {isPending ? 'On the Book' : kind === 'overall' ? 'The Full Purse' : "This Month's Take"}
          </span>
          <h2 style={{ marginTop: 8, fontSize: 20 }}>
            {isPending ? 'Pending — still to pay' : kind === 'overall' ? 'All earnings' : `Received in ${MONTH_NAME}`}
          </h2>
        </div>
        <div className="actions-row">
          {isPending && (
            <button className="btn ghost sm" onClick={handleExport} disabled={exporting || loading}>
              {exporting ? 'Preparing…' : 'Export to Excel'}
            </button>
          )}
          <button className="btn ghost sm" onClick={onClose}>Close</button>
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}

      {loading ? <div className="empty">Loading…</div> : (
        <>
          {isPending ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th><th>Phone</th><th>Package</th>
                    <th>Expires</th><th>Total</th><th>Balance due</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="muted">Everyone is settled up — no fees outstanding. 🎉</td></tr>
                  )}
                  {pageRows.map((r) => (
                    <tr key={r.membership_id} className="row-link" onClick={() => navigate(`/admin/members/${r.member_id}`)}>
                      <td>{r.full_name}</td>
                      <td>{r.mobile_no1 || '—'}</td>
                      <td>{r.package_name || '—'}</td>
                      <td>{fmtDate(r.end_date)}</td>
                      <td>{formatMoney(r.total_amount)}</td>
                      <td>{formatMoney(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Member</th><th>Phone</th>
                    <th>Package</th><th>Pay Mode</th><th>Amount</th><th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="muted">
                      {kind === 'overall' ? 'No payments recorded yet.' : 'No payments received yet this month.'}
                    </td></tr>
                  )}
                  {pageRows.map((r) => (
                    <tr key={r.payment_id} className="row-link" onClick={() => navigate(`/admin/members/${r.member_id}`)}>
                      <td>{fmtDate(r.paid_on)}</td>
                      <td>{r.full_name}</td>
                      <td>{r.mobile_no1 || '—'}</td>
                      <td>{r.package_name || '—'}</td>
                      <td>{r.pay_mode || '—'}</td>
                      <td>{formatMoney(r.paid_amount)}</td>
                      {/* Receipt note — collected pending payments arrive tagged
                          "Received pending payment — <member>" and show as a chip. */}
                      <td>
                        {r.details
                          ? (r.details.startsWith('Received pending payment')
                              ? <span className="chip upcoming">{r.details}</span>
                              : r.details)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={safePage} pageSize={DETAIL_PAGE_SIZE} total={rows.length} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
