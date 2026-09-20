import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isAdminLogin } from '../config.js';
import Logo from '../components/Logo.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Login() {
  const { user, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in as an admin? Skip the form.
  if (user && isAdmin) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const signedIn = await login(username, password);
      if (isAdminLogin(signedIn)) {
        navigate('/');
      } else {
        // Correct password, but this account isn't on the admin list in
        // src/config.js — so it gets the public site, not the console.
        logout();
        setError(
          'That account is not set up for the staff console. Ask the club to add it, or browse the site instead.'
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <ThemeToggle />
      <div className="card login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Logo size={64} />
        </div>
        <h1>Monkey Mayhem</h1>
        <div className="sub">FIGHT CLUB · STAFF ENTRANCE</div>

        {error && <div className="notice error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="u">Username or email</label>
            <input
              id="u"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input
              id="p"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Stepping in…' : 'Step into the ring'}
          </button>
        </form>

        <p className="login-back">
          <a href="/">← Back to the club website</a>
        </p>
      </div>
    </div>
  );
}
