import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Language Context
const LanguageContext = createContext();

// Custom hook to use the Language Context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  // State for current language, default to 'en'
  const [language, setLanguageState] = useState('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Function to change language, persists to localStorage
  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Context value
  const value = {
    language,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};