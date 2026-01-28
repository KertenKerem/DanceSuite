import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import LanguageSelector from '../components/LanguageSelector';
import './Auth.css';

const Login = () => {
  const { t } = useLanguage();
  const { branding } = useSettings();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {branding.logo && <img src={branding.logo} alt={branding.schoolName} className="auth-logo" />}
          <h1>{branding.schoolName}</h1>
          {branding.motto && <p className="auth-motto">{branding.motto}</p>}
          <LanguageSelector />
        </div>
        <h2>{t('auth.signIn')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
        <p className="auth-link">
          {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
