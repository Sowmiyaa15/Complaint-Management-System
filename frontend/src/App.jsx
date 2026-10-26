import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { SubmitComplaintPage } from './pages/citizen/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/citizen/ComplaintDetailsPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { AssignedComplaintsPage } from './pages/employee/AssignedComplaintsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ComplaintManagementPage } from './pages/admin/ComplaintManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Shared Pages
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { UnauthorizedPage } from './pages/shared/UnauthorizedPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

// Root redirect handler
const RoleHomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/citizen/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Authenticated Dashboard Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RoleHomeRedirect />} />

        {/* Citizen Features */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
              <MyComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'EMPLOYEE', 'ADMIN']}>
              <MyComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-complaint"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'EMPLOYEE', 'ADMIN']}>
              <SubmitComplaintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'EMPLOYEE', 'ADMIN']}>
              <ComplaintDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Employee Features */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/complaints"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
              <AssignedComplaintsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Features */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ComplaintManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Features */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
