import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoMeta } from './seo.js';

export default function usePageMeta() {
  const location = useLocation();

  useEffect(() => {
    const meta = getSeoMeta(location.pathname);
    const title = meta.title || 'Monkey Mayhem';
    const description = meta.description || '';
    const canonical = meta.canonical || 'https://monkeymayhemfightclub.com';

    document.title = title;

    const setOrCreate = (selector, attr, value, tag = 'meta') => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement(tag);
        document.head.appendChild(el);
      }
      if (tag === 'meta') {
        el.setAttribute(attr, value);
      } else {
        el.setAttribute('href', value);
      }
    };

    const descriptionEl = document.head.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute('content', description);
    } else {
      const el = document.createElement('meta');
      el.name = 'description';
      el.content = description;
      document.head.appendChild(el);
    }

    const robotsEl = document.head.querySelector('meta[name="robots"]');
    if (meta.noindex) {
      if (!robotsEl) {
        const el = document.createElement('meta');
        el.name = 'robots';
        el.content = 'noindex';
        document.head.appendChild(el);
      } else {
        robotsEl.setAttribute('content', 'noindex');
      }
    } else if (robotsEl) {
      robotsEl.remove();
    }

    const canonicalEl = document.head.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', canonical);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonical;
      document.head.appendChild(link);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en-IN';
    }
  }, [location.pathname]);
}
