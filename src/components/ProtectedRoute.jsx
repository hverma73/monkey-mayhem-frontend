import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* Gates the /admin subtree. Two distinct rejections:
     - not signed in       → the login screen
     - signed in, not admin → the public site (they're a guest here)         */
export default function ProtectedRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
