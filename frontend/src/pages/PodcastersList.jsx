import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Mic, Users, MapPin, Globe, Instagram, Youtube, ExternalLink, Plus, Clock, CheckCircle, Headphones, TrendingUp, Star, Play, Radio, Award, BarChart3, Target, Zap } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Skeleton from '../components/common/Skeleton';
import PodcasterSubmissionForm from '../components/user/PodcasterSubmissionForm';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { createSlugPath } from '../utils/slugify';

// Global error handler for ResizeObserver
const resizeObserverErrHandler = (error) => {
  if (error.message && error.message.includes('ResizeObserver')) {
    // Ignore ResizeObserver errors as they are harmless
    return;
  }
  console.error(error);
};

// Set up global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', resizeObserverErrHandler);
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
      event.preventDefault();
    }
  });
}

// Enhanced theme colors inspired by PublicationsPage
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
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const PodcastersList = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [podcasters, setPodcasters] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubmissionsLoading, setUserSubmissionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'my-submissions'

  useEffect(() => {
    const onResize = () => {
      try {
        setIsMobile(window.innerWidth < 768);
      } catch (error) {
        console.warn('ResizeObserver error:', error);
      }
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPodcasters();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-submissions') {
      fetchUserSubmissions();
    }
  }, [isAuthenticated, activeTab]);

  const fetchPodcasters = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      });

      // Enhanced search across multiple fields
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Only add category filter if it's not 'all'
      if (selectedCategory && selectedCategory !== 'all') {
        // Use the category as industry filter
        params.append('industry', selectedCategory);
      }

      console.log('Fetching podcasters with params:', params.toString());

      const response = await api.get(`/podcasters/approved?${params.toString()}`);

      if (response.data && response.data.podcasters) {
        let podcastersData = response.data.podcasters;

        // Client-side filtering as backup
        if (selectedCategory && selectedCategory !== 'all') {
          podcastersData = podcastersData.filter(podcaster =>
            podcaster.podcast_focus_industry === selectedCategory ||
            podcaster.podcast_region === selectedCategory
          );
        }

        // Client-side search for better results
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase().trim();
          podcastersData = podcastersData.filter(podcaster => {
            return (
              podcaster.podcast_name?.toLowerCase().includes(searchLower) ||
              podcaster.podcast_host?.toLowerCase().includes(searchLower) ||
              podcaster.podcast_focus_industry?.toLowerCase().includes(searchLower) ||
              podcaster.podcast_region?.toLowerCase().includes(searchLower) ||
              podcaster.podcast_target_audience?.toLowerCase().includes(searchLower)
            );
          });
        }

        setPodcasters(podcastersData);
      } else {
        setPodcasters([]);
      }
    } catch (err) {
      console.error('Error fetching podcasters:', err);

      // More detailed error handling
      let errorMessage = 'Failed to load podcasters';

      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error;

        if (status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (status === 404) {
          errorMessage = 'Podcasters endpoint not found.';
        } else if (message) {
          errorMessage = message;
        } else {
          errorMessage = `Server error (${status}). Please try again.`;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        errorMessage = err.message || 'An unexpected error occurred.';
      }

      setError(errorMessage);
      setPodcasters([]); // Clear podcasters on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      setUserSubmissionsLoading(true);
      const response = await api.get('/podcasters/my');
      setUserSubmissions(response.data.podcasters);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
    } finally {
      setUserSubmissionsLoading(false);
    }
  };

  // Extract unique categories from podcasters - with error handling
  const categories = React.useMemo(() => {
    try {
      if (!Array.isArray(podcasters) || podcasters.length === 0) {
        return [{ id: 'all', name: t('podcasters.filters.allIndustries'), count: 0 }];
      }

      const industries = [...new Set(
        podcasters
          .map(p => p.podcast_focus_industry)
          .filter(industry => industry && typeof industry === 'string' && industry.trim() !== '')
      )].sort();

      const cats = [
        { id: 'all', name: t('podcasters.filters.allIndustries'), count: podcasters.length },
      ];

      industries.forEach(industry => {
        const count = podcasters.filter(p =>
          p.podcast_focus_industry === industry
        ).length;
        if (count > 0) {
          cats.push({
            id: industry,
            name: industry,
            count
          });
        }
      });

      return cats;
    } catch (error) {
      console.warn('Error processing categories:', error);
      return [{ id: 'all', name: t('podcasters.filters.allIndustries'), count: 0 }];
    }
  }, [podcasters, t]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const filteredPodcasters = useMemo(() => {
    try {
      if (!Array.isArray(podcasters)) {
        return [];
      }

      return podcasters.filter(podcaster => {
        if (!podcaster) return false;

        const matchesCategory = selectedCategory === 'all' ||
          podcaster.podcast_focus_industry === selectedCategory ||
          podcaster.podcast_region === selectedCategory;

        const matchesSearch = !searchQuery ||
          podcaster.podcast_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcaster.podcast_host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcaster.podcast_focus_industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcaster.podcast_region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcaster.podcast_target_audience?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      });
    } catch (error) {
      console.warn('Error filtering podcasters:', error);
      return [];
    }
  }, [podcasters, selectedCategory, searchQuery]);

  if (loading && podcasters.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader />
        <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto text-center animate-pulse">
            <div className="h-16 w-3/4 mx-auto mb-6 bg-slate-200 rounded-lg" />
            <div className="h-10 w-1/2 mx-auto mb-8 bg-slate-100 rounded" />
            <div className="h-14 w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg" />
          </div>
        </section>
        <div className="flex max-w-7xl mx-auto p-6 gap-6">
          <aside className="w-1/4 hidden md:block">
            <div className="p-6 h-full bg-white rounded-lg border border-slate-200 animate-pulse">
              <div className="h-10 w-1/2 mb-6 bg-slate-200 rounded" />
              <div className="space-y-4">
                <div className="h-24 w-full bg-slate-50 rounded-lg" />
                <div className="h-48 w-full bg-slate-50 rounded-lg" />
                <div className="h-12 w-full bg-slate-100 rounded-lg" />
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6 animate-pulse">
              <div className="h-8 w-48 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 border border-slate-200 rounded-lg animate-pulse">
                  <div className="flex justify-between mb-6">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-3/4 bg-slate-200 rounded" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded" />
                      <div className="h-4 w-1/3 bg-slate-100 rounded" />
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 rounded-lg mb-6">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="space-y-2 text-center">
                        <div className="h-6 w-1/2 mx-auto bg-slate-200 rounded" />
                        <div className="h-2 w-3/4 mx-auto bg-slate-50 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mb-6">
                    <div className="h-4 w-1/4 bg-slate-100 rounded" />
                    <div className="h-4 w-1/4 bg-orange-50 rounded" />
                  </div>
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 w-16 bg-blue-50 rounded-full" />
                    <div className="h-6 w-16 bg-orange-50 rounded-full" />
                  </div>
                  <div className="h-12 w-full bg-slate-200 rounded-lg" />
                </div>
              ))}
            </div>
          </main>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Enhanced Hero Section */}
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              {t('podcasters.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('podcasters.hero.desc')}
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              {t('podcasters.hero.disclaimer')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('podcasters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              {isAuthenticated && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  onClick={() => setShowSubmissionForm(true)}
                  className="bg-[#1976D2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0D47A1] transition-colors shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('podcasters.submitPodcast')}
                </motion.button>
              )}
              {!isAuthenticated && (
                <div className="text-center">
                  <p className="text-[#757575] mb-2">{t('podcasters.wantToSubmit')}</p>
                  <Link
                    to="/login"
                    className="text-[#1976D2] hover:text-[#0D47A1] font-medium"
                  >
                    {t('podcasters.loginToSubmit')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Enhanced Layout */}
      <div className={`${isMobile ? 'flex flex-col' : 'flex'}`}>
        {/* Enhanced Filters Sidebar - 25% width */}
        <aside className={`${sidebarOpen ? (isMobile ? 'w-full' : 'w-80') : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden ${isMobile ? 'order-2' : ''}`} style={{
          minHeight: isMobile ? 'auto' : 'calc(100vh - 200px)',
          position: isMobile ? 'static' : 'sticky',
          top: isMobile ? 'auto' : '80px',
          zIndex: 10,
          borderRight: isMobile ? 'none' : `1px solid ${theme.borderLight}`,
          borderTop: isMobile ? `1px solid ${theme.borderLight}` : 'none',
          width: isMobile ? '100%' : '25%'
        }}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#212121] flex items-center gap-2">
                <Filter size={20} className="text-[#1976D2]" />
                {t('podcasters.filters.title')}
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
                  <Globe size={16} className="text-[#1976D2]" />
                  {t('podcasters.filters.basic')}
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('podcasters.filters.industry')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name} ({category.count})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabs for authenticated users */}
              {isAuthenticated && (
                <div className="bg-[#E3F2FD] rounded-lg p-4 border border-[#1976D2]">
                  <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                    <Users size={16} className="text-[#1976D2]" />
                    {t('podcasters.filters.myContent')}
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('approved')}
                      className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${activeTab === 'approved'
                        ? 'bg-white text-[#1976D2] shadow-sm'
                        : 'text-[#757575] hover:text-[#212121] hover:bg-white'
                        }`}
                    >
                      {t('podcasters.filters.approved')}
                    </button>
                    <button
                      onClick={() => setActiveTab('my-submissions')}
                      className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${activeTab === 'my-submissions'
                        ? 'bg-white text-[#1976D2] shadow-sm'
                        : 'text-[#757575] hover:text-[#212121] hover:bg-white'
                        }`}
                    >
                      {t('podcasters.filters.mySubmissions')}
                    </button>
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                {t('podcasters.filters.clear')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Enhanced */}
        <main className={`flex-1 p-6 min-w-0 ${isMobile ? 'order-1' : ''}`}>
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
                  {t('podcasters.controls.found', { count: filteredPodcasters.length })}
                  {searchQuery && (
                    <span className="ml-2 text-[#757575]">
                      {t('podcasters.controls.for')} "{searchQuery}"
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Podcasters Display */}
          {filteredPodcasters.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPodcasters.map((podcaster, index) => (
                  <Link key={podcaster.id} to={`/podcasters/${createSlugPath(podcaster.podcast_name, podcaster.id)}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Enhanced Podcaster Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                              {podcaster.podcast_name}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <Users size={14} className="mr-2" />
                              <span>{t('podcasters.card.by')} {podcaster.podcast_host || t('podcasters.card.unknownHost')}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <Target size={14} className="mr-2" />
                              <span>{podcaster.podcast_focus_industry}</span>
                            </div>
                          </div>
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.primaryLight }}
                          >
                            <Headphones size={24} className="text-[#1976D2]" />
                          </div>
                        </div>

                        {/* Enhanced Podcast Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.primary }}>
                              {Math.floor(Math.random() * 50) + 10}K
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('podcasters.card.listeners')}</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.success }}>
                              {Math.floor(Math.random() * 200) + 50}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('podcasters.card.episodes')}</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.warning }}>
                              {Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9) + 1}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('podcasters.card.rating')}</div>
                          </div>
                        </div>

                        {/* Enhanced Location and Features */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm" style={{ color: theme.textSecondary }}>
                            <MapPin size={14} className="mr-1" />
                            <span>{podcaster.podcast_region}</span>
                          </div>
                          <div className="flex items-center text-sm" style={{ color: theme.warning }}>
                            <Star size={14} className="mr-1" />
                            <span>4.{Math.floor(Math.random() * 9) + 1}</span>
                          </div>
                        </div>

                        {/* Enhanced Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {podcaster.podcast_target_audience && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F5E8', color: theme.success }}>
                              {podcaster.podcast_target_audience}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFF3E0', color: theme.warning }}>
                            {podcaster.podcast_region}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F3E5F5', color: theme.info }}>
                            {t('podcasters.card.active')}
                          </span>
                        </div>

                        {/* Enhanced CTA Button */}
                        <button
                          className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          style={{ backgroundColor: theme.primary }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                        >
                          <Play size={16} />
                          {t('podcasters.card.listenNow')}
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme.backgroundSoft }}
              >
                <Headphones size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                {t('podcasters.empty.title')}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                {t('podcasters.empty.desc')}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  clearAllFilters();
                }}
                className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('podcasters.filters.clear')}
              </button>
            </div>
          )}
        </main>
      </div>

      <UserFooter />

      {/* Podcaster Submission Form Modal */}
      {showSubmissionForm && (
        <PodcasterSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            setShowSubmissionForm(false);
            // Refresh data based on active tab
            if (activeTab === 'approved' || !isAuthenticated) {
              fetchPodcasters();
            }
            if (activeTab === 'my-submissions') {
              fetchUserSubmissions();
            }
          }}
        />
      )}
    </div>
  );
};

export default PodcastersList;
