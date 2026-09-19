import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const emptyMember = {
  full_name: '', date_of_birth: '', gender: '', address: '', mobile_no1: '',
  mobile_no2: '', email: '', occupation: '', blood_group: '', height_cm: '',
  weight_kg: '', id_proof_no: '', photo_url: '',
};
const emptyOffice = {
  membership_no: '', batch: '', trainer: '', date_of_joining: '',
  id_verified: false, medical_reviewed: false, staff_name: '', staff_signature: '',
};

export default function MemberForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [member, setMember] = useState(emptyMember);
  const [emergencyContacts, setEmergency] = useState([{ name: '', relationship: '', phone: '', address: '' }]);
  const [guardians, setGuardians] = useState([{ name: '', relationship: '', mobile_number: '' }]);
  const [office, setOffice] = useState(emptyOffice);
  const [membership, setMembership] = useState({ package_id: '', start_date: '', amount_paid: '' });
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // The starting-package list is scoped to the member's gender: a male sees
  // Male + unisex plans, a female sees Female + unisex (the server applies the
  // mapping). Re-fetch whenever the gender changes; with no gender chosen yet we
  // show the whole catalogue so the field stays usable. If the gender changes to
  // one that no longer offers the picked plan, drop the now-invalid selection.
  useEffect(() => {
    api
      .packages(member.gender || '')
      .then((rows) => {
        setPackages(rows);
        setMembership((p) =>
          p.package_id && !rows.some((r) => String(r.package_id) === String(p.package_id))
            ? { ...p, package_id: '' }
            : p,
        );
      })
      .catch((e) => setError(e.message));
  }, [member.gender]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await api.getMember(id);
        const m = data.member;
        setMember({
          full_name: m.full_name || '', date_of_birth: m.date_of_birth?.slice(0, 10) || '',
          gender: m.gender || '', address: m.address || '', mobile_no1: m.mobile_no1 || '',
          mobile_no2: m.mobile_no2 || '', email: m.email || '', occupation: m.occupation || '',
          blood_group: m.blood_group || '', height_cm: m.height_cm || '', weight_kg: m.weight_kg || '',
          id_proof_no: m.id_proof_no || '', photo_url: m.photo_url || '',
        });
        setEmergency(data.emergencyContacts.length ? data.emergencyContacts : [{ name: '', relationship: '', phone: '', address: '' }]);
        setGuardians(data.guardians.length ? data.guardians : [{ name: '', relationship: '', mobile_number: '' }]);
        setOffice({
          membership_no: data.office?.membership_no || '', batch: data.office?.batch || '',
          trainer: data.office?.trainer || '', date_of_joining: data.office?.date_of_joining?.slice(0, 10) || '',
          id_verified: data.office?.id_verified || false, medical_reviewed: data.office?.medical_reviewed || false,
          staff_name: data.office?.staff_name || '', staff_signature: data.office?.staff_signature || '',
        });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id, isEdit]);

  const setM = (k, v) => setMember((p) => ({ ...p, [k]: v }));
  const setO = (k, v) => setOffice((p) => ({ ...p, [k]: v }));

  function updateRow(setter, list, idx, key, value) {
    const next = list.map((row, i) => (i === idx ? { ...row, [key]: value } : row));
    setter(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!member.full_name || !member.mobile_no1) {
      setError('Full name and primary mobile number are required.');
      return;
    }
    setBusy(true);
    const payload = {
      member,
      emergencyContacts: emergencyContacts.filter((c) => c.name),
      guardians: guardians.filter((g) => g.name),
      office,
    };
    if (!isEdit && membership.package_id) {
      payload.membership = {
        package_id: Number(membership.package_id),
        start_date: membership.start_date || undefined,
        amount_paid: membership.amount_paid ? Number(membership.amount_paid) : undefined,
      };
    }
    try {
      const res = isEdit ? await api.updateMember(id, payload) : await api.createMember(payload);
      navigate(`/admin/members/${res.member_id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <span className="eyebrow">{isEdit ? 'Update the Tape' : 'Sign the Fighter'}</span>
      <div className="section-head" style={{ margin: '8px 0 18px' }}>
        <h2>{isEdit ? 'Edit Member' : 'New Member'}</h2>
        <button className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {error && <div className="notice error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Personal */}
        <div className="fieldset">
          <span className="eyebrow">Personal</span>
          <div className="grid-2">
            <div className="field"><label>Full name *</label><input value={member.full_name} onChange={(e) => setM('full_name', e.target.value)} /></div>
            <div className="field"><label>Date of birth</label><input type="date" value={member.date_of_birth} onChange={(e) => setM('date_of_birth', e.target.value)} /></div>
          </div>
          <div className="grid-3">
            <div className="field">
              <label>Gender</label>
              <select value={member.gender} onChange={(e) => setM('gender', e.target.value)}>
                <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Blood group</label>
              <select value={member.blood_group} onChange={(e) => setM('blood_group', e.target.value)}>
                <option value="">—</option>
                {BLOOD.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="field"><label>Occupation</label><input value={member.occupation} onChange={(e) => setM('occupation', e.target.value)} /></div>
          </div>
          <div className="field"><label>Address</label><textarea value={member.address} onChange={(e) => setM('address', e.target.value)} /></div>
          <div className="grid-2">
            <div className="field"><label>Mobile no. 1 *</label><input value={member.mobile_no1} onChange={(e) => setM('mobile_no1', e.target.value)} /></div>
            <div className="field"><label>Mobile no. 2</label><input value={member.mobile_no2} onChange={(e) => setM('mobile_no2', e.target.value)} /></div>
          </div>
          <div className="grid-2">
            <div className="field"><label>Email</label><input type="email" value={member.email} onChange={(e) => setM('email', e.target.value)} /></div>
            <div className="field"><label>ID proof no.</label><input value={member.id_proof_no} onChange={(e) => setM('id_proof_no', e.target.value)} /></div>
          </div>
          <div className="grid-3">
            <div className="field"><label>Height (cm)</label><input type="number" step="0.1" value={member.height_cm} onChange={(e) => setM('height_cm', e.target.value)} /></div>
            <div className="field"><label>Weight (kg)</label><input type="number" step="0.1" value={member.weight_kg} onChange={(e) => setM('weight_kg', e.target.value)} /></div>
            <div className="field"><label>Photo URL</label><input value={member.photo_url} onChange={(e) => setM('photo_url', e.target.value)} /></div>
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="fieldset">
          <span className="eyebrow">Emergency Contacts</span>
          {emergencyContacts.map((c, i) => (
            <div className="repeater-row" key={i}>
              <div className="field" style={{ margin: 0 }}><label>Name</label><input value={c.name} onChange={(e) => updateRow(setEmergency, emergencyContacts, i, 'name', e.target.value)} /></div>
              <div className="field" style={{ margin: 0 }}><label>Relationship</label><input value={c.relationship} onChange={(e) => updateRow(setEmergency, emergencyContacts, i, 'relationship', e.target.value)} /></div>
              <div className="field" style={{ margin: 0 }}><label>Phone</label><input value={c.phone} onChange={(e) => updateRow(setEmergency, emergencyContacts, i, 'phone', e.target.value)} /></div>
              <div className="field" style={{ margin: 0 }}><label>Address</label><input value={c.address} onChange={(e) => updateRow(setEmergency, emergencyContacts, i, 'address', e.target.value)} /></div>
              <button type="button" className="btn ghost sm" onClick={() => setEmergency(emergencyContacts.filter((_, x) => x !== i))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn ghost sm" onClick={() => setEmergency([...emergencyContacts, { name: '', relationship: '', phone: '', address: '' }])}>+ Add contact</button>
        </div>

        {/* Guardians */}
        <div className="fieldset">
          <span className="eyebrow">Guardian Details</span>
          {guardians.map((g, i) => (
            <div className="repeater-row" key={i} style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <div className="field" style={{ margin: 0 }}><label>Name</label><input value={g.name} onChange={(e) => updateRow(setGuardians, guardians, i, 'name', e.target.value)} /></div>
              <div className="field" style={{ margin: 0 }}><label>Relationship</label><input value={g.relationship} onChange={(e) => updateRow(setGuardians, guardians, i, 'relationship', e.target.value)} /></div>
              <div className="field" style={{ margin: 0 }}><label>Mobile number</label><input value={g.mobile_number} onChange={(e) => updateRow(setGuardians, guardians, i, 'mobile_number', e.target.value)} /></div>
              <button type="button" className="btn ghost sm" onClick={() => setGuardians(guardians.filter((_, x) => x !== i))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn ghost sm" onClick={() => setGuardians([...guardians, { name: '', relationship: '', mobile_number: '' }])}>+ Add guardian</button>
        </div>

        {/* Office use */}
        <div className="fieldset">
          <span className="eyebrow">For Office Use</span>
          <div className="grid-3">
            <div className="field">
              <label>Membership no.</label>
              <input value={office.membership_no || ''} readOnly disabled placeholder={isEdit ? '—' : 'Auto-generated on save'} />
              <span className="muted" style={{ fontSize: 12 }}>Assigned automatically — unique per member.</span>
            </div>
            <div className="field"><label>Batch</label><input value={office.batch} onChange={(e) => setO('batch', e.target.value)} placeholder="Morning / Evening" /></div>
            <div className="field"><label>Trainer</label><input value={office.trainer} onChange={(e) => setO('trainer', e.target.value)} /></div>
          </div>
          <div className="grid-3">
            <div className="field"><label>Date of joining</label><input type="date" value={office.date_of_joining} onChange={(e) => setO('date_of_joining', e.target.value)} /></div>
            <div className="field"><label>Staff name</label><input value={office.staff_name} onChange={(e) => setO('staff_name', e.target.value)} /></div>
            <div className="field"><label>Staff signature</label><input value={office.staff_signature} onChange={(e) => setO('staff_signature', e.target.value)} /></div>
          </div>
          <div className="actions-row">
            <div className="field check"><input id="idv" type="checkbox" checked={office.id_verified} onChange={(e) => setO('id_verified', e.target.checked)} /><label htmlFor="idv">ID verified</label></div>
            <div className="field check"><input id="med" type="checkbox" checked={office.medical_reviewed} onChange={(e) => setO('medical_reviewed', e.target.checked)} /><label htmlFor="med">Medical reviewed</label></div>
          </div>
        </div>

        {/* Initial package (create only) */}
        {!isEdit && (
          <div className="fieldset">
            <span className="eyebrow">Starting Package</span>
            <div className="grid-3">
              <div className="field">
                <label>Package</label>
                <select value={membership.package_id} onChange={(e) => setMembership((p) => ({ ...p, package_id: e.target.value, amount_paid: '' }))}>
                  <option value="">No plan yet</option>
                  {packages.map((p) => (
                    <option key={p.package_id} value={p.package_id}>{p.name} — ₹{Number(p.price).toLocaleString('en-IN')}</option>
                  ))}
                </select>
                {member.gender && (
                  <span className="muted" style={{ fontSize: 12 }}>Showing {member.gender} + unisex plans.</span>
                )}
              </div>
              <div className="field"><label>Start date</label><input type="date" value={membership.start_date} onChange={(e) => setMembership((p) => ({ ...p, start_date: e.target.value }))} /></div>
              <div className="field"><label>Amount paid (₹)</label><input type="number" value={membership.amount_paid} onChange={(e) => setMembership((p) => ({ ...p, amount_paid: e.target.value }))} placeholder="defaults to package price" /></div>
            </div>
            <p className="muted" style={{ margin: 0 }}>End date is set automatically from the package length. Renewals are added later from the member's page.</p>
          </div>
        )}

        <div className="actions-row">
          <button className="btn brass" disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Sign the fighter'}</button>
          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
