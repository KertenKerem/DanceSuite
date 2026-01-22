import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Payments = () => {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getMyPayments();
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      PENDING: 'status-pending',
      COMPLETED: 'status-completed',
      FAILED: 'status-failed',
      REFUNDED: 'status-refunded'
    };
    return statusClasses[status] || '';
  };

  const getStatusText = (status) => {
    const statusKeys = {
      PENDING: 'payments.pending',
      COMPLETED: 'payments.completed',
      FAILED: 'payments.failed',
      REFUNDED: 'payments.refunded'
    };
    return t(statusKeys[status]) || status;
  };

  if (loading) {
    return <div className="page">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1>{t('payments.title')}</h1>
      {payments.length > 0 ? (
        <div className="card">
          <table className="payment-table">
            <thead>
              <tr>
                <th>{t('common.date')}</th>
                <th>{t('classes.description')}</th>
                <th>{t('payments.amount')}</th>
                <th>{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>{payment.description || '-'}</td>
                  <td>${payment.amount.toFixed(2)}</td>
                  <td>
                    <span className={`payment-status ${getStatusClass(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">{t('payments.noPayments')}</p>
      )}
    </div>
  );
};

export default Payments;
