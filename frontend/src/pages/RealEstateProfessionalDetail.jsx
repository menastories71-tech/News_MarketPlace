import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import ReCAPTCHA from 'react-google-recaptcha';
import countryPhoneData from '../data/countryPhoneData.js';
import worldLanguages from '../data/languagesData.js';
import {
  ArrowLeft, Globe, User, Star, ExternalLink, Shield,
  Link as LinkIcon, Image as ImageIcon, FileText, CheckCircle,
  DollarSign, Clock, BarChart3, Target, Award, TrendingUp,
  MapPin, Calendar, Users, Zap, Eye, Heart, Share,
  Languages, Building, UserCheck, Crown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getIdFromSlug } from '../utils/slugify';

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

const RealEstateProfessionalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  // Order form state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_whatsapp_country_code: '+91',
    customer_whatsapp_number: '',
    customer_calling_country_code: '+91',
    customer_calling_number: '',
    budget_range: '',
    influencers_required: '',
    gender_required: 'Both',
    languages_required: [],
    min_followers: '',
    message: '',
    captcha_token: '',
    terms_accepted: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchProfessionalDetails();
    }
  }, [id]);


  const fetchProfessionalDetails = async () => {
    try {
      setLoading(true);
      const realId = getIdFromSlug(id);
      console.log('Fetching professional details for ID:', realId);

      const response = await api.get(`/real-estate-professionals/${realId}`);
      console.log('Professional details response:', response.data);

      setProfessional(response.data.professional || response.data);
    } catch (error) {
      console.error('Error fetching professional details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        // Handle error - maybe navigate back or show error message
        console.error('Failed to load professional details');
        navigate('/creators');
      }
    } finally {
      setLoading(false);
    }
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

      // Here you would typically call an API to save/unsave the professional
      // await api.post(`/real-estate-professionals/${id}/save`, { saved: !isSaved });
    } catch (error) {
      console.error('Error saving professional:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: `${professional.first_name} ${professional.last_name}`,
      text: `Check out this Creator: ${professional.first_name} ${professional.last_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(t('realEstateProfessionalDetail.actions.linkCopied'));
      }).catch(() => {
        // Ultimate fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(t('realEstateProfessionalDetail.actions.linkCopied'));
      });
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowContactModal(true);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    // Validate phone numbers
    const whatsappError = validatePhoneNumber(
      orderFormData.customer_whatsapp_country_code,
      orderFormData.customer_whatsapp_number,
      'WhatsApp Number'
    );
    const callingError = validatePhoneNumber(
      orderFormData.customer_calling_country_code,
      orderFormData.customer_calling_number,
      'Calling Number'
    );

    const newErrors = {};
    if (whatsappError) newErrors.customer_whatsapp_number = whatsappError;
    if (callingError) newErrors.customer_calling_number = callingError;

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setIsSubmittingOrder(true);

    try {
      // Use the visible reCAPTCHA token
      const orderData = {
        ...orderFormData,
        professional_id: parseInt(id),
        min_followers: orderFormData.min_followers ? parseInt(orderFormData.min_followers) : undefined,
        captcha_token: recaptchaToken
      };

      const response = await api.post('/real-estate-orders', orderData);

      if (response.data.success !== false) {
        alert(t('realEstateProfessionalDetail.order.success'));
        setShowOrderModal(false);
        setOrderFormData({
          customer_name: '',
          customer_email: '',
          customer_whatsapp_country_code: '+91',
          customer_whatsapp_number: '',
          customer_calling_country_code: '+91',
          customer_calling_number: '',
          budget_range: '',
          influencers_required: '',
          gender_required: 'Both',
          languages_required: [],
          min_followers: '',
          message: '',
          captcha_token: '',
          terms_accepted: false
        });
        setFormErrors({});
      } else {
        throw new Error(response.data.message || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error.response?.data?.message || error.message || t('realEstateProfessionalDetail.order.error');
      alert(errorMessage);
    } finally {
      setIsSubmittingOrder(false);
    }
  };


  const validatePhoneNumber = (countryCode, phoneNumber, fieldName) => {
    const country = Object.values(countryPhoneData).find(c => c.code === countryCode);
    if (!country) return `${fieldName}: Invalid country code`;

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < country.minLength || digitsOnly.length > country.maxLength) {
      return `${fieldName}: Phone number must be between ${country.minLength} and ${country.maxLength} digits`;
    }
    return null;
  };

  const handlePhoneNumberChange = (field, value) => {
    setOrderFormData(prev => ({ ...prev, [field]: value }));

    // Clear previous error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }

    // Validate if we have both country code and number
    const countryCodeField = field.includes('whatsapp') ? 'customer_whatsapp_country_code' : 'customer_calling_country_code';
    const numberField = field.includes('whatsapp') ? 'customer_whatsapp_number' : 'customer_calling_number';

    if (field === numberField && orderFormData[countryCodeField] && value) {
      const error = validatePhoneNumber(orderFormData[countryCodeField], value, field.includes('whatsapp') ? 'WhatsApp Number' : 'Calling Number');
      if (error) {
        setFormErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsContacting(true);

    try {
      // Create contact data for API
      const contactData = {
        professionalId: professional.id,
        professionalName: `${professional.first_name} ${professional.last_name}`,
        customerInfo: contactFormData,
        contactDate: new Date().toISOString()
      };

      // Submit contact request to backend
      const response = await api.post('/real-estate-professionals/contact', contactData);

      if (response.data.success) {
        alert(t('realEstateProfessionalDetail.contact.success'));
        setShowContactModal(false);
        setContactFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(response.data.message || 'Failed to submit contact request');
      }

    } catch (error) {
      console.error('Error submitting contact request:', error);
      const errorMessage = error.response?.data?.message || error.message || t('realEstateProfessionalDetail.contact.error');
      alert(errorMessage);
    } finally {
      setIsContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-64 bg-slate-200 rounded mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-8 space-y-10">
                <div className="flex items-start gap-8">
                  <div className="w-32 h-20 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                      <div className="h-10 w-3/4 bg-slate-200 rounded" />
                      <div className="flex gap-4">
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-4 w-40 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-28 bg-blue-50 rounded-full" />
                      <div className="h-8 w-28 bg-teal-50 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t">
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-slate-50 rounded" />
                      <div className="h-4 w-1/2 bg-slate-50 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-slate-50 rounded" />
                      <div className="h-4 w-1/2 bg-slate-50 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border p-6 space-y-8">
                <div className="text-center space-y-3">
                  <div className="h-10 w-1/2 mx-auto bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 mx-auto bg-slate-100 rounded" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 bg-slate-100 rounded" />
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-12 w-full bg-slate-200 rounded-lg" />
              </div>
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <div className="h-6 w-1/2 bg-slate-200 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-slate-50 rounded-lg" />
                  <div className="h-16 bg-slate-50 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <User size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              {t('realEstateProfessionalDetail.notFound.title')}
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {t('realEstateProfessionalDetail.notFound.desc')}
            </p>
            <button
              onClick={() => navigate('/creators')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              {t('realEstateProfessionalDetail.notFound.back')}
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
              onClick={() => navigate('/creators')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              {t('realEstateProfessionalDetail.breadcrumb.back')}
            </button>
            <span>/</span>
            <span>{t('realEstateProfessionalDetail.breadcrumb.current')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Professional Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-32 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-2 shadow-sm">
                    {professional.image ? (
                      <img
                        src={professional.image}
                        alt={`${professional.first_name} ${professional.last_name}`}
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
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                        {professional.first_name} {professional.last_name}
                      </h1>
                      {professional.verified_tick && (
                        <CheckCircle size={24} style={{ color: theme.success }} title="Verified Creator" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{professional.current_residence_city || t('realEstateProfessionalDetail.locationNotSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Languages size={16} />
                        <span>{professional.languages?.length ? professional.languages.join(', ') : t('realEstateProfessionalDetail.languagesNotSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Joined {formatDate(professional.created_at)}</span>
                      </div>
                    </div>
                    {/* Professional Roles */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {professional.real_estate_agency_owner && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.primaryLight, color: theme.primaryDark }}>
                          <Crown size={14} className="inline mr-1" />
                          {t('realEstateProfessionalDetail.roles.agencyOwner')}
                        </span>
                      )}
                      {professional.real_estate_agent && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.secondaryLight, color: theme.secondaryDark }}>
                          <UserCheck size={14} className="inline mr-1" />
                          {t('realEstateProfessionalDetail.roles.agent')}
                        </span>
                      )}
                      {professional.developer_employee && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.info + '20', color: theme.info }}>
                          <Building size={14} className="inline mr-1" />
                          {t('realEstateProfessionalDetail.roles.developerEmployee')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('realEstateProfessionalDetail.about.title')}
                  </h3>
                  <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                    <p>
                      {professional.first_name} is a verified Creator with expertise in the industry.
                      {professional.nationality && ` Originally from ${professional.nationality},`}
                      {professional.current_residence_city && ` currently based in ${professional.current_residence_city}.`}
                      {professional.languages?.length > 0 && ` Fluent in ${professional.languages.join(', ')}.`}
                    </p>
                    {professional.no_of_followers > 0 && (
                      <p className="mt-4">
                        <strong>{t('realEstateProfessionalDetail.about.socialPresence')}</strong> {professional.no_of_followers.toLocaleString()} {t('realEstateProfessionalDetail.info.followers')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    {t('realEstateProfessionalDetail.info.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>{t('realEstateProfessionalDetail.info.personalDetails')}</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        <li className="flex items-center gap-2">
                          <User size={14} />
                          <span>{t('realEstateProfessionalDetail.info.gender')}: {professional.gender || t('realEstateProfessionalDetail.info.notSpecified')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{t('realEstateProfessionalDetail.info.nationality')}: {professional.nationality || t('realEstateProfessionalDetail.info.notSpecified')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{t('realEstateProfessionalDetail.info.currentCity')}: {professional.current_residence_city || t('realEstateProfessionalDetail.info.notSpecified')}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>{t('realEstateProfessionalDetail.info.professionalStatus')}</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={14} style={{ color: professional.verified_tick ? theme.success : theme.textDisabled }} />
                          <span>{t('realEstateProfessionalDetail.info.verified')}: {professional.verified_tick ? t('realEstateProfessionalDetail.info.yes') : t('realEstateProfessionalDetail.info.no')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{t('realEstateProfessionalDetail.info.followers')}: {professional.no_of_followers?.toLocaleString() || 0}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Languages size={14} />
                          <span>{t('realEstateProfessionalDetail.info.languages')}: {professional.languages?.length || 0}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('realEstateProfessionalDetail.social.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    {professional.ig_url && (
                      <a
                        href={professional.ig_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="Instagram"
                      >
                        <Instagram size={16} style={{ color: '#E4405F' }} />
                      </a>
                    )}
                    {!professional.ig_url && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Instagram size={16} style={{ color: '#E4405F' }} />
                      </div>
                    )}

                    {professional.facebook && (
                      <a
                        href={professional.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="Facebook"
                      >
                        <Facebook size={16} style={{ color: '#1877F2' }} />
                      </a>
                    )}
                    {!professional.facebook && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Facebook size={16} style={{ color: '#1877F2' }} />
                      </div>
                    )}

                    {professional.linkedin && (
                      <a
                        href={professional.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="LinkedIn"
                      >
                        <Linkedin size={16} style={{ color: '#0077B5' }} />
                      </a>
                    )}
                    {!professional.linkedin && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Linkedin size={16} style={{ color: '#0077B5' }} />
                      </div>
                    )}

                    {professional.youtube && (
                      <a
                        href={professional.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="YouTube"
                      >
                        <Youtube size={16} style={{ color: '#FF0000' }} />
                      </a>
                    )}
                    {!professional.youtube && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <Youtube size={16} style={{ color: '#FF0000' }} />
                      </div>
                    )}

                    {professional.tiktok && (
                      <a
                        href={professional.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: theme.borderLight }}
                        title="TikTok"
                      >
                        <span className="text-sm font-bold" style={{ color: '#000000' }}>TT</span>
                      </a>
                    )}
                    {!professional.tiktok && (
                      <div className="p-2 rounded-lg border opacity-50" style={{ borderColor: theme.borderLight }}>
                        <span className="text-sm font-bold" style={{ color: '#000000' }}>TT</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                {professional.languages && professional.languages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('realEstateProfessionalDetail.languages.title')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {professional.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: theme.primaryLight, color: theme.primaryDark }}
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold mb-2" style={{ color: theme.success }}>
                    {t('realEstateProfessionalDetail.contact.title')}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {t('realEstateProfessionalDetail.contact.desc')}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('realEstateProfessionalDetail.contact.status')}</span>
                    <span className="font-medium" style={{ color: professional.verified_tick ? theme.success : theme.textSecondary }}>
                      {professional.verified_tick ? t('realEstateProfessionalDetail.quickInfo.verified') : t('realEstateProfessionalDetail.contact.active')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('realEstateProfessionalDetail.stats.languages')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {professional.languages?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>{t('realEstateProfessionalDetail.list.location')}</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {professional.current_residence_city || 'N/A'}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  onClick={handleAddToCart}
                  disabled={isSubmittingOrder}
                >
                  <MessageCircle size={16} />
                  {isSubmittingOrder ? t('realEstateProfessionalDetail.contact.processing') : (isAuthenticated ? t('realEstateProfessionalDetail.contact.addToCart') : t('realEstateProfessionalDetail.contact.signInToOrder'))}
                </button>
              </div>

              {/* Professional Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('realEstateProfessionalDetail.stats.title')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.primary }}>
                      {professional.no_of_followers?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('realEstateProfessionalDetail.stats.instagramFollowers')}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.success }}>
                      {professional.languages?.length || 0}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('realEstateProfessionalDetail.stats.languages')}</div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('realEstateProfessionalDetail.quickInfo.title')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Award size={16} style={{ color: professional.verified_tick ? theme.success : theme.textDisabled }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('realEstateProfessionalDetail.quickInfo.verification')}: {professional.verified_tick ? t('realEstateProfessionalDetail.quickInfo.verified') : t('realEstateProfessionalDetail.quickInfo.unverified')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: theme.primary }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('realEstateProfessionalDetail.quickInfo.memberSince')}: {formatDate(professional.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: theme.secondary }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('realEstateProfessionalDetail.quickInfo.type')}: {professional.real_estate_agency_owner ? t('realEstateProfessionalDetail.roles.agencyOwner') : professional.real_estate_agent ? t('realEstateProfessionalDetail.roles.agent') : professional.developer_employee ? t('realEstateProfessionalDetail.roles.developerEmployee') : t('realEstateProfessionalDetail.roles.professional')}
                    </span>
                  </div>
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
                {isSaved ? t('realEstateProfessionalDetail.actions.saved') : t('realEstateProfessionalDetail.actions.save')}
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
              <span style={{ color: theme.textSecondary }}>{t('realEstateProfessionalDetail.actions.share')}</span>
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px 24px',
              borderBottom: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                Order Real Estate Influencers
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

            {/* Content */}
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
                  {professional.first_name} {professional.last_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>Real Estate Influencer Order</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primary }}>
                    Professional Services
                  </span>
                </div>
              </div>

              <form id="order-form" onSubmit={handleOrderSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {/* Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={orderFormData.customer_name}
                      onChange={(e) => setOrderFormData({ ...orderFormData, customer_name: e.target.value })}
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

                  {/* Email */}
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
                      value={orderFormData.customer_email}
                      onChange={(e) => setOrderFormData({ ...orderFormData, customer_email: e.target.value })}
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

                  {/* WhatsApp Number */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      WhatsApp Number *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={orderFormData.customer_whatsapp_country_code}
                        onChange={(e) => setOrderFormData({ ...orderFormData, customer_whatsapp_country_code: e.target.value })}
                        style={{
                          padding: '10px 8px',
                          border: `1px solid ${theme.borderLight}`,
                          borderRadius: '8px',
                          backgroundColor: theme.background,
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
                        value={orderFormData.customer_whatsapp_number}
                        onChange={(e) => handlePhoneNumberChange('customer_whatsapp_number', e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          border: `1px solid ${formErrors.customer_whatsapp_number ? theme.danger : theme.borderLight}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: theme.background
                        }}
                      />
                    </div>
                    {formErrors.customer_whatsapp_number && (
                      <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.customer_whatsapp_number}
                      </div>
                    )}
                  </div>

                  {/* Calling Number */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Calling Number
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={orderFormData.customer_calling_country_code}
                        onChange={(e) => setOrderFormData({ ...orderFormData, customer_calling_country_code: e.target.value })}
                        style={{
                          padding: '10px 8px',
                          border: `1px solid ${theme.borderLight}`,
                          borderRadius: '8px',
                          backgroundColor: theme.background,
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
                        value={orderFormData.customer_calling_number}
                        onChange={(e) => handlePhoneNumberChange('customer_calling_number', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          border: `1px solid ${formErrors.customer_calling_number ? theme.danger : theme.borderLight}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: theme.background
                        }}
                      />
                    </div>
                    {formErrors.customer_calling_number && (
                      <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.customer_calling_number}
                      </div>
                    )}
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Budget Range *
                    </label>
                    <select
                      value={orderFormData.budget_range}
                      onChange={(e) => setOrderFormData({ ...orderFormData, budget_range: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: theme.background
                      }}
                    >
                      <option value="">Select Budget Range</option>
                      <option value="USD 15k-25k">USD 15k-25k</option>
                      <option value="USD 26k-50k">USD 26k-50k</option>
                      <option value="USD 51k-75k">USD 51k-75k</option>
                      <option value="USD 76k-100k">USD 76k-100k</option>
                      <option value="More than 100k">More than 100k</option>
                    </select>
                  </div>

                  {/* Influencers Required */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      No. of Real Estate Influencers Required *
                    </label>
                    <select
                      value={orderFormData.influencers_required}
                      onChange={(e) => setOrderFormData({ ...orderFormData, influencers_required: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: theme.background
                      }}
                    >
                      <option value="">Select Range</option>
                      <option value="1-10">1-10</option>
                      <option value="11-25">11-25</option>
                      <option value="26-50">26-50</option>
                      <option value="51-100">51-100</option>
                      <option value="More than 100">More than 100</option>
                    </select>
                  </div>

                  {/* Gender Required */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Gender Required *
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['Male', 'Female', 'Both'].map(gender => (
                        <label key={gender} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="gender_required"
                            value={gender}
                            checked={orderFormData.gender_required === gender}
                            onChange={(e) => setOrderFormData({ ...orderFormData, gender_required: e.target.value })}
                            required
                          />
                          <span style={{ fontSize: '14px', color: theme.textPrimary }}>{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Min Followers */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Min Followers for Each Influencer
                    </label>
                    <input
                      type="number"
                      value={orderFormData.min_followers}
                      onChange={(e) => setOrderFormData({ ...orderFormData, min_followers: e.target.value })}
                      placeholder="e.g. 10000"
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
                </div>

                {/* Languages Required */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '10px'
                  }}>
                    Languages Needed *
                  </label>
                  <select
                    multiple
                    value={orderFormData.languages_required}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setOrderFormData({ ...orderFormData, languages_required: selectedOptions });
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: theme.background,
                      minHeight: '120px'
                    }}
                  >
                    {worldLanguages.map(language => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                    Hold Ctrl (Cmd on Mac) to select multiple languages
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '6px'
                  }}>
                    Any Message
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
                    placeholder="Additional requirements or special instructions..."
                  />
                </div>

                {/* Terms and Conditions */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={orderFormData.terms_accepted}
                      onChange={(e) => setOrderFormData({ ...orderFormData, terms_accepted: e.target.checked })}
                      required
                      style={{ marginTop: '2px' }}
                    />
                    <span style={{ fontSize: '14px', color: theme.textPrimary, lineHeight: '1.4' }}>
                      I agree to the <a href="#" style={{ color: theme.primary, textDecoration: 'underline' }}>Terms and Conditions</a> and <a href="#" style={{ color: theme.primary, textDecoration: 'underline' }}>Privacy Policy</a> *
                    </span>
                  </label>
                </div>

                {/* reCAPTCHA */}
                <div style={{ marginBottom: '20px' }}>
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
                    <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.recaptcha}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                    Complete the reCAPTCHA verification to submit your order.
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
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
                disabled={isSubmittingOrder}
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
                disabled={isSubmittingOrder}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {isSubmittingOrder ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
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
        }} onClick={() => setShowContactModal(false)}>
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
                Contact Professional
              </h2>
              <button
                onClick={() => setShowContactModal(false)}
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
                  {professional.first_name} {professional.last_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>Professional Contact Request</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primary }}>
                    Real Estate Services
                  </span>
                </div>
              </div>

              <form id="contact-form" onSubmit={handleContactSubmit}>
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
                      value={contactFormData.fullName}
                      onChange={(e) => setContactFormData({ ...contactFormData, fullName: e.target.value })}
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
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
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
                      value={contactFormData.phone}
                      onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
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
                      Message
                    </label>
                    <textarea
                      value={contactFormData.message}
                      onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
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
                      placeholder="Tell us about your real estate needs..."
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
                onClick={() => setShowContactModal(false)}
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
                disabled={isContacting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="contact-form"
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
                disabled={isContacting}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {isContacting ? 'Sending...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateProfessionalDetail;