import { PageHead, PhotoSlot } from '../components/bits.jsx';
import { site, team } from '../siteData.js';

export default function Team() {
  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="In your corner"
        title="Team & trainers"
        lead="One standard across every mat."
      />

      <div className="grid g-auto">
        {team.map((m, i) => (
          <article className="card r" key={`${m.name}-${i}`}>
            <PhotoSlot
              label={m.real ? 'Coach Nithesh — corner shot, wraps on' : `${m.role} — headshot`}
              variant="tall"
            />
            <div className="card-b">
              <h3>{m.name}</h3>
              {m.alias && (
                <span className="alias" style={{ margin: '4px 0 10px' }}>
                  &ldquo;{m.alias}&rdquo;
                </span>
              )}
              <div className="lv" style={{ marginBottom: 10 }}>{m.role}</div>
              <div className="pill-row" style={{ marginBottom: 12 }}>
                {m.tags.map((t) => (
                  <span className="tag" style={{ margin: 0 }} key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <p>{m.bio}</p>
              {m.real && (
                <a
                  className="morelink"
                  style={{ display: 'inline-block', marginTop: 12 }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={site.insta}
                >
                  @the_vintage_monkey →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
