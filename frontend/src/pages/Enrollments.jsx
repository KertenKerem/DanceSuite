import { useState, useEffect } from 'react';
import { enrollmentAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Enrollments = () => {
  const { t } = useLanguage();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyEnrollments();
      setEnrollments(response.data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t('enrollments.cancelConfirm'))) {
      return;
    }

    try {
      await enrollmentAPI.cancel(id);
      setMessage({ type: 'success', text: t('success.deleted') });
      fetchEnrollments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || t('errors.general')
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const getDayName = (day) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(`classes.days.${dayKeys[day]}`) || day;
  };

  if (loading) {
    return <div className="page">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1>{t('enrollments.title')}</h1>
      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}
      {enrollments.length > 0 ? (
        <div className="grid">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="card">
              <h3>{enrollment.class.name}</h3>
              <p><strong>{t('common.status')}:</strong> <span className="status">{enrollment.status}</span></p>
              {enrollment.class.schedules.length > 0 && (
                <div>
                  <strong>{t('classes.schedule')}:</strong>
                  <ul>
                    {enrollment.class.schedules.map((schedule) => (
                      <li key={schedule.id}>
                        {getDayName(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="btn-danger"
                onClick={() => handleCancel(enrollment.id)}
              >
                {t('enrollments.cancelEnrollment')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">{t('enrollments.noEnrollments')}</p>
      )}
    </div>
  );
};

export default Enrollments;
