import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../components/bits.jsx';
import { gallery, videos } from '../siteData.js';

/* Category chips are derived from the data, so an empty category never shows
   a filter that leads nowhere. */
const CATEGORIES = ['All', ...new Set(gallery.map((g) => g.category))];
const VIDEO_GROUPS = [...new Set(videos.map((v) => v.group))];

export default function Gallery() {
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(-1);
  const [playing, setPlaying] = useState(null);
  const shown = cat === 'All' ? gallery : gallery.filter((g) => g.category === cat);

  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="Inside the gym"
        title="Gallery"
        lead="The floor, the team and fight nights — straight from the club's own camera roll."
        right={
          <nav className="gal-jump" aria-label="Gallery sections">
            <a href="#photos">Photos · {gallery.length}</a>
            <a href="#videos">Videos · {videos.length}</a>
          </nav>
        }
      />

      <section id="photos" aria-label="Photos">
        {CATEGORIES.length > 2 && (
          <div className="chips r" role="group" aria-label="Filter photos">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={c === cat}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="gal-grid">
          {shown.map((g, i) => (
            <button
              key={g.slug}
              type="button"
              className="gal-item r"
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${g.alt}`}
            >
              <img src={g.thumb} alt={g.alt} width={g.tw} height={g.th} loading="lazy" decoding="async" />
              <span className="gal-cap">{g.caption}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="videos" className="vid-section" aria-labelledby="videos-h">
        <h2 id="videos-h" className="h2 r">Videos</h2>
        {VIDEO_GROUPS.map((group) => {
          const list = videos.filter((v) => v.group === group);
          return (
            <div key={group} className="vid-group">
              <h3 className="vid-group-h r">{group}</h3>
              <div className={`vid-grid${list.every((v) => v.vertical) ? ' vid-grid--tall' : ''}`}>
                {list.map((v) => (
                  <VideoCard key={v.id} video={v} onPlay={() => setPlaying(v)} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {open >= 0 && (
        <Lightbox items={shown} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />
      )}
      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

/* A modal <dialog> gives focus trapping, Esc-to-close and the inert backdrop
   for free. Clicking the backdrop (the dialog element itself) closes it. */
function useModal() {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  const close = () => ref.current?.close();
  const onBackdrop = (e) => e.target === ref.current && close();
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };
  return { ref, close, onBackdrop, onKeyDown };
}

function Lightbox({ items, index, onIndex, onClose }) {
  const { ref, close, onBackdrop, onKeyDown } = useModal();
  const item = items[index];
  const go = useCallback(
    (step) => onIndex((index + step + items.length) % items.length),
    [index, items.length, onIndex]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <dialog ref={ref} className="gal-box" aria-label={item.alt} onClose={onClose} onClick={onBackdrop} onKeyDown={onKeyDown}>
      <figure>
        <img src={item.src} alt={item.alt} width={item.w} height={item.h} />
        <figcaption>
          <span>{item.caption}</span>
          <span className="gal-src">
            {index + 1} / {items.length}
            {item.source?.url && (
              <>
                {' · '}
                <a href={item.source.url} target="_blank" rel="noopener noreferrer">
                  {item.source.name}
                </a>
              </>
            )}
          </span>
        </figcaption>
      </figure>
      {items.length > 1 && (
        <>
          <button type="button" className="gal-nav prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
          <button type="button" className="gal-nav next" onClick={() => go(1)} aria-label="Next photo">›</button>
        </>
      )}
      <button type="button" className="gal-close" onClick={close} aria-label="Close">×</button>
    </dialog>
  );
}

const PLATFORM = { youtube: 'YouTube', instagram: 'Instagram' };

function watchUrl(v) {
  return v.platform === 'youtube'
    ? `https://www.youtube.com/watch?v=${v.id}`
    : `https://www.instagram.com/reel/${v.id}/`;
}

/* The card is only a poster: no third-party player (or its cookies and
   megabytes of script) loads until someone actually presses play. */
function VideoCard({ video: v, onPlay }) {
  return (
    <button type="button" className={`vid-card r${v.vertical ? ' tall' : ''}`} onClick={onPlay}>
      <span className="vid-poster">
        <img src={v.poster} alt="" width={v.pw} height={v.ph} loading="lazy" decoding="async" />
        <span className="vid-play" aria-hidden="true" />
      </span>
      <span className="vid-body">
        <span className="vid-title">{v.title}</span>
        <span className="vid-meta">
          {PLATFORM[v.platform]}
          {v.year && ` · ${v.year}`}
        </span>
      </span>
    </button>
  );
}

function VideoPlayer({ video: v, onClose }) {
  const { ref, close, onBackdrop, onKeyDown } = useModal();
  const src =
    v.platform === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`
      : `https://www.instagram.com/reel/${v.id}/embed/`;
  const frame = v.platform === 'instagram' ? `ig${v.vertical ? ' ig-tall' : ''}` : v.vertical ? 'tall' : 'wide';

  return (
    <dialog ref={ref} className="gal-box vid-box" aria-label={v.title} onClose={onClose} onClick={onBackdrop} onKeyDown={onKeyDown}>
      <figure>
        <div className={`vid-frame ${frame}`}>
          <iframe
            src={src}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <figcaption>
          <span>{v.title}</span>
          <span className="gal-src">
            <a href={watchUrl(v)} target="_blank" rel="noopener noreferrer">
              Watch on {PLATFORM[v.platform]}
            </a>
          </span>
        </figcaption>
      </figure>
      <button type="button" className="gal-close" onClick={close} aria-label="Close">×</button>
    </dialog>
  );
}
