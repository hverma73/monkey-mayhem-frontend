import { PageHead } from '../components/bits.jsx';
import { events, wa } from '../siteData.js';
import { useToast } from '../toast.jsx';

export default function Events() {
  const toast = useToast();

  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="What's on"
        title="Events"
        lead="Open days, gradings, seminars and sparring meets. Come watch or come compete."
      />

      <div className="grid g2">
        {events.map((e) => (
          <article className="card r" key={e.title}>
            <div className="card-b ev-row">
              <div className="ev-when">
                <div className="tag" style={{ margin: 0 }}>{e.type}</div>
                <div className="ev-date">{e.date}</div>
              </div>
              <div>
                <h3>{e.title}</h3>
                <p style={{ marginBottom: 12 }}>{e.blurb}</p>
                <a
                  className="btn btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => toast('Opening WhatsApp')}
                  href={wa(`Hi TMM, I'm interested in: ${e.title} (${e.date}).`)}
                >
                  {e.cta}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
