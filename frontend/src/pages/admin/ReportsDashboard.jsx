import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
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
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reports-dashboard">
      <h1>Reports Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">{stats?.totalStudents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Classes</h3>
          <p className="stat-value">{stats?.totalClasses || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Enrollments</h3>
          <p className="stat-value">{stats?.activeEnrollments || 0}</p>
        </div>
        <div className="stat-card revenue">
          <h3>Total Revenue</h3>
          <p className="stat-value">${revenue?.total?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className="reports-section">
        <h2>Enrollment by Class</h2>
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
            <p className="no-data">No enrollment data available</p>
          )}
        </div>
      </div>

      <div className="reports-section">
        <h2>Revenue by Status</h2>
        <div className="revenue-breakdown">
          <div className="revenue-item">
            <span className="label">Completed</span>
            <span className="value completed">${revenue?.completed?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="revenue-item">
            <span className="label">Pending</span>
            <span className="value pending">${revenue?.pending?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="revenue-item">
            <span className="label">Failed</span>
            <span className="value failed">${revenue?.failed?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="revenue-item">
            <span className="label">Refunded</span>
            <span className="value refunded">${revenue?.refunded?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
