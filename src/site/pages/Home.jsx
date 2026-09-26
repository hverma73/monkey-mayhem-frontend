import { Link } from 'react-router-dom';
import MonkeyMark from '../components/MonkeyMark.jsx';
import {
  CtaStrip,
  GoogleAttribution,
  PhotoSlot,
  ProgramCard,
  QuoteCard,
  SectionHead,
  WeekGrid,
} from '../components/bits.jsx';
import {
  programs,
  site,
  stats,
  team,
  testimonials,
  verifiedTestimonials,
  wa,
} from '../siteData.js';
import { useGoogleReviews } from '../useGoogleReviews.js';

export default function Home() {
  // One fetch for the whole page: the hero, the ticker and the reviews section
  // all quote the same rating, so they must not disagree mid-render.
  const google = useGoogleReviews();
  return (
    <>
      <Hero google={google} />
      <Ticker google={google} />
      <LowerThirdStats />

      <section className="pg sub-alt">
        <div className="wrap">
          <SectionHead
            eyebrow="The main card"
            title="Programs"
            moreTo="/programs"
            moreLabel="Full fight card"
          />
          <div className="grid g-auto home-programs">
            {programs.slice(0, 6).map((p) => (
              <ProgramCard key={p.name} program={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="pg">
        <div className="wrap">
          <SectionHead
            eyebrow="Tale of the tape"
            title="This week's schedule"
            moreTo="/batches"
            moreLabel="Batches"
          />
          <WeekGrid />
        </div>
      </section>

      <section className="pg sub-alt">
        <div className="wrap">
          <CoachSplit />
        </div>
      </section>

      <Verdicts google={google} />

      <section className="pg sub-alt">
        <div className="wrap">
          <CtaStrip
            title="The bell rings six days a week."
            sub="Book a trial and take your first round."
          />
        </div>
      </section>
    </>
  );
}

/* The star rating shown across the page. Google's live figure wins when we
   have it; otherwise the static one in siteData.js stands in, which is why
   both are formatted the same way here rather than at each call site. */
function ratingOf(google) {
  const live = typeof google?.rating === 'number';
  return {
    rating: live ? google.rating.toFixed(1) : site.rating,
    total: live && typeof google.total === 'number' ? String(google.total) : site.reviews,
    live,
  };
}

function Hero({ google }) {
  const { rating, total } = ratingOf(google);
  return (
    <section className="night-hero">
      <MonkeyMark variant="plain" className="hero-mk" />
      <div className="wrap">
        <span className="eyer">
          Kadri, Mangaluru · Est. {site.est} · {rating}★ ({total})
        </span>
        <h1 className="night-h1">
          Step into the <span className="hl">arena</span>.
        </h1>
        <p className="night-sub">
          {site.tagline} Twelve disciplines, a 50-fighter team, and a floor where beginners and pros
          train side by side — six days a week.
        </p>
        <div className="night-cta">
          <a
            className="btn"
            target="_blank"
            rel="noopener noreferrer"
            href={wa("Hi TMM, I'd like to book a trial class.")}
          >
            Book a trial
          </a>
          <Link className="btn btn-2" to="/batches">
            Tonight&rsquo;s card
          </Link>
        </div>
      </div>
    </section>
  );
}

/* Broadcast-style scrolling strip. The run is duplicated so the -50%
   translate loops seamlessly. */
function Ticker({ google }) {
  const { rating } = ratingOf(google);
  const run = [
    '— Mon–Sat · 6 AM – 10 PM',
    '— MMA · Boxing · Muay Thai · BJJ · Wrestling',
    '— 600+ trained',
    `— ${rating}★ on Google`,
  ];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="run">
        {[...run, ...run].map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}

function LowerThirdStats() {
  return (
    <section className="pg">
      <div className="wrap">
        <div className="lt r">
          {stats.map((s) => (
            <div className="cell" key={s.l}>
              <div className="n">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Member verdicts. Prefers live Google reviews and falls back to the curated
   quotes in siteData.js — a visitor must never meet an empty section because
   Google is slow, unconfigured or down.

   The fallback deliberately uses verifiedTestimonials, not testimonials: if we
   cannot show real Google reviews, the least we can do is show only the quotes
   whose source resolves. `testimonials` still holds the four unverified ones so
   the club can fix or remove them — see the note in siteData.js. */
function Verdicts({ google }) {
  const { rating } = ratingOf(google);
  const quotes = google.live
    ? google.reviews.map((r) => ({
        q: r.text,
        who: r.authorName || 'Google review',
        role: r.relativeTime || '',
        src: 'Google',
        href: r.sourceUri || r.authorUri || null,
        avatar: r.authorPhotoUri || null,
        stars: r.rating,
        translated: r.translated,
      }))
    : verifiedTestimonials.slice(0, 6);

  return (
    <section className="pg">
      <div className="wrap">
        <div className="pg-head r">
          <span className="eyebrow">
            <span className="tab" />
            Scorecards · {rating}★
          </span>
          <h2 className="h2">The verdicts</h2>
        </div>
        <div className="q-masonry">
          {quotes.map((t, i) => (
            <QuoteCard key={t.href || i} item={t} />
          ))}
        </div>
        {google.live && (
          <GoogleAttribution
            attribution={google.attribution}
            rating={google.rating}
            total={google.total}
          />
        )}
      </div>
    </section>
  );
}

function CoachSplit() {
  const coach = team[0];
  return (
    <div className="split r">
      {/* Nithesh, cropped from the club's own 2021 WKN title team photo
          (Instagram CTv0PZKlszD) and upscaled 4x with Real-ESRGAN to 1200x1600.
          Replace it with an original portrait when one is to hand. */}
      <PhotoSlot
        label="Coach Nithesh — corner shot, wraps on"
        variant="tall"
        src={coach.photo}
        alt={`${coach.name}, head coach at Monkey Mayhem Fight Club`}
      />
      <div>
        <span className="eyebrow">
          <span className="tab" />
          In your corner
        </span>
        <h2 className="h2">{coach.name}</h2>
        <span className="alias">
          &ldquo;{coach.alias}&rdquo; · {coach.role}
        </span>
        <p style={{ color: 'var(--muted)', maxWidth: '52ch', marginBottom: 14 }}>
          {coach.bio} Nine years on, TMM is the busiest fight floor in Mangaluru — and he still
          coaches the fundamentals class himself.
        </p>
        <div className="creds">
          <b>9 yrs</b> coaching · <b>600+</b> students · <b>50</b>-fighter team
        </div>
        <a className="btn btn-2" target="_blank" rel="noopener noreferrer" href={site.insta}>
          @the_vintage_monkey
        </a>
      </div>
    </div>
  );
}
