import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const LINKS = [
  ['/admin', 'Dashboard', true],
  ['/admin/members/new', 'Add Member'],
  ['/admin/calendar', 'Calendar'],
  ['/admin/packages', 'Custom Package Plan'],
  ['/admin/payments', 'Payments'],
  ['/admin/import', 'Import Members'],
  ['/admin/leads', 'Leads'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Below 820px the nav collapses behind a burger (it used to just disappear,
  // leaving the console unnavigable on a phone).
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => setNavOpen(false), [pathname]);

  // Logging out drops the staff back onto the public site — that's what a
  // signed-out visitor sees, so there's nowhere else sensible to land.
  function handleLogout() {
    logout();
    navigate('/');
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
          <Link className="btn ghost sm" to="/">View site</Link>
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
