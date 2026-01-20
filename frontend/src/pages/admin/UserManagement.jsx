import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/Modal';
import './UserManagement.css';

const UserManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    phone: '',
    address: '',
    birthday: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll(filterRole || undefined);
      setUsers(response.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = formData.birthday ? calculateAge(formData.birthday) < 18 : false;
  const isStudent = formData.role === 'STUDENT';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!submitData.password) delete submitData.password;

      if (submitData.role !== 'STUDENT') {
        delete submitData.phone;
        delete submitData.address;
        delete submitData.birthday;
        delete submitData.parentName;
        delete submitData.parentPhone;
        delete submitData.parentEmail;
      }

      if (!isMinor) {
        delete submitData.parentName;
        delete submitData.parentPhone;
        delete submitData.parentEmail;
      }

      if (editingUser) {
        await userAPI.update(editingUser.id, submitData);
      } else {
        await userAPI.create(submitData);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
      parentName: user.parentName || '',
      parentPhone: user.parentPhone || '',
      parentEmail: user.parentEmail || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('users.deleteConfirm'))) return;
    try {
      await userAPI.delete(id);
      fetchUsers();
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
      phone: '',
      address: '',
      birthday: '',
      parentName: '',
      parentPhone: '',
      parentEmail: ''
    });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'INSTRUCTOR': return 'badge-instructor';
      default: return 'badge-student';
    }
  };

  const formatAge = (birthday) => {
    if (!birthday) return '-';
    const age = calculateAge(birthday);
    return `${age} ${t('users.years')}`;
  };

  if (loading) return <div className="page loading">{t('common.loading')}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('users.title')}</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          {t('users.addUser')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('users.allRoles')}</option>
          <option value="STUDENT">{t('users.students')}</option>
          <option value="INSTRUCTOR">{t('users.instructors')}</option>
          <option value="ADMIN">{t('users.admins')}</option>
        </select>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              <th>{t('common.email')}</th>
              <th>{t('users.role')}</th>
              <th>{t('common.phone')}</th>
              <th>{t('users.age')}</th>
              <th>{t('users.enrollments')}</th>
              <th>{t('users.joined')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.phone || '-'}</td>
                <td>{formatAge(user.birthday)}</td>
                <td>{user._count?.enrollments || 0}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-sm btn-edit"
                      onClick={() => handleEdit(user)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      className="btn-sm btn-delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="no-data">{t('users.noUsersFound')}</p>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? t('users.editUser') : t('users.addUser')}
      >
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <h3>{t('users.basicInfo')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t('auth.firstName')} *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('auth.lastName')} *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('common.email')} *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{editingUser ? t('users.newPassword') : `${t('auth.password')} *`}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>{t('users.role')} *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="STUDENT">{t('users.student')}</option>
                <option value="INSTRUCTOR">{t('users.instructor')}</option>
                <option value="ADMIN">{t('users.admin')}</option>
              </select>
            </div>
          </div>

          {isStudent && (
            <div className="form-section">
              <h3>{t('users.studentInfo')}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.phoneNumber')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label>{t('users.birthday')}</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('users.homeAddress')}</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  placeholder="Street address, City, State, ZIP"
                />
              </div>

              {formData.birthday && (
                <div className="age-indicator">
                  {t('users.age')}: {calculateAge(formData.birthday)} {t('users.yearsOld')}
                  {isMinor && <span className="minor-badge">{t('users.minor')}</span>}
                </div>
              )}
            </div>
          )}

          {isStudent && isMinor && (
            <div className="form-section parent-section">
              <h3>{t('users.parentInfo')}</h3>
              <p className="section-note">{t('users.parentRequired')}</p>

              <div className="form-group">
                <label>{t('users.parentName')} *</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  required={isMinor}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.parentPhone')} *</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    required={isMinor}
                  />
                </div>
                <div className="form-group">
                  <label>{t('users.parentEmail')}</label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {editingUser ? t('common.update') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
