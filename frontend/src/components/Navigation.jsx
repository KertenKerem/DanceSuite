import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import './Navigation.css';

const Navigation = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const isAdminOrInstructor = isAdmin || isInstructor;

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
          <span className="user-info">
            {user?.firstName} {user?.lastName}
            <span className="user-role">{user?.role}</span>
          </span>
          <button onClick={handleLogout} className="btn-logout">{t('auth.logout')}</button>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="nav-brand">DanceSuite</Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Main</span>
            <Link to="/dashboard">{t('nav.dashboard')}</Link>
            <Link to="/classes">{t('nav.classes')}</Link>
            <Link to="/enrollments">{t('nav.enrollments')}</Link>
            <Link to="/payments">{t('nav.payments')}</Link>
            <Link to="/attendance">{t('nav.attendance')}</Link>
            <Link to="/progress">{t('nav.progress')}</Link>
          </div>

          {isAdminOrInstructor && (
            <div className="nav-section">
              <span className="nav-section-title">{t('nav.management')}</span>
              <Link to="/admin/classes">{t('nav.manageClasses')}</Link>
              <Link to="/admin/attendance">{t('nav.takeAttendance')}</Link>
              {isAdmin && (
                <>
                  <Link to="/admin/users">{t('nav.manageUsers')}</Link>
                  <Link to="/admin/payments">{t('nav.managePayments')}</Link>
                  <Link to="/admin/accounting">{t('nav.accounting')}</Link>
                  <Link to="/admin/reports">{t('nav.reports')}</Link>
                </>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Navigation;
