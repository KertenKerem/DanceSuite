import { useState, useEffect } from 'react';
import { accountingAPI, paymentAPI } from '../../services/api';
import Modal from '../../components/Modal';
import './Accounting.css';

const EXPENSE_CATEGORIES = [
  'RENT', 'UTILITIES', 'SALARIES', 'EQUIPMENT',
  'MARKETING', 'SUPPLIES', 'MAINTENANCE', 'INSURANCE', 'OTHER'
];

const Accounting = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'OTHER',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vendor: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const [summaryRes, monthlyRes] = await Promise.all([
          accountingAPI.getSummary(),
          accountingAPI.getMonthly()
        ]);
        setSummary(summaryRes.data);
        setMonthlyData(monthlyRes.data);
      } else if (activeTab === 'expenses') {
        const res = await accountingAPI.getExpenses();
        setExpenses(res.data);
      } else if (activeTab === 'payments') {
        const res = await paymentAPI.getAll();
        setPayments(res.data);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await accountingAPI.updateExpense(editingExpense.id, expenseForm);
      } else {
        await accountingAPI.createExpense(expenseForm);
      }
      setShowExpenseModal(false);
      setEditingExpense(null);
      resetExpenseForm();
      fetchData();
    } catch (err) {
      setError('Failed to save expense');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
      vendor: expense.vendor || ''
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await accountingAPI.deleteExpense(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      category: 'OTHER',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      vendor: ''
    });
  };

  const openCreateExpenseModal = () => {
    setEditingExpense(null);
    resetExpenseForm();
    setShowExpenseModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatCategory = (category) => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ');
  };

  if (loading && !summary) return <div className="page loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Accounting</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      {activeTab === 'overview' && summary && (
        <div className="overview-content">
          <div className="summary-cards">
            <div className="summary-card revenue">
              <h3>Total Revenue</h3>
              <p className="amount">{formatCurrency(summary.revenue.total)}</p>
              <span className="count">{summary.revenue.count} payments</span>
            </div>
            <div className="summary-card expenses">
              <h3>Total Expenses</h3>
              <p className="amount">{formatCurrency(summary.expenses.total)}</p>
              <span className="count">{summary.expenses.count} expenses</span>
            </div>
            <div className="summary-card net-income">
              <h3>Net Income</h3>
              <p className={`amount ${summary.netIncome >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.netIncome)}
              </p>
            </div>
            <div className="summary-card pending">
              <h3>Pending Payments</h3>
              <p className="amount">{formatCurrency(summary.pendingPayments.total)}</p>
              <span className="count">{summary.pendingPayments.count} pending</span>
            </div>
          </div>

          <div className="card">
            <h2>Expenses by Category</h2>
            <div className="category-breakdown">
              {summary.expenses.byCategory.map((item) => (
                <div key={item.category} className="category-item">
                  <span className="category-name">{formatCategory(item.category)}</span>
                  <div className="category-bar">
                    <div
                      className="category-fill"
                      style={{
                        width: `${(item.amount / summary.expenses.total) * 100}%`
                      }}
                    />
                  </div>
                  <span className="category-amount">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Monthly Breakdown</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Net Income</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr key={month.month}>
                    <td>{month.monthName}</td>
                    <td className="positive">{formatCurrency(month.revenue)}</td>
                    <td className="negative">{formatCurrency(month.expenses)}</td>
                    <td className={month.netIncome >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(month.netIncome)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="expenses-content">
          <div className="section-header">
            <button className="btn-primary" onClick={openCreateExpenseModal}>
              Add Expense
            </button>
          </div>

          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`category-badge ${expense.category.toLowerCase()}`}>
                        {formatCategory(expense.category)}
                      </span>
                    </td>
                    <td>{expense.description}</td>
                    <td>{expense.vendor || '-'}</td>
                    <td className="negative">{formatCurrency(expense.amount)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm btn-edit"
                          onClick={() => handleEditExpense(expense)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-sm btn-delete"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <p className="no-data">No expenses recorded</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="payments-content">
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{payment.user?.firstName} {payment.user?.lastName}</td>
                    <td>{payment.description || '-'}</td>
                    <td className="positive">{formatCurrency(payment.amount)}</td>
                    <td>
                      <span className={`status-badge ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <p className="no-data">No payments recorded</p>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleExpenseSubmit} className="expense-form">
          <div className="form-group">
            <label>Category</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              required
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{formatCategory(cat)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Vendor (Optional)</label>
            <input
              type="text"
              value={expenseForm.vendor}
              onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowExpenseModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingExpense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounting;
