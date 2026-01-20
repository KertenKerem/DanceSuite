import { useState, useEffect } from 'react';
import { paymentAPI, userAPI } from '../../services/api';
import Modal from '../../components/Modal';
import PaymentForm from '../../components/admin/PaymentForm';
import './PaymentManagement.css';

const PaymentManagement = () => {
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
      setError('Failed to load data');
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
      alert(err.response?.data?.error || 'Failed to save payment');
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

  const filteredPayments = filter === 'ALL'
    ? payments
    : payments.filter(p => p.status === filter);

  if (loading) return <div className="loading">Loading payments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Manage Payments</h1>
        <button onClick={handleCreate} className="btn-primary">
          + Create Payment
        </button>
      </div>

      <div className="filter-bar">
        <label>Filter by status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <table className="payments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
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
                  {payment.status}
                </span>
              </td>
              <td>
                <button onClick={() => handleEdit(payment)} className="btn-edit">
                  Update Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <PaymentForm
            payment={editingPayment}
            users={users}
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default PaymentManagement;
