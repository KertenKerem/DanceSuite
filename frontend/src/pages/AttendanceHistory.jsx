import { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getStudentHistory(user.id);
      setAttendance(response.data);
    } catch (err) {
      setError('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'status-present';
      case 'ABSENT': return 'status-absent';
      case 'LATE': return 'status-late';
      case 'EXCUSED': return 'status-excused';
      default: return '';
    }
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((present / attendance.length) * 100);
  };

  if (loading) return <div className="loading">Loading attendance...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="attendance-history">
      <h1>My Attendance History</h1>

      <div className="attendance-summary">
        <div className="summary-card">
          <h3>Attendance Rate</h3>
          <p className="rate">{calculateAttendanceRate()}%</p>
        </div>
        <div className="summary-card">
          <h3>Total Sessions</h3>
          <p className="count">{attendance.length}</p>
        </div>
      </div>

      {attendance.length === 0 ? (
        <p className="no-data">No attendance records found.</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Class</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.enrollment?.class?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceHistory;
