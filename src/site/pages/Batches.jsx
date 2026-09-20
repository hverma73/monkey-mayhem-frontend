import { PageHead, WeekGrid } from '../components/bits.jsx';
import { batches, wa } from '../siteData.js';
import { useToast } from '../toast.jsx';

/* "By invite" and "filling fast" are both cautions; anything else is open. */
function spotsBadge(spots) {
  return /invite|fast|filling/i.test(spots) ? 'b-warn' : 'b-ok';
}

export default function Batches() {
  const toast = useToast();

  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="Batches · Mon–Fri"
        title="Find your batch"
        lead="Named batches for every schedule and level. Timings rotate — message us for the live sheet."
      />

      <div className="grid g-auto">
        {batches.map((b) => (
          <article className="card r" key={b.name}>
            <div className="card-b">
              <span className="tag">{b.level}</span>
              <h3>{b.name}</h3>
              <p style={{ marginBottom: 12 }}>{b.focus}</p>
              <div className="lv" style={{ marginBottom: 4 }}>🕐 {b.time}</div>
              <div className="lv" style={{ marginBottom: 4 }}>📅 {b.days}</div>
              <div className="lv" style={{ marginBottom: 12 }}>🧑‍🏫 {b.coach}</div>
              <span className={`badge ${spotsBadge(b.spots)}`}>{b.spots}</span>
              <a
                className="btn btn-sm btn-block"
                style={{ marginTop: 14 }}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toast('Opening WhatsApp to enrol')}
                href={wa(
                  `Hi TMM, I'd like to join the ${b.name} batch (${b.time}, ${b.days}).`
                )}
              >
                Enrol / ask
              </a>
            </div>
          </article>
        ))}
      </div>

      <h2 id="timetable" className="h2 r" style={{ margin: '44px 0 18px' }}>
        The full week
      </h2>
      <WeekGrid />

      <p className="note r" style={{ marginTop: 14 }}>
        Indicative timetable — sessions rotate.{' '}
        <a
          href={wa("Hi TMM, please send this week's timetable.")}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          Message us on WhatsApp
        </a>{' '}
        for the live version.
      </p>
    </div>
  );
}
