import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div className="language-selector">
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${language === lang.code ? 'active' : ''}`}
          onClick={() => changeLanguage(lang.code)}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
