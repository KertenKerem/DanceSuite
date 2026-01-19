import { useState, useEffect } from 'react';
import { enrollmentAPI } from '../services/api';

const Enrollments = () => {
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
    if (!window.confirm('Are you sure you want to cancel this enrollment?')) {
      return;
    }

    try {
      await enrollmentAPI.cancel(id);
      setMessage({ type: 'success', text: 'Enrollment cancelled successfully!' });
      fetchEnrollments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to cancel enrollment'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page">
      <h1>My Enrollments</h1>
      {message.text && (
        <div className={`${message.type}-message`}>{message.text}</div>
      )}
      {enrollments.length > 0 ? (
        <div className="grid">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="card">
              <h3>{enrollment.class.name}</h3>
              <p><strong>Status:</strong> <span className="status">{enrollment.status}</span></p>
              {enrollment.class.schedules.length > 0 && (
                <div>
                  <strong>Schedule:</strong>
                  <ul>
                    {enrollment.class.schedules.map((schedule) => (
                      <li key={schedule.id}>
                        Day {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="btn-danger"
                onClick={() => handleCancel(enrollment.id)}
              >
                Cancel Enrollment
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">You are not enrolled in any classes yet.</p>
      )}
    </div>
  );
};

export default Enrollments;
