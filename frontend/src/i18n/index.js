import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: {} },
    ar: { translation: {} },
    hi: { translation: {} },
    ru: { translation: {} },
    zh: { translation: {} },
    fr: { translation: {} }
  },
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false
  }
});

// Add debugging for language changes
i18n.on('languageChanged', (lng) => {
  console.log('i18n: Language changed to:', lng);
});

console.log('i18n initialized with language:', i18n.language);

export default i18n;