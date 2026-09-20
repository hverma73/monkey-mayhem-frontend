import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute.jsx';
import Layout from '../src/components/Layout.jsx';
import Login from '../src/pages/Login.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import MemberForm from '../src/pages/MemberForm.jsx';
import MemberDetail from '../src/pages/MemberDetail.jsx';
import CalendarPage from '../src/pages/CalendarPage.jsx';
import CustomPackages from '../src/pages/CustomPackages.jsx';
import PaymentsPage from '../src/pages/PaymentsPage.jsx';
import ImportPage from '../src/pages/ImportPage.jsx';
import LeadsPage from '../src/pages/LeadsPage.jsx';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
