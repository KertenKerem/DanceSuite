import { useState, useEffect } from 'react';
import { classAPI, attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './AttendanceTaking.css';

const AttendanceTaking = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      const filteredClasses = isAdmin
        ? response.data
        : response.data.filter(c => c.instructorId === user?.id);
      setClasses(filteredClasses);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const classResponse = await classAPI.getById(selectedClass);
      const classData = classResponse.data;
      const enrolledStudents = classData.enrollments || [];
      setStudents(enrolledStudents);

      const attendanceResponse = await attendanceAPI.getByClass(selectedClass, selectedDate);
      const attendanceMap = {};
      attendanceResponse.data.forEach(record => {
        attendanceMap[record.enrollmentId] = record;
      });
      setAttendance(attendanceMap);
    } catch (err) {
      setStudents([]);
      setAttendance({});
    }
  };

  const handleStatusChange = (enrollmentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], status, enrollmentId }
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(enrollment => {
      newAttendance[enrollment.id] = {
        ...attendance[enrollment.id],
        status,
        enrollmentId: enrollment.id
      };
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      for (const enrollmentId of Object.keys(attendance)) {
        const record = attendance[enrollmentId];
        if (record.status) {
          await attendanceAPI.mark({
            enrollmentId,
            date: selectedDate,
            status: record.status,
            notes: record.notes || ''
          });
        }
      }
      setSuccess(t('success.saved'));
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;

  return (
    <div className="attendance-taking">
      <h1>{t('attendance.takeTitle')}</h1>

      <div className="attendance-controls">
        <div className="control-group">
          <label>{t('attendance.selectClass')}:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">{t('classes.selectClass')}</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>{t('common.date')}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <>
          <div className="quick-actions">
            <button onClick={() => handleMarkAll('PRESENT')} className="btn-quick">
              {t('attendance.markAllPresent')}
            </button>
            <button onClick={() => handleMarkAll('ABSENT')} className="btn-quick btn-absent">
              {t('attendance.markAllAbsent')}
            </button>
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>{t('payments.student')}</th>
                <th>{t('attendance.present')}</th>
                <th>{t('attendance.absent')}</th>
                <th>{t('attendance.late')}</th>
                <th>{t('attendance.excused')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td>{enrollment.user?.firstName} {enrollment.user?.lastName}</td>
                  {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => (
                    <td key={status}>
                      <input
                        type="radio"
                        name={`attendance-${enrollment.id}`}
                        checked={attendance[enrollment.id]?.status === status}
                        onChange={() => handleStatusChange(enrollment.id, status)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            onClick={handleSave}
            className="btn-save"
            disabled={saving}
          >
            {saving ? t('common.saving') : t('attendance.saveAttendance')}
          </button>
        </>
      )}

      {selectedClass && students.length === 0 && (
        <p className="no-data">{t('attendance.noStudents')}</p>
      )}
    </div>
  );
};

export default AttendanceTaking;
