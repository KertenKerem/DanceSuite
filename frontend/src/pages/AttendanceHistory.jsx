import { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
      setError(t('errors.general'));
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

  const getStatusText = (status) => {
    const statusKeys = {
      PRESENT: 'attendance.present',
      ABSENT: 'attendance.absent',
      LATE: 'attendance.late',
      EXCUSED: 'attendance.excused'
    };
    return t(statusKeys[status]) || status;
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((present / attendance.length) * 100);
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="attendance-history">
      <h1>{t('attendance.historyTitle')}</h1>

      <div className="attendance-summary">
        <div className="summary-card">
          <h3>{t('attendance.attendanceRate')}</h3>
          <p className="rate">{calculateAttendanceRate()}%</p>
        </div>
        <div className="summary-card">
          <h3>{t('attendance.totalClasses')}</h3>
          <p className="count">{attendance.length}</p>
        </div>
      </div>

      {attendance.length === 0 ? (
        <p className="no-data">{t('attendance.noRecords')}</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>{t('common.date')}</th>
              <th>{t('nav.classes')}</th>
              <th>{t('common.status')}</th>
              <th>{t('attendance.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.enrollment?.class?.name || '-'}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(record.status)}`}>
                    {getStatusText(record.status)}
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
