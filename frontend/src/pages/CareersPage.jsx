import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationArray } from '../hooks/useTranslation';
import { createSlugPath } from '../utils/slugify';

import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Skeleton from '../components/common/Skeleton';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import CareersSidebar from '../components/user/CareersSidebar';
import CareerSubmissionForm from '../components/user/CareerSubmissionForm';
// Removed ShareButtons import to implement manually
import {
  Search, Filter, Eye, Heart, Share, Grid, List, Star, Clock,
  TrendingUp, Globe, BookOpen, Award, Target, Zap, CheckCircle,
  ExternalLink, MapPin, Calendar, DollarSign, BarChart3, Users,
  Link as LinkIcon, Image as ImageIcon, FileText, Shield
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

const CareersPage = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCareerSubmission, setShowCareerSubmission] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        status: 'approved',
        is_active: 'true',
        limit: '100'
      });

      if (searchTerm) params.append('title', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (salaryMin) params.append('salary_min', salaryMin);
      if (salaryMax) params.append('salary_max', salaryMax);
      if (companyFilter) params.append('company', companyFilter);

      const response = await api.get(`/careers?${params.toString()}`);
      let careersData = response.data.careers || [];

      setCareers(careersData);
    } catch (error) {
      console.error('Error fetching careers:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setCareers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Translate careers - with null safety
  const { translatedItems: rawTranslatedCareers } = useTranslationArray(careers, ['title', 'description', 'company', 'location', 'type']);

  // Ensure translatedCareers is never null - fallback to original careers or empty array
  const translatedCareers = rawTranslatedCareers || careers || [];


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCareers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, locationFilter, typeFilter, salaryMin, salaryMax, companyFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleShowCareerSubmission = () => {
    setShowCareerSubmission(true);
  };

  const handleCloseCareerSubmission = () => {
    setShowCareerSubmission(false);
  };

  // Get unique locations from original careers data (sidebar handles translation display)
  const getUniqueLocations = () => {
    const locations = careers.map(career => career.location).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  // Get unique companies from original careers data (sidebar handles translation display)
  const getUniqueCompanies = () => {
    const companies = careers.map(career => career.company).filter(Boolean);
    return [...new Set(companies)].sort();
  };

  const formatSalary = (salary) => {
    const numSalary = parseFloat(salary);
    return numSalary > 0 ? `$${numSalary.toLocaleString(language)}` : t('careers.salaryNotSpecified', 'Salary not specified');
  };


  const handleCareerClick = (career) => {
    navigate(`/careers/${createSlugPath(career.title, career.id)}`);
  };



  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              {t('careers.pageTitle')}
            </h1>
            <p className="text-lg mb-8" style={{ color: theme.textSecondary }}>
              {careers.length} {t('careers.openings')}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={handleShowCareerSubmission}
                className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('careers.submitOpportunity')}
              </button>

              <div className="bg-white p-2 px-4 rounded-lg border border-[#E0E0E0] shadow-sm flex items-center gap-2 relative">
                <span className="text-sm font-medium text-[#757575] border-r pr-2 mr-2">{t('common.share', 'Share')}:</span>
                <button
                  onClick={() => setActiveShareId(activeShareId === 'hero' ? null : 'hero')}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="share" size={18} />
                </button>
                {renderShareMenu(window.location.href, t('careers.pageTitle'), 'hero')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <CareersSidebar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                locationFilter={locationFilter}
                onLocationChange={setLocationFilter}
                locations={getUniqueLocations()}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                salaryMin={salaryMin}
                onSalaryMinChange={setSalaryMin}
                salaryMax={salaryMax}
                onSalaryMaxChange={setSalaryMax}
                companyFilter={companyFilter}
                onCompanyChange={setCompanyFilter}
                companies={getUniqueCompanies()}
                onClearFilters={() => { }}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-lg" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : translatedCareers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {translatedCareers.map((career, index) => (
                    <motion.div
                      key={career.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handleCareerClick(career)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                              {career.title}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <Globe size={14} className="mr-2" />
                              <span>{career.company || t('careers.companyNotSpecified', 'Company not specified')}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <MapPin size={14} className="mr-2" />
                              <span>{career.location || t('careers.locationNotSpecified', 'Location not specified')}</span>
                            </div>
                          </div>
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.primaryLight }}
                          >
                            <Icon name="briefcase" size="lg" style={{ color: theme.primary }} />
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="grid grid-cols-2 gap-2 text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: theme.primary }}>{career.type || t('common.NA')}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('careers.jobType')}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: theme.success }}>{formatSalary(career.salary)}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('careers.salary')}</div>
                          </div>
                        </div>

                        {/* Description Preview */}
                        <p className="text-sm mb-4 line-clamp-3" style={{ color: theme.textSecondary }}>
                          {career.description || t('careers.noDescription', 'No description available.')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex gap-2">
                          <button
                            className="flex-1 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            style={{ backgroundColor: theme.primary }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            <Eye size={16} />
                            {t('ViewDetails', 'View Details')}
                            <ExternalLink size={14} />
                          </button>
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveShareId(activeShareId === career.id ? null : career.id)}
                              className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <Icon name="share" size={18} />
                            </button>
                            {renderShareMenu(
                              `${window.location.origin}/careers/${createSlugPath(career.title, career.id)}`,
                              career.title,
                              career.id,
                              'right'
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: theme.backgroundSoft }}
                  >
                    <Globe size={48} style={{ color: theme.textDisabled }} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('careers.noCareersFound')}
                  </h3>
                  <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                    {t('careers.noCareersFoundDesc', "We couldn't find any career opportunities matching your search criteria.")}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('');
                      setTypeFilter('');
                      setSalaryMin('');
                      setSalaryMax('');
                      setCompanyFilter('');
                    }}
                    className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  >
                    {t('careers.clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <UserFooter />

      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      )}

      {showCareerSubmission && (
        <CareerSubmissionForm
          onClose={handleCloseCareerSubmission}
          onSuccess={() => {
            handleCloseCareerSubmission();
            fetchCareers();
          }}
        />
      )}
    </div>
  );
};

export default CareersPage;