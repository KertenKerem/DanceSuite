import { useState, useEffect } from 'react';
import { userAPI, branchAPI, saloonAPI, scheduleAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import './ClassForm.css';

const ClassForm = ({ classData, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [instructors, setInstructors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [saloons, setSaloons] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validating, setValidating] = useState(false);

  const [formData, setFormData] = useState({
    name: classData?.name || '',
    description: classData?.description || '',
    maxCapacity: classData?.maxCapacity || 15,
    instructorId: classData?.instructorId || '',
    branchId: classData?.branchId || '',
    fee: classData?.fee || '',
    recurrence: classData?.recurrence || 'WEEKLY',
    schedules: classData?.schedules?.map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      saloonId: s.saloonId || ''
    })) || [{ dayOfWeek: 1, startTime: '10:00', endTime: '11:00', saloonId: '' }]
  });

  const recurrenceOptions = [
    { value: 'WEEKLY', key: 'weekly' },
    { value: 'BIWEEKLY', key: 'biweekly' },
    { value: 'MONTHLY', key: 'monthly' },
    { value: 'QUARTERLY', key: 'quarterly' },
    { value: 'BIANNUAL', key: 'biannual' },
    { value: 'YEARLY', key: 'yearly' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instructorsRes, branchesRes] = await Promise.all([
          userAPI.getAll('INSTRUCTOR'),
          branchAPI.getAll()
        ]);
        setInstructors(instructorsRes.data);
        setBranches(branchesRes.data);

        // If editing and has branchId, load saloons
        if (classData?.branchId) {
          const saloonsRes = await saloonAPI.getByBranch(classData.branchId);
          setSaloons(saloonsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Load saloons when branch changes
  useEffect(() => {
    const loadSaloons = async () => {
      if (formData.branchId) {
        try {
          const response = await saloonAPI.getByBranch(formData.branchId);
          setSaloons(response.data);
        } catch (err) {
          console.error('Failed to fetch saloons:', err);
          setSaloons([]);
        }
      } else {
        setSaloons([]);
      }
    };
    loadSaloons();
  }, [formData.branchId]);

  // Validate schedules when they change
  useEffect(() => {
    const validateSchedules = async () => {
      if (!formData.instructorId && !formData.schedules.some(s => s.saloonId)) {
        setValidationErrors([]);
        return;
      }

      setValidating(true);
      try {
        const response = await scheduleAPI.validateSchedule({
          schedules: formData.schedules,
          instructorId: formData.instructorId,
          classId: classData?.id
        });
        setValidationErrors(response.data.errors || []);
      } catch (err) {
        console.error('Validation failed:', err);
      } finally {
        setValidating(false);
      }
    };

    const timeoutId = setTimeout(validateSchedules, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.schedules, formData.instructorId, classData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseInt(value) :
              name === 'fee' && value ? parseFloat(value) : value
    }));
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setFormData(prev => ({
      ...prev,
      branchId,
      // Clear saloon selections when branch changes
      schedules: prev.schedules.map(s => ({ ...s, saloonId: '' }))
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
      schedules: [...prev.schedules, { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', saloonId: '' }]
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
    if (validationErrors.length > 0) {
      alert(t('scheduling.conflict'));
      return;
    }
    onSave({
      ...formData,
      fee: formData.fee || null
    });
  };

  const getScheduleError = (index) => {
    return validationErrors.filter(err => err.scheduleIndex === index);
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

      <div className="form-row">
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
          <label>{t('classes.fee')} (TL)</label>
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            min={0}
            step="10"
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('branches.selectBranch')}</label>
          <select
            name="branchId"
            value={formData.branchId}
            onChange={handleBranchChange}
          >
            <option value="">{t('branches.selectBranch')}</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
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
      </div>

      <div className="form-group">
        <label>{t('classes.recurrence')}</label>
        <select
          name="recurrence"
          value={formData.recurrence}
          onChange={handleChange}
        >
          {recurrenceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {t(`classes.recurrences.${option.key}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group schedules-section">
        <label>{t('classes.schedules')}</label>
        {validating && <span className="validating-indicator">{t('common.loading')}</span>}

        {formData.schedules.map((schedule, index) => {
          const errors = getScheduleError(index);
          return (
            <div key={index} className={`schedule-row ${errors.length > 0 ? 'has-error' : ''}`}>
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

              {saloons.length > 0 && (
                <select
                  value={schedule.saloonId}
                  onChange={(e) => handleScheduleChange(index, 'saloonId', e.target.value)}
                  className="saloon-select"
                >
                  <option value="">{t('saloons.selectSaloon')}</option>
                  {saloons.map(saloon => (
                    <option key={saloon.id} value={saloon.id}>
                      {saloon.name}
                    </option>
                  ))}
                </select>
              )}

              {formData.schedules.length > 1 && (
                <button type="button" onClick={() => removeSchedule(index)} className="btn-remove">
                  {t('classes.removeSchedule')}
                </button>
              )}

              {errors.length > 0 && (
                <div className="schedule-errors">
                  {errors.map((err, i) => (
                    <span key={i} className="error-text">
                      {err.type === 'instructor' ? t('scheduling.instructorBusy') : t('scheduling.saloonBusy')}
                      {err.conflictingClass && ` (${err.conflictingClass})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <button type="button" onClick={addSchedule} className="btn-add-schedule">
          + {t('classes.addSchedule')}
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-summary">
          <strong>{t('scheduling.conflict')}</strong>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="btn-save"
          disabled={validationErrors.length > 0}
        >
          {classData ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;
