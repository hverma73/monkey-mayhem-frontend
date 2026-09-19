import { useEffect, useState } from 'react';
import { api } from '../api.js';

const GENDERS = ['Male', 'Female', 'Other'];
const emptyForm = { name: '', duration_days: '', price: '', gender: 'All' };

// Standard plans are month-based; custom plans are day-based. Label whichever
// unit the package carries.
function durationLabel(p) {
  if (p.duration_days) return `${p.duration_days} day${Number(p.duration_days) === 1 ? '' : 's'}`;
  return `${p.duration_months} mo${p.duration_months > 1 ? 's' : ''}`;
}

export default function CustomPackages() {
  const [gender, setGender] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create-plan form
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Re-fetch whenever the chosen gender changes, or after a plan is created.
  useEffect(() => {
    if (!gender) {
      setPackages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .packages(gender)
      .then((rows) => !cancelled && setPackages(rows))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [gender, refreshKey]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    const days = Number(form.duration_days);
    const price = Number(form.price);
    if (!form.name.trim()) {
      setError('Give the plan a name.');
      return;
    }
    if (!Number.isInteger(days) || days <= 0) {
      setError('Duration must be a whole number of days greater than 0.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be 0 or more.');
      return;
    }

    setSaving(true);
    try {
      const created = await api.createPackage({
        name: form.name.trim(),
        duration_days: days,
        price,
        gender: form.gender,
      });
      setForm(emptyForm);
      setNotice(`Added “${created.name}”.`);
      // Surface the new plan: jump to its gender for a specific plan, or just
      // refresh the current view for a unisex one (it shows under every gender).
      if (GENDERS.includes(created.gender)) setGender(created.gender);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <span className="eyebrow">Build the Fight Plan</span>
      <div className="section-head" style={{ margin: '8px 0 18px' }}>
        <h2>Custom Package Plan</h2>
      </div>

      {error && <div className="notice error">{error}</div>}
      {notice && <div className="notice ok">{notice}</div>}

      {/* Create a custom plan */}
      <div className="fieldset">
        <span className="eyebrow">Add a Custom Plan</span>
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="field">
              <label>Plan name *</label>
              <input
                value={form.name}
                onChange={(e) => setF('name', e.target.value)}
                placeholder="e.g. 45-Day Shred"
              />
            </div>
            <div className="field">
              <label>Built for</label>
              <select value={form.gender} onChange={(e) => setF('gender', e.target.value)}>
                <option value="All">All (unisex)</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Duration (days) *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.duration_days}
                onChange={(e) => setF('duration_days', e.target.value)}
                placeholder="e.g. 45 for a 45-day plan"
              />
            </div>
            <div className="field">
              <label>Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setF('price', e.target.value)}
              />
            </div>
          </div>
          <div className="actions-row">
            <button className="btn brass" disabled={saving}>
              {saving ? 'Saving…' : 'Add plan'}
            </button>
          </div>
        </form>
      </div>

      {/* Pick a gender to view */}
      <div className="fieldset">
        <span className="eyebrow">Pick a Corner</span>
        <p className="muted" style={{ margin: '0 0 14px' }}>
          Choose a gender to see the packages built for that fighter.
        </p>
        <div className="actions-row" role="group" aria-label="Choose a gender">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              className={`btn ${gender === g ? '' : 'ghost'}`}
              aria-pressed={gender === g}
              onClick={() => setGender(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {!gender ? (
        <div className="card empty">Select a gender above to see the matching packages.</div>
      ) : loading ? (
        <div className="card empty">Loading packages…</div>
      ) : packages.length === 0 ? (
        <div className="card empty">No packages set up for {gender} yet.</div>
      ) : (
        <>
          <div className="section-head">
            <div>
              <span className="eyebrow">The Card</span>
              <h2 style={{ marginTop: 8 }}>{gender} Packages</h2>
            </div>
            <span className="muted">
              {packages.length} plan{packages.length === 1 ? '' : 's'} available
            </span>
          </div>

          <div className="pkg-grid">
            {packages.map((p) => (
              <div className="pkg-card card" key={p.package_id}>
                <div className="pkg-top">
                  <span className="chip noplan">{p.gender === 'All' ? 'Unisex' : p.gender}</span>
                  <span className="pkg-dur">{durationLabel(p)}</span>
                </div>
                <h3 className="pkg-name">{p.name}</h3>
                <div className="pkg-price">₹{Number(p.price).toLocaleString('en-IN')}</div>
                <div className="pkg-permonth">
                  {p.duration_days
                    ? `₹${Math.round(Number(p.price) / p.duration_days).toLocaleString('en-IN')}/day`
                    : `₹${Math.round(Number(p.price) / p.duration_months).toLocaleString('en-IN')}/month`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
