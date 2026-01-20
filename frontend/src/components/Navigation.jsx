import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
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
          <span className="user-info">
            {user?.firstName} {user?.lastName}
            <span className="user-role">{user?.role}</span>
          </span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
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
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/classes">Classes</Link>
            <Link to="/enrollments">My Enrollments</Link>
            <Link to="/payments">Payments</Link>
            <Link to="/attendance">Attendance</Link>
            <Link to="/progress">My Progress</Link>
          </div>

          {isAdminOrInstructor && (
            <div className="nav-section">
              <span className="nav-section-title">Management</span>
              <Link to="/admin/classes">Manage Classes</Link>
              <Link to="/admin/attendance">Take Attendance</Link>
              {isAdmin && (
                <>
                  <Link to="/admin/payments">Manage Payments</Link>
                  <Link to="/admin/reports">Reports</Link>
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
