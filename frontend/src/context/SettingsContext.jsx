import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    schoolName: 'DanceSuite',
    motto: null,
    logo: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      // Public endpoint - no auth required
      const response = await api.get('/settings/branding');
      setBranding(response.data);
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  };

  const refreshBranding = () => {
    fetchBranding();
  };

  return (
    <SettingsContext.Provider value={{
      branding,
      loading,
      refreshBranding
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
