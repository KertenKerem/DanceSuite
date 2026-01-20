import { useState, useEffect } from 'react';
import { reportAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './StudentProgress.css';

const StudentProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [progressRes, enrollmentsRes] = await Promise.all([
        reportAPI.getStudentProgress(user.id).catch(() => ({ data: null })),
        enrollmentAPI.getMyEnrollments()
      ]);
      setProgress(progressRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (err) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading progress...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="student-progress">
      <h1>My Progress</h1>

      <div className="progress-cards">
        <div className="progress-card">
          <h3>Enrolled Classes</h3>
          <p className="stat">{enrollments.length}</p>
        </div>
        <div className="progress-card">
          <h3>Active Enrollments</h3>
          <p className="stat">
            {enrollments.filter(e => e.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="progress-card">
          <h3>Completed</h3>
          <p className="stat">
            {enrollments.filter(e => e.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="progress-card">
          <h3>Attendance Rate</h3>
          <p className="stat">{progress?.attendanceRate || 0}%</p>
        </div>
      </div>

      <div className="enrollments-section">
        <h2>My Classes</h2>
        {enrollments.length === 0 ? (
          <p className="no-data">You are not enrolled in any classes.</p>
        ) : (
          <div className="class-list">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="class-progress-card">
                <div className="class-info">
                  <h3>{enrollment.class?.name}</h3>
                  <p>{enrollment.class?.description}</p>
                </div>
                <div className="class-status">
                  <span className={`status-badge status-${enrollment.status.toLowerCase()}`}>
                    {enrollment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
