import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Enrollments from './pages/Enrollments';
import Payments from './pages/Payments';
import AttendanceHistory from './pages/AttendanceHistory';
import StudentProgress from './pages/StudentProgress';
import ClassManagement from './pages/admin/ClassManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import AttendanceTaking from './pages/admin/AttendanceTaking';
import ReportsDashboard from './pages/admin/ReportsDashboard';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Navigation from './components/Navigation';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      <main className={`main-content ${!isAuthenticated ? 'no-sidebar' : ''} ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
          <Route path="/enrollments" element={<PrivateRoute><Enrollments /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendanceHistory /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><StudentProgress /></PrivateRoute>} />

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
          <Route path="/admin/payments" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <PaymentManagement />
            </RoleBasedRoute>
          } />
          <Route path="/admin/reports" element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <ReportsDashboard />
            </RoleBasedRoute>
          } />

          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
