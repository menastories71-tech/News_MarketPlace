import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import ReCAPTCHA from 'react-google-recaptcha';
import countryPhoneData from '../data/countryPhoneData.js';
import {
  ArrowLeft, Package, MapPin, Building, Globe, DollarSign,
  FileText, ExternalLink, CheckCircle, ShoppingCart,
  Eye, Star, Calendar, Users, Heart, Share
} from 'lucide-react';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import { getIdFromSlug } from '../utils/slugify';
import Icon from '../components/common/Icon';
// Removed ShareButtons import to implement manually

const PressPackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [pressPack, setPressPack] = useState(null);
  const [includedPublications, setIncludedPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState({
    name: '',
    whatsapp_country_code: '+91',
    whatsapp_number: '',
    calling_country_code: '+91',
    calling_number: '',
    press_release_type: [], // multi check options: company/project, individual/brand
    email: '',
    company_registration_document: null,
    letter_of_authorisation: null,
    image: null,
    word_pdf_document: null,
    submitted_by_type: 'agency', // agency or direct
    press_release_selection: '',
    package_selection: '',
    message: '',
    captcha: '',
    terms_accepted: false,
    content_writing_assistance: 'required' // required or not_required
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [pressReleases, setPressReleases] = useState([]);
  const recaptchaRef = useRef(null);

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
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
        className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200 p-3 
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
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-sm"
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

  useEffect(() => {
    if (id) {
      fetchPressPackDetails();
    }
    fetchPressReleases();
  }, [id]);

  const fetchPressPackDetails = async () => {
    try {
      setLoading(true);
      const realId = getIdFromSlug(id);
      console.log('Fetching press pack details for ID:', realId);

      const response = await api.get(`/admin/press-releases/${realId}`);
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

  const fetchPressReleases = async () => {
    try {
      const response = await api.get('/admin/press-releases?page=1&limit=100');
      setPressReleases(response.data.pressReleases || []);
    } catch (error) {
      console.error('Error fetching press releases:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return t('pressPackDetail.contactForPricing');
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
        alert(t('pressPackDetail.actions.linkCopied'));
      }).catch(() => {
        // Ultimate fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(t('pressPackDetail.actions.linkCopied'));
      });
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
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append('name', purchaseFormData.name);
      formDataToSend.append('whatsapp_country_code', purchaseFormData.whatsapp_country_code);
      formDataToSend.append('whatsapp_number', purchaseFormData.whatsapp_number);
      formDataToSend.append('calling_country_code', purchaseFormData.calling_country_code);
      formDataToSend.append('calling_number', purchaseFormData.calling_number);
      formDataToSend.append('press_release_type', JSON.stringify(purchaseFormData.press_release_type));
      formDataToSend.append('email', purchaseFormData.email);
      formDataToSend.append('submitted_by_type', purchaseFormData.submitted_by_type);
      formDataToSend.append('press_release_selection', parseInt(purchaseFormData.press_release_selection) || null);
      formDataToSend.append('package_selection', purchaseFormData.package_selection);
      formDataToSend.append('message', purchaseFormData.message);
      formDataToSend.append('captcha_token', recaptchaToken);
      formDataToSend.append('terms_accepted', purchaseFormData.terms_accepted ? 'true' : 'false');
      formDataToSend.append('content_writing_assistance', purchaseFormData.content_writing_assistance);

      // Add file fields
      if (purchaseFormData.company_registration_document) {
        formDataToSend.append('company_registration_document', purchaseFormData.company_registration_document);
      }
      if (purchaseFormData.letter_of_authorisation) {
        formDataToSend.append('letter_of_authorisation', purchaseFormData.letter_of_authorisation);
      }
      if (purchaseFormData.image) {
        formDataToSend.append('image', purchaseFormData.image);
      }
      if (purchaseFormData.word_pdf_document) {
        formDataToSend.append('word_pdf_document', purchaseFormData.word_pdf_document);
      }

      const response = await api.post('/press-pack-orders', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success !== false) {
        alert(t('pressPackDetail.orderSuccess'));
        setShowPurchaseModal(false);
        setPurchaseFormData({
          name: '',
          whatsapp_country_code: '+91',
          whatsapp_number: '',
          calling_country_code: '+91',
          calling_number: '',
          press_release_type: [],
          email: '',
          company_registration_document: null,
          letter_of_authorisation: null,
          image: null,
          word_pdf_document: null,
          submitted_by_type: 'agency',
          press_release_selection: '',
          package_selection: '',
          message: '',
          captcha: '',
          terms_accepted: false,
          content_writing_assistance: 'required'
        });
        setRecaptchaToken('');
      } else {
        throw new Error(response.data.message || t('pressPackDetail.orderFailed'));
      }
    } catch (error) {
      console.error('Error submitting press pack order:', error);
      alert(t('pressPackDetail.orderFailed'));
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
      <div className="min-h-screen" style={{ backgroundColor: themeColors.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-64 bg-slate-200 rounded mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-8 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    <div className="h-10 w-3/4 bg-slate-200 rounded" />
                    <div className="flex gap-6">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="w-32 h-20 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-64 w-full bg-slate-100 rounded-lg" />
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-50 rounded" />
                    <div className="h-4 w-5/6 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-50 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border p-6 space-y-8">
                <div className="h-6 w-1/2 bg-slate-200 rounded" />
                <div className="text-center space-y-3">
                  <div className="h-10 w-1/2 mx-auto bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 mx-auto bg-slate-100 rounded" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 w-full bg-slate-50 rounded" />
                  ))}
                </div>
                <div className="h-12 w-full bg-slate-200 rounded-lg" />
              </div>
              <div className="bg-white rounded-lg border p-6 space-y-3">
                <div className="h-6 w-1/2 bg-slate-200 rounded mb-4" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
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
              {t('pressPackDetail.notFound.title')}
            </h1>
            <p className="mb-8" style={{ color: themeColors.textSecondary }}>
              {t('pressPackDetail.notFound.desc')}
            </p>
            <button
              onClick={() => navigate('/press-packs')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: themeColors.primary }}
            >
              <ArrowLeft size={16} />
              {t('pressPackDetail.notFound.back')}
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
      <SEO
        title={`${pressPack.name} - Press Release Package - News Marketplace`}
        description={pressPack.description || `Get your press release published on ${pressPack.distribution_media_websites}+ websites.`}
        image={pressPack.image}
        type="product"
      />
      <Schema
        type="service"
        data={{
          name: pressPack.name,
          description: pressPack.description,
          areaServed: pressPack.region,
          catalogName: "Press Release Components",
          services: includedPublications.map(pub => ({
            name: pub.publication_name
          }))
        }}
      />
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
              {t('pressPackDetail.breadcrumb.back')}
            </button>
            <span>/</span>
            <span>{t('pressPackDetail.breadcrumb.current')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Pack Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
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
                            <span>{t('pressPackDetail.added')} {new Date(pressPack.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {/* Pack Image on the right */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="w-32 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-2 shadow-sm">
                          <img
                            src={pressPack.image_logo || pressPack.image || '/logo.png'}
                            alt={pressPack.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.src = '/logo.png';
                            }}
                          />
                        </div>
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
                      {t('pressPackDetail.about')}
                    </h3>
                    <div className="prose max-w-none" style={{ color: themeColors.textSecondary }}>
                      <p>{pressPack.description}</p>
                    </div>
                  </div>
                )}

                {/* Press Release Stats */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                    {t('pressPackDetail.overview.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.primary }}>
                        {pressPack.distribution_media_websites || 0}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.overview.mediaWebsites')}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.success }}>
                        {pressPack.guaranteed_media_placements || 0}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.overview.guaranteedPlacements')}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.backgroundSoft }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.warning }}>
                        {pressPack.word_limit || 'N/A'}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.overview.wordLimit')}</div>
                    </div>
                  </div>
                </div>

                {/* Included Publications */}
                {includedPublications.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                      {t('pressPackDetail.includedPublications.title')} ({includedPublications.length})
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
                                <span>{t('pressPackDetail.includedPublications.da')}: {pub.da || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium" style={{ color: themeColors.success }}>
                              ${pub.publication_price || 0}
                            </div>
                            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                              {pub.agreement_tat || 0} {t('pressPackDetail.includedPublications.tat')}
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
                      {t('pressPackDetail.resources.title')}
                    </h3>
                    <a
                      href={pressPack.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      <ExternalLink size={16} />
                      {t('pressPackDetail.resources.button')}
                    </a>
                  </div>
                )}

                {/* Disclaimer */}
                {pressPack.disclaimer && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.textPrimary }}>
                      {t('pressPackDetail.disclaimer.title')}
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
                  {t('pressPackDetail.purchase.title')}
                </h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
                    {formatPrice(pressPack.price)}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                    {t('pressPackDetail.purchase.oneTimePayment')}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} style={{ color: themeColors.success }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {pressPack.distribution_media_websites || 0} {t('pressPackDetail.purchase.mediaWebsitesDistribution')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} style={{ color: themeColors.success }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {pressPack.guaranteed_media_placements || 0} {t('pressPackDetail.purchase.guaranteedPlacements')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} style={{ color: themeColors.success }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {pressPack.word_limit ? `${pressPack.word_limit} ${t('pressPackDetail.purchase.wordLimit')}` : t('pressPackDetail.purchase.flexibleWordCount')}
                    </span>
                  </div>
                  {pressPack.content_writing_assistance && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} style={{ color: themeColors.success }} />
                      <span style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.purchase.contentWritingIncluded')}</span>
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
                  {isAuthenticated ? t('pressPackDetail.purchase.button') : t('pressPackDetail.purchase.signIn')}
                </button>
              </div>

              {/* Package Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary }}>
                  {t('pressPackDetail.details.title')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.details.region')}</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.region}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.details.niche')}</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.niche}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.details.turnaroundTime')}</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.turnaround_time} {t('pressPacks.card.days')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.details.contentWriting')}</span>
                    <span style={{ color: themeColors.textPrimary }} className="font-medium">
                      {pressPack.content_writing_assistance ? t('pressPackDetail.details.included') : t('pressPackDetail.details.notIncluded')}
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
                {isSaved ? t('pressPackDetail.actions.saved') : t('pressPackDetail.actions.save')}
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveShareId(activeShareId === 'pack' ? null : 'pack')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
              >
                <Icon name="share" size={16} />
                <span>{t('common.share', 'Share')}</span>
              </button>
              {renderShareMenu(window.location.href, pressPack?.name || 'Press Pack', 'pack')}
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
                {t('pressPackDetail.form.title')}
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
                <span style={{ color: themeColors.textSecondary }}>{t('pressPackDetail.form.totalAmount')}:</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: themeColors.success }}>
                  {formatPrice(pressPack.price)}
                </span>
              </div>
            </div>

            <form onSubmit={handlePurchaseSubmit}>
              <div className="space-y-4 mb-6">
                {/* 1. Name (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.name')} *
                  </label>
                  <input
                    type="text"
                    value={purchaseFormData.name}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* 2. Whatsapp Number (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.whatsappNumber')} *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={purchaseFormData.whatsapp_country_code}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, whatsapp_country_code: e.target.value })}
                      style={{
                        padding: '10px 8px',
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        backgroundColor: themeColors.background,
                        width: '100px',
                        fontSize: '12px'
                      }}
                    >
                      {Object.entries(countryPhoneData).map(([country, data]) => (
                        <option key={data.code} value={data.code}>
                          {data.code} ({country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={purchaseFormData.whatsapp_number}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, whatsapp_number: e.target.value })}
                      required
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: themeColors.background
                      }}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                {/* 3. Calling Number (Optional) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.callingNumber')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={purchaseFormData.calling_country_code}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, calling_country_code: e.target.value })}
                      style={{
                        padding: '10px 8px',
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        backgroundColor: themeColors.background,
                        width: '100px',
                        fontSize: '12px'
                      }}
                    >
                      {Object.entries(countryPhoneData).map(([country, data]) => (
                        <option key={data.code} value={data.code}>
                          {data.code} ({country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={purchaseFormData.calling_number}
                      onChange={(e) => setPurchaseFormData({ ...purchaseFormData, calling_number: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: `1px solid ${themeColors.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: themeColors.background
                      }}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                {/* 4. Press release for company/ Project, Individual/ Brand (multi check options) (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.typeLabel')} *
                  </label>
                  <div className="space-y-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={purchaseFormData.press_release_type.includes('company')}
                        onChange={(e) => {
                          const current = purchaseFormData.press_release_type;
                          const updated = e.target.checked
                            ? [...current, 'company']
                            : current.filter(item => item !== 'company');
                          setPurchaseFormData({ ...purchaseFormData, press_release_type: updated });
                        }}
                        required={purchaseFormData.press_release_type.length === 0}
                      />
                      <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>{t('pressPackDetail.form.companyProject')}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={purchaseFormData.press_release_type.includes('individual')}
                        onChange={(e) => {
                          const current = purchaseFormData.press_release_type;
                          const updated = e.target.checked
                            ? [...current, 'individual']
                            : current.filter(item => item !== 'individual');
                          setPurchaseFormData({ ...purchaseFormData, press_release_type: updated });
                        }}
                        required={purchaseFormData.press_release_type.length === 0}
                      />
                      <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>{t('pressPackDetail.form.individualBrand')}</span>
                    </label>
                  </div>
                </div>

                {/* 5. email (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.email')} *
                  </label>
                  <input
                    type="email"
                    value={purchaseFormData.email}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                {/* 6. Company registration document upload option (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.companyRegistration')} *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, company_registration_document: e.target.files[0] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {purchaseFormData.company_registration_document && (
                    <div style={{ fontSize: '12px', color: themeColors.textSecondary, marginTop: '4px' }}>
                      Selected: {purchaseFormData.company_registration_document.name}
                    </div>
                  )}
                </div>

                {/* 7. Letter of Authorisation (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.letterOfAuthorisation')} *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, letter_of_authorisation: e.target.files[0] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {purchaseFormData.letter_of_authorisation && (
                    <div style={{ fontSize: '12px', color: themeColors.textSecondary, marginTop: '4px' }}>
                      Selected: {purchaseFormData.letter_of_authorisation.name}
                    </div>
                  )}
                </div>

                {/* 8. Image for the Press release (Optional) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.image')}
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {purchaseFormData.image && (
                    <div style={{ fontSize: '12px', color: themeColors.textSecondary, marginTop: '4px' }}>
                      Selected: {purchaseFormData.image.name}
                    </div>
                  )}
                </div>

                {/* 9. Word or PDF Document upload (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.wordPdf')} *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, word_pdf_document: e.target.files[0] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {purchaseFormData.word_pdf_document && (
                    <div style={{ fontSize: '12px', color: themeColors.textSecondary, marginTop: '4px' }}>
                      Selected: {purchaseFormData.word_pdf_document.name}
                    </div>
                  )}
                </div>

                {/* 10. Submitted by - Agency or Direct Company / Individual (Check option, only one) (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.submittedBy')} *
                  </label>
                  <div className="space-y-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="submitted_by_type"
                        value="agency"
                        checked={purchaseFormData.submitted_by_type === 'agency'}
                        onChange={(e) => setPurchaseFormData({ ...purchaseFormData, submitted_by_type: e.target.value })}
                        required
                      />
                      <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>{t('pressPackDetail.form.agency')}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="submitted_by_type"
                        value="direct"
                        checked={purchaseFormData.submitted_by_type === 'direct'}
                        onChange={(e) => setPurchaseFormData({ ...purchaseFormData, submitted_by_type: e.target.value })}
                        required
                      />
                      <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>{t('pressPackDetail.form.direct')}</span>
                    </label>
                  </div>
                </div>

                {/* 11. Selection of Press Release (Mandatory based on press release selection) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.selectionPressRelease')} *
                  </label>
                  <select
                    value={purchaseFormData.press_release_selection}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, press_release_selection: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('pressPackDetail.form.selectPressRelease')}</option>
                    {pressReleases.map(pressRelease => (
                      <option key={pressRelease.id} value={pressRelease.id}>
                        {pressRelease.name} - {pressRelease.region} - ${pressRelease.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 12. Selection of Press Release Package - Diamond, Titanium, Platinum, Gold, Silver, Bronze, Steel (Mandatory based on press release selection) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.selectionPackage')} *
                  </label>
                  <select
                    value={purchaseFormData.package_selection}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, package_selection: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('pressPackDetail.form.selectPackage')}</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Titanium">Titanium</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Steel">Steel</option>
                  </select>
                </div>

                {/* 13. any message (Optional) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.message')}
                  </label>
                  <textarea
                    value={purchaseFormData.message}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base box-border bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder={t('pressPackDetail.form.messagePlaceholder')}
                  />
                </div>

                {/* 14. captcha (Mandatory) */}
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
                    {t('pressPackDetail.form.captchaHint')} *
                  </div>
                </div>

                {/* 15. terms (Mandatory) */}
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
                      {t('pressPackDetail.form.agreeTo')} <a href="#" style={{ color: themeColors.primary, textDecoration: 'underline' }}>{t('pressPackDetail.form.termsAndConditions')}</a> {t('pressPackDetail.form.and')} <a href="#" style={{ color: themeColors.primary, textDecoration: 'underline' }}>{t('pressPackDetail.form.privacyPolicy')}</a> *
                    </span>
                  </label>
                </div>

                {/* 16. submit (Mandatory) - This is the submit button below */}

                {/* 17. Content writing assistance - Required, not required (Mandatory) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: themeColors.textPrimary,
                    marginBottom: '6px'
                  }}>
                    {t('pressPackDetail.form.contentWritingAssistance')} *
                  </label>
                  <div className="space-y-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="content_writing_assistance"
                        value="required"
                        checked={purchaseFormData.content_writing_assistance === 'required'}
                        onChange={(e) => setPurchaseFormData({ ...purchaseFormData, content_writing_assistance: e.target.value })}
                        required
                      />
                      <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>{t('pressPackDetail.form.required')}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="content_writing_assistance"
                        value="not_required"
                        checked={purchaseFormData.content_writing_assistance === 'not_required'}
                        onChange={(e) => setPurchaseFormData({ ...purchaseFormData, content_writing_assistance: e.target.value })}
                        required
                      />
                      <span style={{ fontSize: '14px', color: themeColors.textPrimary }}>{t('pressPackDetail.form.notRequired')}</span>
                    </label>
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
                  {t('pressPackDetail.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white border border-blue-600 rounded-lg font-semibold text-sm sm:text-base cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPurchasing}
                >
                  {isPurchasing ? t('pressPackDetail.form.processing') : t('pressPackDetail.form.submit')}
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