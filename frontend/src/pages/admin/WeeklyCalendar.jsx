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
    // Calculate Monday (start of week)
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

  const getScheduleStyle = (schedule, totalHours, startHour) => {
    const schedStartHour = parseInt(schedule.startTime.split(':')[0]);
    const schedStartMinute = parseInt(schedule.startTime.split(':')[1]);
    const schedEndHour = parseInt(schedule.endTime.split(':')[0]);
    const schedEndMinute = parseInt(schedule.endTime.split(':')[1]);

    const startPosition = ((schedStartHour - startHour) + schedStartMinute / 60) / totalHours * 100;
    const duration = ((schedEndHour - schedStartHour) + (schedEndMinute - schedStartMinute) / 60) / totalHours * 100;

    return {
      top: `${startPosition}%`,
      height: `${Math.max(duration, 3)}%` // Minimum height for visibility
    };
  };

  const getSchedulesForSaloonAndDay = (saloonId, dayIndex) => {
    if (!calendarData) return [];
    return calendarData.schedules.filter(
      s => s.saloonId === saloonId && s.dayOfWeek === dayIndex
    );
  };

  const getUnassignedSchedulesForDay = (dayIndex) => {
    if (!calendarData || !calendarData.unassignedSchedules) return [];
    return calendarData.unassignedSchedules.filter(s => s.dayOfWeek === dayIndex);
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
    // Use classId to get consistent color for each class
    const hash = classId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  if (loading) return <div className="page loading">{t('common.loading')}</div>;

  const timeSlots = generateTimeSlots();
  const { start: startHour, end: endHour } = getOperatingHours();
  const totalHours = endHour - startHour;
  const weekDates = getWeekDates();

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
            {t('common.date')}
          </button>
        </div>
        <button className="btn-nav" onClick={goToNextWeek}>
          {t('common.next')} →
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!calendarData || (calendarData.saloons.length === 0 && (!calendarData.unassignedSchedules || calendarData.unassignedSchedules.length === 0)) ? (
        <p className="empty-state">{t('calendar.noClasses')}</p>
      ) : (
        <div className="calendar-container">
          {/* Day Headers with Dates */}
          <div className="calendar-day-headers">
            <div className="time-column-header"></div>
            {daysOfWeek.map((day, idx) => {
              const date = weekDates[idx];
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div key={day.index} className={`day-header-cell ${isToday ? 'today' : ''}`}>
                  <span className="day-name">{t(`classes.days.${day.key}`)}</span>
                  <span className="day-date">{date.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Calendar Body - Each Saloon as a Row */}
          <div className="calendar-body">
            {/* Time Column */}
            <div className="time-column">
              {timeSlots.map(time => (
                <div key={time} className="time-slot">
                  <span className="time-text">{time}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="days-grid">
              {calendarData.saloons.map((saloon, saloonIndex) => (
                <div key={saloon.id} className="saloon-row">
                  <div className="saloon-header">
                    <span className="saloon-name">{saloon.name}</span>
                    {saloon.branchName && (
                      <span className="saloon-branch">{saloon.branchName}</span>
                    )}
                  </div>
                  <div className="saloon-days">
                    {daysOfWeek.map((day) => (
                      <div key={day.index} className="day-column">
                        {/* Time grid lines */}
                        <div className="time-grid-lines">
                          {timeSlots.map((_, i) => (
                            <div key={i} className="time-line" />
                          ))}
                        </div>
                        {/* Class blocks */}
                        {getSchedulesForSaloonAndDay(saloon.id, day.index).map((schedule) => (
                          <div
                            key={schedule.id}
                            className="class-block"
                            style={{
                              ...getScheduleStyle(schedule, totalHours, startHour),
                              backgroundColor: getClassColor(schedule.classId)
                            }}
                            onClick={() => handleClassClick(schedule)}
                            title={`${schedule.class.name} - ${schedule.class.instructorName || t('classes.instructor')}`}
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
                    ))}
                  </div>
                </div>
              ))}

              {/* Unassigned Classes Row */}
              {calendarData.unassignedSchedules && calendarData.unassignedSchedules.length > 0 && (
                <div className="saloon-row unassigned">
                  <div className="saloon-header">
                    <span className="saloon-name">{t('saloons.noSaloons')}</span>
                  </div>
                  <div className="saloon-days">
                    {daysOfWeek.map((day) => (
                      <div key={day.index} className="day-column">
                        <div className="time-grid-lines">
                          {timeSlots.map((_, i) => (
                            <div key={i} className="time-line" />
                          ))}
                        </div>
                        {getUnassignedSchedulesForDay(day.index).map((schedule) => (
                          <div
                            key={schedule.id}
                            className="class-block unassigned-class"
                            style={getScheduleStyle(schedule, totalHours, startHour)}
                            onClick={() => handleClassClick(schedule)}
                            title={`${schedule.class.name} - ${schedule.class.instructorName || t('classes.instructor')}`}
                          >
                            <span className="class-name">{schedule.class.name}</span>
                            <span className="class-time">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            {selectedClass.class.recurrence && (
              <div className="detail-row">
                <span className="detail-label">{t('classes.recurrence')}:</span>
                <span className="detail-value">{t(`classes.recurrences.${selectedClass.class.recurrence.toLowerCase()}`)}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WeeklyCalendar;
