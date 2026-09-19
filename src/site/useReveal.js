import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Fades `.r` elements in as they scroll into view. Re-scans on every route
   change because each page mounts a fresh set of them. Honours
   prefers-reduced-motion (and browsers without IntersectionObserver) by
   revealing everything immediately. */
export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const els = document.querySelectorAll('.mm-site .r:not(.in)');
    if (!els.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
}
