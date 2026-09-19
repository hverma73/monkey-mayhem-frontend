/* =====================================================================
   WHO GETS THE STAFF CONSOLE
   ---------------------------------------------------------------------
   The app serves two audiences from one build:

     • guests (and anyone not on the list below)  → the public site
     • an admin login                            → the staff console

   >>> PUT THE REAL ADMIN EMAIL HERE <<<
   Add it to ADMIN_LOGINS (or set VITE_ADMIN_LOGINS in the frontend .env
   as a comma-separated list, which overrides this default). Matching is
   case-insensitive against the login the account signs in with — the
   backend calls that field `username`, and it happily holds an email.

   Credentials are still checked server-side; this list only decides which
   of the two UIs a *successfully authenticated* account is shown.
   ===================================================================== */

const DEFAULT_ADMIN_LOGINS = [
  'admin', // the account created by the backend's `npm run seed`
  'info@monkeymayhemfightclub.com',
];

export const ADMIN_LOGINS = (
  import.meta.env.VITE_ADMIN_LOGINS
    ? import.meta.env.VITE_ADMIN_LOGINS.split(',')
    : DEFAULT_ADMIN_LOGINS
)
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminLogin(user) {
  if (!user?.username) return false;
  return ADMIN_LOGINS.includes(String(user.username).trim().toLowerCase());
}
