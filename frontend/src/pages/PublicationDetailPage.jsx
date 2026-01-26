import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, Globe, BookOpen, Star, ExternalLink, Shield,
  Link as LinkIcon, Image as ImageIcon, FileText, CheckCircle,
  DollarSign, Clock, BarChart3, Target, Award, TrendingUp,
  MapPin, Calendar, Users, Zap, Eye, Heart, Share,
  Instagram, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { getIdFromSlug } from '../utils/slugify';

// Updated theme colors matching the color pal
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

const PublicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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
      fetchPublicationDetails();
    }
  }, [id]);

  const fetchPublicationDetails = async () => {
    try {
      setLoading(true);
      const realId = getIdFromSlug(id);
      console.log('Fetching publication details for ID:', realId);

      const response = await api.get(`/admin/publication-management/${realId}`);
      console.log('Publication details response:', response.data);

      setPublication(response.data.publication || response.data);
    } catch (error) {
      console.error('Error fetching publication details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        // Handle error - maybe navigate back or show error message
        console.error('Failed to load publication details');
        navigate('/publications');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice > 0 ? `$${numPrice.toFixed(2)}` : t('publicationDetail.sidebar.contactPricing');
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

      // Here you would typically call an API to save/unsave the publication
      // await api.post(`/publications/${id}/save`, { saved: !isSaved });
    } catch (error) {
      console.error('Error saving publication:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: publication.publication_name,
      text: `Check out this publication: ${publication.publication_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(t('publicationDetail.actions.linkCopied'));
      }).catch(() => {
        // Ultimate fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(t('publicationDetail.actions.linkCopied'));
      });
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
        publicationId: publication.id,
        publicationName: publication.publication_name,
        price: publication.price_usd,
        customerInfo: orderFormData,
        orderDate: new Date().toISOString()
      };

      // Submit order to backend
      const response = await api.post('/orders', orderData);

      if (response.data.success) {
        alert(t('publicationDetail.orderModal.success'));
        setShowOrderModal(false);
        setOrderFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(response.data.message || t('publicationDetail.orderModal.error'));
      }

    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting booking request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsOrdering(false);
    }
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>{t('publicationDetail.loading')}</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Globe size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              {t('publicationDetail.notFound.title')}
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {t('publicationDetail.notFound.desc')}
            </p>
            <button
              onClick={() => navigate('/publications')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              Back to Publications
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
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: theme.textSecondary }}>
            <button
              onClick={() => navigate('/publications')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              <ArrowLeft size={16} />
              {t('publicationDetail.backToPublications')}
            </button>
            <span>/</span>
            <span>{t('publicationDetail.title')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Publication Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-32 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                    {publication.image ? (
                      <img
                        src={publication.image}
                        alt={publication.publication_name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.src = '/logo.png';
                        }}
                      />
                    ) : (
                      <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-12 h-12 object-contain opacity-50"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                      {publication.publication_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{publication.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>{publication.language}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{t('publicationDetail.addedOn', { date: formatDate(publication.created_at) })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website Link */}
                {publication.publication_url && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('publicationDetail.website')}
                    </h3>
                    <a
                      href={publication.publication_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <ExternalLink size={16} />
                      {publication.publication_url}
                    </a>
                  </div>
                )}

                {/* Description/About */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('publicationDetail.about')}
                  </h3>
                  <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                    <p>
                      {publication.other_remarks || t('publicationDetail.defaultDescription')}
                    </p>
                    {publication.publication_primary_focus && (
                      <p className="mt-4">
                        <strong>{t('publicationDetail.industryFocus')}</strong> {publication.publication_primary_focus}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features & Specifications */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    {t('publicationDetail.features.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>{t('publicationDetail.features.content')}</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        <li className="flex items-center gap-2">
                          <FileText size={14} />
                          <span>{t('publicationDetail.features.wordLimit')} {publication.word_limit ? `${publication.word_limit} ${t('publicationDetail.features.words')}` : t('publicationDetail.features.na')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ImageIcon size={14} />
                          <span>{t('publicationDetail.features.images')} {publication.image_count || 0} {t('publicationDetail.features.needed')}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>{t('publicationDetail.features.services')}</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={14} style={{ color: theme.success }} />
                          <span>{publication.sponsored_or_not ? t('publicationDetail.features.sponsored') : t('publicationDetail.features.editorial')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{t('publicationDetail.features.tat')} {publication.committed_tat || 0} {t('publicationDetail.features.days')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield size={14} />
                          <span>{publication.live_on_platform ? t('publicationDetail.features.livePlatform') : t('publicationDetail.features.standardService')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Example Article */}
                {publication.article_reference_link && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('publicationDetail.exampleArticle.title')}
                    </h3>
                    <a
                      href={publication.article_reference_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.success }}
                    >
                      <ExternalLink size={16} />
                      {t('publicationDetail.exampleArticle.button')}
                    </a>
                  </div>
                )}

                {/* Social Media Links */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('publicationDetail.socialMedia')}
                  </h3>
                  <div className="flex items-center gap-2">
                    {publication.instagram && (
                      <a
                        href={publication.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="Instagram"
                      >
                        <Instagram size={16} style={{ color: '#E4405F' }} />
                      </a>
                    )}
                    {!publication.instagram && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Instagram size={16} style={{ color: '#E4405F' }} />
                      </div>
                    )}

                    {publication.facebook && (
                      <a
                        href={publication.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="Facebook"
                      >
                        <Facebook size={16} style={{ color: '#1877F2' }} />
                      </a>
                    )}
                    {!publication.facebook && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Facebook size={16} style={{ color: '#1877F2' }} />
                      </div>
                    )}

                    {publication.twitter && (
                      <a
                        href={publication.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="X (Twitter)"
                      >
                        <Twitter size={16} style={{ color: '#000000' }} />
                      </a>
                    )}
                    {!publication.twitter && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Twitter size={16} style={{ color: '#000000' }} />
                      </div>
                    )}

                    {publication.linkedin && (
                      <a
                        href={publication.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="LinkedIn"
                      >
                        <Linkedin size={16} style={{ color: '#0077B5' }} />
                      </a>
                    )}
                    {!publication.linkedin && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Linkedin size={16} style={{ color: '#0077B5' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags/Badges */}
                {publication.tags_badges && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('publicationDetail.tags')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {publication.tags_badges.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: theme.primaryLight, color: theme.primaryDark }}
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excluding Categories */}
                {publication.excluding_categories && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('publicationDetail.guidelines.title')}
                    </h3>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.backgroundSoft }}>
                      <h4 className="font-medium mb-2" style={{ color: theme.textPrimary }}>
                        {t('publicationDetail.guidelines.excluding')}
                      </h4>
                      <p style={{ color: theme.textSecondary }}>{publication.excluding_categories}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Price Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2" style={{ color: theme.success }}>
                    {formatPrice(publication.price_usd)}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {publication.price_usd > 0 ? t('publicationDetail.sidebar.startingPrice') : t('publicationDetail.sidebar.contactPricing')}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('publicationDetail.sidebar.tat')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publication.committed_tat || 0} {t('publicationDetail.features.days')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('publicationDetail.sidebar.language')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publication.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('publicationDetail.sidebar.region')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publication.region}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? t('publicationDetail.sidebar.processing') : (isAuthenticated ? t('publicationDetail.sidebar.placeOrder') : t('publicationDetail.sidebar.signInOrder'))}
                </button>
              </div>

              {/* SEO Metrics */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('publicationDetail.seo.title')}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.primary }}>
                      {publication.da || 0}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('publicationDetail.seo.da')}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.success }}>
                      {publication.dr || 0}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('publicationDetail.seo.dr')}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-lg font-bold mb-1" style={{ color: publication.do_follow ? '#4CAF50' : '#F44336' }}>
                      {publication.do_follow ? t('publicationDetail.yes') : t('publicationDetail.no')}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('publicationDetail.seo.opinion')}</div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('publicationDetail.quickInfo.title')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Award size={16} style={{ color: theme.info }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('publicationDetail.quickInfo.grade')} {publication.publication_grade || t('publicationDetail.quickInfo.standard')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: theme.success }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('publicationDetail.quickInfo.newsIndex')} {publication.website_news_index || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: theme.secondary }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('publicationDetail.quickInfo.group')} {publication.group_name || t('publicationDetail.quickInfo.independent')}
                    </span>
                  </div>
                  {publication.publication_sn && (
                    <div className="flex items-center gap-2">
                      <Target size={16} style={{ color: theme.warning }} />
                      <span style={{ color: theme.textSecondary }}>
                        {t('publicationDetail.quickInfo.sn')} {publication.publication_sn}
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
                {isSaved ? t('publicationDetail.actions.saved') : t('publicationDetail.actions.save')}
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
              <span style={{ color: theme.textSecondary }}>{t('publicationDetail.actions.share')}</span>
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
                {t('publicationDetail.orderModal.title')}
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
                  {publication.publication_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>{t('publicationDetail.orderModal.totalAmount')}</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: theme.success }}>
                    {formatPrice(publication.price_usd)}
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
                      {t('publicationDetail.orderModal.fullName')}
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
                      {t('publicationDetail.orderModal.email')}
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
                      {t('publicationDetail.orderModal.phone')}
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
                      {t('publicationDetail.orderModal.message')}
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
                      placeholder={t('publicationDetail.orderModal.messagePlaceholder')}
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
                {t('publicationDetail.orderModal.cancel')}
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
                {isOrdering ? t('publicationDetail.sidebar.processing') : t('publicationDetail.orderModal.checkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationDetailPage;

