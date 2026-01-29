import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import { getIdFromSlug } from '../utils/slugify';
// Removed ShareButtons import to implement manually
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

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sharePlatforms = [
    { name: 'Telegram', icon: 'telegram', color: '#0088cc', link: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', link: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + '\n' + u)}` },
    { name: 'Facebook', icon: 'facebook', color: '#1877F2', link: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { name: 'X', icon: 'x-logo', color: '#000000', link: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', link: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` }
  ];

  const renderShareMenu = (url, title, id, align = 'center') => {
    const isOpen = activeShareId === id;
    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-3 
          ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`}
        style={{ width: isMobile ? '220px' : '280px' }}
      >
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-2">
          {sharePlatforms.map((p) => (
            <a
              key={p.name}
              href={p.link(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: p.color }}
            >
              <Icon name={p.icon} size={18} />
            </a>
          ))}
          <button
            onClick={() => handleCopy(url, id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copiedId === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Icon name={copiedId === id ? 'check-circle' : 'link'} size={18} />
          </button>
        </div>
      </motion.div>
    );
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
      <section className="py-2 sm:py-3 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#1976D2] hover:text-[#1565C0] transition-all duration-300 text-xs sm:text-sm font-semibold group"
          >
            <Icon name="arrow-left" size="xs" className="group-hover:-translate-x-1 transition-transform" />
            {t('radioDetails.backToStations')}
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#212121] mb-4 sm:mb-6 tracking-tight leading-tight">
              {translatedRadio.radio_name}
            </h1>
            <div className="flex justify-center mb-4 sm:mb-6">
              <span className="text-sm sm:text-lg font-bold text-[#1976D2] bg-[#E3F2FD] px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-blue-200 shadow-sm">
                {translatedRadio.frequency}
              </span>
            </div>
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl -z-10 group-hover:bg-blue-400/30 transition-all duration-500 animate-pulse"></div>
                <img
                  src={translatedRadio.image_url || "/logo.png"}
                  alt={translatedRadio.radio_name}
                  className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105"
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
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-6 sm:mb-8 flex items-center gap-2">
                    <Icon name="radio" size="sm" className="text-[#1976D2]" />
                    {t('radioDetails.stationDetails')}
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all duration-300">
                      <div className="text-lg sm:text-2xl font-bold text-[#1976D2] mb-1">
                        {translatedRadio.frequency}
                      </div>
                      <div className="text-[10px] sm:text-sm font-semibold text-[#757575] uppercase tracking-wider">{t('radioDetails.frequency')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-all duration-300">
                      <div className="text-lg sm:text-2xl font-bold text-[#00796B] mb-1">
                        {translatedRadio.radio_language}
                      </div>
                      <div className="text-[10px] sm:text-sm font-semibold text-[#757575] uppercase tracking-wider">{t('radioDetails.language')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all duration-300">
                      <div className="text-lg sm:text-2xl font-bold text-[#9C27B0] mb-1">
                        {translatedRadio.emirate_state}
                      </div>
                      <div className="text-[10px] sm:text-sm font-semibold text-[#757575] uppercase tracking-wider">{t('radioDetails.emirate')}</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all duration-300">
                      <div className="text-lg sm:text-2xl font-bold text-[#FF9800] mb-1 truncate px-2">
                        {translatedRadio.radio_popular_rj || t('radioDetails.na')}
                      </div>
                      <div className="text-[10px] sm:text-sm font-semibold text-[#757575] uppercase tracking-wider">{t('radioDetails.popularRj')}</div>
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
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 bg-[#1976D2] text-white hover:bg-[#0D47A1] shadow-lg shadow-blue-500/20 text-sm sm:text-base font-semibold"
                        >
                          <Icon name="globe" size="xs" />
                          {t('radioDetails.visitWebsite')}
                          <Icon name="external-link" size="xs" />
                        </a>
                      )}
                      {translatedRadio.radio_linkedin && (
                        <a
                          href={translatedRadio.radio_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 bg-[#00796B] text-white hover:bg-[#004D40] shadow-lg shadow-teal-500/20 text-sm sm:text-base font-semibold"
                        >
                          <Icon name="linkedin" size="xs" />
                          LinkedIn
                          <Icon name="external-link" size="xs" />
                        </a>
                      )}
                      {translatedRadio.radio_instagram && (
                        <a
                          href={translatedRadio.radio_instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 bg-[#9C27B0] text-white hover:bg-[#7B1FA2] shadow-lg shadow-purple-500/20 text-sm sm:text-base font-semibold"
                        >
                          <Icon name="instagram" size="xs" />
                          Instagram
                          <Icon name="external-link" size="xs" />
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
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 sm:p-6 order-1 lg:order-2 ring-1 ring-black/5">
                <div className="space-y-5">
                  {/* Share Section - Moved to Top for better UX */}
                  <div className="flex flex-col items-center justify-center text-center gap-3 pb-6 border-b border-slate-100">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">{t('common.share_station', 'Share Station')}</span>
                    <div className="flex justify-center w-full relative">
                      <button
                        onClick={() => setActiveShareId(activeShareId === 'details' ? null : 'details')}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold shadow-sm"
                      >
                        <Icon name="share" size={18} />
                        <span>{t('common.share', 'Share')}</span>
                      </button>
                      {renderShareMenu(window.location.href, translatedRadio?.radio_name, 'details')}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#212121] text-center lg:text-left">
                    {t('radioDetails.quickActions')}
                  </h3>

                  <div className="space-y-3">
                    <button
                      className="w-full text-white font-bold py-3.5 sm:py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95 text-sm sm:text-base"
                      style={{ backgroundColor: theme.primary }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                      onClick={handlePlaceOrder}
                      disabled={isOrdering}
                    >
                      {isOrdering ? t('radioDetails.processing') : (isAuthenticated ? t('radioDetails.checkout') : t('radioDetails.signInOrder'))}
                    </button>

                    <button
                      onClick={handleBack}
                      className="w-full flex items-center justify-center gap-2 text-slate-500 font-bold py-3 px-4 rounded-xl transition-all duration-300 border-2 border-slate-100 hover:bg-slate-50 active:scale-95 text-xs sm:text-sm group"
                    >
                      <Icon name="arrow-left" size="xs" className="group-hover:-translate-x-1 transition-transform" />
                      {t('radioDetails.backToStations')}
                    </button>
                  </div>
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

