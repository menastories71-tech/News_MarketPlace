import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import useTranslatedText from '../../hooks/useTranslatedText';
import { initializeAnalytics, initializeMarketing } from '../../utils/cookieUtils';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Translated texts
  const cookieTitle = useTranslatedText('Cookie Preferences');
  const cookieDescription = useTranslatedText('We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.');
  const acceptAllText = useTranslatedText('Accept All Cookies');
  const rejectAllText = useTranslatedText('Reject All Cookies');
  const customizeText = useTranslatedText('Customize Settings');
  const necessaryCookiesText = useTranslatedText('Necessary Cookies');
  const necessaryDesc = useTranslatedText('Required for the website to function properly. Cannot be disabled.');
  const analyticsCookiesText = useTranslatedText('Analytics Cookies');
  const analyticsDesc = useTranslatedText('Help us understand how visitors interact with our website.');
  const marketingCookiesText = useTranslatedText('Marketing Cookies');
  const marketingDesc = useTranslatedText('Used to deliver personalized advertisements.');
  const savePreferencesText = useTranslatedText('Save Preferences');
  const privacyPolicyText = useTranslatedText('Privacy Policy');
  const cookiePolicyText = useTranslatedText('Cookie Policy');

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      consentId: generateConsentId()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);

    // Set actual cookies based on preferences
    setCookiePreferences(preferences);
  };

  const handleRejectAll = () => {
    const preferences = {
      necessary: true, // Always true for necessary cookies
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      consentId: generateConsentId()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);

    // Set actual cookies based on preferences
    setCookiePreferences(preferences);

    // Initialize tracking services based on consent
    if (preferences.analytics) {
      initializeAnalytics();
    }
    if (preferences.marketing) {
      initializeMarketing();
    }
  };

  const handleSavePreferences = (preferences) => {
    const fullPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
      consentId: generateConsentId()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(fullPreferences));
    setShowBanner(false);
    setShowDetails(false);

    // Set actual cookies based on preferences
    setCookiePreferences(fullPreferences);

    // Initialize tracking services based on consent
    if (fullPreferences.analytics) {
      initializeAnalytics();
    }
    if (fullPreferences.marketing) {
      initializeMarketing();
    }
  };

  const generateConsentId = () => {
    return 'consent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const setCookiePreferences = (preferences) => {
    // Set analytics cookies if accepted
    if (preferences.analytics) {
      document.cookie = "analytics_consent=true; path=/; max-age=31536000"; // 1 year
      // Here you would initialize analytics services like Google Analytics
    }

    // Set marketing cookies if accepted
    if (preferences.marketing) {
      document.cookie = "marketing_consent=true; path=/; max-age=31536000"; // 1 year
      // Here you would initialize marketing services
    }

    // Always set necessary cookies
    document.cookie = "necessary_consent=true; path=/; max-age=31536000"; // 1 year
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#1976D2]/10 rounded-lg flex items-center justify-center">
                  <Icon name="shield-check" size="sm" className="text-[#1976D2]" />
                </div>
                <h3 className="text-lg font-semibold text-[#212121]">{cookieTitle}</h3>
              </div>
              <p className="text-sm text-[#757575] leading-relaxed max-w-2xl">
                {cookieDescription}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#757575]">
                <a href="/privacy-policy" className="hover:text-[#1976D2] underline">{privacyPolicyText}</a>
                <a href="/cookie-policy" className="hover:text-[#1976D2] underline">{cookiePolicyText}</a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium text-[#1976D2] border border-[#1976D2] rounded-lg hover:bg-[#1976D2]/10 transition-colors"
              >
                {customizeText}
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-[#757575] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {rejectAllText}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 text-sm font-medium text-white bg-[#1976D2] rounded-lg hover:bg-[#0D47A1] transition-colors"
              >
                {acceptAllText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cookie Settings Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#212121]">{cookieTitle}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="x" size="md" className="text-[#757575]" />
                </button>
              </div>

              <CookieSettingsForm onSave={handleSavePreferences} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Cookie Settings Form Component
const CookieSettingsForm = ({ onSave }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: false,
    marketing: false
  });

  const necessaryCookiesText = useTranslatedText('Necessary Cookies');
  const necessaryDesc = useTranslatedText('Required for the website to function properly. Cannot be disabled.');
  const analyticsCookiesText = useTranslatedText('Analytics Cookies');
  const analyticsDesc = useTranslatedText('Help us understand how visitors interact with our website.');
  const marketingCookiesText = useTranslatedText('Marketing Cookies');
  const marketingDesc = useTranslatedText('Used to deliver personalized advertisements.');
  const savePreferencesText = useTranslatedText('Save Preferences');

  const handleToggle = (type) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Necessary Cookies */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-[#4CAF50] rounded flex items-center justify-center">
            <Icon name="check" size="xs" className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#212121]">{necessaryCookiesText}</h3>
            <p className="text-sm text-[#757575] mt-1">{necessaryDesc}</p>
          </div>
        </div>
        <div className="text-sm text-[#757575] font-medium">Always Active</div>
      </div>

      {/* Analytics Cookies */}
      <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => handleToggle('analytics')}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            preferences.analytics
              ? 'bg-[#1976D2] border-[#1976D2]'
              : 'border-gray-300'
          }`}
        >
          {preferences.analytics && <Icon name="check" size="xs" className="text-white" />}
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-[#212121]">{analyticsCookiesText}</h3>
          <p className="text-sm text-[#757575] mt-1">{analyticsDesc}</p>
        </div>
      </div>

      {/* Marketing Cookies */}
      <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => handleToggle('marketing')}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            preferences.marketing
              ? 'bg-[#1976D2] border-[#1976D2]'
              : 'border-gray-300'
          }`}
        >
          {preferences.marketing && <Icon name="check" size="xs" className="text-white" />}
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-[#212121]">{marketingCookiesText}</h3>
          <p className="text-sm text-[#757575] mt-1">{marketingDesc}</p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={() => onSave(preferences)}
          className="px-6 py-2 bg-[#1976D2] text-white font-medium rounded-lg hover:bg-[#0D47A1] transition-colors"
        >
          {savePreferencesText}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;