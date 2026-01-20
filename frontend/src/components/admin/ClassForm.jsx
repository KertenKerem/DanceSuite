import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './ClassForm.css';

const ClassForm = ({ classData, onSave, onCancel }) => {
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
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <form onSubmit={handleSubmit} className="class-form">
      <h2>{classData ? 'Edit Class' : 'Create New Class'}</h2>

      <div className="form-group">
        <label>Class Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Max Capacity</label>
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
        <label>Instructor</label>
        <select
          name="instructorId"
          value={formData.instructorId}
          onChange={handleChange}
        >
          <option value="">Select Instructor</option>
          {instructors.map(instructor => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.firstName} {instructor.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Schedules</label>
        {formData.schedules.map((schedule, index) => (
          <div key={index} className="schedule-row">
            <select
              value={schedule.dayOfWeek}
              onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)}
            >
              {days.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
            />
            <span>to</span>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
            />
            {formData.schedules.length > 1 && (
              <button type="button" onClick={() => removeSchedule(index)} className="btn-remove">
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSchedule} className="btn-add-schedule">
          + Add Schedule
        </button>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn-save">
          {classData ? 'Update Class' : 'Create Class'}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;
