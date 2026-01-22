import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        reportAPI.getEnrollmentStats(),
        reportAPI.getRevenue()
      ]);
      setStats(statsRes.data);
      setRevenue(revenueRes.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reports-dashboard">
      <h1>{t('reports.title')}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{t('reports.totalStudents')}</h3>
          <p className="stat-value">{stats?.totalStudents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>{t('reports.totalClasses')}</h3>
          <p className="stat-value">{stats?.totalClasses || 0}</p>
        </div>
        <div className="stat-card">
          <h3>{t('reports.activeEnrollments')}</h3>
          <p className="stat-value">{stats?.activeEnrollments || 0}</p>
        </div>
        <div className="stat-card revenue">
          <h3>{t('reports.totalRevenue')}</h3>
          <p className="stat-value">${revenue?.total?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className="reports-section">
        <h2>{t('reports.enrollmentByClass')}</h2>
        <div className="chart-placeholder">
          {stats?.enrollmentsByClass?.length > 0 ? (
            <div className="bar-chart">
              {stats.enrollmentsByClass.map((item, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-label">{item.className}</div>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{ width: `${(item.count / Math.max(...stats.enrollmentsByClass.map(i => i.count))) * 100}%` }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{t('reports.noData')}</p>
          )}
        </div>
      </div>

      <div className="reports-section">
        <h2>{t('reports.revenueByStatus')}</h2>
        <div className="revenue-breakdown">
          <div className="revenue-item">
            <span className="label">{t('payments.completed')}</span>
            <span className="value completed">${revenue?.completed?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="revenue-item">
            <span className="label">{t('payments.pending')}</span>
            <span className="value pending">${revenue?.pending?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="revenue-item">
            <span className="label">{t('payments.failed')}</span>
            <span className="value failed">${revenue?.failed?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="revenue-item">
            <span className="label">{t('payments.refunded')}</span>
            <span className="value refunded">${revenue?.refunded?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
