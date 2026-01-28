import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import './Settings.css';

const Settings = () => {
  const { t } = useLanguage();
  const { theme, changeTheme, availableThemes } = useTheme();
  const { refreshBranding } = useSettings();

  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    schoolName: 'DanceSuite',
    motto: '',
    logo: '',
    primaryColor: '#a855f7',
    theme: 'LIGHT'
  });

  const [exportOptions, setExportOptions] = useState({
    userFormat: 'csv',
    userRole: '',
    financialFormat: 'csv',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      setSettings({
        schoolName: response.data.schoolName || 'DanceSuite',
        motto: response.data.motto || '',
        logo: response.data.logo || '',
        primaryColor: response.data.primaryColor || '#a855f7',
        theme: response.data.theme || 'LIGHT'
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await settingsAPI.update(settings);
      refreshBranding();
      setSuccess(t('settings.savedSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        setError(t('settings.logoTooLarge'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = async () => {
    try {
      setError('');
      const response = await settingsAPI.backup();
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dancesuite-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      setSuccess(t('settings.backupSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  const handleExportUsers = async () => {
    try {
      setError('');
      const response = await settingsAPI.exportUsers(
        exportOptions.userFormat,
        exportOptions.userRole || undefined
      );

      let blob;
      let filename;
      if (exportOptions.userFormat === 'csv') {
        blob = response.data;
        filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        blob = new Blob([dataStr], { type: 'application/json' });
        filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  const handleExportFinancial = async () => {
    try {
      setError('');
      const response = await settingsAPI.exportFinancial(
        exportOptions.financialFormat,
        exportOptions.startDate || undefined,
        exportOptions.endDate || undefined
      );

      let blob;
      let filename;
      if (exportOptions.financialFormat === 'csv') {
        blob = response.data;
        filename = `financial-export-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        blob = new Blob([dataStr], { type: 'application/json' });
        filename = `financial-export-${new Date().toISOString().split('T')[0]}.json`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  const tabs = [
    { id: 'branding', label: t('settings.branding') },
    { id: 'theme', label: t('settings.theme') },
    { id: 'backup', label: t('settings.backup') },
    { id: 'print', label: t('settings.print') }
  ];

  if (loading) return <div className="page loading">{t('common.loading')}</div>;

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>{t('settings.title')}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="settings-section">
            <h2>{t('settings.schoolBranding')}</h2>

            <div className="form-group">
              <label>{t('settings.schoolName')}</label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                placeholder="DanceSuite"
              />
            </div>

            <div className="form-group">
              <label>{t('settings.motto')}</label>
              <input
                type="text"
                value={settings.motto || ''}
                onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
                placeholder={t('settings.mottoPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('settings.logo')}</label>
              <div className="logo-upload">
                {settings.logo && (
                  <div className="logo-preview">
                    <img src={settings.logo} alt="School logo" />
                    <button
                      type="button"
                      className="btn-sm btn-delete"
                      onClick={() => setSettings({ ...settings, logo: '' })}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <p className="help-text">{t('settings.logoHelp')}</p>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="settings-section">
            <h2>{t('settings.themeSettings')}</h2>

            <div className="form-group">
              <label>{t('settings.colorTheme')}</label>
              <div className="theme-options">
                {availableThemes.map(themeOption => (
                  <button
                    key={themeOption.code}
                    className={`theme-option ${theme === themeOption.code ? 'active' : ''}`}
                    onClick={() => changeTheme(themeOption.code)}
                  >
                    <span className={`theme-preview ${themeOption.code}`}></span>
                    <span className="theme-name">{themeOption.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>{t('settings.primaryColor')}</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={settings.primaryColor || '#a855f7'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                />
                <span>{settings.primaryColor}</span>
              </div>
              <p className="help-text">{t('settings.primaryColorHelp')}</p>
            </div>

            <button
              className="btn-primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="settings-section">
            <h2>{t('settings.backupMaintenance')}</h2>

            <div className="backup-section">
              <h3>{t('settings.databaseBackup')}</h3>
              <p>{t('settings.backupDescription')}</p>
              <button className="btn-primary" onClick={handleBackup}>
                {t('settings.downloadBackup')}
              </button>
            </div>

            <div className="export-section">
              <h3>{t('settings.exportUsers')}</h3>
              <div className="export-options">
                <div className="form-group">
                  <label>{t('settings.format')}</label>
                  <select
                    value={exportOptions.userFormat}
                    onChange={(e) => setExportOptions({ ...exportOptions, userFormat: e.target.value })}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('users.role')}</label>
                  <select
                    value={exportOptions.userRole}
                    onChange={(e) => setExportOptions({ ...exportOptions, userRole: e.target.value })}
                  >
                    <option value="">{t('users.allRoles')}</option>
                    <option value="STUDENT">{t('users.students')}</option>
                    <option value="INSTRUCTOR">{t('users.instructors')}</option>
                    <option value="ADMIN">{t('users.admins')}</option>
                  </select>
                </div>
              </div>
              <button className="btn-secondary" onClick={handleExportUsers}>
                {t('settings.exportUsers')}
              </button>
            </div>

            <div className="export-section">
              <h3>{t('settings.exportFinancial')}</h3>
              <div className="export-options">
                <div className="form-group">
                  <label>{t('settings.format')}</label>
                  <select
                    value={exportOptions.financialFormat}
                    onChange={(e) => setExportOptions({ ...exportOptions, financialFormat: e.target.value })}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('reports.startDate')}</label>
                  <input
                    type="date"
                    value={exportOptions.startDate}
                    onChange={(e) => setExportOptions({ ...exportOptions, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('reports.endDate')}</label>
                  <input
                    type="date"
                    value={exportOptions.endDate}
                    onChange={(e) => setExportOptions({ ...exportOptions, endDate: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn-secondary" onClick={handleExportFinancial}>
                {t('settings.exportFinancial')}
              </button>
            </div>
          </div>
        )}

        {/* Print Tab */}
        {activeTab === 'print' && (
          <div className="settings-section">
            <h2>{t('settings.printSettings')}</h2>
            <p className="section-description">{t('settings.printDescription')}</p>

            <div className="print-options">
              <div className="print-card">
                <h3>{t('settings.studentLists')}</h3>
                <p>{t('settings.studentListsDesc')}</p>
                <button
                  className="btn-secondary"
                  onClick={() => window.open('/admin/users?print=true', '_blank')}
                >
                  {t('settings.printStudentList')}
                </button>
              </div>

              <div className="print-card">
                <h3>{t('settings.classRosters')}</h3>
                <p>{t('settings.classRostersDesc')}</p>
                <button
                  className="btn-secondary"
                  onClick={() => window.open('/admin/classes?print=true', '_blank')}
                >
                  {t('settings.printClassRosters')}
                </button>
              </div>

              <div className="print-card">
                <h3>{t('settings.financialReports')}</h3>
                <p>{t('settings.financialReportsDesc')}</p>
                <button
                  className="btn-secondary"
                  onClick={() => window.open('/admin/reports?print=true', '_blank')}
                >
                  {t('settings.printFinancialReport')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
