import { useState, useEffect } from 'react';
import { calendarAPI, branchAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/Modal';
import './WeeklyCalendar.css';

const WeeklyCalendar = () => {
  const { t } = useLanguage();
  const [calendarData, setCalendarData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Days of week (Monday first)
  const daysOfWeek = [
    { index: 1, key: 'monday' },
    { index: 2, key: 'tuesday' },
    { index: 3, key: 'wednesday' },
    { index: 4, key: 'thursday' },
    { index: 5, key: 'friday' },
    { index: 6, key: 'saturday' },
    { index: 0, key: 'sunday' }
  ];

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data);
      if (response.data.length > 0) {
        setSelectedBranchId(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = selectedBranchId
        ? await calendarAPI.getWeeklyByBranch(selectedBranchId)
        : await calendarAPI.getWeekly();
      setCalendarData(response.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  // Week navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const getWeekDates = () => {
    return daysOfWeek.map((day, idx) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + idx);
      return date;
    });
  };

  const formatWeekRange = () => {
    const weekDates = getWeekDates();
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    const formatDate = (d) => {
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)} ${endDate.getFullYear()}`;
  };

  const getOperatingHours = () => {
    if (!calendarData) return { start: 9, end: 23 };
    const start = parseInt(calendarData.operatingHours.start.split(':')[0]);
    const end = parseInt(calendarData.operatingHours.end.split(':')[0]);
    return { start, end };
  };

  const generateTimeSlots = () => {
    const { start, end } = getOperatingHours();
    const slots = [];
    for (let hour = start; hour <= end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getSchedulesForColumn = (saloonId, dayIndex) => {
    if (!calendarData) return [];
    return calendarData.schedules.filter(s =>
      s.saloonId === saloonId && s.dayOfWeek === dayIndex
    );
  };

  // Calculate position and height for a class block
  const getClassBlockStyle = (schedule) => {
    const { start: opStart } = getOperatingHours();
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    // Calculate top position (percentage from start of day)
    const startMinutes = (startHour - opStart) * 60 + startMin;
    const endMinutes = (endHour - opStart) * 60 + endMin;
    const totalMinutes = (23 - opStart) * 60; // Total minutes in operating hours

    const top = (startMinutes / totalMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

    return {
      top: `${top}%`,
      height: `${Math.max(height, 3)}%`, // Minimum height for visibility
      backgroundColor: getClassColor(schedule.class?.id)
    };
  };

  const handleClassClick = (schedule) => {
    setSelectedClass(schedule);
    setShowClassModal(true);
  };

  const getClassColor = (classId) => {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#9b59b6',
      '#f39c12', '#1abc9c', '#e91e63', '#00bcd4'
    ];
    const hash = classId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  if (loading) return <div className="page loading">{t('common.loading')}</div>;

  const timeSlots = generateTimeSlots();
  const weekDates = getWeekDates();
  const saloons = calendarData?.saloons || [];
  const saloonCount = saloons.length || 1;

  return (
    <div className="page weekly-calendar">
      <div className="page-header">
        <h1>{t('calendar.title')}</h1>
        <div className="calendar-controls">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="branch-selector"
          >
            <option value="">{t('branches.allBranches')}</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="btn-nav" onClick={goToPreviousWeek}>
          ← {t('common.back')}
        </button>
        <div className="week-info">
          <span className="week-range">{formatWeekRange()}</span>
          <button className="btn-today" onClick={goToToday}>
            {t('common.today')}
          </button>
        </div>
        <button className="btn-nav" onClick={goToNextWeek}>
          {t('common.next')} →
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!calendarData || saloons.length === 0 ? (
        <p className="empty-state">{t('calendar.noClasses')}</p>
      ) : (
        <div className="calendar-wrapper">
          <div className="calendar-scroll-container">
            <div className="calendar-content">
              {/* Header - Days and Saloons */}
              <div className="calendar-header">
                <div className="time-column-header"></div>
                {daysOfWeek.map((day, idx) => {
                  const date = weekDates[idx];
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <div key={day.index} className={`day-column-header ${isToday ? 'today' : ''}`}>
                      <div className="day-info">
                        <span className="day-name">{t(`classes.days.${day.key}`)}</span>
                        <span className="day-date">{date.getDate()}</span>
                      </div>
                      <div className="saloon-headers">
                        {saloons.map(saloon => (
                          <div key={saloon.id} className="saloon-header">
                            {saloon.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Body - Time grid and events */}
              <div className="calendar-body">
                {/* Time column */}
                <div className="time-column">
                  {timeSlots.map(time => (
                    <div key={time} className="time-slot">
                      <span className="time-label">{time}</span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {daysOfWeek.map((day) => (
                  <div key={day.index} className="day-column">
                    {/* Saloon sub-columns */}
                    {saloons.map(saloon => (
                      <div key={saloon.id} className="saloon-column">
                        {/* Hour grid lines */}
                        <div className="hour-grid">
                          {timeSlots.map(time => (
                            <div key={time} className="hour-line"></div>
                          ))}
                        </div>

                        {/* Class blocks */}
                        <div className="events-container">
                          {getSchedulesForColumn(saloon.id, day.index).map(schedule => (
                            <div
                              key={schedule.id}
                              className="class-block"
                              style={getClassBlockStyle(schedule)}
                              onClick={() => handleClassClick(schedule)}
                              title={`${schedule.class.name} - ${schedule.class.instructorName || ''}`}
                            >
                              <span className="class-name">{schedule.class.name}</span>
                              <span className="class-time">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              {schedule.class.instructorName && (
                                <span className="class-instructor">{schedule.class.instructorName}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      <Modal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        title={selectedClass?.class?.name || t('classes.title')}
      >
        {selectedClass && (
          <div className="class-detail">
            <div className="detail-row">
              <span className="detail-label">{t('classes.className')}:</span>
              <span className="detail-value">{selectedClass.class.name}</span>
            </div>
            {selectedClass.class.instructorName && (
              <div className="detail-row">
                <span className="detail-label">{t('classes.instructor')}:</span>
                <span className="detail-value">{selectedClass.class.instructorName}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">{t('classes.schedule')}:</span>
              <span className="detail-value">
                {t(`classes.days.${daysOfWeek.find(d => d.index === selectedClass.dayOfWeek)?.key}`)} {selectedClass.startTime} - {selectedClass.endTime}
              </span>
            </div>
            {selectedClass.saloonName && (
              <div className="detail-row">
                <span className="detail-label">{t('saloons.title')}:</span>
                <span className="detail-value">{selectedClass.saloonName}</span>
              </div>
            )}
            {selectedClass.class.fee && (
              <div className="detail-row">
                <span className="detail-label">{t('classes.fee')}:</span>
                <span className="detail-value">{selectedClass.class.fee} TL</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">{t('classes.enrolled')}:</span>
              <span className="detail-value">{selectedClass.class.enrollmentCount} {t('classes.students')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WeeklyCalendar;
