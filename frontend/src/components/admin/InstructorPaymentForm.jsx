import { useState, useEffect } from 'react';
import { instructorPaymentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import './InstructorPaymentForm.css';

const InstructorPaymentForm = ({ instructorId, onSave }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    paymentType: 'MONTHLY_SALARY',
    monthlySalary: '',
    perLessonRate: '',
    percentageRate: ''
  });

  useEffect(() => {
    if (instructorId) {
      fetchPaymentConfig();
    } else {
      setLoading(false);
    }
  }, [instructorId]);

  const fetchPaymentConfig = async () => {
    try {
      setLoading(true);
      const response = await instructorPaymentAPI.getByInstructor(instructorId);
      setFormData({
        paymentType: response.data.paymentType,
        monthlySalary: response.data.monthlySalary || '',
        perLessonRate: response.data.perLessonRate || '',
        percentageRate: response.data.percentageRate || ''
      });
    } catch (err) {
      // No config exists yet, use defaults
      if (err.response?.status !== 404) {
        console.error('Failed to fetch payment config:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        instructorId,
        paymentType: formData.paymentType,
        monthlySalary: formData.paymentType === 'MONTHLY_SALARY' ? parseFloat(formData.monthlySalary) : null,
        perLessonRate: formData.paymentType === 'PER_LESSON' ? parseFloat(formData.perLessonRate) : null,
        percentageRate: formData.paymentType === 'PERCENTAGE' ? parseFloat(formData.percentageRate) : null
      };

      await instructorPaymentAPI.save(data);
      if (onSave) onSave();
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-small">{t('common.loading')}</div>;

  return (
    <div className="instructor-payment-form">
      <h4>{t('instructorPayment.title')}</h4>

      {error && <div className="error-message small">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="payment-type-selector">
          <label className="radio-label">
            <input
              type="radio"
              name="paymentType"
              value="MONTHLY_SALARY"
              checked={formData.paymentType === 'MONTHLY_SALARY'}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
            />
            <span>{t('instructorPayment.monthlySalary')}</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="paymentType"
              value="PER_LESSON"
              checked={formData.paymentType === 'PER_LESSON'}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
            />
            <span>{t('instructorPayment.perLesson')}</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="paymentType"
              value="PERCENTAGE"
              checked={formData.paymentType === 'PERCENTAGE'}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
            />
            <span>{t('instructorPayment.percentage')}</span>
          </label>
        </div>

        <div className="payment-amount-input">
          {formData.paymentType === 'MONTHLY_SALARY' && (
            <div className="form-group">
              <label>{t('instructorPayment.amount')} (TL)</label>
              <input
                type="number"
                value={formData.monthlySalary}
                onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                placeholder="10000"
                min="0"
                step="100"
              />
            </div>
          )}

          {formData.paymentType === 'PER_LESSON' && (
            <div className="form-group">
              <label>{t('instructorPayment.rate')} (TL)</label>
              <input
                type="number"
                value={formData.perLessonRate}
                onChange={(e) => setFormData({ ...formData, perLessonRate: e.target.value })}
                placeholder="500"
                min="0"
                step="50"
              />
            </div>
          )}

          {formData.paymentType === 'PERCENTAGE' && (
            <div className="form-group">
              <label>{t('instructorPayment.percentageRate')}</label>
              <div className="percentage-input">
                <input
                  type="number"
                  value={formData.percentageRate}
                  onChange={(e) => setFormData({ ...formData, percentageRate: e.target.value })}
                  placeholder="40"
                  min="0"
                  max="100"
                  step="5"
                />
                <span className="percentage-symbol">%</span>
              </div>
              <small className="hint">{t('instructorPayment.percentage')}</small>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary btn-sm" disabled={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </form>
    </div>
  );
};

export default InstructorPaymentForm;
