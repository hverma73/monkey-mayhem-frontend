import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const LINKS = [
  ['/', 'Dashboard', true],
  ['/members/new', 'Add Member'],
  ['/calendar', 'Calendar'],
  ['/packages', 'Custom Package Plan'],
  ['/payments', 'Payments'],
  ['/import', 'Import Members'],
  ['/leads', 'Leads'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  // Below 820px the nav collapses behind a burger (it used to just disappear,
  // leaving the console unnavigable on a phone).
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => setNavOpen(false), [pathname]);

  // Logging out drops the staff back onto the public site — that's what a
  // signed-out visitor sees, so there's nowhere else sensible to land.
  function handleLogout() {
    logout();
    window.location.assign('/');
  }

  return (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <Logo size={42} />
          <div className="brand-name">
            Monkey Mayhem
            <small>Fight Club</small>
          </div>
        </div>

        <button
          className="topbar-burger"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={navOpen}
        >
          <span />
        </button>

        <nav className="nav">
          {LINKS.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-right">
          <span className="who">In your corner: <b>{user?.name}</b></span>
          <a className="btn ghost sm" href="/">View site</a>
          <ThemeToggle />
          <button className="btn ghost sm" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
