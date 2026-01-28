import { useState, useEffect } from 'react';
import { accountingAPI, paymentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/Modal';
import './Accounting.css';

const EXPENSE_CATEGORIES = [
  'RENT', 'UTILITIES', 'SALARIES', 'EQUIPMENT',
  'MARKETING', 'SUPPLIES', 'MAINTENANCE', 'INSURANCE', 'OTHER'
];

const Accounting = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [instructorIncome, setInstructorIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedInstructor, setExpandedInstructor] = useState(null);
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
      } else if (activeTab === 'instructors') {
        const res = await accountingAPI.getInstructorIncome();
        setInstructorIncome(res.data);
      }
    } catch (err) {
      setError(t('errors.general'));
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
      setError(t('errors.general'));
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
    if (!window.confirm(t('accounting.deleteConfirm'))) return;
    try {
      await accountingAPI.deleteExpense(id);
      fetchData();
    } catch (err) {
      setError(t('errors.general'));
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
    return t(`accounting.categories.${category.toLowerCase()}`) || category;
  };

  if (loading && !summary) return <div className="page loading">{t('common.loading')}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('accounting.title')}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('accounting.overview')}
        </button>
        <button
          className={`tab ${activeTab === 'instructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructors')}
        >
          {t('users.instructors')}
        </button>
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          {t('accounting.expenses')}
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          {t('nav.payments')}
        </button>
      </div>

      {activeTab === 'overview' && summary && (
        <div className="overview-content">
          <div className="summary-cards">
            <div className="summary-card revenue">
              <h3>{t('accounting.totalRevenue')}</h3>
              <p className="amount">{formatCurrency(summary.revenue.total)}</p>
              <span className="count">{summary.revenue.count} {t('nav.payments').toLowerCase()}</span>
            </div>
            <div className="summary-card expenses">
              <h3>{t('accounting.totalExpenses')}</h3>
              <p className="amount">{formatCurrency(summary.expenses.total)}</p>
              <span className="count">{summary.expenses.count} {t('accounting.expenses').toLowerCase()}</span>
            </div>
            <div className="summary-card net-income">
              <h3>{t('accounting.netIncome')}</h3>
              <p className={`amount ${summary.netIncome >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.netIncome)}
              </p>
            </div>
            <div className="summary-card pending">
              <h3>{t('accounting.pendingPayments')}</h3>
              <p className="amount">{formatCurrency(summary.pendingPayments.total)}</p>
              <span className="count">{summary.pendingPayments.count} {t('payments.pending').toLowerCase()}</span>
            </div>
          </div>

          <div className="card">
            <h2>{t('accounting.expensesByCategory')}</h2>
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
            <h2>{t('accounting.monthlyBreakdown')}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('accounting.month')}</th>
                  <th>{t('accounting.revenue')}</th>
                  <th>{t('accounting.expenses')}</th>
                  <th>{t('accounting.netIncome')}</th>
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
              {t('accounting.addExpense')}
            </button>
          </div>

          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('common.date')}</th>
                  <th>{t('accounting.category')}</th>
                  <th>{t('classes.description')}</th>
                  <th>{t('accounting.vendor')}</th>
                  <th>{t('payments.amount')}</th>
                  <th>{t('common.actions')}</th>
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
                          {t('common.edit')}
                        </button>
                        <button
                          className="btn-sm btn-delete"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <p className="no-data">{t('accounting.noExpenses')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'instructors' && (
        <div className="instructors-content">
          <div className="instructor-cards">
            {instructorIncome.map((data) => (
              <div key={data.instructor.id} className="instructor-card">
                <div
                  className="instructor-header"
                  onClick={() => setExpandedInstructor(
                    expandedInstructor === data.instructor.id ? null : data.instructor.id
                  )}
                >
                  <div className="instructor-info">
                    <h3>{data.instructor.name}</h3>
                    <p className="instructor-email">{data.instructor.email}</p>
                  </div>
                  <div className="instructor-stats">
                    <div className="stat-item">
                      <span className="stat-label">{t('accounting.totalIncome')}</span>
                      <span className="stat-value positive">{formatCurrency(data.totalIncome)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{t('classes.classes')}</span>
                      <span className="stat-value">{data.totalClasses}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{t('users.students')}</span>
                      <span className="stat-value">{data.totalStudents}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{t('nav.payments')}</span>
                      <span className="stat-value">{data.totalPayments}</span>
                    </div>
                  </div>
                  <span className={`expand-icon ${expandedInstructor === data.instructor.id ? 'expanded' : ''}`}>
                    &#9660;
                  </span>
                </div>

                {expandedInstructor === data.instructor.id && (
                  <div className="instructor-classes">
                    <h4>{t('classes.classes')}</h4>
                    <div className="classes-grid">
                      {data.classes.map((cls) => (
                        <div key={cls.id} className="class-item">
                          <span className="class-name">{cls.name}</span>
                          <span className="class-fee">{formatCurrency(cls.fee)} / {t('classes.student')}</span>
                          <span className="class-students">{cls.students} {t('users.students')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {instructorIncome.length === 0 && (
            <p className="no-data">{t('accounting.noInstructorData')}</p>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="payments-content">
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('common.date')}</th>
                  <th>{t('payments.student')}</th>
                  <th>{t('classes.description')}</th>
                  <th>{t('payments.amount')}</th>
                  <th>{t('common.status')}</th>
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
              <p className="no-data">{t('payments.noPayments')}</p>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title={editingExpense ? t('accounting.editExpense') : t('accounting.addExpense')}
      >
        <form onSubmit={handleExpenseSubmit} className="expense-form">
          <div className="form-group">
            <label>{t('accounting.category')}</label>
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
            <label>{t('payments.amount')}</label>
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
            <label>{t('classes.description')}</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('common.date')}</label>
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('accounting.vendor')}</label>
            <input
              type="text"
              value={expenseForm.vendor}
              onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowExpenseModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {editingExpense ? t('common.update') : t('accounting.addExpense')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounting;
