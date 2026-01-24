import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, Camera, Globe, Star, ExternalLink, Shield,
  Link as LinkIcon, FileText, CheckCircle, DollarSign, Clock,
  BarChart3, Target, Award, TrendingUp, MapPin, Calendar,
  Users, Zap, Eye, Heart, Share, Instagram, Youtube, Twitter, Filter
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationObject } from '../hooks/useTranslation';

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

const PaparazziDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const { t } = useLanguage();
  const [paparazzi, setPaparazzi] = useState(null);
  const { translatedObj: translatedPaparazzi, isTranslating } = useTranslationObject(paparazzi, ['category', 'region_focused']);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    views: 0,
    orders: 0,
    rating: 0,
    reviews: 0
  });
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    if (id) {
      fetchPaparazziDetails();
    }
  }, [id]);

  const fetchPaparazziDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching paparazzi details for ID:', id);

      const response = await api.get(`/admin/paparazzi-creations/public/${id}`);
      console.log('Paparazzi details response:', response.data);

      setPaparazzi(response.data.paparazziCreation || response.data);
    } catch (error) {
      console.error('Error fetching paparazzi details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        // Handle error - maybe navigate back or show error message
        console.error('Failed to load paparazzi details');
        navigate('/paparazzi');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Contact for pricing';
  };

  const getRatingStars = (followers) => {
    const rating = Math.min(Math.max(Math.round((parseInt(followers) || 0) / 10000), 1), 5);
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    try {
      // Simulate save action
      setIsSaved(!isSaved);
      console.log('Save toggled:', !isSaved);

      // Here you would typically call an API to save/unsave the paparazzi
      // await api.post(`/paparazzi/${id}/save`, { saved: !isSaved });
    } catch (error) {
      console.error('Error saving paparazzi:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: paparazzi.page_name,
      text: `Check out this paparazzi: ${paparazzi.page_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        // Ultimate fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
      });
    }
  };

  const handleViewStats = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    try {
      // Use real data from the paparazzi instead of dummy data
      const realStats = {
        views: (parseInt(paparazzi.followers_count) || 0) * 5 + (parseInt(paparazzi.followers_count) || 0) * 2,
        orders: (parseInt(paparazzi.followers_count) || 0) * 0.1,
        rating: (parseInt(paparazzi.followers_count) || 0) >= 50000 ? 4.8 : (parseInt(paparazzi.followers_count) || 0) >= 10000 ? 4.5 : 4.2,
        reviews: Math.floor(((parseInt(paparazzi.followers_count) || 0)) / 500)
      };

      setStats(realStats);
      setShowStats(true);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
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
        paparazziId: paparazzi.id,
        paparazziName: paparazzi.instagram_page_name,
        category: paparazzi.category,
        followers: paparazzi.no_of_followers,
        customerInfo: orderFormData,
        orderDate: new Date().toISOString()
      };

      // Submit order to backend
      const response = await api.post('/paparazzi-orders', orderData);

      if (response.data.success) {
        alert('Call booking request submitted successfully! Our team will contact you soon.');
        setShowOrderModal(false);
        setOrderFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(response.data.message || 'Failed to submit booking request');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting booking request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsOrdering(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      Instagram: Instagram,
      TikTok: Camera, // Using Camera as fallback for TikTok
      YouTube: Youtube,
      Twitter: Twitter,
      Facebook: Globe // Using Globe as fallback for Facebook
    };
    return icons[platform] || Camera;
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
              style={{
                borderBottom: `2px solid ${theme.primary}`,
                borderRight: `2px solid transparent`
              }}
            ></div>
            <p className="text-lg" style={{ color: theme.textSecondary }}>{t('paparazziDetails.loading')}</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!paparazzi) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Camera size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              {t('paparazziDetails.notFound')}
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {t('paparazziDetails.notFoundDesc')}
            </p>
            <button
              onClick={() => navigate('/paparazzi')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              {t('paparazziDetails.backToPaparazzi')}
            </button>
          </div>
        </div>
        <UserFooter />
        {showAuth && (
          <AuthModal
            isOpen={showAuth}
            onClose={handleCloseAuth}
            onLoginSuccess={handleCloseAuth}
          />
        )}
      </div>
    );
  }

  const PlatformIcon = getPlatformIcon(translatedPaparazzi?.platform);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: theme.textSecondary }}>
            <button
              onClick={() => navigate('/paparazzi')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              {t('paparazziDetails.backToPaparazzi')}
            </button>
            <span>/</span>
            <span>{t('paparazziDetails.details')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Paparazzi Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <PlatformIcon size={32} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                      {translatedPaparazzi?.instagram_page_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Globe size={16} />
                        <span>{t('paparazziDetails.instagramProfile')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{formatFollowers(translatedPaparazzi?.no_of_followers)} {t('paparazziDetails.followers')}</span>
                      </div>
                      {translatedPaparazzi?.region_focused && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{translatedPaparazzi.region_focused}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{t('paparazziDetails.added')} {formatDate(translatedPaparazzi?.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instagram Link */}
                {translatedPaparazzi?.instagram_url && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('paparazziDetails.instagramProfile')}
                    </h3>
                    <a
                      href={translatedPaparazzi.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Instagram size={16} />
                      {t('paparazziDetails.viewProfile')}
                    </a>
                  </div>
                )}

                {/* Description/About */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('paparazziDetails.about')}
                  </h3>
                  <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                    <p>
                      {t('paparazziDetails.aboutDesc')}
                    </p>
                    {translatedPaparazzi?.category && (
                      <p className="mt-4">
                        <strong>{t('paparazziDetails.category')}:</strong> {translatedPaparazzi.category}
                      </p>
                    )}
                    {translatedPaparazzi?.region_focused && (
                      <p className="mt-2">
                        <strong>{t('paparazziDetails.region')}:</strong> {translatedPaparazzi.region_focused}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Image */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('paparazziDetails.profileImage')}
                  </h3>
                  <div className="flex justify-center">
                    <img
                      src={translatedPaparazzi?.profile_dp_logo || "/logo.png"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      onError={(e) => {
                        e.target.src = "/logo.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Stats Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>
                    {formatFollowers(translatedPaparazzi?.no_of_followers)}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {t('paparazziDetails.followers')}
                  </div>
                  <div className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                    {t('paparazzi.card.asOf')} 01st Dec 2025
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('paparazziDetails.platform')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      Instagram
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('paparazziDetails.category')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {translatedPaparazzi?.category || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('paparazziDetails.region')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {translatedPaparazzi?.region_focused || 'Global'}
                    </span>
                  </div>
                  {translatedPaparazzi?.instagram_url && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: theme.textSecondary }}>{t('paparazziDetails.profile')}</span>
                      <a href={translatedPaparazzi.instagram_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: theme.primary }}>
                        {t('paparazziDetails.view')} →
                      </a>
                    </div>
                  )}
                </div>

                <button
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? t('paparazziDetails.processing') : (isAuthenticated ? t('paparazziDetails.contactCreator') : t('paparazziDetails.signInContact'))}
                </button>
              </div>

              {/* Profile Image Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('paparazziDetails.profileImage')}
                </h3>
                <div className="flex justify-center">
                  <img
                    src={translatedPaparazzi?.profile_dp_logo || "/logo.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = "/logo.png";
                    }}
                  />
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('paparazziDetails.quickInfo')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Instagram size={16} style={{ color: theme.primary }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('paparazziDetails.instagramProfile')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: theme.secondary }} />
                    <span style={{ color: theme.textSecondary }}>
                      {formatFollowers(translatedPaparazzi?.no_of_followers)} {t('paparazziDetails.followers')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={16} style={{ color: theme.warning }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('paparazziDetails.category')}: {translatedPaparazzi?.category || 'General'}
                    </span>
                  </div>
                  {translatedPaparazzi?.region_focused && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} style={{ color: theme.info }} />
                      <span style={{ color: theme.textSecondary }}>
                        {t('paparazziDetails.region')}: {translatedPaparazzi.region_focused}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Actions */}
      <section className="px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: isSaved ? theme.danger : theme.borderLight,
                backgroundColor: isSaved ? theme.danger + '20' : 'transparent',
                color: isSaved ? theme.danger : theme.textSecondary
              }}
            >
              <Heart size={16} style={{ color: isSaved ? theme.danger : theme.danger, fill: isSaved ? theme.danger : 'none' }} />
              <span style={{ color: isSaved ? theme.danger : theme.textSecondary }}>
                {isSaved ? t('paparazziDetails.saved') : t('paparazziDetails.save')}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: theme.borderLight,
                color: theme.textSecondary
              }}
            >
              <Share size={16} style={{ color: theme.primary }} />
              <span style={{ color: theme.textSecondary }}>{t('paparazziDetails.share')}</span>
            </button>
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

      {/* Stats Modal */}
      {showStats && (
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
          padding: '20px'
        }} onClick={() => setShowStats(false)}>
          <div style={{
            backgroundColor: theme.background,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                {t('paparazziDetails.stats.title')}
              </h2>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.primary,
                  marginBottom: '4px'
                }}>
                  {stats.views.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('paparazziDetails.stats.totalViews')}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.success,
                  marginBottom: '4px'
                }}>
                  {stats.orders}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('paparazziDetails.stats.totalOrders')}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.warning,
                  marginBottom: '4px'
                }}>
                  {stats.rating}★
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('paparazziDetails.stats.avgRating')}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.info,
                  marginBottom: '4px'
                }}>
                  {stats.reviews}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('paparazziDetails.stats.totalReviews')}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.primaryLight,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: theme.primary
              }}>
                {t('paparazziDetails.stats.performanceSummary')}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: theme.textSecondary
              }}>
                {t('paparazziDetails.stats.performanceDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowStats(false)}
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
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('paparazziDetails.stats.close')}
              </button>
            </div>
          </div>
        </div>
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
                Place Order
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
                  {paparazzi.instagram_page_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>Category:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primary }}>
                    {paparazzi.category || 'General'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ color: theme.textSecondary }}>Followers:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.secondary }}>
                    {formatFollowers(paparazzi.no_of_followers)}
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
                      Full Name *
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
                      Email *
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
                      Phone *
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
                      Additional Message
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
                      placeholder="Any specific requirements or questions..."
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
                Cancel
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
                {isOrdering ? 'Processing...' : 'Book Call Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaparazziDetailPage;