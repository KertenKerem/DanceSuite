import { useState } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ payment, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: payment?.userId || '',
    amount: payment?.amount || '',
    description: payment?.description || '',
    status: payment?.status || 'PENDING'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!payment;

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>{isEditing ? 'Update Payment' : 'Create Payment'}</h2>

      {!isEditing && (
        <div className="form-group">
          <label>Student</label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          >
            <option value="">Select a student...</option>
            {users.filter(u => u.role === 'STUDENT').map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {isEditing && (
        <div className="form-group">
          <label>Student</label>
          <p className="static-value">
            {payment.user?.firstName} {payment.user?.lastName}
          </p>
        </div>
      )}

      <div className="form-group">
        <label>Amount ($)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
          disabled={isEditing}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., Monthly subscription - January"
          required
          disabled={isEditing}
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn-save">
          {isEditing ? 'Update Payment' : 'Create Payment'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
