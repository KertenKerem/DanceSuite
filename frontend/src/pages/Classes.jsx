import { useState, useEffect } from 'react';
import { classAPI, enrollmentAPI } from '../services/api';
import './Classes.css';

const Classes = () => {
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
      setMessage({ type: 'success', text: 'Successfully enrolled in class!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to enroll in class'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page">
      <h1>Available Classes</h1>
      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}
      <div className="grid">
        {classes.map((classItem) => (
          <div key={classItem.id} className="card class-card">
            <h3>{classItem.name}</h3>
            <p>{classItem.description || 'No description available'}</p>
            <div className="class-info">
              <p><strong>Capacity:</strong> {classItem._count.enrollments} / {classItem.maxCapacity}</p>
              {classItem.schedules.length > 0 && (
                <div>
                  <strong>Schedule:</strong>
                  <ul>
                    {classItem.schedules.map((schedule) => (
                      <li key={schedule.id}>
                        Day {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={() => handleEnroll(classItem.id)}
              disabled={classItem._count.enrollments >= classItem.maxCapacity}
            >
              {classItem._count.enrollments >= classItem.maxCapacity ? 'Full' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>
      {classes.length === 0 && (
        <p className="empty-state">No classes available at the moment.</p>
      )}
    </div>
  );
};

export default Classes;
