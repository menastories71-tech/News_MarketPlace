import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, Globe, MapPin, Users, Star, ExternalLink,
  Instagram, Youtube, Twitter, Facebook, Hash, DollarSign,
  Calendar, Eye, Heart, Share
} from 'lucide-react';

const ThemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(null);
  const [relatedThemes, setRelatedThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchThemeDetails();
    }

    // Cleanup function to prevent ResizeObserver errors
    return () => {
      // Clear any pending state updates
      setTheme(null);
      setRelatedThemes([]);
      setLoading(false);
    };
  }, [id]);

  const fetchThemeDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching theme details for ID:', id);

      const response = await api.get(`/themes/${id}`);
      console.log('Theme details response:', response.data);

      setTheme(response.data.theme || response.data);

      // Fetch related themes
      if (response.data.theme) {
        fetchRelatedThemes(response.data.theme.category, response.data.theme.platform);
      }
    } catch (error) {
      console.error('Error fetching theme details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        console.error('Failed to load theme details');
        navigate('/themes');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedThemes = async (category, platform) => {
    try {
      const params = new URLSearchParams({
        limit: '4',
        status: 'approved',
        is_active: 'true'
      });

      if (category) params.append('category', category);
      if (platform) params.append('platform', platform);

      const response = await api.get(`/themes?${params.toString()}`);
      const themes = response.data.themes || [];
      // Filter out current theme
      setRelatedThemes(themes.filter(t => t.id !== parseInt(id)));
    } catch (error) {
      console.error('Error fetching related themes:', error);
    }
  };

  const formatFollowers = (count) => {
    if (!count) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
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
        themeId: theme.id,
        themeName: theme.page_name,
        price: theme.price_reel_without_tagging_collaboration,
        customerInfo: orderFormData,
        orderDate: new Date().toISOString()
      };

      // Submit order to backend
      const response = await api.post('/theme-orders', orderData);

      if (response.data.order) {
        alert('Theme collaboration request submitted successfully! Our team will contact you soon.');
        setShowOrderModal(false);
        setOrderFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(response.data.message || 'Failed to submit collaboration request');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error submitting collaboration request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsOrdering(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: theme.page_name,
      text: `Check out this social media theme: ${theme.page_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
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

  const themeColors = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
    primaryLight: '#E3F2FD',
    secondary: '#00796B',
    secondaryDark: '#004D40',
    secondaryLight: '#E0F2F1',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#E0E0E0] border-t-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading theme details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
              <Hash className="w-12 h-12 text-[#BDBDBD]" />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
              Theme Not Found
            </h1>
            <p className="mb-8" style={{ color: themeColors.textSecondary }}>
              The theme you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/themes')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: themeColors.primary }}
            >
              <ArrowLeft size={16} />
              Back to Themes
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

  return (
    <div className="min-h-screen bg-white">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: themeColors.textSecondary }}>
            <button
              onClick={() => navigate('/themes')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              Back to Themes
            </button>
            <span>/</span>
            <span>Theme Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Theme Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: themeColors.primaryLight }}
                  >
                    <div style={{ color: themeColors.primary }}>
                      {getPlatformIcon(theme.platform)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-2 py-1 rounded-full">
                        {theme.platform}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#FF9800]">
                        {theme.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3" style={{ color: themeColors.textPrimary }}>
                      {theme.page_name}
                    </h1>
                    <p className="text-lg text-[#757575] mb-2">@{theme.username}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: themeColors.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{theme.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{formatFollowers(theme.no_of_followers)} followers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Added {new Date(theme.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website Link */}
                {theme.page_website && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.textPrimary }}>
                      Website
                    </h3>
                    <a
                      href={theme.page_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      <ExternalLink size={16} />
                      {theme.page_website}
                    </a>
                  </div>
                )}

                {/* Collaboration Details */}
                {theme.collaboration && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.textPrimary }}>
                      Collaboration Details
                    </h3>
                    <div className="prose max-w-none" style={{ color: themeColors.textSecondary }}>
                      <p>{theme.collaboration}</p>
                    </div>
                  </div>
                )}

                {/* Pricing Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                    Pricing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Reel (Without Tagging/Collaboration)</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.success }}>
                        {formatPrice(theme.price_reel_without_tagging_collaboration)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Reel (With Tagging/Collaboration)</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.success }}>
                        {formatPrice(theme.price_reel_with_tagging_collaboration)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Reel (With Tagging)</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.success }}>
                        {formatPrice(theme.price_reel_with_tagging)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Video Minutes Allowed</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.primary }}>
                        {theme.video_minute_allowed || 'N/A'} min
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Pin Post (Weekly)</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.success }}>
                        {formatPrice(theme.pin_post_charges_week)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Story Charges</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.success }}>
                        {formatPrice(theme.story_charges)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-sm text-[#757575] mb-1">Story with Reel</div>
                      <div className="text-xl font-bold" style={{ color: themeColors.success }}>
                        {formatPrice(theme.story_with_reel_charges)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Price Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
                    {formatPrice(theme.price_reel_without_tagging_collaboration)}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                    Starting Price
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>Platform</span>
                    <span className="font-medium" style={{ color: themeColors.textPrimary }}>
                      {theme.platform}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>Category</span>
                    <span className="font-medium" style={{ color: themeColors.textPrimary }}>
                      {theme.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>Followers</span>
                    <span className="font-medium" style={{ color: themeColors.textPrimary }}>
                      {formatFollowers(theme.no_of_followers)}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: themeColors.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? 'Processing...' : (isAuthenticated ? 'Place Order' : 'Sign In to Order')}
                </button>
              </div>


              {/* Theme Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                  Theme Overview
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Platform</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {theme.platform}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Category</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {theme.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Followers</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {formatFollowers(theme.no_of_followers)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Location</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {theme.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Actions */}
      <section className="px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: themeColors.borderLight,
                color: themeColors.textSecondary
              }}
            >
              <Share size={16} style={{ color: themeColors.primary }} />
              <span style={{ color: themeColors.textSecondary }}>Share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Related Themes */}
      {relatedThemes.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8" style={{ color: themeColors.textPrimary }}>
              Related Themes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedThemes.map((relatedTheme, index) => (
                <motion.div
                  key={relatedTheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => navigate(`/themes/${relatedTheme.id}`)}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div style={{ color: themeColors.primary }}>
                        {getPlatformIcon(relatedTheme.platform)}
                      </div>
                      <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-2 py-1 rounded-full">
                        {relatedTheme.platform}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: themeColors.textPrimary }}>
                      {relatedTheme.page_name}
                    </h3>
                    <p className="text-sm text-[#757575] mb-2">@{relatedTheme.username}</p>
                    <div className="flex items-center text-sm text-[#757575] mb-3">
                      <Users size={14} className="mr-1" />
                      <span>{formatFollowers(relatedTheme.no_of_followers)}</span>
                    </div>
                    <div className="text-sm font-medium" style={{ color: themeColors.success }}>
                      From {formatPrice(relatedTheme.price_reel_without_tagging_collaboration)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

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
            backgroundColor: themeColors.background,
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
              borderBottom: `1px solid ${themeColors.borderLight}`,
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: themeColors.textPrimary }}>
                Place Order
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: themeColors.textSecondary,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.backgroundSoft}
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
                backgroundColor: themeColors.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: themeColors.textPrimary
                }}>
                  {theme.page_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: themeColors.textSecondary }}>Total Amount:</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: themeColors.success }}>
                    {formatPrice(theme.price_reel_without_tagging_collaboration)}
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
                      color: themeColors.textPrimary,
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
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: themeColors.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
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
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: themeColors.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
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
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: themeColors.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
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
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: themeColors.background,
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
              borderTop: `1px solid ${themeColors.borderLight}`,
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: themeColors.backgroundSoft,
                  color: themeColors.textPrimary,
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
                  backgroundColor: themeColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={isOrdering}
                onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
              >
                {isOrdering ? 'Processing...' : 'Book Collaboration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDetailPage;