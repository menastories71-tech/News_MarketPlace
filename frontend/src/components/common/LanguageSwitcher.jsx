import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const languages = [
  { code: 'en', apertiumCode: 'eng', name: 'English', flag: '🇺🇸' },
  { code: 'ar', apertiumCode: 'ara', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', apertiumCode: 'hin', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', apertiumCode: 'rus', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', apertiumCode: 'zho', name: '中文', flag: '🇨🇳' },
  { code: 'fr', apertiumCode: 'fra', name: 'Français', flag: '🇫🇷' }
];

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <select
      value={language}
      onChange={handleLanguageChange}
      className="bg-white/50 border border-white/20 rounded-lg px-3 py-2 text-sm font-medium text-[#212121] hover:bg-white/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}

export default LanguageSwitcher;