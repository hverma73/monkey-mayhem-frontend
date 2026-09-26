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
            {m.photo ? (
              <PhotoSlot
                variant="tall"
                src={m.photo}
                alt={`${m.name}, ${m.role} at Monkey Mayhem Fight Club`}
              />
            ) : (
              <div className="coach-plate" aria-label={`${m.name}, ${m.role}`}>
                <span>{m.name.split(' ').map((part) => part[0]).join('')}</span>
              </div>
            )}
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
                  @monkey_mayhem_fight_club →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
