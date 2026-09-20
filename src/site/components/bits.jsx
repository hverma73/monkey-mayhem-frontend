/* Small building blocks shared by every public-site page. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site, wa, week as weekData } from '../siteData.js';
import { waTo } from '../../utils.js';

/* ---- photo slot -------------------------------------------------------
   A real photo when `src` is given, otherwise the labelled placeholder that
   marks where one still needs to land. Either way the aspect-ratio classes
   (tall / sq / wide) hold the layout, so filling a slot never reflows the page.

   Photos live in public/photos/ and must be the club's own. Images from the
   Google listing are not an option: reviewer-uploaded photos belong to the
   reviewer, and the Maps Platform terms forbid re-hosting any of them.       */
export function PhotoSlot({ label, variant = '', src, alt }) {
  if (!src) return null;
  return (
    <div className={`ph has-img ${variant}`.trim()}>
      <img src={src} alt={alt || label} loading="lazy" />
    </div>
  );
}

/* ---- page header ---- */
export function PageHead({ eyebrow, title, lead, right }) {
  return (
    <div className="pg-head r">
      <div className="pg-head-row">
        <div>
          {eyebrow && (
            <span className="eyebrow">
              <span className="tab" />
              {eyebrow}
            </span>
          )}
          <h1 className="h2">{title}</h1>
          {lead && <p className="lead">{lead}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

/* ---- section header with a "more" link on the right ---- */
export function SectionHead({ eyebrow, title, moreTo, moreLabel }) {
  return (
    <div className="pg-head r">
      <div className="pg-head-row">
        <div>
          <span className="eyebrow">
            <span className="tab" />
            {eyebrow}
          </span>
          <h2 className="h2">{title}</h2>
        </div>
        {moreTo && (
          <Link className="morelink" to={moreTo}>
            {moreLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}

/* ---- program card ---- */
export function ProgramCard({ program, mode = 'plate' }) {
  const catClass = `c-${program.category.replace(/[^A-Za-z0-9-]/g, '-')}`;
  const isRow = mode === 'row';
  const isPoster = mode === 'poster' || Boolean(program.photo);
  const whatsappUrl = waTo(site.phoneRaw, program.whatsappText);
  const titleWords = program.name.split(' ');
  const markIndex = titleWords.length > 1 ? 1 : -1;
  const title = titleWords.map((word, index) => (
    <span key={word}>
      {index === markIndex ? <mark>{word}</mark> : word}
      {index < titleWords.length - 1 ? ' ' : ''}
    </span>
  ));

  if (isRow) {
    return (
      <article className="pr r">
        <span className="pr-idx" aria-hidden="true">{program.index}</span>
        <div className="pr-main">
          <span><span className={`tag ${catClass}`}>{program.category}</span></span>
          <h3>{program.name}</h3>
          <p>{program.tagline}</p>
        </div>
        <dl className="pr-tape">
          <div><dt>Level</dt><dd>{program.level}</dd></div>
          <div><dt>Days</dt><dd>{program.days}</dd></div>
          <div><dt>Time</dt><dd>{program.times}</dd></div>
        </dl>
        <a className="pr-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Book a trial →
        </a>
      </article>
    );
  }

  return (
    <article className={`pc hoverable r${program.featured ? ' pc--featured' : ''}`}>
      <a className="pc-hit" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`Book a trial for ${program.name}`} />
      <div className={`pc-media${isPoster ? ' has-img' : ''}`}>
        {isPoster && <img src={program.photo} alt={`${program.name} training at Monkey Mayhem`} loading="lazy" />}
        <span className={`tag ${catClass}`}>{program.category}</span>
        {!isPoster && <i className="pc-slab" aria-hidden="true" />}
        <span className="pc-idx" aria-hidden="true">{program.index}</span>
        {program.featured && <span className="pc-event">Main event</span>}
        {isPoster && <h3 className="pc-over">{title}</h3>}
      </div>
      <div className="pc-body">
        {!isPoster && <h3>{program.name}</h3>}
        <p>{program.tagline}</p>
        <dl className="pc-tape">
          <div><dt>Level</dt><dd>{program.level}</dd></div>
          <div><dt>Coach</dt><dd>{program.coach}</dd></div>
          <div><dt>Days</dt><dd>{program.days}</dd></div>
          <div><dt>Time</dt><dd>{program.times}</dd></div>
        </dl>
        <div className="pc-actions">
          <a className="btn btn-sm pc-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Book a trial</a>
          <Link className="pc-link" to={`/batches?program=${program.slug}#timetable`}>Timetable →</Link>
        </div>
      </div>
    </article>
  );
}

/* ---- weekly timetable grid ---- */
export function WeekGrid({ highlightProgram = '' }) {
  const [hitProgram, setHitProgram] = useState(highlightProgram);

  useEffect(() => {
    setHitProgram(highlightProgram);
    if (!highlightProgram) return undefined;
    const timer = setTimeout(() => setHitProgram(''), 2000);
    return () => clearTimeout(timer);
  }, [highlightProgram]);

  return (
    <div className="week r">
      {weekData.map((d) => (
        <div className="day" key={d.day}>
          <h3>{d.day}</h3>
          {d.slots.map(([time, cls, level]) => (
            <div className={`slot${hitProgram && cls === hitProgram ? ' slot--hit' : ''}`} key={time + cls}>
              <div className="t">{time}</div>
              <div className="c">{cls}</div>
              <div className="lv">{level}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---- testimonial card ----
   Takes the same shape whether the quote came from siteData.js or live from
   Google, so the homepage can swap sources without a second component:
     { q, who, role, src, href, avatar, stars, translated }

   `avatar`, `href` and `stars` are the attribution Google requires whenever its
   reviews are displayed — the author's name and picture, and a link back to the
   review itself. They are optional so the curated fallback still renders.     */
export function QuoteCard({ item }) {
  const label = item.src === 'Facebook' ? 'Read on Facebook' : 'Read on Google';
  return (
    <figure className="quote r">
      <blockquote>&ldquo;{item.q}&rdquo;</blockquote>
      {item.translated && <div className="qnote">Translated by Google</div>}
      <figcaption>
        {item.avatar && (
          <img className="avatar" src={item.avatar} alt="" loading="lazy" aria-hidden="true" />
        )}
        <div className="qmeta">
          <div className="who">{item.who}</div>
          <div className="role">
            {typeof item.stars === 'number' && (
              <span className="stars" aria-label={`${item.stars} out of 5`}>
                {'★'.repeat(Math.round(item.stars))}
              </span>
            )}
            {item.role}
          </div>
        </div>
        {item.href && (
          <a className="qsrc" href={item.href} target="_blank" rel="noopener noreferrer nofollow">
            {label}
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/* ---- Google attribution strip ----
   Shown under live Google reviews. Two things are required and neither is
   decorative: a route back to the listing on Google Maps, and a plain statement
   of how the set was chosen — these are whichever few Google ranked most
   relevant, not the club's pick and not the newest.                          */
export function GoogleAttribution({ attribution, rating, total }) {
  if (!attribution) return null;
  return (
    <p className="attrib">
      {typeof rating === 'number' && (
        <strong>
          {rating.toFixed(1)}★{typeof total === 'number' ? ` · ${total} reviews` : ''}
        </strong>
      )}{' '}
      Reviews from Google. {attribution.ordering}{' '}
      {attribution.mapsUri && (
        <a href={attribution.mapsUri} target="_blank" rel="noopener noreferrer">
          See them all on Google Maps
        </a>
      )}
    </p>
  );
}

/* ---- closing call-to-action strip ---- */
export function CtaStrip({ title, sub }) {
  return (
    <div
      className="panel r"
      style={{
        marginTop: 34,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h3 style={{ marginBottom: 4 }}>{title}</h3>
        <p className="note">{sub}</p>
      </div>
      <div className="actions">
        <a
          className="btn"
          target="_blank"
          rel="noopener noreferrer"
          href={wa("Hi TMM, I'd like to book a trial class.")}
        >
          Book a trial
        </a>
        <Link className="btn btn-2" to="/contact">
          Contact
        </Link>
      </div>
    </div>
  );
}
