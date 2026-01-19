import { useState, useEffect } from 'react';
import { userAPI, enrollmentAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
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
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2>Welcome, {user?.firstName}!</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        <div className="card">
          <h2>My Enrollments</h2>
          <p className="stat">{enrollments.length}</p>
          <p>Active classes</p>
        </div>
        <div className="card">
          <h2>Quick Actions</h2>
          <a href="/classes" className="btn-primary">Browse Classes</a>
        </div>
      </div>
      {enrollments.length > 0 && (
        <div className="card">
          <h2>Your Classes</h2>
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
