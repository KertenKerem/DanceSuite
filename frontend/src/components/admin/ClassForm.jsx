import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import './ClassForm.css';

const ClassForm = ({ classData, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [instructors, setInstructors] = useState([]);
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    description: classData?.description || '',
    maxCapacity: classData?.maxCapacity || 15,
    instructorId: classData?.instructorId || '',
    schedules: classData?.schedules || [{ dayOfWeek: 1, startTime: '10:00', endTime: '11:00' }]
  });

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await userAPI.getAll('INSTRUCTOR');
        setInstructors(response.data);
      } catch (err) {
        console.error('Failed to fetch instructors');
      }
    };
    fetchInstructors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseInt(value) : value
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: field === 'dayOfWeek' ? parseInt(value) : value
    };
    setFormData(prev => ({ ...prev, schedules: newSchedules }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { dayOfWeek: 1, startTime: '10:00', endTime: '11:00' }]
    }));
  };

  const removeSchedule = (index) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const days = [
    { value: 0, key: 'sunday' },
    { value: 1, key: 'monday' },
    { value: 2, key: 'tuesday' },
    { value: 3, key: 'wednesday' },
    { value: 4, key: 'thursday' },
    { value: 5, key: 'friday' },
    { value: 6, key: 'saturday' }
  ];

  return (
    <form onSubmit={handleSubmit} className="class-form">
      <div className="form-group">
        <label>{t('classes.className')}</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>{t('classes.description')}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>{t('classes.capacity')}</label>
        <input
          type="number"
          name="maxCapacity"
          value={formData.maxCapacity}
          onChange={handleChange}
          min={1}
          required
        />
      </div>

      <div className="form-group">
        <label>{t('classes.instructor')}</label>
        <select
          name="instructorId"
          value={formData.instructorId}
          onChange={handleChange}
        >
          <option value="">{t('classes.selectInstructor')}</option>
          {instructors.map(instructor => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.firstName} {instructor.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>{t('classes.schedules')}</label>
        {formData.schedules.map((schedule, index) => (
          <div key={index} className="schedule-row">
            <select
              value={schedule.dayOfWeek}
              onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)}
            >
              {days.map(day => (
                <option key={day.value} value={day.value}>{t(`classes.days.${day.key}`)}</option>
              ))}
            </select>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
            />
            <span>-</span>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
            />
            {formData.schedules.length > 1 && (
              <button type="button" onClick={() => removeSchedule(index)} className="btn-remove">
                {t('classes.removeSchedule')}
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSchedule} className="btn-add-schedule">
          + {t('classes.addSchedule')}
        </button>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-save">
          {classData ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;
