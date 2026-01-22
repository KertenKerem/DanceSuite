import { useState, useEffect } from 'react';
import { classAPI, enrollmentAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Classes.css';

const Classes = () => {
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    try {
      await enrollmentAPI.enroll(classId);
      setMessage({ type: 'success', text: t('success.created') });
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

  const getRecurrenceText = (recurrence) => {
    const recurrenceKeys = {
      WEEKLY: 'weekly',
      BIWEEKLY: 'biweekly',
      MONTHLY: 'monthly',
      QUARTERLY: 'quarterly',
      BIANNUAL: 'biannual',
      YEARLY: 'yearly'
    };
    return t(`classes.recurrences.${recurrenceKeys[recurrence]}`) || recurrence;
  };

  if (loading) {
    return <div className="page">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1>{t('classes.title')}</h1>
      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}
      <div className="grid">
        {classes.map((classItem) => (
          <div key={classItem.id} className="card class-card">
            <h3>{classItem.name}</h3>
            <p>{classItem.description || t('classes.description')}</p>
            <div className="class-info">
              <p><strong>{t('classes.capacity')}:</strong> {classItem.enrollments?.length || 0} / {classItem.maxCapacity}</p>
              <p><strong>{t('classes.recurrence')}:</strong> {getRecurrenceText(classItem.recurrence)}</p>
              {classItem.schedules?.length > 0 && (
                <div>
                  <strong>{t('classes.schedule')}:</strong>
                  <ul>
                    {classItem.schedules.map((schedule) => (
                      <li key={schedule.id}>
                        {getDayName(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={() => handleEnroll(classItem.id)}
              disabled={(classItem.enrollments?.length || 0) >= classItem.maxCapacity}
            >
              {(classItem.enrollments?.length || 0) >= classItem.maxCapacity ? t('classes.full') : t('classes.enroll')}
            </button>
          </div>
        ))}
      </div>
      {classes.length === 0 && (
        <p className="empty-state">{t('classes.noClasses')}</p>
      )}
    </div>
  );
};

export default Classes;
