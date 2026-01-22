import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationArray } from '../hooks/useTranslation';

import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import CareersSidebar from '../components/user/CareersSidebar';
import CareerSubmissionForm from '../components/user/CareerSubmissionForm';
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
  const { t } = useLanguage();
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

  // Translate careers
  const { translatedItems: translatedCareers } = useTranslationArray(careers, ['title', 'description', 'company', 'location', 'type']);


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

  const getUniqueLocations = () => {
    const locations = careers.map(career => career.location).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const getUniqueCompanies = () => {
    const companies = careers.map(career => career.company).filter(Boolean);
    return [...new Set(companies)].sort();
  };

  const formatSalary = (salary) => {
    const numSalary = parseFloat(salary);
    return numSalary > 0 ? `$${numSalary.toLocaleString()}` : t('careers.salaryNotSpecified', 'Salary not specified');
  };


  const handleCareerClick = (career) => {
    navigate(`/careers/${career.id}`);
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading career opportunities...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

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
            <button
              onClick={handleShowCareerSubmission}
              className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}

              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            >
              {t('careers.submitOpportunity')}
            </button>
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
              {translatedCareers.length > 0 ? (
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
                            <div className="text-sm font-semibold" style={{ color: theme.primary }}>{career.type || 'N/A'}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Type</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: theme.success }}>{formatSalary(career.salary)}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Salary</div>
                          </div>
                        </div>

                        {/* Description Preview */}
                        <p className="text-sm mb-4 line-clamp-3" style={{ color: theme.textSecondary }}>
                          {career.description || t('careers.noDescription', 'No description available.')}
                        </p>

                        {/* CTA Button */}
                        <button
                          className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          style={{ backgroundColor: theme.primary }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                        >
                          <Eye size={16} />
                          {t('ViewDetails', 'View Details')}
                          <ExternalLink size={14} />
                        </button>
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

              {/* Placeholder for career list */}
              {translatedCareers.length === 0 && loading && (
                <div className="text-center py-8 border-t" style={{ borderColor: theme.borderLight }}>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>{t('loading', 'Loading...')}</p>
                </div>
              )}
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

      {/* Career Submission Modal */}
      {showCareerSubmission && (
        <CareerSubmissionForm
          onClose={handleCloseCareerSubmission}
          onSuccess={() => {
            handleCloseCareerSubmission();
            fetchCareers(); // Refresh the careers list
          }}
        />
      )}
    </div>
  );
};

export default CareersPage;