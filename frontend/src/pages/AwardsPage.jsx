import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import AwardsListing from '../components/common/AwardsListing';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import AwardSubmissionForm from '../components/user/AwardSubmissionForm';
import {
  Search, Filter, Award, Star, Clock, Globe, BookOpen,
  Target, Zap, CheckCircle, ExternalLink, MapPin, Calendar,
  DollarSign, BarChart3, Users, Link as LinkIcon, Image as ImageIcon,
  FileText, Shield, User, Building, TrendingUp
} from 'lucide-react';

// Enhanced theme colors inspired by VideoTutorials
const theme = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
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

const AwardsPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');
  const [focusFilter, setFocusFilter] = useState('');
  const [organiserFilter, setOrganiserFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      // Enhanced search across multiple fields
      if (searchTerm.trim()) {
        params.append('award_name', searchTerm.trim());
      }

      if (monthFilter) params.append('tentative_month', monthFilter);
      if (focusFilter) params.append('company_focused_individual_focused', focusFilter);
      if (organiserFilter) params.append('award_organiser_name', organiserFilter);
      if (industryFilter) params.append('industry', industryFilter);
      if (countryFilter) params.append('award_country', countryFilter);
      if (cityFilter) params.append('award_city', cityFilter);

      const response = await api.get(`/awards?${params.toString()}`);
      const awardsData = response.data.awards || [];

      setAwards(awardsData);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching awards:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setAwards([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAwards(1); // Reset to first page on filter change
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, monthFilter, focusFilter, organiserFilter, industryFilter, countryFilter, cityFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleShowAwardForm = (award) => {
    setSelectedAward(award);
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setShowAwardForm(true);
    }
  };

  const handleCloseAwardForm = () => {
    setShowAwardForm(false);
    setSelectedAward(null);
  };

  const handleAwardSuccess = () => {
    setShowAwardForm(false);
    setSelectedAward(null);
    // Refresh the awards to include the new submission if approved
    fetchAwards(currentPage);
  };

  const getUniqueMonths = () => {
    const months = awards.map(a => a.tentative_month).filter(Boolean);
    return [...new Set(months)].sort();
  };

  const getUniqueFocuses = () => {
    const focuses = awards.map(a => a.company_focused_individual_focused).filter(Boolean);
    return [...new Set(focuses)].sort();
  };

  const getUniqueOrganisers = () => {
    const organisers = awards.map(a => a.award_organiser_name).filter(Boolean);
    return [...new Set(organisers)].sort();
  };

  const getUniqueIndustries = () => {
    const industries = awards.map(a => a.industry).filter(Boolean);
    const uniqueIndustries = [...new Set(industries)].sort();
    // Add "Other" option if not already present
    if (!uniqueIndustries.includes('Other')) {
      uniqueIndustries.push('Other');
    }
    return uniqueIndustries;
  };

  const getUniqueCountries = () => {
    const countries = awards.map(a => a.award_country).filter(Boolean);
    return [...new Set(countries)].sort();
  };

  const getUniqueCities = () => {
    const cities = awards.map(a => a.award_city).filter(Boolean);
    return [...new Set(cities)].sort();
  };

  const handleAwardClick = (award) => {
    navigate(`/awards/${award.id}`);
  };

  const handlePageChange = (page) => {
    fetchAwards(page);
  };

  const clearAllFilters = () => {
    setMonthFilter('');
    setFocusFilter('');
    setOrganiserFilter('');
    setIndustryFilter('');
    setCountryFilter('');
    setCityFilter('');
  };

  if (loading && awards.length === 0) {
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading awards...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Enhanced Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Awards Directory
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
                   Explore our prestigious collection of awards and recognitions celebrating excellence in digital publishing and media innovation worldwide. Discover our achievements in journalism, content creation, and industry leadership. Connect with award-winning professionals who set the standards for quality and innovation.
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              The current page is for representation purpose only, the comprehensive list will be live soon
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Enhanced Layout */}
      <div className="flex">
        {/* Enhanced Filters Sidebar - 25% width */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden`} style={{
          minHeight: 'calc(100vh - 200px)',
          position: 'sticky',
          top: '80px',
          zIndex: 10,
          borderRight: `1px solid ${theme.borderLight}`,
          width: '25%'
        }}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#212121] flex items-center gap-2">
                <Filter size={20} className="text-[#1976D2]" />
                Filters & Sort
              </h3>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-[#757575]"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Enhanced Filter Sections */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Award size={16} className="text-[#1976D2]" />
                  Award Filters
                </h4>

                {/* Month Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Month
                  </label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Months</option>
                    {getUniqueMonths().map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                {/* Focus Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Focus
                  </label>
                  <select
                    value={focusFilter}
                    onChange={(e) => setFocusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Focuses</option>
                    {getUniqueFocuses().map(focus => (
                      <option key={focus} value={focus}>{focus}</option>
                    ))}
                  </select>
                </div>

                {/* Organiser Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Organiser
                  </label>
                  <select
                    value={organiserFilter}
                    onChange={(e) => setOrganiserFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Organisers</option>
                    {getUniqueOrganisers().map(organiser => (
                      <option key={organiser} value={organiser}>{organiser}</option>
                    ))}
                  </select>
                </div>

                {/* Industry Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Industry
                  </label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Industries</option>
                    {getUniqueIndustries().map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Country
                  </label>
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Countries</option>
                    {getUniqueCountries().map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    City
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Cities</option>
                    {getUniqueCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Enhanced */}
        <main className="flex-1 p-6 min-w-0">
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search awards by name or organiser..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Controls Bar */}
          <div className="bg-white rounded-lg shadow-lg border p-6 mb-6" style={{
            borderColor: theme.borderLight,
            boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
          }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-[#F5F5F5] hover:bg-[#E0E0E0] transition-colors"
                    style={{ borderColor: theme.borderLight }}
                  >
                    <Filter size={16} />
                    <span className="text-[#212121]">Filters</span>
                  </button>
                )}

                <span className="text-sm font-medium text-[#212121]">
                  {awards.length} awards found
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Awards Display */}
          {awards.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {awards.map((award, index) => (
                  <motion.div
                    key={award.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <AwardsListing
                      award={award}
                      onAwardClick={handleAwardClick}
                      onApplyClick={handleShowAwardForm}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border border-[#E0E0E0] rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#1976D2] text-white border-[#1976D2]'
                            : 'hover:bg-[#F5F5F5] text-[#212121]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
              <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                No awards found
              </h3>
              <p className="text-[#757575] text-lg max-w-md mx-auto">
                We couldn't find any awards matching your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAllFilters();
                  fetchAwards(1);
                }}
                className="mt-6 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <UserFooter />

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      )}

      {/* Award Submission Form Modal */}
      {showAwardForm && selectedAward && (
        <AwardSubmissionForm
          award={selectedAward}
          onClose={handleCloseAwardForm}
          onSuccess={handleAwardSuccess}
        />
      )}
    </div>
  );
};

export default AwardsPage;