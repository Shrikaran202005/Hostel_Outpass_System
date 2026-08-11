import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { HodDashboard } from './pages/HodDashboard';
import { HodHistory } from './pages/HodHistory';
import { WardenDashboard } from './pages/WardenDashboard';
import { WardenHistory } from './pages/WardenHistory';
import { WatchmanDashboard } from './pages/WatchmanDashboard';
import { authService } from './services/auth';
import { Role } from './types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();
  const token = authService.getToken();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'STUDENT':
        return <Navigate to="/student/dashboard" replace />;
      case 'HOD':
        return <Navigate to="/hod/dashboard" replace />;
      case 'WARDEN':
        return <Navigate to="/warden/dashboard" replace />;
      case 'WATCHMAN':
        return <Navigate to="/watchman/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'STUDENT':
      return <Navigate to="/student/dashboard" replace />;
    case 'HOD':
      return <Navigate to="/hod/dashboard" replace />;
    case 'WARDEN':
      return <Navigate to="/warden/dashboard" replace />;
    case 'WATCHMAN':
      return <Navigate to="/watchman/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod/dashboard"
          element={
            <ProtectedRoute allowedRoles={['HOD']}>
              <HodDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod/history"
          element={
            <ProtectedRoute allowedRoles={['HOD']}>
              <HodHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warden/dashboard"
          element={
            <ProtectedRoute allowedRoles={['WARDEN']}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warden/history"
          element={
            <ProtectedRoute allowedRoles={['WARDEN']}>
              <WardenHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchman/dashboard"
          element={
            <ProtectedRoute allowedRoles={['WATCHMAN']}>
              <WatchmanDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
