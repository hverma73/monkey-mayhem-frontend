import { PageHead } from '../components/bits.jsx';
import { achievements, stats } from '../siteData.js';

export default function Achievements() {
  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="On the wall"
        title="Achievements"
        lead="Nine years, a 50-fighter team, and a shelf that keeps filling up."
      />

      <div className="lt r">
        {stats.map((s) => (
          <div className="cell" key={s.l}>
            <div className="n">{s.n}</div>
            <div className="l">{s.l}</div>
          </div>
        ))}
      </div>

      <h2 className="h2 r" style={{ margin: '40px 0 18px' }}>
        The record
      </h2>

      <div className="grid">
        {achievements.map((a) => (
          <div className="card rec-row r" key={a.year + a.title}>
            <div className="rec-year">{a.year}</div>
            <div className="rec-body">
              <h3>{a.title}</h3>
              {a.meta && <div className="rec-meta">{a.meta}</div>}
              <p>{a.detail}</p>
              {a.href && (
                <a className="rec-src" href={a.href} target="_blank" rel="noopener noreferrer">
                  {a.src || 'Source'} →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
