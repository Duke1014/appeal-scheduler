import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/store/authContext';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import MyAssignmentsPage from '@/pages/volunteer/MyAssignmentsPage';
import SurveyPage from '@/pages/volunteer/SurveyPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import AdminSurveysPage from '@/pages/admin/AdminSurveysPage';
import AdminAssignmentsPage from '@/pages/admin/AdminAssignmentsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/my-assignments" element={<RequireAuth><MyAssignmentsPage /></RequireAuth>} />
          <Route path="/survey" element={<RequireAuth><SurveyPage /></RequireAuth>} />

          <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
          <Route path="/admin/events" element={<RequireAdmin><AdminEventsPage /></RequireAdmin>} />
          <Route path="/admin/assignments" element={<RequireAdmin><AdminAssignmentsPage /></RequireAdmin>} />
          <Route path="/admin/surveys" element={<RequireAdmin><AdminSurveysPage /></RequireAdmin>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}