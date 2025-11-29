import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Global cache for ongoing translation requests to avoid duplicates
const translationPromises = new Map();

function useTranslatedText(text, sourceLang = 'en') {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (!text || sourceLang === currentLang) {
      setTranslatedText(text);
      return;
    }

    const key = `translation:${currentLang}:${text}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    const cacheKey = `${currentLang}:${text}`;
    if (translationPromises.has(cacheKey)) {
      // Wait for the ongoing request
      translationPromises.get(cacheKey).then(result => {
        setTranslatedText(result);
      });
      return;
    }

    const fetchTranslation = async () => {
      try {
        const response = await fetch('/api/translations/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, sourceLang, targetLang: currentLang }),
        });
        const data = await response.json();
        if (data.translatedText) {
          localStorage.setItem(key, data.translatedText);
          return data.translatedText;
        } else {
          return text;
        }
      } catch (error) {
        return text;
      }
    };

    const promise = fetchTranslation();
    translationPromises.set(cacheKey, promise);

    promise.then(result => {
      translationPromises.delete(cacheKey);
      setTranslatedText(result);
    }).catch(() => {
      translationPromises.delete(cacheKey);
      setTranslatedText(text);
    });
  }, [text, sourceLang, currentLang]);

  // Listen for language changes to ensure immediate re-translation
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      console.log('useTranslatedText: Language changed to:', lng, 'for text:', text);
      if (lng !== sourceLang) {
        const key = `translation:${lng}:${text}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          console.log('useTranslatedText: Using cached translation:', cached);
          setTranslatedText(cached);
        } else {
          console.log('useTranslatedText: Fetching translation for:', text);
          // Trigger re-translation for new language
          const fetchTranslation = async () => {
            try {
              const response = await fetch('/api/translations/translate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, sourceLang, targetLang: lng }),
              });
              const data = await response.json();
              if (data.translatedText) {
                console.log('useTranslatedText: Received translation:', data.translatedText);
                localStorage.setItem(key, data.translatedText);
                setTranslatedText(data.translatedText);
              } else {
                console.log('useTranslatedText: No translation received');
              }
            } catch (error) {
              console.error('useTranslatedText: Translation fetch error:', error);
              // Keep current text if translation fails
            }
          };
          fetchTranslation();
        }
      } else {
        console.log('useTranslatedText: Language is source language, using original text');
        setTranslatedText(text);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [text, sourceLang, i18n]);

  return translatedText;
}

export default useTranslatedText;