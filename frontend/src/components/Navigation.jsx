import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import LanguageSelector from './LanguageSelector';
import './Navigation.css';

const Navigation = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { branding } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => location.pathname === path;

  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const isStudent = user?.role === 'STUDENT';
  const isOfficeWorker = user?.role === 'OFFICE_WORKER';
  const isStaff = isAdmin || isInstructor || isOfficeWorker;

  return (
    <>
      {/* Top Bar */}
      <header className="top-bar">
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
        </button>
        <div className="top-bar-right">
          <LanguageSelector />
          <Link to="/profile" className="user-info-link">
            <span className="user-info">
              {user?.firstName} {user?.lastName}
              <span className="user-role">{user?.role}</span>
            </span>
          </Link>
          <button onClick={handleLogout} className="btn-logout">{t('auth.logout')}</button>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to={isStaff ? "/admin/calendar" : "/dashboard"} className="nav-brand">
            {branding.logo && <img src={branding.logo} alt={branding.schoolName} className="brand-logo" />}
            <span className="brand-name">{branding.schoolName}</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {/* Staff: Calendar is the main page */}
          {isStaff && (
            <div className="nav-section">
              <span className="nav-section-title">{t('nav.management')}</span>
              <Link to="/admin/calendar" className={isActive('/admin/calendar') ? 'active' : ''}>{t('nav.calendar')}</Link>
              <Link to="/admin/classes" className={isActive('/admin/classes') ? 'active' : ''}>{t('nav.manageClasses')}</Link>
              <Link to="/admin/attendance" className={isActive('/admin/attendance') ? 'active' : ''}>{t('nav.takeAttendance')}</Link>

              {/* Admin-only links */}
              {isAdmin && (
                <>
                  <Link to="/admin/branches" className={isActive('/admin/branches') ? 'active' : ''}>{t('nav.branches')}</Link>
                  <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>{t('nav.manageUsers')}</Link>
                  <Link to="/admin/payments" className={isActive('/admin/payments') ? 'active' : ''}>{t('nav.managePayments')}</Link>
                  <Link to="/admin/accounting" className={isActive('/admin/accounting') ? 'active' : ''}>{t('nav.accounting')}</Link>
                  <Link to="/admin/reports" className={isActive('/admin/reports') ? 'active' : ''}>{t('nav.reports')}</Link>
                  <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>{t('nav.settings')}</Link>
                </>
              )}

              {/* Office Worker links */}
              {isOfficeWorker && (
                <>
                  <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>{t('nav.manageUsers')}</Link>
                  <Link to="/admin/payments" className={isActive('/admin/payments') ? 'active' : ''}>{t('nav.managePayments')}</Link>
                  <Link to="/admin/accounting" className={isActive('/admin/accounting') ? 'active' : ''}>{t('nav.accounting')}</Link>
                </>
              )}
            </div>
          )}

          {/* Student: Their own views */}
          {isStudent && (
            <div className="nav-section">
              <span className="nav-section-title">Main</span>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>{t('nav.dashboard')}</Link>
              <Link to="/classes" className={isActive('/classes') ? 'active' : ''}>{t('nav.classes')}</Link>
              <Link to="/enrollments" className={isActive('/enrollments') ? 'active' : ''}>{t('nav.enrollments')}</Link>
              <Link to="/payments" className={isActive('/payments') ? 'active' : ''}>{t('nav.payments')}</Link>
              <Link to="/attendance" className={isActive('/attendance') ? 'active' : ''}>{t('nav.attendance')}</Link>
              <Link to="/progress" className={isActive('/progress') ? 'active' : ''}>{t('nav.progress')}</Link>
            </div>
          )}

          {/* Profile link for everyone */}
          <div className="nav-section">
            <span className="nav-section-title">{t('nav.profile')}</span>
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>{t('profile.title')}</Link>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Navigation;
