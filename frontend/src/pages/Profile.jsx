import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { t } = useLanguage();
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    birthday: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        birthday: response.data.birthday ? response.data.birthday.split('T')[0] : '',
        parentName: response.data.parentName || '',
        parentPhone: response.data.parentPhone || '',
        parentEmail: response.data.parentEmail || ''
      });
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      setProfile(response.data);
      if (updateUser) {
        updateUser(response.data);
      }
      setSuccess(t('profile.updateSuccess'));
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('profile.passwordMismatch'));
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError(t('profile.passwordTooShort'));
      setSaving(false);
      return;
    }

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess(t('profile.passwordChanged'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64 for simple storage (in production, use cloud storage)
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await userAPI.updateProfile({ profilePicture: reader.result });
        setProfile(response.data);
        setSuccess(t('profile.pictureUpdated'));
      } catch (err) {
        setError(t('errors.general'));
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="page loading">{t('common.loading')}</div>;

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-container">
        {/* Profile Picture Section */}
        <div className="profile-sidebar">
          <div className="profile-picture-container">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </div>
            )}
            <label className="profile-picture-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                hidden
              />
              <span className="upload-btn">{t('profile.changePicture')}</span>
            </label>
          </div>
          <div className="profile-info">
            <h2>{profile?.firstName} {profile?.lastName}</h2>
            <p className="role-badge">{profile?.role}</p>
            <p className="email">{profile?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-main">
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              {t('profile.personalInfo')}
            </button>
            <button
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              {t('profile.changePassword')}
            </button>
          </div>

          {/* Personal Info Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.firstName')}</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('users.lastName')}</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('users.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                <label>{t('users.address')}</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Parent/Guardian info - show for students */}
              {profile?.role === 'STUDENT' && (
                <>
                  <h3 className="section-title">{t('profile.parentInfo')}</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('users.parentName')}</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('users.parentPhone')}</label>
                      <input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('users.parentEmail')}</label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label>{t('profile.currentPassword')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('profile.newPassword')}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>{t('profile.confirmPassword')}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? t('common.saving') : t('profile.changePassword')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
