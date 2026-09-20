import { useEffect, useState, useCallback, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../adminApi.js";
import { fmtDate, formatMoney, triggerDownload } from "../utils.js";
import Pagination from "../components/Pagination.jsx";

const HISTORY_PAGE_SIZE = 10;
const PAY_MODES = ["Cash", "Card", "UPI", "Bank Transfer", "Cheque", "Other"];

function Line({ k, v }) {
  return (
    <div className="stat-line">
      <span className="k">{k}</span>
      <span className="v">{v || "—"}</span>
    </div>
  );
}

const STATUS_CLASS = {
  Active: "active",
  Inactive: "inactive",
  Paused: "paused",
  Upcoming: "upcoming",
};
function StatusChip({ status }) {
  const cls = STATUS_CLASS[status] || "noplan";
  return <span className={`chip ${cls}`}>{status}</span>;
}

// Inline form to edit one membership period. Reused by the current card, the
// upcoming rows, and the history rows so a period is editable wherever shown.
function EditPeriodForm({
  editing,
  setEditing,
  packages,
  onSave,
  onCancel,
  busy,
}) {
  const setE = (k, v) => setEditing((p) => ({ ...p, [k]: v }));
  // Changing the package re-charges the plan: snap Amount to the new package's
  // list price in the SAME update (so it can't lag behind the selection). Staff
  // can still type a discounted amount afterwards. Prevents the stale-amount
  // bug where switching plans left the old, lower charge — under-billing.
  const onPackageChange = (packageId) => {
    const pkg = packages.find(
      (p) => String(p.package_id) === String(packageId),
    );
    setEditing((p) => ({
      ...p,
      package_id: packageId,
      amount: pkg ? String(pkg.price) : "",
    }));
  };
  return (
    <form
      onSubmit={onSave}
      style={{
        marginTop: 12,
        borderTop: "1px solid var(--line)",
        paddingTop: 12,
      }}
    >
      <span className="eyebrow">Edit Period</span>
      <div className="grid-3" style={{ marginTop: 12 }}>
        <div className="field">
          <label>Package</label>
          <select
            value={editing.package_id}
            onChange={(e) => onPackageChange(e.target.value)}
          >
            <option value="">Select…</option>
            {packages.map((p) => (
              <option key={p.package_id} value={p.package_id}>
                {p.name} — ₹{Number(p.price).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Start</label>
          <input
            type="date"
            value={editing.start_date}
            onChange={(e) => setE("start_date", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={editing.amount}
            onChange={(e) => setE("amount", e.target.value)}
            placeholder="defaults to plan price"
          />
        </div>
      </div>
      <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>
        End date is recalculated from the plan length. Leave <b>Start</b> blank
        to re-stack after current coverage. <b>Amount</b> is the plan charge —
        it snaps to the new plan's price when you switch packages (edit it to
        apply a discount). Recorded payments are unchanged, so the balance
        follows from the receipts.
      </p>
      <div className="actions-row">
        <button className="btn brass sm" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className="btn ghost sm"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [renew, setRenew] = useState({
    package_id: "",
    start_date: "",
    amount_paid: "",
  });
  const [busyInvoice, setBusyInvoice] = useState(null);
  const [pause, setPause] = useState(null);
  const [pauseReason, setPauseReason] = useState("");
  const [pauseDays, setPauseDays] = useState("");
  const [pauseBusy, setPauseBusy] = useState(false);
  const [renewBusy, setRenewBusy] = useState(false);
  // Which period is being edited, its draft fields, and in-flight guards.
  const [editing, setEditing] = useState(null); // { membership_id, package_id, start_date, amount }
  const [editBusy, setEditBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  // Pending-payment collection: which period is being collected, the pay mode
  // picked per period (defaults to Cash), and the amount typed per period
  // (defaults to the full balance — staff lower it for a partial collection).
  const [collectingId, setCollectingId] = useState(null);
  const [collectMode, setCollectMode] = useState({});
  const [collectAmount, setCollectAmount] = useState({});

  const load = useCallback(async () => {
    try {
      const d = await api.getMember(id);
      setData(d);
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  const loadPause = useCallback(async () => {
    try {
      setPause(await api.pauseInfo(id));
    } catch {
      setPause(null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadPause();
  }, [loadPause]);
  // Scope the renew dropdown to the member's gender (their own gender's plans
  // plus unisex) once the member has loaded; the server enforces the same map.
  useEffect(() => {
    const g = data?.member?.gender || "";
    api
      .packages(g)
      .then((rows) => {
        setPackages(rows);
        setRenew((p) =>
          p.package_id &&
          !rows.some((r) => String(r.package_id) === String(p.package_id))
            ? { ...p, package_id: "" }
            : p,
        );
      })
      .catch(() => {});
  }, [data?.member?.gender]);

  async function handlePause() {
    setMsg("");
    setError("");
    setPauseBusy(true);
    try {
      const res = await api.pauseMembership(id, {
        days: pauseDays ? Number(pauseDays) : undefined,
        reason: pauseReason || undefined,
      });
      setPause(res.pause_info);
      setPauseReason("");
      setPauseDays("");
      setMsg("Membership paused. Resume it later to add the frozen days back.");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setPauseBusy(false);
    }
  }

  async function handleResume() {
    setMsg("");
    setError("");
    setPauseBusy(true);
    try {
      const res = await api.resumeMembership(id);
      setPause(res.pause_info);
      setMsg(
        `Membership resumed — ${res.applied_days} day(s) added back to the end date.`,
      );
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setPauseBusy(false);
    }
  }

  async function handleCancelPause(pauseId) {
    if (
      !confirm(
        "Undo this pause? Any days it added will be removed from the end date.",
      )
    )
      return;
    setMsg("");
    setError("");
    try {
      const res = await api.cancelPause(id, pauseId);
      setPause(res.pause_info);
      setMsg("Pause removed.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRenew(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!renew.package_id) {
      setError("Pick a package to renew.");
      return;
    }
    // Guard against a double-click / slow-network resubmit: renew is NOT
    // idempotent — each call stacks another period and (if Paid now is filled)
    // records another receipt.
    if (renewBusy) return;
    setRenewBusy(true);
    try {
      await api.renewMember(id, {
        package_id: Number(renew.package_id),
        start_date: renew.start_date || undefined,
        amount_paid: renew.amount_paid ? Number(renew.amount_paid) : undefined,
      });
      setRenew({ package_id: "", start_date: "", amount_paid: "" });
      setMsg("Membership renewed.");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setRenewBusy(false);
    }
  }

  // Open the inline edit form for a period, prefilled from its current values.
  // amount = the plan charge (membership.amount), not what's been paid.
  function handleEditStart(period) {
    setMsg("");
    setError("");
    setEditing({
      membership_id: period.membership_id,
      package_id: String(period.package_id ?? ""),
      start_date: period.start_date || "",
      amount: period.amount != null ? String(period.amount) : "",
    });
  }

  function handleEditCancel() {
    setEditing(null);
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!editing?.package_id) {
      setError("Pick a package.");
      return;
    }
    setEditBusy(true);
    try {
      const res = await api.updateMembership(id, editing.membership_id, {
        package_id: Number(editing.package_id),
        start_date: editing.start_date || undefined,
        amount: editing.amount !== "" ? Number(editing.amount) : undefined,
      });
      setEditing(null);
      // Receipts stay authoritative when a period is re-priced, so an edit can
      // leave the invoice out of balance — say so loudly rather than letting
      // staff discover a phantom credit/due on the invoice later.
      const bal = Number(res.billing?.balance) || 0;
      let balNote = "";
      if (bal > 0.005)
        balNote = ` This period now shows ${formatMoney(bal)} DUE — record the payment on the Payments tab if the member has paid.`;
      else if (bal < -0.005)
        balNote = ` This period now shows a CREDIT of ${formatMoney(Math.abs(bal))} — adjust its receipts on the Payments tab if that's unintended.`;
      setMsg(
        `Membership period updated — now ${fmtDate(res.start_date)} → ${fmtDate(res.end_date)}.${balNote}`,
      );
      load();
      loadPause();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDeletePeriod(period) {
    const bal =
      Number(period.paid_amount) > 0
        ? ` Its recorded payment${Number(period.paid_amount) ? ` of ${formatMoney(period.paid_amount)}` : ""} and any pause records will be removed too.`
        : " Any pause records will be removed too.";
    if (
      !confirm(
        `Delete this ${period.package_name || "membership"} period (${fmtDate(period.start_date)} → ${fmtDate(period.end_date)})?${bal} This cannot be undone.`,
      )
    )
      return;
    setMsg("");
    setError("");
    setDeletingId(period.membership_id);
    try {
      await api.deleteMembership(id, period.membership_id);
      if (editing?.membership_id === period.membership_id) setEditing(null);
      setMsg("Membership period deleted.");
      load();
      loadPause();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Collect a pending balance (fully or partially): records a payment receipt
  // for the ENTERED amount, tagged so it's identifiable everywhere (receipts,
  // earnings drill-downs). Receipts are authoritative, so the invoice's balance
  // updates in place — a partial collection leaves the same invoice pending
  // with the remainder, never a new entry. A full collection settles it.
  async function handleCollect(period) {
    const bal = Number(period.balance);
    const amt = Number(collectAmount[period.membership_id] ?? bal);
    const mode = collectMode[period.membership_id] || "Cash";
    const name = data?.member?.full_name || "member";
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter the amount received — more than ₹0.");
      return;
    }
    if (amt > bal + 0.005) {
      setError(
        `Only ${formatMoney(bal)} is pending on this invoice — the amount received can't be more. To record an intentional overpayment, use the Payments tab.`,
      );
      return;
    }
    const remaining = Math.round((bal - amt) * 100) / 100;
    if (
      !confirm(
        `Received ${formatMoney(amt)} in ${mode} from ${name} for the ${period.package_name} plan (${fmtDate(period.start_date)} → ${fmtDate(period.end_date)})?` +
          (remaining > 0.005
            ? ` ${formatMoney(remaining)} will remain pending.`
            : " This settles the invoice."),
      )
    )
      return;
    setMsg("");
    setError("");
    setCollectingId(period.membership_id);
    try {
      await api.createPayment({
        membership_id: period.membership_id,
        paid_amount: amt,
        pay_mode: mode,
        details: `Received pending payment — ${name}`,
        // Optimistic guard: the server rejects (409) if this balance changed
        // since the page loaded, so a stale/concurrent collect can't overpay.
        expected_balance: bal,
      });
      setMsg(
        remaining > 0.005
          ? `Received ${formatMoney(amt)} from ${name} against the ${period.package_name} membership — ` +
              `${formatMoney(remaining)} is still pending on this invoice.`
          : `Received ${formatMoney(amt)} from ${name} — the ${period.package_name} invoice ` +
              `(${fmtDate(period.start_date)} → ${fmtDate(period.end_date)}) is now settled.`,
      );
      // Drop the typed amount so the input re-prefills with the fresh balance.
      setCollectAmount((prev) => {
        const next = { ...prev };
        delete next[period.membership_id];
        return next;
      });
      load();
    } catch (e) {
      setError(e.message);
      // A conflict means our numbers are stale — pull fresh so the table shows
      // the real current balance.
      load();
    } finally {
      setCollectingId(null);
    }
  }

  async function handleInvoice(membershipId) {
    setError("");
    setBusyInvoice(membershipId);
    try {
      const { blob, filename } = await api.downloadInvoice(membershipId);
      triggerDownload(blob, filename || `invoice-${membershipId}.pdf`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyInvoice(null);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Remove this member and all their records? This cannot be undone.",
      )
    )
      return;
    try {
      await api.deleteMember(id);
      navigate("/admin");
    } catch (e) {
      setError(e.message);
    }
  }

  if (error && !data) return <div className="notice error">{error}</div>;
  if (!data) return <div className="empty">Loading…</div>;

  const { member: m, emergencyContacts, guardians, office, memberships } = data;

  // Bucket periods using the server-computed period_phase (never JS date math).
  // Current card shows the running period; if none covers today, fall back to
  // the most-recent past so staff still see what just expired (renew from here).
  // The history table is a full ledger: every period lists there (with a status
  // chip), even the ones also shown in the card/upcoming sections above.
  const byEndDesc = (a, b) =>
    a.end_date < b.end_date ? 1 : a.end_date > b.end_date ? -1 : 0;
  const byStartAsc = (a, b) =>
    a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : 0;
  const currents = memberships
    .filter((p) => p.period_phase === "current")
    .sort(byEndDesc);
  const upcoming = memberships
    .filter((p) => p.period_phase === "upcoming")
    .sort(byStartAsc);
  const pastByRecent = memberships
    .filter((p) => p.period_phase === "past")
    .sort(byEndDesc);
  const current = currents[0] || pastByRecent[0] || null;
  const history = [...memberships].sort(byEndDesc);
  // Paginate the full ledger (10/period per page); footer hides itself at ≤10.
  const historyPages = Math.max(
    1,
    Math.ceil(history.length / HISTORY_PAGE_SIZE),
  );
  const safeHistoryPage = Math.min(historyPage, historyPages);
  const historyRows = history.slice(
    (safeHistoryPage - 1) * HISTORY_PAGE_SIZE,
    safeHistoryPage * HISTORY_PAGE_SIZE,
  );

  // Member-level money owed across STARTED periods — the same filter the
  // Pending Payments chip uses (upcoming/queued plans aren't pending until
  // they begin). The Current Membership card only shows the current period's
  // balance, so surface the grand total here too (a member can owe on several
  // invoices). A tiny epsilon ignores floating-point noise.
  const owingPeriods = memberships.filter(
    (p) => Number(p.balance) > 0.005 && p.period_phase !== "upcoming",
  );
  const totalOutstanding = owingPeriods.reduce(
    (s, p) => s + Number(p.balance),
    0,
  );

  const age = m.date_of_birth
    ? Math.floor((Date.now() - new Date(m.date_of_birth)) / 31557600000)
    : null;

  return (
    <>
      <span className="eyebrow">Tale of the Tape</span>
      <div className="section-head" style={{ margin: "8px 0 18px" }}>
        <h2>{m.full_name}</h2>
        <div className="actions-row">
          <button
            className="btn ghost"
            onClick={() => navigate(`/admin/members/${id}/edit`)}
          >
            Edit
          </button>
          {/* <button className="btn danger" onClick={handleDelete}>Delete</button> */}
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}
      {msg && <div className="notice ok">{msg}</div>}

      {/* Member-level outstanding across STARTED periods — same filter as the
          Pending Payments chip (upcoming plans aren't pending), so the two
          never look like they disagree. Rendered full-width above the two-column
          grid so the wide table (6 columns + Received amount + pay-mode +
          Collected button) is never cramped into a half-width column. Each
          pending invoice can be collected fully or partially: the typed amount
          becomes a tagged payment receipt, the balance updates in place, and any
          remainder stays pending on the same invoice. */}
      {totalOutstanding > 0.005 && (
        <div
          className="card"
          style={{ marginBottom: 20, borderColor: "var(--danger)" }}
        >
          <span className="eyebrow">Pending Payment History</span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 8,
            }}
          >
            <b style={{ fontSize: 22, color: "var(--danger)" }}>
              {formatMoney(totalOutstanding)}
            </b>
            <span
              className="muted"
              style={{ fontSize: 13, textAlign: "right" }}
            >
              outstanding across {owingPeriods.length} unpaid invoice
              {owingPeriods.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Received (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {owingPeriods.map((p) => (
                  <tr key={p.membership_id}>
                    <td>{p.package_name}</td>
                    <td>
                      {fmtDate(p.start_date)} → {fmtDate(p.end_date)}
                    </td>
                    <td>{formatMoney(p.total_amount)}</td>
                    <td>{formatMoney(p.paid_amount)}</td>
                    <td>
                      <b style={{ color: "var(--danger)" }}>
                        {formatMoney(p.balance)}
                      </b>
                    </td>
                    <td>
                      {/* Prefilled with the full balance; type less for a
                          partial collection — the rest stays pending. */}
                      <input
                        type="number"
                        min="0.01"
                        max={Number(p.balance)}
                        step="0.01"
                        value={
                          collectAmount[p.membership_id] ?? Number(p.balance)
                        }
                        onChange={(e) =>
                          setCollectAmount((prev) => ({
                            ...prev,
                            [p.membership_id]: e.target.value,
                          }))
                        }
                        style={{ width: 110 }}
                        aria-label={`Amount received for ${p.package_name}`}
                      />
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <select
                        value={collectMode[p.membership_id] || "Cash"}
                        onChange={(e) =>
                          setCollectMode((prev) => ({
                            ...prev,
                            [p.membership_id]: e.target.value,
                          }))
                        }
                        // Global CSS makes selects width:100% — pin this one so
                        // the row fits on screen ("Bank Transfer" still fits).
                        style={{ marginRight: 6, width: 130 }}
                      >
                        {PAY_MODES.map((mo) => (
                          <option key={mo}>{mo}</option>
                        ))}
                      </select>
                      <button
                        className="btn brass sm"
                        onClick={() => handleCollect(p)}
                        disabled={collectingId === p.membership_id}
                      >
                        {collectingId === p.membership_id
                          ? "Recording…"
                          : "Collected ✓"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 20 }}>
        <div>
          <div className="tape">
            <Line k="Age" v={age != null ? `${age} yrs` : "—"} />
            <Line k="Gender" v={m.gender} />
            <Line k="Blood group" v={m.blood_group} />
            <Line k="Height" v={m.height_cm ? `${m.height_cm} cm` : ""} />
            <Line k="Weight" v={m.weight_kg ? `${m.weight_kg} kg` : ""} />
            <Line k="Occupation" v={m.occupation} />
            <Line k="Mobile 1" v={m.mobile_no1} />
            <Line k="Mobile 2" v={m.mobile_no2} />
            <Line k="Email" v={m.email} />
            <Line k="ID proof" v={m.id_proof_no} />
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <span className="eyebrow">Address</span>
            <p style={{ margin: "10px 0 0" }}>{m.address || "—"}</p>
          </div>
        </div>

        <div>
          {/* Current membership + renew */}
          <div className="card">
            <span className="eyebrow">Current Membership</span>
            {current ? (
              <>
                <div className="tape" style={{ marginTop: 12 }}>
                  <Line k="Package" v={current.package_name} />
                  <Line k="Status" v={current.membership_status} />
                  <Line k="Start" v={fmtDate(current.start_date)} />
                  <Line k="Ends" v={fmtDate(current.end_date)} />
                  <Line k="Total" v={formatMoney(current.total_amount)} />
                  <Line k="Paid" v={formatMoney(current.paid_amount)} />
                  <Line k="Balance" v={formatMoney(current.balance)} />
                </div>
                <div className="actions-row" style={{ marginTop: 12 }}>
                  <button
                    className="btn ghost sm"
                    onClick={() => handleInvoice(current.membership_id)}
                    disabled={busyInvoice === current.membership_id}
                  >
                    {busyInvoice === current.membership_id
                      ? "Preparing…"
                      : "Invoice"}
                  </button>
                  <button
                    className="btn ghost sm"
                    onClick={() => handleEditStart(current)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn danger sm"
                    onClick={() => handleDeletePeriod(current)}
                    disabled={deletingId === current.membership_id}
                  >
                    {deletingId === current.membership_id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
                {editing?.membership_id === current.membership_id && (
                  <EditPeriodForm
                    editing={editing}
                    setEditing={setEditing}
                    packages={packages}
                    onSave={handleEditSave}
                    onCancel={handleEditCancel}
                    busy={editBusy}
                  />
                )}

                {/* Membership pause / resume */}
                {pause && (
                  <div
                    style={{
                      marginTop: 16,
                      borderTop: "1px solid var(--line)",
                      paddingTop: 14,
                    }}
                  >
                    <span className="eyebrow">Membership Pause</span>
                    <p className="muted" style={{ margin: "8px 0 10px" }}>
                      Budget {pause.budget}d · Used {pause.used}d ·{" "}
                      <b style={{ color: "var(--bone)" }}>
                        {pause.remaining}d left
                      </b>
                    </p>

                    {pause.open_pause ? (
                      <div className="notice ok">
                        Paused since {fmtDate(pause.open_pause.pause_start)} ·{" "}
                        {pause.open_pause.accrued_days} day(s) frozen so far.
                        {pause.open_pause.planned_days
                          ? ` · planned ${pause.open_pause.planned_days}d (resume by ${fmtDate(pause.open_pause.expected_resume)})`
                          : ""}
                        <div className="actions-row" style={{ marginTop: 10 }}>
                          <button
                            className="btn brass sm"
                            onClick={handleResume}
                            disabled={pauseBusy}
                          >
                            {pauseBusy ? "Working…" : "Resume membership"}
                          </button>
                        </div>
                      </div>
                    ) : pause.membership_status === "Active" &&
                      pause.remaining > 0 ? (
                      <div
                        className="actions-row"
                        style={{ alignItems: "flex-end" }}
                      >
                        <div
                          className="field"
                          style={{ margin: 0, width: 110 }}
                        >
                          <label>Days (optional)</label>
                          <input
                            type="number"
                            min="1"
                            max={pause.remaining}
                            value={pauseDays}
                            onChange={(e) => setPauseDays(e.target.value)}
                            placeholder={`≤ ${pause.remaining}`}
                          />
                        </div>
                        <div className="field" style={{ margin: 0, flex: 1 }}>
                          <label>Reason (optional)</label>
                          <input
                            value={pauseReason}
                            onChange={(e) => setPauseReason(e.target.value)}
                            placeholder="e.g. travel, injury"
                          />
                        </div>
                        <button
                          className="btn ghost sm"
                          onClick={handlePause}
                          disabled={pauseBusy}
                        >
                          {pauseBusy ? "Working…" : "Pause membership"}
                        </button>
                      </div>
                    ) : pause.remaining <= 0 ? (
                      <p className="muted" style={{ margin: 0 }}>
                        No pause days remaining for this plan.
                      </p>
                    ) : (
                      <p className="muted" style={{ margin: 0 }}>
                        Pause is available only while the plan is active.
                      </p>
                    )}

                    {pause.pauses.filter((p) => p.resume_date).length > 0 && (
                      <div className="tape" style={{ marginTop: 12 }}>
                        {pause.pauses
                          .filter((p) => p.resume_date)
                          .map((p) => (
                            <div className="stat-line" key={p.pause_id}>
                              <span className="k">
                                {fmtDate(p.pause_start)} →{" "}
                                {fmtDate(p.resume_date)} · {p.days}d
                                {p.reason ? ` · ${p.reason}` : ""}
                              </span>
                              <span className="v">
                                <button
                                  className="btn ghost sm"
                                  onClick={() => handleCancelPause(p.pause_id)}
                                >
                                  Undo
                                </button>
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="muted" style={{ marginTop: 10 }}>
                No active plan.
              </p>
            )}

            <form onSubmit={handleRenew} style={{ marginTop: 16 }}>
              <span className="eyebrow">Renew / New Plan</span>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div className="field">
                  <label>Package</label>
                  {/* Amount here is the FIRST PAYMENT, not the plan charge — so a
                      value typed for one plan must not survive switching to
                      another (silent under-billing). Clear it on plan change. */}
                  <select
                    value={renew.package_id}
                    onChange={(e) =>
                      setRenew((p) => ({
                        ...p,
                        package_id: e.target.value,
                        amount_paid: "",
                      }))
                    }
                  >
                    <option value="">Select…</option>
                    {packages.map((p) => (
                      <option key={p.package_id} value={p.package_id}>
                        {p.name} — ₹{Number(p.price).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Start</label>
                  <input
                    type="date"
                    value={renew.start_date}
                    onChange={(e) =>
                      setRenew((p) => ({ ...p, start_date: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Paid now (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={renew.amount_paid}
                    onChange={(e) =>
                      setRenew((p) => ({ ...p, amount_paid: e.target.value }))
                    }
                    placeholder="leave blank if unpaid"
                  />
                </div>
              </div>
              <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>
                {data.next_start_date && currents.length > 0 ? (
                  <>
                    Leave <b>Start</b> blank to stack: the new period begins{" "}
                    <b>{fmtDate(data.next_start_date)}</b> when current coverage
                    ends, so the expiry extends and no paid time is lost. Set a
                    date to schedule or backdate.
                  </>
                ) : (
                  <>
                    Leave <b>Start</b> blank to begin today. Set a date to
                    schedule or backdate.
                  </>
                )}
              </p>
              <button className="btn brass sm" disabled={renewBusy}>
                {renewBusy ? "Adding…" : "Add membership period"}
              </button>
            </form>
          </div>

          {/* Upcoming / queued periods (start in the future, stacked behind current) */}
          {upcoming.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <span className="eyebrow">Upcoming / Queued</span>
              <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
                Paid plans that begin when current coverage ends.
              </p>
              <div style={{ marginTop: 12 }}>
                {upcoming.map((u) => (
                  <div
                    key={u.membership_id}
                    style={{
                      padding: "10px 0",
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <b>{u.package_name}</b>{" "}
                        <span className="chip upcoming">Queued</span>
                        <br />
                        <span className="muted">
                          {fmtDate(u.start_date)} → {fmtDate(u.end_date)}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="muted">
                          Bal {formatMoney(u.balance)}
                        </span>{" "}
                        <button
                          className="btn ghost sm"
                          onClick={() => handleInvoice(u.membership_id)}
                          disabled={busyInvoice === u.membership_id}
                        >
                          {busyInvoice === u.membership_id ? "…" : "Invoice"}
                        </button>{" "}
                        <button
                          className="btn ghost sm"
                          onClick={() => handleEditStart(u)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="btn danger sm"
                          onClick={() => handleDeletePeriod(u)}
                          disabled={deletingId === u.membership_id}
                        >
                          {deletingId === u.membership_id ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                    {editing?.membership_id === u.membership_id && (
                      <EditPeriodForm
                        editing={editing}
                        setEditing={setEditing}
                        packages={packages}
                        onSave={handleEditSave}
                        onCancel={handleEditCancel}
                        busy={editBusy}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Office use */}
          <div className="card" style={{ marginTop: 16 }}>
            <span className="eyebrow">Office Use</span>
            <div className="tape" style={{ marginTop: 12 }}>
              <Line k="Membership no." v={office?.membership_no} />
              <Line k="Batch" v={office?.batch} />
              <Line k="Trainer" v={office?.trainer} />
              <Line k="Joined" v={fmtDate(office?.date_of_joining)} />
              <Line k="ID verified" v={office?.id_verified ? "Yes" : "No"} />
              <Line
                k="Medical reviewed"
                v={office?.medical_reviewed ? "Yes" : "No"}
              />
              <Line k="Staff" v={office?.staff_name} />
              <Line k="Signature" v={office?.staff_signature} />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="grid-2" style={{ gap: 20, marginTop: 20 }}>
        <div className="card">
          <span className="eyebrow">Emergency Contacts</span>
          {emergencyContacts.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>
              None on file.
            </p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {emergencyContacts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <b>{c.name}</b>{" "}
                  <span className="muted">({c.relationship || "—"})</span>
                  <br />
                  <span className="muted">
                    {c.phone || "—"} · {c.address || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <span className="eyebrow">Guardians</span>
          {guardians.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>
              None on file.
            </p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {guardians.map((g) => (
                <div
                  key={g.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <b>{g.name}</b>{" "}
                  <span className="muted">({g.relationship || "—"})</span>
                  <br />
                  <span className="muted">{g.mobile_number || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Membership history */}
      <div className="section-head">
        <div>
          <span className="eyebrow">Fight History</span>
          <h2 style={{ marginTop: 8, fontSize: 22 }}>Membership History</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {historyRows.map((ms) => (
              <Fragment key={ms.membership_id}>
                <tr>
                  <td>{ms.package_name}</td>
                  <td>
                    <StatusChip status={ms.membership_status} />
                  </td>
                  <td>{fmtDate(ms.start_date)}</td>
                  <td>{fmtDate(ms.end_date)}</td>
                  <td>{formatMoney(ms.total_amount)}</td>
                  <td>{formatMoney(ms.paid_amount)}</td>
                  <td>{formatMoney(ms.balance)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      className="btn ghost sm"
                      onClick={() => handleInvoice(ms.membership_id)}
                      disabled={busyInvoice === ms.membership_id}
                    >
                      {busyInvoice === ms.membership_id ? "…" : "Invoice"}
                    </button>{" "}
                    <button
                      className="btn ghost sm"
                      onClick={() => handleEditStart(ms)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="btn danger sm"
                      onClick={() => handleDeletePeriod(ms)}
                      disabled={deletingId === ms.membership_id}
                    >
                      {deletingId === ms.membership_id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
                {editing?.membership_id === ms.membership_id && (
                  <tr>
                    <td colSpan={8} style={{ background: "var(--tint)" }}>
                      <EditPeriodForm
                        editing={editing}
                        setEditing={setEditing}
                        packages={packages}
                        onSave={handleEditSave}
                        onCancel={handleEditCancel}
                        busy={editBusy}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  No membership periods yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={safeHistoryPage}
        pageSize={HISTORY_PAGE_SIZE}
        total={history.length}
        onPageChange={setHistoryPage}
      />
    </>
  );
}
