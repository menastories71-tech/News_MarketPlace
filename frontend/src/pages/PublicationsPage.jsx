import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import { createSlugPath } from '../utils/slugify';
import PublicationSubmissionForm from '../components/user/PublicationSubmissionForm';
import {
  Search, Filter, Eye, Heart, Share, Grid, List, Star, Clock,
  TrendingUp, Globe, BookOpen, Award, Target, Zap, CheckCircle,
  ExternalLink, MapPin, Calendar, DollarSign, BarChart3, Users,
  Link as LinkIcon, Image as ImageIcon, FileText, Shield,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Newspaper, Plus
} from 'lucide-react';
import Skeleton from '../components/common/Skeleton';

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
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const PublicationsPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [regionFilter, setRegionFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [focusFilter, setFocusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [daRange, setDaRange] = useState([0, 100]);
  const [drRange, setDrRange] = useState([0, 100]);
  const [tatFilter, setTatFilter] = useState([]);
  const [dofollowFilter, setDofollowFilter] = useState('all');

  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Groups data
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Enhanced search and filter with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on filter change
      fetchPublications();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, regionFilter, languageFilter, focusFilter, priceRange, daRange, drRange, tatFilter, dofollowFilter, sortField, sortDirection, pageSize]);

  // Fetch when page changes
  useEffect(() => {
    fetchPublications();
  }, [currentPage]);

  const fetchPublications = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortField,
        sortOrder: sortDirection
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (regionFilter) params.append('region', regionFilter);
      if (languageFilter) params.append('language', languageFilter);
      if (focusFilter) params.append('publication_primary_focus', focusFilter);

      // Range filters
      if (priceRange[0] > 0) params.append('price_min', priceRange[0].toString());
      if (priceRange[1] < 20000) params.append('price_max', priceRange[1].toString());
      if (daRange[0] > 0) params.append('da_min', daRange[0].toString());
      if (daRange[1] < 100) params.append('da_max', daRange[1].toString());
      if (drRange[0] > 0) params.append('dr_min', drRange[0].toString());
      if (drRange[1] < 100) params.append('dr_max', drRange[1].toString());

      // TAT filter mapping
      if (tatFilter.length > 0) {
        // Find min and max days across all selected filters
        let min = 1000, max = 0;
        tatFilter.forEach(filter => {
          switch (filter) {
            case '1-5 days': min = Math.min(min, 1); max = Math.max(max, 5); break;
            case '6-10 days': min = Math.min(min, 6); max = Math.max(max, 10); break;
            case '2-3 weeks': min = Math.min(min, 14); max = Math.max(max, 21); break;
            case '4-6 weeks': min = Math.min(min, 28); max = Math.max(max, 42); break;
          }
        });
        if (min < 1000) params.append('tat_min', min.toString());
        if (max > 0) params.append('tat_max', max.toString());
      }

      if (dofollowFilter !== 'all') {
        params.append('do_follow', dofollowFilter === 'dofollow' ? 'true' : 'false');
      }

      const response = await api.get(`/admin/publication-management?${params.toString()}`);

      setPublications(response.data.publications || []);
      setTotalRecords(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.pages || 0);
    } catch (error) {
      console.error('Error fetching publications:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPublications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const clearAllFilters = () => {
    setRegionFilter('');
    setLanguageFilter('');
    setFocusFilter('');
    setPriceRange([0, 20000]);
    setDaRange([0, 100]);
    setDrRange([0, 100]);
    setTatFilter([]);
    setDofollowFilter('all');
    setCurrentPage(1);
  };


  const toggleTatFilter = (tatOption) => {
    setTatFilter(prev =>
      prev.includes(tatOption)
        ? prev.filter(t => t !== tatOption)
        : [...prev, tatOption]
    );
  };

  const hasActiveFilters = () => {
    return regionFilter || languageFilter || focusFilter ||
      priceRange[0] > 0 || priceRange[1] < 20000 ||
      daRange[0] > 0 || daRange[1] < 100 ||
      drRange[0] > 0 || drRange[1] < 100 ||
      tatFilter.length > 0 || (dofollowFilter !== '');
  };

  const formatTAT = (days) => {
    if (!days || days === 0) return 'N/A';
    if (days === 1) return '1-5 days';
    if (days <= 5) return '1-5 days';
    if (days <= 10) return '6-10 days';
    if (days <= 21) return '2-3 weeks';
    return '4-6 weeks';
  };

  const getDAScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  };

  const getDRScoreColor = (score) => {
    if (score >= 70) return '#2196F3';
    if (score >= 50) return '#00BCD4';
    if (score >= 30) return '#9C27B0';
    if (score >= 10) return '#E91E63';
    return '#F44336';
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handlePublicationClick = (publication) => {
    navigate(`/publications/${createSlugPath(publication.publication_name, publication.id)}`);
  };

  // Get unique values for filter options
  const getUniqueRegions = () => {
    const regions = publications.map(pub => pub.region).filter(Boolean);
    const uniqueRegions = [...new Set(regions)].sort();
    // Add "Other" option if not already present
    if (!uniqueRegions.includes('Other')) {
      uniqueRegions.push('Other');
    }
    return uniqueRegions;
  };

  const getUniqueLanguages = () => {
    const languages = publications.map(pub => pub.language).filter(Boolean);
    return [...new Set(languages)].sort();
  };

  const getUniqueFocus = () => {
    const focuses = publications.map(pub => pub.publication_primary_focus).filter(Boolean);
    const uniqueFocuses = [...new Set(focuses)].sort();
    // Add "Other" option if not already present
    if (!uniqueFocuses.includes('Other')) {
      uniqueFocuses.push('Other');
    }
    return uniqueFocuses;
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Contact for pricing';
  };

  if (loading && publications.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-[#E3F2FD] to-white">
          <div className="max-w-7xl mx-auto text-center">
            <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
            <Skeleton className="h-14 w-full max-w-xl mx-auto rounded-lg" />
          </div>
        </section>
        <div className="flex max-w-7xl mx-auto p-6 gap-6">
          <aside className="w-1/4 hidden md:block">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <div className="space-y-6">
              <div className="p-4 border rounded-lg space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="p-4 border border-orange-200 rounded-lg space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="p-4 border border-blue-200 rounded-lg space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </aside>
          <main className="flex-1">
            <Skeleton className="h-20 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 border rounded-lg">
                  <div className="flex justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-12 w-20 rounded-lg" />
                  </div>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
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
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Enhanced Hero Section */}
      <section className="relative py-4 md:py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#212121] mb-4 tracking-tight">
              {t('publications.hero.title')}
            </h1>
            <p className="text-base md:text-lg text-[#757575] max-w-2xl mx-auto leading-relaxed font-light mb-6">
              {t('publications.hero.desc')}
            </p>


            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('publications.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-[#E0E0E0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: theme.textSecondary }} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
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
                {t('publications.filters.title')}
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
                  {t('publications.filters.basic')}
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Region Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('publications.filters.region')}
                    </label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('publications.filters.allRegions')}</option>
                      {getUniqueRegions().map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('publications.filters.language')}
                    </label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('publications.filters.allLanguages')}</option>
                      {getUniqueLanguages().map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>

                  {/* Industry/Niche Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('publications.filters.industry')}
                    </label>
                    <select
                      value={focusFilter}
                      onChange={(e) => setFocusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('publications.filters.allIndustries')}</option>
                      {getUniqueFocus().map(focus => (
                        <option key={focus} value={focus}>{focus}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Range Section */}
              <div className="bg-[#FFF8E1] rounded-lg p-4 border border-[#FF9800]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-[#FF9800]" />
                  {t('publications.filters.priceRange')}
                </h4>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    {t('publications.filters.priceRange')}: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="50"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-[#FF9800]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#FF9800]"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Metrics Section */}
              <div className="bg-[#E3F2FD] rounded-lg p-4 border border-[#1976D2]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#1976D2]" />
                  {t('publications.filters.seoMetrics')}
                </h4>

                {/* DA Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    {t('publications.filters.domainAuthority')}: {daRange[0]} - {daRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={daRange[0]}
                      onChange={(e) => setDaRange([parseInt(e.target.value), daRange[1]])}
                      className="w-full accent-[#1976D2]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={daRange[1]}
                      onChange={(e) => setDaRange([daRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#1976D2]"
                    />
                  </div>
                </div>

                {/* DR Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    {t('publications.filters.domainRating')}: {drRange[0]} - {drRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={drRange[0]}
                      onChange={(e) => setDrRange([parseInt(e.target.value), drRange[1]])}
                      className="w-full accent-[#1976D2]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={drRange[1]}
                      onChange={(e) => setDrRange([drRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#1976D2]"
                    />
                  </div>
                </div>

                {/* Link Type */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: theme.textPrimary }}>
                    {t('publications.filters.linkType')}
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                    <input
                      type="checkbox"
                      checked={dofollowFilter === 'dofollow'}
                      onChange={(e) => setDofollowFilter(e.target.checked ? 'dofollow' : 'all')}
                      className="rounded accent-[#1976D2]"
                    />
                    <span className="text-sm" style={{ color: theme.textPrimary }}>{t('publications.filters.doFollow')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                    <input
                      type="checkbox"
                      checked={dofollowFilter === 'nofollow'}
                      onChange={(e) => setDofollowFilter(e.target.checked ? 'nofollow' : 'all')}
                      className="rounded accent-[#1976D2]"
                    />
                    <span className="text-sm" style={{ color: theme.textPrimary }}>{t('publications.filters.noFollow')}</span>
                  </label>
                </div>
              </div>

              {/* TAT Filter */}
              <div className="bg-[#FFF3E0] rounded-lg p-4 border border-[#FF9800]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#FF9800]" />
                  {t('publications.filters.tat')}
                </h4>
                <div className="space-y-3">
                  {['1-5 days', '6-10 days', '2-3 weeks', '4-6 weeks'].map(tat => (
                    <label key={tat} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                      <input
                        type="checkbox"
                        checked={tatFilter.includes(tat)}
                        onChange={() => toggleTatFilter(tat)}
                        className="rounded accent-[#FF9800]"
                      />
                      <span className="text-sm" style={{ color: theme.textPrimary }}>{tat}</span>
                    </label>
                  ))}
                </div>
              </div>


              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                {t('publications.filters.clear')}
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
                    <span className="text-[#212121]">{t('publications.filters.mobileToggle')}</span>
                  </button>
                )}

                {/* View Toggle */}
                <div className="flex items-center bg-[#F5F5F5] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                      ? 'bg-white shadow-sm text-[#1976D2]'
                      : 'text-[#757575] hover:text-[#212121]'
                      }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white shadow-sm text-[#1976D2]'
                      : 'text-[#757575] hover:text-[#212121]'
                      }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                <span className="text-sm font-medium text-[#212121]">
                  {totalRecords} {t('publications.results.found')}
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      {t('publications.results.for')} "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">{t('publications.results.sortBy')}:</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="publication_name-asc">{t('publications.results.sort.nameAsc')}</option>
                  <option value="publication_name-desc">{t('publications.results.sort.nameDesc')}</option>
                  <option value="price_usd-asc">{t('publications.results.sort.priceLow')}</option>
                  <option value="price_usd-desc">{t('publications.results.sort.priceHigh')}</option>
                  <option value="da-desc">{t('publications.results.sort.daHigh')}</option>
                  <option value="da-asc">{t('publications.results.sort.daLow')}</option>
                  <option value="dr-desc">{t('publications.results.sort.drHigh')}</option>
                  <option value="dr-asc">{t('publications.results.sort.drLow')}</option>
                  <option value="region-asc">{t('publications.results.sort.regionAsc')}</option>
                  <option value="language-asc">{t('publications.results.sort.languageAsc')}</option>
                  <option value="committed_tat-asc">{t('publications.results.sort.tatFast')}</option>
                  <option value="committed_tat-desc">{t('publications.results.sort.tatSlow')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Publications Display */}
          {totalRecords > 0 ? (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-3 gap-6">
                  {publications.map((publication, index) => (
                    <motion.div
                      key={publication.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handlePublicationClick(publication)}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Rating Type or NEW Badge - Angled at top left */}
                      {(() => {
                        // Show rating type first if exists
                        if (publication.rating_type) {
                          const badgeColors = {
                            'Customer Choice': 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                            'Best Seller': 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                            'Editor\'s Pick': 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                            'Trending': 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
                            'Featured': 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
                          };

                          const getBadgeLabel = (type) => {
                            switch (type) {
                              case 'Customer Choice': return t('publications.badges.customerChoice');
                              case 'Best Seller': return t('publications.badges.bestSeller');
                              case 'Editor\'s Pick': return t('publications.badges.editorsPick');
                              case 'Trending': return t('publications.badges.trending');
                              case 'Featured': return t('publications.badges.featured');
                              default: return type;
                            }
                          };

                          const badgeColor = badgeColors[publication.rating_type] || 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)';

                          return (
                            <div
                              className="absolute top-0 left-0 text-white text-xs font-bold px-3 py-1 rounded-br-lg transform -rotate-12 shadow-lg z-10"
                              style={{
                                background: badgeColor,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                              }}
                            >
                              {getBadgeLabel(publication.rating_type)}
                            </div>
                          );
                        }

                        // Otherwise show NEW if recently added
                        const createdDate = new Date(publication.created_at);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return createdDate > thirtyDaysAgo ? (
                          <div
                            className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg transform -rotate-12 shadow-lg z-10"
                            style={{
                              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                              boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
                            }}
                          >
                            {t('publications.badges.new')}
                          </div>
                        ) : null;
                      })()}

                      {/* Enhanced Publication Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                              {publication.publication_name}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <Globe size={14} className="mr-2" />
                              <span>{publication.region}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <BookOpen size={14} className="mr-2" />
                              <span>{publication.language}</span>
                            </div>
                          </div>
                          <div className="w-20 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 rounded-lg p-1">
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
                                className="w-8 h-8 object-contain opacity-50"
                              />
                            )}
                          </div>
                        </div>

                        {/* Enhanced SEO Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.primary }}>{publication.da || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>DA</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.success }}>{publication.dr || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>DR</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: publication.do_follow ? '#4CAF50' : '#F44336' }}>
                              {publication.do_follow ? 'Do' : 'No'}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Follow</div>
                          </div>
                        </div>

                        {/* Enhanced Price */}
                        <div className="flex items-center justify-center mb-4">
                          <div className="text-xl font-bold" style={{ color: theme.success }}>
                            {formatPrice(publication.price_usd)}
                          </div>
                        </div>

                        {/* Rating Type Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {/* Word Limit Badge */}
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E3F2FD', color: theme.primary }}>
                            {publication.word_limit ? t('publications.badges.wordCount', { count: publication.word_limit }) : t('publications.badges.wordCountTba')}
                          </span>

                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFF8E1', color: theme.warning }}>
                            {formatTAT(publication.committed_tat)}
                          </span>
                        </div>

                        {/* Enhanced CTA Button */}
                        <button
                          className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          style={{ backgroundColor: theme.primary }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                        >
                          <Eye size={16} />
                          {t('publications.table.viewDetails')}
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Enhanced List View - Table Format */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-lg border overflow-hidden" style={{
                  borderColor: theme.borderLight,
                  boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: theme.backgroundSoft }}>
                        <tr>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('publication_name')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.publication')} {getSortIcon('publication_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('region')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.region')} {getSortIcon('region')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('language')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.language')} {getSortIcon('language')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('da')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.da')} {getSortIcon('da')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('dr')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.dr')} {getSortIcon('dr')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('price_usd')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.price')} {getSortIcon('price_usd')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('committed_tat')}
                          >
                            <div className="flex items-center gap-2">
                              {t('publications.table.tat')} {getSortIcon('committed_tat')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('publications.table.features')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('publications.table.action')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {publications.map((publication, index) => (
                          <tr
                            key={publication.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handlePublicationClick(publication)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-10 rounded shadow-sm bg-gray-50 flex items-center justify-center overflow-hidden p-1">
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
                                      className="w-6 h-6 object-contain opacity-50"
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {publication.publication_name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    {publication.publication_primary_focus}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {publication.region}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {publication.language}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: getDAScoreColor(publication.da) }}
                              >
                                {publication.da || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: getDRScoreColor(publication.dr) }}
                              >
                                {publication.dr || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-lg font-bold" style={{ color: theme.success }}>
                                {formatPrice(publication.price_usd)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {formatTAT(publication.committed_tat)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {publication.do_follow && (
                                  <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#F3E5F5', color: theme.info }}>
                                    {t('publications.table.doFollow')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                style={{ backgroundColor: theme.primary }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                              >
                                <Eye size={14} className="inline mr-1" />
                                {t('publications.table.view')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Enhanced Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: theme.borderLight }}>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {t('publications.pagination.showing', { start: ((currentPage - 1) * pageSize) + 1, end: Math.min(currentPage * pageSize, totalRecords), total: totalRecords })}
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976D2] bg-white"
                      style={{ borderColor: theme.borderLight, color: theme.textPrimary }}
                    >
                      <option value={12}>{t('publications.pagination.perPage', { count: 12 })}</option>
                      <option value={24}>{t('publications.pagination.perPage', { count: 24 })}</option>
                      <option value={48}>{t('publications.pagination.perPage', { count: 48 })}</option>
                      <option value={96}>{t('publications.pagination.perPage', { count: 96 })}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 active:scale-95'}`}
                      style={{ borderColor: theme.borderLight, color: theme.textPrimary }}
                    >
                      {t('publications.pagination.previous')}
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === pageNum ? 'text-white' : 'hover:bg-gray-100'}`}
                            style={{
                              backgroundColor: currentPage === pageNum ? theme.primary : 'transparent',
                              color: currentPage === pageNum ? '#fff' : theme.textPrimary
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 active:scale-95'}`}
                      style={{ borderColor: theme.borderLight, color: theme.textPrimary }}
                    >
                      {t('publications.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme.backgroundSoft }}
              >
                <Newspaper size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                {t('publications.empty.title')}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                {t('publications.empty.desc')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAllFilters();
                }}
                className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('publications.filters.clear')}
              </button>
            </div>
          )}
        </main>
      </div>

      <UserFooter />

      {/* Publication Submission Form Modal */}
      {showSubmissionForm && (
        <PublicationSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => setShowSubmissionForm(false)}
        />
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

export default PublicationsPage;
