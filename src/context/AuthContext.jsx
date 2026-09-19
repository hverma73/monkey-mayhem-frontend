import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';
import { isAdminLogin } from '../config.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem('mm_user');
    return raw ? JSON.parse(raw) : null;
  });

  // The api layer wipes localStorage on a 401 (expired/invalid token) and fires
  // this event; without it, `user` state stays truthy and ProtectedRoute keeps
  // rendering broken authed pages until a manual reload.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onLogout = () => setUser(null);
    window.addEventListener('mm-logout', onLogout);
    return () => window.removeEventListener('mm-logout', onLogout);
  }, []);

  // Returns the signed-in user so callers can route on it without waiting for
  // a re-render (Login needs to know immediately whether to open the console).
  async function login(username, password) {
    const { token, user: signedIn } = await api.login(username, password);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('mm_token', token);
      window.localStorage.setItem('mm_user', JSON.stringify(signedIn));
    }
    setUser(signedIn);
    return signedIn;
  }

  function logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('mm_token');
      window.localStorage.removeItem('mm_user');
    }
    setUser(null);
  }

  // Authenticated *and* on the admin list (see src/config.js) — the one gate
  // that decides staff console vs. public site.
  const isAdmin = isAdminLogin(user);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
