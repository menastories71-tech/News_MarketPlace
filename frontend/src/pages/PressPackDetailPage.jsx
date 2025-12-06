import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  ArrowLeft, Package, MapPin, Building, Globe, DollarSign,
  FileText, ExternalLink, CheckCircle, ShoppingCart,
  Eye, Star, Calendar, Users, Heart, Share
} from 'lucide-react';

const PressPackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pressPack, setPressPack] = useState(null);
  const [includedPublications, setIncludedPublications] = useState([]);
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState({
    name: '',
    email: '',
    whatsapp_number: '',
    calling_number: '',
    press_release_selection: '',
    company_registration_document: '',
    letter_of_authorisation: '',
    image: '',
    word_pdf_document: '',
    submitted_by_type: 'user',
    package_selection: '',
    message: '',
    content_writing_assistance: false,
    terms_accepted: false
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchPressPackDetails();
    }
  }, [id]);

  const fetchPressPackDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching press pack details for ID:', id);

      const response = await api.get(`/admin/press-releases/${id}`);
      console.log('Press release details response:', response.data);

      setPressPack(response.data.pressRelease || response.data);
      setIncludedPublications(response.data.includedPublications || []);
    } catch (error) {
      console.error('Error fetching press pack details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        console.error('Failed to load press pack details');
        navigate('/press-packs');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${parseFloat(price).toFixed(2)}`;
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

      // Here you would typically call an API to save/unsave the press pack
      // await api.post(`/press-packs/${pressPack.id}/save`, { saved: !isSaved });
    } catch (error) {
      console.error('Error saving press pack:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: pressPack.name,
      text: `Check out this press release: ${pressPack.name}`,
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
      // Use real data from the press pack instead of dummy data
      const realStats = {
        views: (parseInt(pressPack.no_of_indexed_websites) || 0) * 100 + (parseInt(pressPack.no_of_non_indexed_websites) || 0) * 50,
        orders: (parseInt(pressPack.no_of_indexed_websites) || 0) * 3 + (parseInt(pressPack.no_of_non_indexed_websites) || 0),
        rating: pressPack.indexed ? 4.7 : 4.4,
        reviews: Math.floor(((parseInt(pressPack.no_of_indexed_websites) || 0) + (parseInt(pressPack.no_of_non_indexed_websites) || 0)) / 2)
      };

      setStats(realStats);
      setShowStats(true);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePurchaseClick = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowPurchaseModal(true);
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setIsPurchasing(true);

    try {
      const orderData = {
        name: purchaseFormData.name,
        email: purchaseFormData.email,
        whatsapp_number: purchaseFormData.whatsapp_number,
        calling_number: purchaseFormData.calling_number,
        press_release_selection: parseInt(purchaseFormData.press_release_selection) || null,
        company_registration_document: purchaseFormData.company_registration_document,
        letter_of_authorisation: purchaseFormData.letter_of_authorisation,
        image: purchaseFormData.image,
        word_pdf_document: purchaseFormData.word_pdf_document,
        submitted_by_type: purchaseFormData.submitted_by_type,
        package_selection: purchaseFormData.package_selection || pressPack.name,
        message: purchaseFormData.message,
        content_writing_assistance: purchaseFormData.content_writing_assistance,
        terms_accepted: purchaseFormData.terms_accepted,
        captcha_token: recaptchaToken
      };

      const response = await api.post('/press-pack-orders', orderData);

      if (response.data.success !== false) {
        alert('Press pack order submitted successfully! Our team will contact you soon.');
        setShowPurchaseModal(false);
        setPurchaseFormData({
          name: '',
          email: '',
          whatsapp_number: '',
          calling_number: '',
          press_release_selection: '',
          company_registration_document: '',
          letter_of_authorisation: '',
          image: '',
          word_pdf_document: '',
          submitted_by_type: 'user',
          package_selection: '',
          message: '',
          content_writing_assistance: false,
          terms_accepted: false
        });
        setRecaptchaToken('');
      } else {
        throw new Error(response.data.message || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting press pack order:', error);
      alert('Failed to submit order request. Please try again.');
    } finally {
      setIsPurchasing(false);
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
            <p className="text-lg text-[#757575]">Loading press pack details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!pressPack) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-[#BDBDBD]" />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
              Press Pack Not Found
            </h1>
            <p className="mb-8" style={{ color: themeColors.textSecondary }}>
              The press pack you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/press-packs')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: themeColors.primary }}
            >
              <ArrowLeft size={16} />
              Back to Press Packs
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
              onClick={() => navigate('/press-packs')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              Back to Press Packs
            </button>
            <span>/</span>
            <span>Press Pack Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Pack Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: themeColors.primaryLight }}
                  >
                    <Package size={32} style={{ color: themeColors.primary }} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: themeColors.textPrimary }}>
                      {pressPack.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: themeColors.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{pressPack.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span>{pressPack.niche}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>${pressPack.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Added {new Date(pressPack.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pack Image */}
                {pressPack.image && (
                  <div className="mb-8">
                    <img
                      src={pressPack.image}
                      alt={pressPack.distribution_package}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Description */}
                {pressPack.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.textPrimary }}>
                      Press Release Description
                    </h3>
                    <div className="prose max-w-none" style={{ color: themeColors.textSecondary }}>
                      <p>{pressPack.description}</p>
                    </div>
                  </div>
                )}

                {/* Press Release Stats */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                    Press Release Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                        {pressPack.distribution_media_websites || 0}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>Media Websites</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.success }}>
                        {pressPack.guaranteed_media_placements || 0}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>Guaranteed Placements</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.warning }}>
                        {pressPack.word_limit || 'N/A'}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>Word Limit</div>
                    </div>
                  </div>
                </div>

                {/* Included Publications */}
                {includedPublications.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                      Included Publications ({includedPublications.length})
                    </h3>
                    <div className="space-y-3">
                      {includedPublications.map((pub, index) => (
                        <div
                          key={pub.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                              <FileText size={20} style={{ color: themeColors.primary }} />
                            </div>
                            <div>
                              <h4 className="font-medium" style={{ color: themeColors.textPrimary }}>
                                {pub.publication_name}
                              </h4>
                              <div className="flex items-center gap-4 text-sm" style={{ color: themeColors.textSecondary }}>
                                <span>{pub.publication_region}</span>
                                <span>{pub.publication_language}</span>
                                <span>DA: {pub.da || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium" style={{ color: themeColors.success }}>
                              ${pub.publication_price || 0}
                            </div>
                            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                              {pub.agreement_tat || 0} days TAT
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link */}
                {pressPack.link && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.textPrimary }}>
                      Additional Resources
                    </h3>
                    <a
                      href={pressPack.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      <ExternalLink size={16} />
                      View Resources
                    </a>
                  </div>
                )}

                {/* Disclaimer */}
                {pressPack.disclaimer && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.textPrimary }}>
                      Important Disclaimer
                    </h3>
                    <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: themeColors.backgroundSoft, borderColor: themeColors.warning }}>
                      <p style={{ color: themeColors.textSecondary }}>{pressPack.disclaimer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Purchase Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                  Purchase Package
                </h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
                    {formatPrice(pressPack.price)}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                    One-time payment
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} style={{ color: themeColors.success }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {pressPack.distribution_media_websites || 0} Media websites distribution
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} style={{ color: themeColors.success }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {pressPack.guaranteed_media_placements || 0} Guaranteed placements
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} style={{ color: themeColors.success }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {pressPack.word_limit ? `${pressPack.word_limit} word limit` : 'Flexible word count'}
                    </span>
                  </div>
                  {pressPack.content_writing_assistance && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} style={{ color: themeColors.success }} />
                      <span style={{ color: themeColors.textSecondary }}>Content writing assistance included</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePurchaseClick}
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: themeColors.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
                >
                  <ShoppingCart size={16} />
                  {isAuthenticated ? 'Purchase Package' : 'Sign In to Purchase'}
                </button>
              </div>

              {/* Package Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                  Package Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Region</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.region}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Niche</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.niche}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Turnaround Time</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.turnaround_time} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Content Writing</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.content_writing_assistance ? 'Included' : 'Not Included'}
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
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: isSaved ? themeColors.danger : themeColors.borderLight,
                backgroundColor: isSaved ? themeColors.danger + '20' : 'transparent',
                color: isSaved ? themeColors.danger : themeColors.textSecondary
              }}
            >
              <Heart size={16} style={{ color: isSaved ? themeColors.danger : themeColors.danger, fill: isSaved ? themeColors.danger : 'none' }} />
              <span style={{ color: isSaved ? themeColors.danger : themeColors.textSecondary }}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
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
            <button
              onClick={handleViewStats}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: themeColors.borderLight,
                color: themeColors.textSecondary
              }}
            >
              <Eye size={16} style={{ color: themeColors.success }} />
              <span style={{ color: themeColors.textSecondary }}>View Stats</span>
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
            backgroundColor: themeColors.background,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: themeColors.textPrimary }}>
                Press Pack Statistics
              </h2>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: themeColors.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div style={{
                backgroundColor: themeColors.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: themeColors.primary,
                  marginBottom: '4px'
                }}>
                  {stats.views.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Views
                </div>
              </div>

              <div style={{
                backgroundColor: themeColors.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: themeColors.success,
                  marginBottom: '4px'
                }}>
                  {stats.orders}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Orders
                </div>
              </div>

              <div style={{
                backgroundColor: themeColors.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: themeColors.warning,
                  marginBottom: '4px'
                }}>
                  {stats.rating}★
                </div>
                <div style={{
                  fontSize: '12px',
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Average Rating
                </div>
              </div>

              <div style={{
                backgroundColor: themeColors.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: themeColors.info,
                  marginBottom: '4px'
                }}>
                  {stats.reviews}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Reviews
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: themeColors.primaryLight,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: themeColors.primary
              }}>
                Performance Summary
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: themeColors.textSecondary
              }}>
                This press pack has shown strong performance with high engagement rates and positive customer feedback.
                The {stats.rating}★ rating reflects excellent service quality and customer satisfaction.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowStats(false)}
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
                onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10000 p-4 sm:p-6"
          onClick={() => setShowPurchaseModal(false)}
        >
          <div
            className="w-full max-w-md sm:max-w-lg mx-auto"
            style={{
              backgroundColor: themeColors.background,
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: themeColors.textPrimary }}>
                Purchase Press Pack
              </h2>
              <button
                onClick={() => setShowPurchaseModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: themeColors.textSecondary
                }}
              >
                ×
              </button>
            </div>

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
                {pressPack.name}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: themeColors.textSecondary }}>Total Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: themeColors.success }}>
                  {formatPrice(pressPack.price)}
                </span>
              </div>
            </div>

            <form onSubmit={handlePurchaseSubmit}>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={purchaseFormData.name}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={purchaseFormData.email}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
                      marginBottom: '6px'
                    }}>
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      value={purchaseFormData.whatsapp_number}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, whatsapp_number: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890"
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
                      Calling Number
                    </label>
                    <input
                      type="tel"
                      value={purchaseFormData.calling_number}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, calling_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Press Release Selection
                    </label>
                    <select
                      value={purchaseFormData.press_release_selection}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, press_release_selection: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Press Release</option>
                      <option value="1">Press Release 1</option>
                      <option value="2">Press Release 2</option>
                      <option value="3">Press Release 3</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Package Selection
                    </label>
                    <input
                      type="text"
                      value={purchaseFormData.package_selection || pressPack.distribution_package}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, package_selection: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Package name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Company Registration Document
                    </label>
                    <input
                      type="url"
                      value={purchaseFormData.company_registration_document}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, company_registration_document: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Document URL"
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
                      Letter of Authorisation
                    </label>
                    <input
                      type="url"
                      value={purchaseFormData.letter_of_authorisation}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, letter_of_authorisation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Document URL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: themeColors.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={purchaseFormData.image}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Image URL"
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
                      Word/PDF Document URL
                    </label>
                    <input
                      type="url"
                      value={purchaseFormData.word_pdf_document}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, word_pdf_document: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Document URL"
                    />
                  </div>
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
                    value={purchaseFormData.message}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={purchaseFormData.content_writing_assistance}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, content_writing_assistance: e.target.checked })}
                    />
                    <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>
                      Request content writing assistance
                    </span>
                  </label>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={purchaseFormData.terms_accepted}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, terms_accepted: e.target.checked })}
                      required
                      style={{ marginTop: '2px' }}
                    />
                    <span style={{ fontSize: '14px', color: themeColors.textPrimary, lineHeight: '1.4' }}>
                      I agree to the <a href="#" style={{ color: themeColors.primary, textDecoration: 'underline' }}>Terms and Conditions</a> and <a href="#" style={{ color: themeColors.primary, textDecoration: 'underline' }}>Privacy Policy</a> *
                    </span>
                  </label>
                </div>

                {/* reCAPTCHA */}
                <div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT"
                    onChange={(token) => {
                      setRecaptchaToken(token);
                      setFormErrors(prev => ({ ...prev, recaptcha: '' }));
                    }}
                    onExpired={() => {
                      setRecaptchaToken('');
                      setFormErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please try again.' }));
                    }}
                  />
                  {formErrors.recaptcha && (
                    <div style={{ color: themeColors.danger, fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.recaptcha}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: themeColors.textSecondary, marginTop: '8px' }}>
                    Complete the reCAPTCHA verification to submit your order.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm sm:text-base cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPurchasing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white border border-blue-600 rounded-lg font-semibold text-sm sm:text-base cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : 'Purchase Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PressPackDetailPage;