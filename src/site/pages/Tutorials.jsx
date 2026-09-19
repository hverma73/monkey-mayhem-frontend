import { PageHead, PhotoSlot } from '../components/bits.jsx';
import { tutorials } from '../siteData.js';

export default function Tutorials() {
  return (
    <div className="wrap pg" style={{ maxWidth: 820 }}>
      <PageHead
        eyebrow="Learn the basics"
        title="Tutorials"
        lead="Free step-by-step guides to the fundamentals. Video clips slot in where the photo blocks are."
      />

      {tutorials.map((t) => (
        <details className="acc r" key={t.id}>
          <summary>
            {t.title}
            <span className="lv" style={{ fontWeight: 600, marginLeft: 'auto' }}>
              {t.discipline} · {t.level} · {t.minutes}
            </span>
          </summary>
          <div className="acc-body">
            <p style={{ marginBottom: 6 }}>{t.summary}</p>
            <PhotoSlot label={`${t.title} — demo clip / step photos`} variant="wide" />
            <ol style={{ marginTop: 14 }}>
              {t.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </details>
      ))}

      <p className="note r" style={{ marginTop: 16 }}>
        Want these in person? Every fundamental here is coached in the beginner classes.
      </p>
    </div>
  );
}
