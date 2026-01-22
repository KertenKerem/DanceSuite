import { useState, useEffect } from 'react';
import { paymentAPI, userAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/Modal';
import PaymentForm from '../../components/admin/PaymentForm';
import './PaymentManagement.css';

const PaymentManagement = () => {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, usersRes] = await Promise.all([
        paymentAPI.getAll(),
        userAPI.getAll()
      ]);
      setPayments(paymentsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPayment(null);
    setShowModal(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingPayment) {
        await paymentAPI.update(editingPayment.id, formData);
      } else {
        await paymentAPI.create(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || t('errors.general'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      case 'REFUNDED': return 'status-refunded';
      default: return '';
    }
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

  const filteredPayments = filter === 'ALL'
    ? payments
    : payments.filter(p => p.status === filter);

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>{t('payments.manageTitle')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          + {t('payments.addPayment')}
        </button>
      </div>

      <div className="filter-bar">
        <label>{t('common.filter')}:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">{t('common.all')}</option>
          <option value="PENDING">{t('payments.pending')}</option>
          <option value="COMPLETED">{t('payments.completed')}</option>
          <option value="FAILED">{t('payments.failed')}</option>
          <option value="REFUNDED">{t('payments.refunded')}</option>
        </select>
      </div>

      <table className="payments-table">
        <thead>
          <tr>
            <th>{t('common.date')}</th>
            <th>{t('payments.student')}</th>
            <th>{t('classes.description')}</th>
            <th>{t('payments.amount')}</th>
            <th>{t('common.status')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}</td>
              <td>{payment.user?.firstName} {payment.user?.lastName}</td>
              <td>{payment.description}</td>
              <td>${payment.amount.toFixed(2)}</td>
              <td>
                <span className={`status-badge ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </td>
              <td>
                <button onClick={() => handleEdit(payment)} className="btn-edit">
                  {t('common.edit')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPayment ? t('payments.editPayment') : t('payments.addPayment')}
      >
        <PaymentForm
          payment={editingPayment}
          users={users}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PaymentManagement;
