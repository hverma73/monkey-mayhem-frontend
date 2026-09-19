import { useEffect, useState } from 'react';
import { api } from '../api.js';

/* Live Google reviews for the public site.
 *
 * The site must render correctly in all four states, because three of them are
 * normal rather than exceptional:
 *   - loading            — first paint, before Google answers
 *   - not configured     — no API key set (the default), so nothing to show
 *   - configured, failed — Google is down or the key is rejected
 *   - configured, loaded — real reviews
 *
 * In every state except the last, the caller falls back to the club's own
 * curated quotes in siteData.js. That fallback is the point: the marketing page
 * must never show an empty section or an error because a third party is having
 * a bad day.
 *
 * Nothing is written to localStorage. The backend deliberately does not cache
 * Google's review text (Maps Platform Terms 3.2.3), and mirroring it into the
 * browser's storage here would reintroduce exactly what that avoids.
 */
export function useGoogleReviews() {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let alive = true;
    api
      .getReviews()
      .then((data) => {
        if (!alive) return;
        if (!data?.configured) return setState({ status: 'unconfigured', data: null });
        setState({ status: 'ready', data });
      })
      .catch(() => {
        // Swallowed on purpose: a failed reviews fetch is a non-event for a
        // visitor, who simply sees the curated quotes instead.
        if (alive) setState({ status: 'failed', data: null });
      });
    return () => {
      alive = false;
    };
  }, []);

  const reviews = state.data?.reviews || [];
  return {
    status: state.status,
    // `live` is the single flag every caller should branch on: true only when
    // we actually have Google reviews to render, attribution and all.
    live: state.status === 'ready' && reviews.length > 0,
    reviews,
    photos: state.data?.photos || [],
    rating: state.data?.rating ?? null,
    total: state.data?.total ?? null,
    attribution: state.data?.attribution || null,
  };
}
