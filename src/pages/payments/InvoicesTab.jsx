import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { fmtDate, formatMoney, triggerDownload } from '../../utils.js';
import Pagination from '../../components/Pagination.jsx';

const INVOICES_PAGE_SIZE = 10;
const PAY_MODES = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];
const emptyForm = {
  member_id: '', package_id: '', start_date: '', amount: '',
  registration_fee: '', discount: '', paid_amount: '', pay_mode: 'Cash', details: '',
};
const num = (v) => (v !== '' && v != null ? Number(v) : undefined);

// A balance cell that makes underpayment unambiguous: a red "Due ₹X" flag when
// the member still owes money, a green "Paid" when settled, and a "Credit ₹X"
// flag when they have overpaid (a negative balance). Uses a tiny epsilon so
// floating-point noise (e.g. 0.0000001) doesn't render as a stray ₹0 due.
function BalanceCell({ balance }) {
  const n = Number(balance);
  if (Number.isNaN(n)) return <span className="muted">—</span>;
  if (n > 0.005) return <span className="bal-flag due" title="Outstanding — collect from member">Due {formatMoney(n)}</span>;
  if (n < -0.005) return <span className="bal-flag credit" title="Overpaid — member has a credit">Credit {formatMoney(Math.abs(n))}</span>;
  return <span className="bal-flag paid" title="Fully paid">Paid</span>;
}

export default function InvoicesTab({ onChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Any billing mutation refreshes this tab AND tells the parent page so the
  // header summary chips / drill-down re-fetch and stay in agreement.
  const refresh = () => { setRefreshKey((k) => k + 1); onChanged?.(); };

  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [busyInvoice, setBusyInvoice] = useState(null);
  const [openId, setOpenId] = useState(null); // membership_id whose receipts panel is open
  const [unpaidOnly, setUnpaidOnly] = useState(false); // show only invoices with a balance due
  const [page, setPage] = useState(1);

  // Collection picture across ALL invoices (not just the filtered view): how much
  // is still outstanding and from how many invoices. Overpayments (credits) are
  // never netted against dues here — "to collect" is the sum of positive balances.
  const dueRows = rows.filter((r) => Number(r.final_balance) > 0.005);
  const totalDue = dueRows.reduce((sum, r) => sum + Number(r.final_balance), 0);

  // The rows actually rendered in the table, honouring the "unpaid only" toggle.
  const visibleRows = unpaidOnly ? dueRows : rows;
  // Clamp the page so toggling the filter or a shrinking list never lands on an
  // empty page; slice to the current page for display.
  const invoicePages = Math.max(1, Math.ceil(visibleRows.length / INVOICES_PAGE_SIZE));
  const safePage = Math.min(page, invoicePages);
  const pageRows = visibleRows.slice((safePage - 1) * INVOICES_PAGE_SIZE, safePage * INVOICES_PAGE_SIZE);

  useEffect(() => {
    api.listMembers().then(setMembers).catch(() => {});
    api.packages().then(setPackages).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.listInvoices({})
      .then((r) => !cancelled && setRows(r))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Reset to the first page when the filter flips or the data reloads.
  useEffect(() => { setPage(1); }, [unpaidOnly, refreshKey]);

  // If the "Show only unpaid" filter is on and the last due invoice just got
  // settled, the toggle (rendered only while dues exist) would vanish and leave
  // an empty, un-clearable table. Drop back to showing all invoices.
  useEffect(() => {
    if (unpaidOnly && !loading && dueRows.length === 0) setUnpaidOnly(false);
  }, [unpaidOnly, loading, dueRows.length]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function handleCreate(e) {
    e.preventDefault();
    setError(''); setNotice('');
    if (!form.member_id) return setError('Select a member.');
    if (!form.package_id) return setError('Select a plan.');
    setSaving(true);
    try {
      const res = await api.createCustomPlan({
        member_id: Number(form.member_id), package_id: Number(form.package_id),
        start_date: form.start_date || undefined, amount: num(form.amount),
        registration_fee: num(form.registration_fee), discount: num(form.discount),
        paid_amount: num(form.paid_amount), pay_mode: form.pay_mode, details: form.details || undefined,
      });
      setForm(emptyForm);
      setNotice(`Created invoice #${res.invoice_no}${res.payment ? ` with a ${formatMoney(res.payment.paid_amount)} payment` : ''}.`);
      refresh();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function handleInvoicePdf(membershipId) {
    setError(''); setBusyInvoice(membershipId);
    try {
      const { blob, filename } = await api.downloadInvoice(membershipId);
      triggerDownload(blob, filename || `invoice-${membershipId}.pdf`);
    } catch (err) { setError(err.message); } finally { setBusyInvoice(null); }
  }

  async function handleExport() {
    setError(''); setExporting(true);
    try {
      const { blob, filename } = await api.exportInvoices({});
      triggerDownload(blob, filename || 'invoices.xlsx');
    } catch (err) { setError(err.message); } finally { setExporting(false); }
  }

  return (
    <>
      {error && <div className="notice error">{error}</div>}
      {notice && <div className="notice ok">{notice}</div>}

      {/* Create a custom plan + first payment */}
      <div className="fieldset">
        <span className="eyebrow">Custom Plan — Take a Payment</span>
        <form onSubmit={handleCreate}>
          <div className="grid-3">
            <div className="field">
              <label>Member *</label>
              <select value={form.member_id} onChange={(e) => setF('member_id', e.target.value)}>
                <option value="">Select…</option>
                {members.map((m) => <option key={m.member_id} value={m.member_id}>{m.full_name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Plan *</label>
              {/* Switching plans re-prices: snap Amount to the new plan's list
                  price so a value typed for a cheaper plan can't silently ride
                  along (staff can still override it to discount). */}
              <select
                value={form.package_id}
                onChange={(e) => {
                  const pkg = packages.find((p) => String(p.package_id) === e.target.value);
                  setForm((prev) => ({ ...prev, package_id: e.target.value, amount: pkg ? String(pkg.price) : '' }));
                }}
              >
                <option value="">Select…</option>
                {packages.map((p) => <option key={p.package_id} value={p.package_id}>{p.name} — {formatMoney(p.price)}</option>)}
              </select>
            </div>
            <div className="field"><label>Start date</label><input type="date" value={form.start_date} onChange={(e) => setF('start_date', e.target.value)} /></div>
          </div>
          <div className="grid-3">
            <div className="field"><label>Amount (₹)</label><input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setF('amount', e.target.value)} placeholder="defaults to plan price" /></div>
            <div className="field"><label>Registration fee (₹)</label><input type="number" min="0" step="0.01" value={form.registration_fee} onChange={(e) => setF('registration_fee', e.target.value)} /></div>
            <div className="field"><label>Discount (₹)</label><input type="number" min="0" step="0.01" value={form.discount} onChange={(e) => setF('discount', e.target.value)} /></div>
          </div>
          <div className="grid-3">
            <div className="field"><label>Paid amount (₹)</label><input type="number" min="0" step="0.01" value={form.paid_amount} onChange={(e) => setF('paid_amount', e.target.value)} placeholder="leave blank if unpaid" /></div>
            <div className="field">
              <label>Pay mode</label>
              <select value={form.pay_mode} onChange={(e) => setF('pay_mode', e.target.value)}>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <div className="field"><label>Details</label><input value={form.details} onChange={(e) => setF('details', e.target.value)} placeholder="txn ref / note" /></div>
          </div>
          <div className="actions-row">
            <button className="btn brass" disabled={saving}>{saving ? 'Saving…' : 'Create plan & record payment'}</button>
          </div>
        </form>
      </div>

      {/* Collection summary — how much is still to be collected, at a glance. */}
      {!loading && rows.length > 0 && (
        <div className="collect-bar">
          <div className={`collect-tile${totalDue > 0 ? ' due' : ' clear'}`}>
            <div className="collect-num">{formatMoney(totalDue)}</div>
            <div className="collect-lbl">
              To Collect
              {totalDue > 0 && <> · {dueRows.length} invoice{dueRows.length === 1 ? '' : 's'} pending</>}
            </div>
          </div>
          {dueRows.length > 0 && (
            <label className="collect-toggle">
              <input type="checkbox" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} />
              Show only unpaid
            </label>
          )}
        </div>
      )}

      <div className="section-head">
        <div><span className="eyebrow">All Invoices</span><h2 style={{ marginTop: 8, fontSize: 22 }}>Invoices</h2></div>
        <button className="btn ghost" onClick={handleExport} disabled={exporting || rows.length === 0}>
          {exporting ? 'Exporting…' : 'Export to Excel'}
        </button>
      </div>

      {loading ? <div className="card empty">Loading invoices…</div> : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th><th>Date</th><th>Member</th><th>Contact</th><th>Type</th><th>Package</th>
                  <th>Days</th><th>Start</th><th>End</th><th>Next Pay</th><th>Fees</th><th>Paid</th><th>Balance</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={14} className="muted">No invoices yet.</td></tr>}
                {rows.length > 0 && visibleRows.length === 0 && (
                  <tr><td colSpan={14} className="muted">No unpaid invoices — everyone is settled up. 🎉</td></tr>
                )}
                {pageRows.map((r) => (
                  <Row
                    key={r.membership_id}
                    r={r}
                    open={openId === r.membership_id}
                    onToggle={() => setOpenId(openId === r.membership_id ? null : r.membership_id)}
                    onInvoice={() => handleInvoicePdf(r.membership_id)}
                    busyInvoice={busyInvoice === r.membership_id}
                    onChanged={refresh}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={safePage} pageSize={INVOICES_PAGE_SIZE} total={visibleRows.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}

// One invoice row + an expandable receipts panel (record/edit/delete payments).
function Row({ r, open, onToggle, onInvoice, busyInvoice, onChanged }) {
  return (
    <>
      <tr>
        <td>#{r.invoice_id}</td>
        <td>{fmtDate(r.invoice_date)}</td>
        <td>{r.member_name}</td>
        <td>{r.member_contact}</td>
        <td>{r.package_type}</td>
        <td>{r.package_name}</td>
        <td>{r.duration_days}</td>
        <td>{fmtDate(r.start_date)}</td>
        <td>{fmtDate(r.end_date)}</td>
        <td>{fmtDate(r.next_payment_date)}</td>
        <td>{formatMoney(r.package_fees)}</td>
        <td>{formatMoney(r.final_paid)}</td>
        <td><BalanceCell balance={r.final_balance} /></td>
        <td style={{ whiteSpace: 'nowrap' }}>
          <button className="btn ghost sm" onClick={onInvoice} disabled={busyInvoice}>{busyInvoice ? '…' : 'PDF'}</button>{' '}
          <button className="btn ghost sm" onClick={onToggle}>{open ? 'Hide' : 'Receipts'}</button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={14} style={{ background: 'var(--tint)' }}>
            <ReceiptsPanel membershipId={r.membership_id} onChanged={onChanged} />
          </td>
        </tr>
      )}
    </>
  );
}

function ReceiptsPanel({ membershipId, onChanged }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [add, setAdd] = useState({ paid_amount: '', pay_mode: 'Cash', details: '', paid_on: '' });
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    api.listReceiptsForMembership(membershipId)
      .then((r) => !cancelled && setRows(r))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [membershipId, refreshKey]);

  const bump = () => { setRefreshKey((k) => k + 1); onChanged?.(); };
  const setD = (k, v) => setDraft((p) => ({ ...p, [k]: v }));
  const setA = (k, v) => setAdd((p) => ({ ...p, [k]: v }));

  async function save(id) {
    setError('');
    // Guard the edit path like the record path: Number('') is 0, so a cleared
    // amount box would silently overwrite the receipt to ₹0 without this.
    if (draft.paid_amount === '' || Number.isNaN(Number(draft.paid_amount))) {
      return setError('Enter a paid amount.');
    }
    try {
      await api.updatePayment(id, { paid_amount: Number(draft.paid_amount), pay_mode: draft.pay_mode, details: draft.details, paid_on: draft.paid_on });
      setEditingId(null); bump();
    } catch (e) { setError(e.message); }
  }
  async function remove(id) {
    if (!confirm('Delete this receipt?')) return;
    setError('');
    try { await api.deletePayment(id); bump(); } catch (e) { setError(e.message); }
  }
  async function record(e) {
    e.preventDefault();
    setError('');
    if (add.paid_amount === '') return setError('Enter a paid amount.');
    try {
      await api.createPayment({ membership_id: membershipId, paid_amount: Number(add.paid_amount), pay_mode: add.pay_mode, details: add.details || undefined, paid_on: add.paid_on || undefined });
      setAdd({ paid_amount: '', pay_mode: 'Cash', details: '', paid_on: '' });
      bump();
    } catch (e) { setError(e.message); }
  }

  return (
    <div style={{ padding: '6px 2px' }}>
      <span className="eyebrow">Receipts</span>
      {error && <div className="notice error" style={{ marginTop: 8 }}>{error}</div>}
      <table style={{ marginTop: 8 }}>
        <thead><tr><th>Re No</th><th>Date</th><th>Paid</th><th>Pay Mode</th><th>Details</th><th>Executive</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={7} className="muted">No receipts yet.</td></tr>}
          {rows.map((p) => {
            const editing = editingId === p.payment_id;
            return (
              <tr key={p.payment_id}>
                <td>{p.re_no}</td>
                <td>{editing ? <input type="date" max={today} value={draft.paid_on} onChange={(e) => setD('paid_on', e.target.value)} /> : fmtDate(p.paid_on)}</td>
                <td>{editing ? <input type="number" min="0" step="0.01" value={draft.paid_amount} onChange={(e) => setD('paid_amount', e.target.value)} /> : formatMoney(p.paid_amount)}</td>
                <td>{editing ? <select value={draft.pay_mode} onChange={(e) => setD('pay_mode', e.target.value)}>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select> : p.pay_mode}</td>
                <td>{editing ? <input value={draft.details} onChange={(e) => setD('details', e.target.value)} /> : (p.details || '—')}</td>
                <td>{p.executive || '—'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {editing ? (
                    <>
                      <button className="btn brass sm" onClick={() => save(p.payment_id)}>Save</button>{' '}
                      <button className="btn ghost sm" onClick={() => setEditingId(null)}>Cancel</button>{' '}
                      <button className="btn danger sm" onClick={() => remove(p.payment_id)}>Delete</button>
                    </>
                  ) : (
                    <button className="btn ghost sm" onClick={() => { setEditingId(p.payment_id); setDraft({ paid_amount: p.paid_amount, pay_mode: p.pay_mode, details: p.details || '', paid_on: p.paid_on }); }}>Edit</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <form onSubmit={record} className="actions-row" style={{ marginTop: 10, alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0 }}><label>Add payment (₹)</label><input type="number" min="0" step="0.01" value={add.paid_amount} onChange={(e) => setA('paid_amount', e.target.value)} /></div>
        <div className="field" style={{ margin: 0 }}><label>Pay mode</label><select value={add.pay_mode} onChange={(e) => setA('pay_mode', e.target.value)}>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div className="field" style={{ margin: 0 }}><label>Date</label><input type="date" max={today} value={add.paid_on} onChange={(e) => setA('paid_on', e.target.value)} /></div>
        <div className="field" style={{ margin: 0 }}><label>Details</label><input value={add.details} onChange={(e) => setA('details', e.target.value)} /></div>
        <button className="btn brass sm">Record</button>
      </form>
    </div>
  );
}
