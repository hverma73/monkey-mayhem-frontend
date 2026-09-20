import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../adminApi.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [byDay, setByDay] = useState({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const rows = await api.calendar(year, month);
      const map = {};
      for (const r of rows) {
        // end_date is 'YYYY-MM-DD'; take the day straight from the string.
        // new Date('YYYY-MM-DD') parses as UTC midnight, so .getDate() rolls
        // back a day in timezones west of UTC and pills land on the wrong cell.
        const day = Number(String(r.end_date).slice(8, 10));
        (map[day] ||= []).push(r);
      }
      setByDay(map);
    } catch (e) {
      setError(e.message);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  function shift(delta) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m); setYear(y);
  }

  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isThisMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  return (
    <>
      <span className="eyebrow">Bell Schedule</span>
      <div className="section-head" style={{ margin: '8px 0 18px' }}>
        <h2>Expiry Calendar</h2>
        <div className="toolbar">
          <button className="btn ghost sm" onClick={() => shift(-1)}>← Prev</button>
          <strong style={{ minWidth: 130, textAlign: 'center', flex: '1 1 auto' }}>
            {MONTHS[month - 1]} {year}
          </strong>
          <button className="btn ghost sm" onClick={() => shift(1)}>Next →</button>
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}

      {/* .cal-scroll lets the month scroll sideways on a phone rather than
          squeezing seven columns into 45px slivers (see index.css). */}
      <div className="cal-scroll">
      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-head">{d}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} className="cal-cell blank" />;
          const today = isThisMonth && d === new Date().getDate();
          const expiries = byDay[d] || [];
          return (
            <div key={d} className={`cal-cell${today ? ' today' : ''}`}>
              <div className="cal-date">{d}</div>
              {expiries.map((m) => (
                <span
                  key={m.member_id}
                  className="cal-pill"
                  title={`${m.full_name} — ${m.package_name || ''}`}
                  onClick={() => navigate(`/admin/members/${m.member_id}`)}
                >
                  {m.full_name}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      </div>
      <p className="muted" style={{ marginTop: 14 }}>Each red tag is a membership ending that day. Click a name to open the member.</p>
    </>
  );
}
