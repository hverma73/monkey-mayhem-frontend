import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';

/* --- staff console (behind /admin, admin login only) --- */
import Dashboard from './pages/Dashboard.jsx';
import MemberForm from './pages/MemberForm.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import CustomPackages from './pages/CustomPackages.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import ImportPage from './pages/ImportPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';

/* --- public site (everything a guest sees) --- */
import SiteLayout from './site/SiteLayout.jsx';
import Home from './site/pages/Home.jsx';
import Programs from './site/pages/Programs.jsx';
import Batches from './site/pages/Batches.jsx';
import Team from './site/pages/Team.jsx';
import Achievements from './site/pages/Achievements.jsx';
import Events from './site/pages/Events.jsx';
import { ArticleList, ArticlePost } from './site/pages/Articles.jsx';
// PARKED: the Tutorials section is commented out for now. Three places turn
// it back on together — this import, its <Route> below, and its entry in NAV
// in site/SiteLayout.jsx. The page (site/pages/Tutorials.jsx) and its content
// (the `tutorials` export in site/siteData.js) are untouched and ready.
// import Tutorials from './site/pages/Tutorials.jsx';
import Contact from './site/pages/Contact.jsx';
import NotFound from './site/pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Staff console. Everything the club runs on lives under /admin so the
          public site can own the root path. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="members/new" element={<MemberForm />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="members/:id/edit" element={<MemberForm />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="packages" element={<CustomPackages />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="leads" element={<LeadsPage />} />
      </Route>

      {/* Bookmarks from before the console moved under /admin. */}
      <Route path="/members/*" element={<Navigate to="/admin" replace />} />
      <Route path="/calendar" element={<Navigate to="/admin/calendar" replace />} />
      <Route path="/packages" element={<Navigate to="/admin/packages" replace />} />
      <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
      <Route path="/import" element={<Navigate to="/admin/import" replace />} />

      {/* Public site — the default face of the app. */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/team" element={<Team />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/events" element={<Events />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<ArticlePost />} />
        {/* PARKED — see the Tutorials note by the imports above. */}
        {/* <Route path="/tutorials" element={<Tutorials />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
