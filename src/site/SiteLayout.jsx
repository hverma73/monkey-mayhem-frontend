import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import MonkeyMark from './components/MonkeyMark.jsx';
import Chatbot from './Chatbot.jsx';
import { ToastProvider } from './toast.jsx';
import useReveal from './useReveal.js';
import { site, wa } from './siteData.js';
import { useAuth } from '../context/AuthContext.jsx';
import './site.css';

/* Public-site nav. Order matters — it's the reading order of the club's
   story: what we teach → when → who → proof → what's on → learn → talk. */
const NAV = [
  ['/', 'Home'],
  ['/programs', 'Programs'],
  ['/batches', 'Batches'],
  ['/team', 'Team'],
  ['/achievements', 'Wins'],
  ['/events', 'Events'],
  ['/articles', 'Articles'],
  // PARKED — see the Tutorials note in App.jsx by the imports.
  // ['/tutorials', 'Tutorials'],
  ['/contact', 'Contact'],
];

export default function SiteLayout() {
  return (
    <ToastProvider>
      <SiteShell />
    </ToastProvider>
  );
}

function SiteShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  useReveal();

  // Every navigation closes the mobile menu and returns to the top of the page.
  useEffect(() => {
    setNavOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Flag the document as "on the public site" so the dark ground applies even
  // when the console's theme toggle is set to light (see site.css).
  useEffect(() => {
    document.documentElement.setAttribute('data-surface', 'site');
    return () => document.documentElement.removeAttribute('data-surface');
  }, []);

  return (
    <div className={`mm-site${navOpen ? ' nav-open' : ''}`}>
      <SiteNav onBurger={() => setNavOpen((v) => !v)} />

      <main className="site-main">
        <Outlet />
      </main>

      <SiteFooter />
      <StickyBar />
      <Chatbot />
    </div>
  );
}

function SiteNav({ onBurger }) {
  const { user, isAdmin } = useAuth();

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link className="brand" to="/">
          <MonkeyMark />
          <b>{site.name}</b>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'on' : undefined)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="burger" onClick={onBurger} aria-label="Menu">
          <span />
        </button>

        <div className="nav-right">
          {user && isAdmin ? (
            <Link className="txtlink" to="/admin">
              Staff console
            </Link>
          ) : (
            <Link className="txtlink" to="/login">
              Log in
            </Link>
          )}
          <a
            className="btn btn-sm"
            target="_blank"
            rel="noopener noreferrer"
            href={wa("Hi TMM, I'd like to book a trial class.")}
          >
            Book a trial
          </a>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="brand" to="/">
              <MonkeyMark />
              <b>{site.name}</b>
            </Link>
            <p className="note" style={{ marginTop: 10 }}>
              {site.tagline}
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/batches">Batches</Link></li>
              <li><Link to="/team">Team</Link></li>
              <li><Link to="/achievements">Achievements</Link></li>
              <li><Link to="/events">Events</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`tel:+${site.phoneRaw}`}>{site.phone}</a></li>
              <li>
                <a target="_blank" rel="noopener noreferrer" href={wa('Hi TMM')}>
                  WhatsApp us
                </a>
              </li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li>{site.address}</li>
            </ul>
          </div>

          <div>
            <h4>Hours &amp; social</h4>
            <ul>
              <li>{site.hours}</li>
              <li><a target="_blank" rel="noopener noreferrer" href={site.insta}>Instagram</a></li>
              <li><a target="_blank" rel="noopener noreferrer" href={site.fb}>Facebook</a></li>
              <li><a target="_blank" rel="noopener noreferrer" href={site.yt}>YouTube</a></li>
              <li><a target="_blank" rel="noopener noreferrer" href={site.maps}>Find us on Maps</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-note">
          <span>Content &amp; photos are placeholders · Design 3 · Fight Night</span>
          <span>Original content © {site.full}</span>
        </div>
      </div>
    </footer>
  );
}

function StickyBar() {
  return (
    <nav className="sticky-bar" aria-label="Quick actions">
      <a href={`tel:+${site.phoneRaw}`}>Call</a>
      <a
        className="mid"
        target="_blank"
        rel="noopener noreferrer"
        href={wa("Hi TMM, I'd like to book a trial class.")}
      >
        WhatsApp
      </a>
      <a target="_blank" rel="noopener noreferrer" href={site.maps}>
        Map
      </a>
    </nav>
  );
}
