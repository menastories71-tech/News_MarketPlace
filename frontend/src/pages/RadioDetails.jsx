import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Radio, ArrowLeft, Globe, MapPin, User, ExternalLink, MessageSquare, Link as LinkIcon, Share2, Instagram } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import { getIdFromSlug } from '../utils/slugify';
import ShareButtons from '../components/common/ShareButtons';
import SEO from '../components/common/SEO';

// Updated theme colors matching the color palette from PDF
const theme = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
  primaryLight: '#E3F2FD',
  secondary: '#00796B',
  secondaryDark: '#004D40',
  secondaryLight: '#E0F2F1',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#9C27B0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  backgroundSoft: '#F5F5F5',
  borderLight: '#E0E0E0',
  borderMedium: '#BDBDBD',
  borderDark: '#757575'
};

import { useLanguage } from '../context/LanguageContext';
import { useTranslationObject } from '../hooks/useTranslation';

const RadioDetails = () => {
  const { t } = useLanguage();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [radio, setRadio] = useState(null);
  const { translatedObject: translatedRadio, isTranslating } = useTranslationObject(radio, ['description', 'radio_language', 'emirate_state', 'radio_popular_rj', 'radio_name']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchRadioDetails();
  }, [id]);

  const fetchRadioDetails = useCallback(async () => {
    try {
      setLoading(true);
      const realId = getIdFromSlug(id);
      const response = await api.get(`/radios/${realId}`);
      setRadio(response.data.radio);
    } catch (err) {
      console.error('Error fetching radio details:', err);
      setError('Failed to load radio details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleBack = () => {
    navigate('/radio');
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setIsOrdering(true);

    try {
      // Create order data for API
      const orderData = {
        radioId: translatedRadio.id,
        radioName: translatedRadio.radio_name,
        customerInfo: orderFormData,
        orderDate: new Date().toISOString()
      };

      // Submit order to backend
      const response = await api.post('/radio-orders', orderData);

      if (response.data.success) {
        alert(t('radioDetails.alerts.bookingSuccess'));
        setShowOrderModal(false);
        setOrderFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(response.data.message || t('radioDetails.alerts.bookingFailed'));
      }

    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || error.message || t('radioDetails.alerts.bookingError');
      alert(errorMessage);
    } finally {
      setIsOrdering(false);
    }
  };

  const openLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading || (!translatedRadio && isTranslating)) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2] mx-auto mb-4"></div>
            <p className="text-[#757575]">{t('radioDetails.loading')}</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (error || !translatedRadio) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || t('radioDetails.notFound')}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-[#1565C0] transition-colors"
            >
              {t('radioDetails.backToStations')}
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${translatedRadio.radio_name} | Radio Station Broadcaster`}
        description={translatedRadio.description || `Listen to ${translatedRadio.radio_name} (${translatedRadio.frequency}) on VaaS Solutions. Discover top radio stations and broadcasters.`}
        image={translatedRadio.image_url || 'https://vaas.solutions/logo.png'}
        type="article"
      />
      <UserHeader />

      {/* Back Button */}
      <section className="py-3 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#1976D2] hover:text-[#1565C0] transition-colors text-sm sm:text-base font-medium"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('radioDetails.backToStations')}
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#212121] mb-4">
              {translatedRadio.radio_name}
            </h1>
            <div className="flex justify-center mb-6">
              <span className="text-lg sm:text-xl font-medium text-[#1976D2] bg-[#E3F2FD] px-6 py-2 rounded-full border border-blue-100">
                {translatedRadio.frequency}
              </span>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl -z-10 animate-pulse"></div>
                <img
                  src={translatedRadio.image_url || "/logo.png"}
                  alt={translatedRadio.radio_name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8">
                {/* Frequency and Basic Info */}
                <div className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-6 flex items-center gap-2">
                    <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-[#1976D2]" />
                    {t('radioDetails.stationDetails')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#1976D2] mb-2">
                        {translatedRadio.frequency}
                      </div>
                      <div className="text-sm text-[#757575]">{t('radioDetails.frequency')}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#00796B] mb-2">
                        {translatedRadio.radio_language}
                      </div>
                      <div className="text-sm text-[#757575]">{t('radioDetails.language')}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#9C27B0] mb-2">
                        {translatedRadio.emirate_state}
                      </div>
                      <div className="text-sm text-[#757575]">{t('radioDetails.emirate')}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#FF9800] mb-2">
                        {translatedRadio.radio_popular_rj || t('radioDetails.na')}
                      </div>
                      <div className="text-sm text-[#757575]">{t('radioDetails.popularRj')}</div>
                    </div>
                  </div>
                </div>

                {/* External Links */}
                {(translatedRadio.radio_website || translatedRadio.radio_linkedin || translatedRadio.radio_instagram) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                      {t('radioDetails.externalLinks')}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {translatedRadio.radio_website && (
                        <a
                          href={translatedRadio.radio_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                        >
                          <Globe size={16} />
                          {t('radioDetails.visitWebsite')}
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {translatedRadio.radio_linkedin && (
                        <a
                          href={translatedRadio.radio_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#00796B] text-white hover:bg-[#004D40]"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {translatedRadio.radio_instagram && (
                        <a
                          href={translatedRadio.radio_instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#9C27B0] text-white hover:bg-[#7B1FA2]"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {translatedRadio.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-[#212121]">
                      {t('radioDetails.about')}
                    </h3>
                    <div className="p-4 rounded-lg border bg-[#FAFAFA]">
                      <p className="text-[#757575]">{translatedRadio.description}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Station Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 order-2 lg:order-1">
                <h3 className="text-lg font-bold mb-4 text-[#212121]">
                  {t('radioDetails.summary')}
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <span className="text-[#757575]">{t('radioDetails.frequency')}</span>
                    <span className="font-semibold text-[#212121] bg-blue-50 px-2 py-0.5 rounded text-xs">{translatedRadio.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <span className="text-[#757575]">{t('radioDetails.language')}</span>
                    <span className="font-medium text-[#212121]">{translatedRadio.radio_language}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <span className="text-[#757575]">{t('radioDetails.emirate')}</span>
                    <span className="font-medium text-[#212121]">{translatedRadio.emirate_state}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">{t('radioDetails.popularRj')}</span>
                    <span className="font-medium text-[#212121]">{translatedRadio.radio_popular_rj || t('radioDetails.na')}</span>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 order-1 lg:order-2 ring-2 ring-blue-500/5">
                <h3 className="text-lg font-bold mb-4 text-[#212121]">
                  {t('radioDetails.quickActions')}
                </h3>
                <div className="space-y-4">
                  <button
                    className="w-full text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                    onClick={handlePlaceOrder}
                    disabled={isOrdering}
                  >
                    {isOrdering ? t('radioDetails.processing') : (isAuthenticated ? t('radioDetails.checkout') : t('radioDetails.signInOrder'))}
                  </button>

                  <div className="flex flex-col items-center gap-3 py-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Share Station</span>
                    <ShareButtons
                      url={window.location.href}
                      title={translatedRadio?.radio_name || 'Radio Station'}
                      description={translatedRadio?.description || ''}
                    />
                  </div>

                  <button
                    onClick={handleBack}
                    className="w-full flex items-center justify-center gap-2 text-slate-600 font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-slate-200 hover:bg-slate-50 active:scale-95"
                  >
                    <ArrowLeft size={16} />
                    {t('radioDetails.backToStations')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setShowOrderModal(false)}>
          <div style={{
            backgroundColor: theme.background,
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header - Fixed */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px 24px',
              borderBottom: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                {t('radioDetails.orderModal.title')}
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundSoft}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Content - Scrollable */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  {translatedRadio.radio_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>{t('radioDetails.orderModal.station')}:</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primary }}>
                    {translatedRadio.frequency}
                  </span>
                </div>
              </div>

              <form id="order-form" onSubmit={handleOrderSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      {t('radioDetails.orderModal.fullName')} *
                    </label>
                    <input
                      type="text"
                      value={orderFormData.fullName}
                      onChange={(e) => setOrderFormData({ ...orderFormData, fullName: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      {t('radioDetails.orderModal.email')} *
                    </label>
                    <input
                      type="email"
                      value={orderFormData.email}
                      onChange={(e) => setOrderFormData({ ...orderFormData, email: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      {t('radioDetails.orderModal.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={orderFormData.phone}
                      onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      {t('radioDetails.orderModal.message')}
                    </label>
                    <textarea
                      value={orderFormData.message}
                      onChange={(e) => setOrderFormData({ ...orderFormData, message: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background,
                        resize: 'vertical'
                      }}
                      placeholder={t('radioDetails.orderModal.messagePlaceholder')}
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer - Fixed */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px 24px 24px',
              borderTop: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.backgroundSoft,
                  color: theme.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={isOrdering}
              >
                {t('radioDetails.orderModal.cancel')}
              </button>
              <button
                type="submit"
                form="order-form"
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={isOrdering}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {isOrdering ? t('radioDetails.processing') : t('radioDetails.checkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioDetails;

