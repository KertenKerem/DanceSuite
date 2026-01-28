import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Enrollments from './pages/Enrollments';
import Payments from './pages/Payments';
import AttendanceHistory from './pages/AttendanceHistory';
import StudentProgress from './pages/StudentProgress';
import Profile from './pages/Profile';
import ClassManagement from './pages/admin/ClassManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import AttendanceTaking from './pages/admin/AttendanceTaking';
import ReportsDashboard from './pages/admin/ReportsDashboard';
import UserManagement from './pages/admin/UserManagement';
import Accounting from './pages/admin/Accounting';
import BranchManagement from './pages/admin/BranchManagement';
import WeeklyCalendar from './pages/admin/WeeklyCalendar';
import Settings from './pages/admin/Settings';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Navigation from './components/Navigation';
import './App.css';

// Component to handle role-based default redirect
const DefaultRedirect = () => {
  const { user } = useAuth();
  // Staff (Admin/Instructor) go to calendar, Students go to dashboard
  const defaultPath = (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR')
    ? '/admin/calendar'
    : '/dashboard';
  return <Navigate to={defaultPath} replace />;
};

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  // Determine default path based on role
  const getDefaultPath = () => {
    if (!isAuthenticated) return '/login';
    return (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR')
      ? '/admin/calendar'
      : '/dashboard';
  };

  return (
    <>
      {isAuthenticated && <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      <main className={`main-content ${!isAuthenticated ? 'no-sidebar' : ''} ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultPath()} />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDefaultPath()} />} />

          {/* Student pages */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
          <Route path="/enrollments" element={<PrivateRoute><Enrollments /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendanceHistory /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><StudentProgress /></PrivateRoute>} />

          {/* Profile page - accessible to all authenticated users */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin/Instructor pages */}
          <Route path="/admin/classes" element={
            <RoleBasedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
              <ClassManagement />
            </RoleBasedRoute>
          } />
          <Route path="/admin/attendance" element={
            <RoleBasedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
              <AttendanceTaking />
            </RoleBasedRoute>
          } />
          <Route path="/admin/users" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </RoleBasedRoute>
          } />
          <Route path="/admin/payments" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <PaymentManagement />
            </RoleBasedRoute>
          } />
          <Route path="/admin/accounting" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <Accounting />
            </RoleBasedRoute>
          } />
          <Route path="/admin/reports" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <ReportsDashboard />
            </RoleBasedRoute>
          } />
          <Route path="/admin/branches" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <BranchManagement />
            </RoleBasedRoute>
          } />
          <Route path="/admin/calendar" element={
            <RoleBasedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
              <WeeklyCalendar />
            </RoleBasedRoute>
          } />
          <Route path="/admin/settings" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <Settings />
            </RoleBasedRoute>
          } />

          {/* Default redirect based on role */}
          <Route path="/" element={isAuthenticated ? <DefaultRedirect /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </LanguageProvider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
