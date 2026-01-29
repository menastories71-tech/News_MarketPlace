import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Skeleton from '../components/common/Skeleton';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationObject } from '../hooks/useTranslation';
import { getIdFromSlug } from '../utils/slugify';
// Removed ShareButtons import to implement manually

import {
  MapPin, Calendar, DollarSign, Building, User, Clock,
  CheckCircle, ExternalLink, ArrowLeft, Share, Heart
} from 'lucide-react';

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

const CareerDetailPage = () => {
  const { language, t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Translate career details - with null safety
  const { translatedObject: rawTranslatedCareer } = useTranslationObject(career, ['title', 'description', 'company', 'location', 'type']);

  // Ensure translatedCareer is never null - fallback to original career or empty object
  const translatedCareer = rawTranslatedCareer || career || {};


  useEffect(() => {
    fetchCareerDetails();
  }, [id]);

  const fetchCareerDetails = async () => {
    try {
      setLoading(true);
      const realId = getIdFromSlug(id);
      const response = await api.get(`/careers/${realId}`);
      setCareer(response.data.career);
    } catch (error) {
      console.error('Error fetching career details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else if (error.response?.status === 404) {
        navigate('/careers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleApplyNow = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowApplyModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
  };

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


  const handleSave = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    // Toggle saved state
    setIsSaved(!isSaved);

    // Here you would typically make an API call to save/unsave the career
    // For now, we'll just toggle the local state
    if (!isSaved) {
      alert(t('careers.saved'));
    } else {
      alert(t('careers.removed'));
    }
  };

  const formatSalary = (salary) => {
    const numSalary = parseFloat(salary);
    return numSalary > 0 ? `$${numSalary.toLocaleString(language)}` : t('careers.salaryNotSpecified', 'Salary not specified');
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'zh-CN' ? 'zh' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        {/* Breadcrumb Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
            {/* Header info skeleton */}
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="w-16 h-16 rounded-lg" />
            </div>

            {/* Price/Details block skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            {/* Description content skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-11/12" />
            </div>

            <Skeleton className="h-40 w-full rounded-lg" />

            <div className="pt-6 border-t">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Icon name="exclamation-triangle" size="48" style={{ color: theme.textDisabled }} />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
              {t('careers.notFound', 'Career Not Found')}
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
              {t('careers.notFoundDesc', "The career opportunity you're looking for doesn't exist or has been removed.")}
            </p>
            <button
              onClick={() => navigate('/careers')}
              className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            >
              {t('careers.backToCareers', 'Back to Careers')}
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Breadcrumb */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/careers')}
              className="flex items-center space-x-1 hover:text-[#1976D2] transition-colors"
              style={{ color: theme.textSecondary }}
            >
              <ArrowLeft size={16} />
              <span>{t('careers.careers', 'Careers')}</span>
            </button>
            <span style={{ color: theme.textDisabled }}>/</span>
            <span style={{ color: theme.textPrimary }} className="font-medium truncate">
              {translatedCareer.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b" style={{ borderColor: theme.borderLight }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                    {translatedCareer.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
                    <div className="flex items-center space-x-2">
                      <Building size={16} />
                      <span>{translatedCareer.company || t('careers.companyNotSpecified', 'Company not specified')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{translatedCareer.location || t('careers.locationNotSpecified', 'Location not specified')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{translatedCareer.type || t('careers.typeNotSpecified', 'Type not specified')}</span>
                    </div>
                  </div>
                </div>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <Icon name="briefcase" size="32" style={{ color: theme.primary }} />
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={18} style={{ color: theme.success }} />
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>{t('careers.salary')}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: theme.success }}>
                    {formatSalary(career.salary)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={18} style={{ color: theme.primary }} />
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>{t('careers.posted')}</span>
                  </div>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    {formatDate(translatedCareer.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={18} style={{ color: theme.success }} />
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>{t('careers.status')}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: theme.success }}>
                    {t('careers.statusActive')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                  {t('careers.jobDescription')}
                </h2>
                <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                  {translatedCareer.description ? (
                    <div className="whitespace-pre-wrap">{translatedCareer.description}</div>
                  ) : (
                    <p>{t('careers.noDescription', 'No description provided.')}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t" style={{ borderColor: theme.borderLight }}>
                <button
                  onClick={handleApplyNow}
                  className="flex-1 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                >
                  <ExternalLink size={18} />
                  {t('careers.applyNow')}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setActiveShareId(activeShareId === 'career' ? null : 'career')}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    style={{ color: theme.textPrimary }}
                  >
                    <Icon name="share" size={18} />
                    {t('common.share', 'Share')}
                  </button>
                  {renderShareMenu(
                    window.location.href,
                    `${career.title} - ${career.company || 'Company'}`,
                    'career'
                  )}
                </div>
                <button
                  onClick={handleSave}
                  className={`px-6 py-3 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isSaved ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  style={{ color: isSaved ? '#D32F2F' : theme.textPrimary }}
                >
                  <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? t('careers.saved') : t('careers.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <UserFooter />

      {/* Apply Now Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                {t('careers.applyModal.title')}
              </h3>
              <button
                onClick={handleCloseApplyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2" style={{ color: theme.textPrimary }}>
                {translatedCareer.title}
              </h4>
              <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
                {translatedCareer.company || t('careers.companyNotSpecified', 'Company not specified')} • {translatedCareer.location || t('careers.locationNotSpecified', 'Location not specified')}
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {t('careers.applyModal.instruction')}
                </p>
                <p className="font-medium mt-2" style={{ color: theme.primary }}>
                  careers@newsmarketplace.com
                </p>
              </div>

              <div className="text-sm" style={{ color: theme.textSecondary }}>
                <p className="mb-2">{t('careers.applyModal.include')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('careers.applyModal.instruction1')}</li>
                  <li>{t('careers.applyModal.instruction2')}</li>
                  <li>{t('careers.applyModal.instruction3')}</li>
                  <li>{t('careers.applyModal.instruction4')}</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseApplyModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                style={{ color: theme.textPrimary }}
              >
                {t('careers.applyModal.cancel')}
              </button>
              <button
                onClick={() => {
                  // Copy email to clipboard
                  navigator.clipboard.writeText('careers@newsmarketplace.com').then(() => {
                    alert(t('careers.emailCopied'));
                    handleCloseApplyModal();
                  });
                }}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('careers.applyModal.copyEmail')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      )}
    </div>
  );
};

export default CareerDetailPage;