import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import tr from '../i18n/tr';

const translations = { en, tr };

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const availableLanguages = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'tr', name: 'Turkce', flag: 'TR' }
  ];

  return (
    <LanguageContext.Provider value={{
      language,
      changeLanguage,
      t,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
