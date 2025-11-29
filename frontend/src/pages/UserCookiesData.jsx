import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import CosmicButton from '../components/common/CosmicButton';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import useTranslatedText from '../hooks/useTranslatedText';

const UserCookiesData = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [allUsersData, setAllUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!user || !hasRole('admin')) {
      navigate('/');
      return;
    }
    loadAllUsersCookieData();
  }, [user, hasRole, navigate]);

  // Translated texts
  const pageTitle = useTranslatedText('All Users Cookie Data - Admin Panel');
  const pageDescription = useTranslatedText('Comprehensive view of all users\' cookie preferences, tracking data, IP addresses, and locations.');
  const totalUsersLabel = useTranslatedText('Total Users');
  const userDetailsLabel = useTranslatedText('User Details');
  const cookiePreferencesTitle = useTranslatedText('Cookie Preferences');
  const trackingDataTitle = useTranslatedText('Tracking Data');
  const deviceInfoTitle = useTranslatedText('Device & Location Info');
  const consentHistoryTitle = useTranslatedText('Consent History');
  const userIdLabel = useTranslatedText('User ID');
  const emailLabel = useTranslatedText('Email');
  const nameLabel = useTranslatedText('Name');
  const consentIdLabel = useTranslatedText('Consent ID');
  const consentTimestampLabel = useTranslatedText('Consent Given');
  const necessaryCookiesLabel = useTranslatedText('Necessary Cookies');
  const analyticsCookiesLabel = useTranslatedText('Analytics Cookies');
  const marketingCookiesLabel = useTranslatedText('Marketing Cookies');
  const totalEventsLabel = useTranslatedText('Total Events');
  const pagesViewedLabel = useTranslatedText('Pages Viewed');
  const timeSpentLabel = useTranslatedText('Time Spent (seconds)');
  const lastActivityLabel = useTranslatedText('Last Activity');
  const ipAddressLabel = useTranslatedText('IP Address');
  const locationLabel = useTranslatedText('Location');
  const browserLabel = useTranslatedText('Browser');
  const osLabel = useTranslatedText('Operating System');
  const userAgentLabel = useTranslatedText('User Agent');
  const refreshDataLabel = useTranslatedText('Refresh Data');
  const exportAllDataLabel = useTranslatedText('Export All Data');
  const noDataLabel = useTranslatedText('No data available');
  const enabledLabel = useTranslatedText('Enabled');
  const disabledLabel = useTranslatedText('Disabled');
  const accessDeniedLabel = useTranslatedText('Access Denied');
  const adminOnlyLabel = useTranslatedText('This page is only accessible to administrators.');

  const loadAllUsersCookieData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/cookies/admin/all-users-data');
      setAllUsersData(response.data.data || []);
    } catch (err) {
      console.error('Error loading all users cookie data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllData = () => {
    const dataStr = JSON.stringify({
      exportDate: new Date().toISOString(),
      totalUsers: allUsersData.length,
      usersData: allUsersData
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `all-users-cookie-data-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return noDataLabel;
    return new Date(dateString).toLocaleString();
  };

  const formatLocation = (location) => {
    if (!location) return noDataLabel;
    return `${location.city}, ${location.region}, ${location.country}`;
  };

  if (!user || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <div className="text-center">
          <Icon name="shield-x" size="lg" className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#212121] mb-2">{accessDeniedLabel}</h1>
          <p className="text-[#757575]">{adminOnlyLabel}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1976D2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <div className="text-center">
          <Icon name="alert-circle" size="lg" className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#212121] mb-2">Error</h1>
          <p className="text-[#757575]">{error}</p>
        </div>
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

        {/* Stats Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1976D2] mb-2">{allUsersData.length}</div>
              <div className="text-[#757575] font-medium">{totalUsersLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4CAF50] mb-2">
                {allUsersData.reduce((sum, user) => sum + (user.trackingData?.totalEvents || 0), 0)}
              </div>
              <div className="text-[#757575] font-medium">Total Events Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {allUsersData.filter(user => user.cookiePreferences?.marketing).length}
              </div>
              <div className="text-[#757575] font-medium">Marketing Consent Given</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <CosmicButton onClick={loadAllUsersCookieData}>
            {refreshDataLabel}
          </CosmicButton>
          <CosmicButton variant="secondary" onClick={handleExportAllData}>
            {exportAllDataLabel}
          </CosmicButton>
        </div>

        {/* Users Data */}
        <div className="space-y-8">
          {allUsersData.map((userData, index) => (
            <div key={userData.userId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* User Header */}
              <div className="bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1976D2] rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#212121]">
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <p className="text-[#757575]">{userData.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#757575]">{userIdLabel}</div>
                    <div className="font-mono text-[#212121]">{userData.userId}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cookie Preferences */}
                  <div>
                    <h4 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
                      <Icon name="shield-check" size="md" className="text-[#1976D2]" />
                      {cookiePreferencesTitle}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-[#212121]">{consentIdLabel}</span>
                        <span className="text-sm font-mono text-[#757575]">{userData.cookiePreferences?.consentId || noDataLabel}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-[#212121]">{consentTimestampLabel}</span>
                        <span className="text-sm text-[#757575]">{formatDate(userData.cookiePreferences?.timestamp)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${userData.cookiePreferences?.necessary ? 'bg-[#4CAF50]' : 'bg-red-500'}`}></div>
                          <div className="text-xs font-medium text-[#212121]">{necessaryCookiesLabel}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${userData.cookiePreferences?.analytics ? 'bg-[#4CAF50]' : 'bg-red-500'}`}></div>
                          <div className="text-xs font-medium text-[#212121]">{analyticsCookiesLabel}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${userData.cookiePreferences?.marketing ? 'bg-[#4CAF50]' : 'bg-red-500'}`}></div>
                          <div className="text-xs font-medium text-[#212121]">{marketingCookiesLabel}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Data */}
                  <div>
                    <h4 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
                      <Icon name="chart-bar" size="md" className="text-[#1976D2]" />
                      {trackingDataTitle}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-[#212121]">{totalEventsLabel}</span>
                        <span className="text-sm text-[#1976D2] font-bold">{userData.trackingData?.totalEvents || 0}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-[#212121] mb-2">{pagesViewedLabel}</div>
                        <div className="text-sm text-[#757575]">
                          {userData.trackingData?.pagesViewed?.join(', ') || noDataLabel}
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-[#212121]">{timeSpentLabel}</span>
                        <span className="text-sm text-[#1976D2] font-bold">{userData.trackingData?.timeSpent || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-[#212121]">{lastActivityLabel}</span>
                        <span className="text-sm text-[#757575]">{formatDate(userData.trackingData?.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device & Location Info */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
                    <Icon name="globe" size="md" className="text-[#1976D2]" />
                    {deviceInfoTitle}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#212121] mb-1">{ipAddressLabel}</div>
                      <div className="text-sm font-mono text-[#757575]">{userData.deviceInfo?.ipAddress || noDataLabel}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#212121] mb-1">{locationLabel}</div>
                      <div className="text-sm text-[#757575]">{formatLocation(userData.deviceInfo?.location)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#212121] mb-1">{browserLabel}</div>
                      <div className="text-sm text-[#757575]">{userData.deviceInfo?.browser || noDataLabel}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#212121] mb-1">{osLabel}</div>
                      <div className="text-sm text-[#757575]">{userData.deviceInfo?.os || noDataLabel}</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-[#212121] mb-1">{userAgentLabel}</div>
                    <div className="text-xs font-mono text-[#757575] break-all">{userData.deviceInfo?.userAgent || noDataLabel}</div>
                  </div>
                </div>

                {/* Consent History */}
                {userData.consentHistory && userData.consentHistory.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
                      <Icon name="clock" size="md" className="text-[#1976D2]" />
                      {consentHistoryTitle}
                    </h4>
                    <div className="space-y-2">
                      {userData.consentHistory.map((consent, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-[#212121]">{consent.consentId}</span>
                            <span className="text-sm text-[#757575]">{formatDate(consent.timestamp)}</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className={`${consent.preferences?.necessary ? 'text-[#4CAF50]' : 'text-red-500'}`}>
                              Necessary: {consent.preferences?.necessary ? enabledLabel : disabledLabel}
                            </span>
                            <span className={`${consent.preferences?.analytics ? 'text-[#4CAF50]' : 'text-red-500'}`}>
                              Analytics: {consent.preferences?.analytics ? enabledLabel : disabledLabel}
                            </span>
                            <span className={`${consent.preferences?.marketing ? 'text-[#4CAF50]' : 'text-red-500'}`}>
                              Marketing: {consent.preferences?.marketing ? enabledLabel : disabledLabel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {allUsersData.length === 0 && (
          <div className="text-center py-12">
            <Icon name="users" size="lg" className="text-[#757575] mx-auto mb-4" />
            <p className="text-[#757575]">{noDataLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCookiesData;