import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Radio, ArrowLeft, Globe, MapPin, User, ExternalLink, MessageSquare, Link as LinkIcon, Share2, Instagram } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';

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

const RadioDetails = () => {
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [radio, setRadio] = useState(null);
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
      const response = await api.get(`/radios/${id}`);
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
        radioId: radio.id,
        radioName: radio.radio_name,
        customerInfo: orderFormData,
        orderDate: new Date().toISOString()
      };

      // Submit order to backend
      const response = await api.post('/radio-orders', orderData);

      if (response.data.success) {
        alert('Radio interview booking request submitted successfully! Our team will contact you soon.');
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

  const openLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2] mx-auto mb-4"></div>
            <p className="text-[#757575]">Loading radio details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (error || !radio) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Radio not found'}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-[#1565C0] transition-colors"
            >
              Back to Radio Stations
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Back Button */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#1976D2] hover:text-[#1565C0] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Radio Stations
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#212121] mb-4">
              {radio.radio_name}
            </h1>
            <div className="flex justify-center mb-6">
              <span className="text-xl font-medium text-[#1976D2] bg-[#E3F2FD] px-6 py-2 rounded-full">
                {radio.frequency}
              </span>
            </div>
            <div className="flex justify-center">
              <img
                src={radio.image_url || "/logo.png"}
                alt={radio.radio_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = "/logo.png";
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Frequency and Basic Info */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-[#212121] mb-6 flex items-center gap-2">
                    <Radio className="w-6 h-6 text-[#1976D2]" />
                    Station Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#1976D2] mb-2">
                        {radio.frequency}
                      </div>
                      <div className="text-sm text-[#757575]">Frequency</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#00796B] mb-2">
                        {radio.radio_language}
                      </div>
                      <div className="text-sm text-[#757575]">Language</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#9C27B0] mb-2">
                        {radio.emirate_state}
                      </div>
                      <div className="text-sm text-[#757575]">Emirate</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FAFAFA]">
                      <div className="text-2xl font-bold text-[#FF9800] mb-2">
                        {radio.radio_popular_rj || 'N/A'}
                      </div>
                      <div className="text-sm text-[#757575]">Popular RJ</div>
                    </div>
                  </div>
                </div>

                {/* External Links */}
                {(radio.radio_website || radio.radio_linkedin || radio.radio_instagram) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                      External Links
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {radio.radio_website && (
                        <a
                          href={radio.radio_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                        >
                          <Globe size={16} />
                          Visit Website
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {radio.radio_linkedin && (
                        <a
                          href={radio.radio_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#00796B] text-white hover:bg-[#004D40]"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {radio.radio_instagram && (
                        <a
                          href={radio.radio_instagram}
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
                {radio.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-[#212121]">
                      About This Station
                    </h3>
                    <div className="p-4 rounded-lg border bg-[#FAFAFA]">
                      <p className="text-[#757575]">{radio.description}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Station Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                  Station Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Frequency</span>
                    <span className="font-medium text-[#212121]">{radio.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Language</span>
                    <span className="font-medium text-[#212121]">{radio.radio_language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Emirate</span>
                    <span className="font-medium text-[#212121]">{radio.emirate_state}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Popular RJ</span>
                    <span className="font-medium text-[#212121]">{radio.radio_popular_rj || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                    onClick={handlePlaceOrder}
                    disabled={isOrdering}
                  >
                    {isOrdering ? 'Processing...' : (isAuthenticated ? 'Place Order' : 'Sign In to Order')}
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: radio.radio_name,
                          text: `Check out ${radio.radio_name} on ${radio.frequency}`,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors bg-[#9C27B0] hover:bg-[#7B1FA2]"
                  >
                    <Share2 size={16} />
                    Share Station
                  </button>

                  <button
                    onClick={handleBack}
                    className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors bg-[#757575] hover:bg-[#616161]"
                  >
                    <ArrowLeft size={16} />
                    Back to Stations
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
                  {radio.radio_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>Radio Station:</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primary }}>
                    {radio.frequency}
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
                {isOrdering ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioDetails;

                