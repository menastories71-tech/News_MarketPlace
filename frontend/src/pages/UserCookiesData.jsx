import React, { useState, useEffect } from 'react';
import Icon from '../components/common/Icon';
import CosmicButton from '../components/common/CosmicButton';
import { generateCookieReport, clearTrackingCookies, getAllCookies, getCookiePreferences } from '../utils/cookieUtils';
import useTranslatedText from '../hooks/useTranslatedText';

const UserCookiesData = () => {
  const [cookieReport, setCookieReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Translated texts
  const pageTitle = useTranslatedText('Your Cookie Data');
  const pageDescription = useTranslatedText('View and manage your cookie preferences and data collected on our website.');
  const cookiePreferencesTitle = useTranslatedText('Cookie Preferences');
  const activeCookiesTitle = useTranslatedText('Active Cookies');
  const trackingDataTitle = useTranslatedText('Tracking Data');
  const consentIdLabel = useTranslatedText('Consent ID');
  const consentTimestampLabel = useTranslatedText('Consent Given');
  const necessaryCookiesLabel = useTranslatedText('Necessary Cookies');
  const analyticsCookiesLabel = useTranslatedText('Analytics Cookies');
  const marketingCookiesLabel = useTranslatedText('Marketing Cookies');
  const cookieNameLabel = useTranslatedText('Cookie Name');
  const cookieValueLabel = useTranslatedText('Value');
  const expiresLabel = useTranslatedText('Expires');
  const userIdLabel = useTranslatedText('User ID');
  const sessionStartLabel = useTranslatedText('Session Start');
  const marketingConsentLabel = useTranslatedText('Marketing Consent');
  const downloadReportLabel = useTranslatedText('Download Report');
  const clearDataLabel = useTranslatedText('Clear All Data');
  const refreshDataLabel = useTranslatedText('Refresh Data');
  const noDataLabel = useTranslatedText('No data available');
  const enabledLabel = useTranslatedText('Enabled');
  const disabledLabel = useTranslatedText('Disabled');
  const confirmClearTitle = useTranslatedText('Clear All Cookie Data');
  const confirmClearMessage = useTranslatedText('Are you sure you want to clear all your cookie data? This action cannot be undone.');
  const cancelLabel = useTranslatedText('Cancel');
  const confirmLabel = useTranslatedText('Confirm');

  useEffect(() => {
    loadCookieData();
  }, []);

  const loadCookieData = () => {
    setLoading(true);
    const report = generateCookieReport();
    setCookieReport(report);
    setLoading(false);
  };

  const handleDownloadReport = () => {
    const report = generateCookieReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `cookie-report-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClearData = () => {
    if (window.confirm(confirmClearMessage)) {
      clearTrackingCookies();
      loadCookieData(); // Refresh the data
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return noDataLabel;
    return new Date(dateString).toLocaleString();
  };

  const formatCookieExpiry = (cookieName) => {
    // This is a simplified version - in reality, you'd need to parse the cookie string
    // For now, we'll show a generic message
    return 'Session/1 Year';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1976D2]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3F2FD]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-[#757575] max-w-3xl mx-auto">
            {pageDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <CosmicButton onClick={loadCookieData}>
            {refreshDataLabel}
          </CosmicButton>
          <CosmicButton variant="secondary" onClick={handleDownloadReport}>
            {downloadReportLabel}
          </CosmicButton>
          <CosmicButton variant="danger" onClick={handleClearData}>
            {clearDataLabel}
          </CosmicButton>
        </div>

        {/* Cookie Preferences */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#212121] mb-6 flex items-center gap-3">
            <Icon name="shield-check" size="lg" className="text-[#1976D2]" />
            {cookiePreferencesTitle}
          </h2>

          {cookieReport?.preferences ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#212121]">{consentIdLabel}</span>
                  <Icon name="badge-check" size="sm" className="text-[#4CAF50]" />
                </div>
                <p className="text-sm text-[#757575] font-mono break-all">
                  {cookieReport.preferences.consentId || noDataLabel}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#212121]">{consentTimestampLabel}</span>
                  <Icon name="calendar" size="sm" className="text-[#1976D2]" />
                </div>
                <p className="text-sm text-[#757575]">
                  {formatDate(cookieReport.preferences.timestamp)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#212121]">{necessaryCookiesLabel}</span>
                  <div className={`w-3 h-3 rounded-full ${cookieReport.preferences.necessary ? 'bg-[#4CAF50]' : 'bg-red-500'}`}></div>
                </div>
                <p className="text-sm text-[#757575]">
                  {cookieReport.preferences.necessary ? enabledLabel : disabledLabel}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#212121]">{analyticsCookiesLabel}</span>
                  <div className={`w-3 h-3 rounded-full ${cookieReport.preferences.analytics ? 'bg-[#4CAF50]' : 'bg-red-500'}`}></div>
                </div>
                <p className="text-sm text-[#757575]">
                  {cookieReport.preferences.analytics ? enabledLabel : disabledLabel}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#212121]">{marketingCookiesLabel}</span>
                  <div className={`w-3 h-3 rounded-full ${cookieReport.preferences.marketing ? 'bg-[#4CAF50]' : 'bg-red-500'}`}></div>
                </div>
                <p className="text-sm text-[#757575]">
                  {cookieReport.preferences.marketing ? enabledLabel : disabledLabel}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="alert-circle" size="lg" className="text-[#757575] mx-auto mb-4" />
              <p className="text-[#757575]">{noDataLabel}</p>
            </div>
          )}
        </div>

        {/* Active Cookies */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#212121] mb-6 flex items-center gap-3">
            <Icon name="cookie" size="lg" className="text-[#1976D2]" />
            {activeCookiesTitle}
          </h2>

          {cookieReport?.cookies && Object.keys(cookieReport.cookies).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#212121]">{cookieNameLabel}</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#212121]">{cookieValueLabel}</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#212121]">{expiresLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cookieReport.cookies).map(([name, value], index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-[#212121] font-medium">{name}</td>
                      <td className="py-3 px-4 text-[#757575] font-mono text-sm max-w-xs truncate">{value}</td>
                      <td className="py-3 px-4 text-[#757575]">{formatCookieExpiry(name)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="cookie" size="lg" className="text-[#757575] mx-auto mb-4" />
              <p className="text-[#757575]">{noDataLabel}</p>
            </div>
          )}
        </div>

        {/* Tracking Data */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#212121] mb-6 flex items-center gap-3">
            <Icon name="chart-bar" size="lg" className="text-[#1976D2]" />
            {trackingDataTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="user" size="sm" className="text-[#1976D2]" />
                <span className="font-medium text-[#212121]">{userIdLabel}</span>
              </div>
              <p className="text-sm text-[#757575] font-mono break-all">
                {cookieReport?.userId || noDataLabel}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="clock" size="sm" className="text-[#1976D2]" />
                <span className="font-medium text-[#212121]">{sessionStartLabel}</span>
              </div>
              <p className="text-sm text-[#757575]">
                {formatDate(cookieReport?.sessionStart)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="megaphone" size="sm" className="text-[#1976D2]" />
                <span className="font-medium text-[#212121]">{marketingConsentLabel}</span>
              </div>
              <p className="text-sm text-[#757575]">
                {formatDate(cookieReport?.marketingConsentTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCookiesData;