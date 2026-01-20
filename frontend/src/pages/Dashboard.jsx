import { useState, useEffect } from 'react';
import { userAPI, enrollmentAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userResponse, enrollmentsResponse] = await Promise.all([
        userAPI.getProfile(),
        enrollmentAPI.getMyEnrollments()
      ]);
      setUser(userResponse.data);
      setEnrollments(enrollmentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1>{t('dashboard.title')}</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2>{t('dashboard.welcome')}, {user?.firstName}!</h2>
          <p><strong>{t('common.email')}:</strong> {user?.email}</p>
          <p><strong>{t('users.role')}:</strong> {user?.role}</p>
        </div>
        <div className="card">
          <h2>{t('dashboard.myEnrollments')}</h2>
          <p className="stat">{enrollments.length}</p>
          <p>{t('dashboard.activeClasses')}</p>
        </div>
        <div className="card">
          <h2>{t('dashboard.quickActions')}</h2>
          <a href="/classes" className="btn-primary">{t('dashboard.browseClasses')}</a>
        </div>
      </div>
      {enrollments.length > 0 && (
        <div className="card">
          <h2>{t('dashboard.yourClasses')}</h2>
          <ul className="class-list">
            {enrollments.map((enrollment) => (
              <li key={enrollment.id}>
                <strong>{enrollment.class.name}</strong>
                <span className="status">{enrollment.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
