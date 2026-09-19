import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MemberForm from './pages/MemberForm.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import CustomPackages from './pages/CustomPackages.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import ImportPage from './pages/ImportPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import { SiteRoutes } from './site/SiteRoutes.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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

      <Route path="/members/*" element={<Navigate to="/admin" replace />} />
      <Route path="/calendar" element={<Navigate to="/admin/calendar" replace />} />
      <Route path="/packages" element={<Navigate to="/admin/packages" replace />} />
      <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
      <Route path="/import" element={<Navigate to="/admin/import" replace />} />

      <Route path="/*" element={<SiteRoutes />} />
    </Routes>
  );
}
