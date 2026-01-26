import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createSlugPath } from '../utils/slugify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  Search, Filter, Eye, Heart, Globe, MapPin, Users,
  Star, TrendingUp, Instagram, Youtube, Twitter,
  Facebook, Hash, DollarSign, ExternalLink, Grid, List,
  ArrowUpDown, ArrowUp, ArrowDown, BarChart3
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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

const ThemesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [followerFilter, setFollowerFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: 'approved',
        is_active: 'true'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (platformFilter) params.append('platform', platformFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (followerFilter) params.append('follower_range', followerFilter);

      const response = await api.get(`/themes?${params.toString()}`);
      let themesData = response.data.themes || [];

      setThemes(themesData);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching themes:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setThemes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchThemes(1); // Reset to first page on filter change
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, platformFilter, categoryFilter, locationFilter, followerFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getUniquePlatforms = () => {
    const platforms = themes.map(t => t.platform).filter(Boolean);
    return [...new Set(platforms)].sort();
  };

  const getUniqueCategories = () => {
    const categories = themes.map(t => t.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  const getUniqueLocations = () => {
    const locations = themes.map(t => t.location).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const formatFollowers = (count) => {
    if (!count) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const handleThemeClick = (theme) => {
    navigate(`/themes/${createSlugPath(theme.page_name, theme.id)}`);
  };

  const handlePageChange = (page) => {
    fetchThemes(page);
  };

  // Sorting logic
  const sortedThemes = useMemo(() => {
    return [...themes].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'no_of_followers') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [themes, sortField, sortDirection]);

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

  const followerRanges = [
    { value: '', label: t('themes.filters.allFollowers') },
    { value: '0-1000', label: '0 - 1K' },
    { value: '1000-10000', label: '1K - 10K' },
    { value: '10000-50000', label: '10K - 50K' },
    { value: '50000-100000', label: '50K - 100K' },
    { value: '100000-500000', label: '100K - 500K' },
    { value: '500000+', label: '500K+' }
  ];

  if (loading && themes.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto text-center space-y-6 animate-pulse">
            <div className="h-16 w-3/4 mx-auto bg-slate-200 rounded-lg" />
            <div className="h-6 w-1/2 mx-auto bg-slate-100 rounded" />
            <div className="h-14 w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg" />
          </div>
        </section>
        <div className="flex max-w-7xl mx-auto p-6 gap-6">
          <aside className="w-1/4 hidden md:block">
            <div className="p-6 h-full bg-white rounded-lg border border-slate-200 animate-pulse">
              <div className="h-10 w-1/2 mb-6 bg-slate-200 rounded" />
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-10 w-full bg-white border border-slate-200 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-10 w-full bg-white border border-slate-200 rounded" />
                </div>
                <div className="h-12 w-full bg-slate-100 rounded-lg" />
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-slate-100 rounded" />
                <div className="h-8 w-32 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 border border-slate-200 rounded-2xl space-y-6 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-8 w-24 bg-slate-100 rounded-full" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full" />
                    <div className="h-6 w-3/4 mx-auto bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 mx-auto bg-slate-100 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 w-full bg-slate-50 rounded-xl" />
                    <div className="h-16 w-full bg-slate-50 rounded-xl" />
                  </div>
                  <div className="flex justify-between border-t border-slate-50 pt-4">
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-12 w-full bg-slate-200 rounded-xl" />
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
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              {t('themes.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('themes.hero.desc')}
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              {t('themes.hero.disclaimer')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('themes.hero.searchPlaceholder')}
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
          </motion.div>
        </div>
      </section>

      {/* Main Content with Enhanced Layout */}
      <div className={`${isMobile ? 'flex flex-col' : 'flex'}`}>
        {/* Enhanced Filters Sidebar */}
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
                {t('themes.filters.title')}
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
              {/* Basic Filters */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-[#1976D2]" />
                  {t('themes.filters.basic')}
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Platform Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('themes.filters.platform')}
                    </label>
                    <select
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('themes.filters.allPlatforms')}</option>
                      {getUniquePlatforms().map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('themes.filters.category')}
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('themes.filters.allCategories')}</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('themes.filters.location')}
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('themes.filters.allLocations')}</option>
                      {getUniqueLocations().map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Followers Range */}
              <div className="bg-[#FFF3E0] rounded-lg p-4 border border-[#FF9800]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Users size={16} className="text-[#FF9800]" />
                  {t('themes.filters.followersRange')}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('themes.filters.followers')}
                    </label>
                    <select
                      value={followerFilter}
                      onChange={(e) => setFollowerFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#FF9800] bg-white text-[#212121]"
                    >
                      {followerRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPlatformFilter('');
                  setCategoryFilter('');
                  setLocationFilter('');
                  setFollowerFilter('');
                }}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                {t('themes.filters.clear')}
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
                    <span className="text-[#212121]">{t('themes.controls.filters')}</span>
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
                  {t('themes.controls.found', { count: totalCount })}
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      {t('themes.controls.for')} "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">{t('themes.controls.sortBy')}</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="page_name-asc">{t('themes.controls.sortOptions.nameAsc')}</option>
                  <option value="page_name-desc">{t('themes.controls.sortOptions.nameDesc')}</option>
                  <option value="platform-asc">{t('themes.controls.sortOptions.platformAsc')}</option>
                  <option value="platform-desc">{t('themes.controls.sortOptions.platformDesc')}</option>
                  <option value="category-asc">{t('themes.controls.sortOptions.categoryAsc')}</option>
                  <option value="category-desc">{t('themes.controls.sortOptions.categoryDesc')}</option>
                  <option value="no_of_followers-desc">{t('themes.controls.sortOptions.followersDesc')}</option>
                  <option value="no_of_followers-asc">{t('themes.controls.sortOptions.followersAsc')}</option>
                  <option value="location-asc">{t('themes.controls.sortOptions.locationAsc')}</option>
                  <option value="location-desc">{t('themes.controls.sortOptions.locationDesc')}</option>
                  <option value="created_at-desc">{t('themes.controls.sortOptions.newest')}</option>
                  <option value="created_at-asc">{t('themes.controls.sortOptions.oldest')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Themes Display */}
          {sortedThemes.length > 0 ? (
            <>
              {/* Modern Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {sortedThemes.map((theme, index) => (
                    <motion.div
                      key={theme.id}
                      onClick={() => handleThemeClick(theme)}
                      className="bg-white rounded-2xl shadow-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden relative"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 10px 25px rgba(2,6,23,0.08)'
                      }}
                    >
                      {/* Gradient Background Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                      {/* Platform Badge - Top Left */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                          <div style={{ color: theme.primary }}>
                            {getPlatformIcon(theme.platform)}
                          </div>
                          <span className="text-xs font-semibold text-[#1976D2]">
                            {theme.platform}
                          </span>
                        </div>
                      </div>

                      {/* Star Rating - Top Right */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                          <Star size={16} style={{ color: '#FFD700' }} fill="#FFD700" />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="p-6 pt-16">
                        {/* Profile Section */}
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center shadow-md">
                            <span className="text-xl font-bold text-[#1976D2]">
                              {theme.page_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-1 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                            {theme.page_name}
                          </h3>
                          <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                            @{theme.username}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center p-3 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] rounded-xl">
                            <Users size={18} className="mx-auto mb-1" style={{ color: '#FF9800' }} />
                            <div className="text-sm font-bold" style={{ color: '#E65100' }}>
                              {formatFollowers(theme.no_of_followers)}
                            </div>
                            <div className="text-xs" style={{ color: '#BF360C' }}>{t('themes.card.followers')}</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-[#E8F5E8] to-[#C8E6C9] rounded-xl">
                            <DollarSign size={18} className="mx-auto mb-1" style={{ color: '#4CAF50' }} />
                            <div className="text-sm font-bold" style={{ color: '#2E7D32' }}>
                              {formatPrice(theme.price_reel_without_tagging_collaboration).replace('$', '')}
                            </div>
                            <div className="text-xs" style={{ color: '#388E3C' }}>{t('themes.card.starting')}</div>
                          </div>
                        </div>

                        {/* Location & Category */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1 text-sm" style={{ color: theme.textSecondary }}>
                            <MapPin size={14} />
                            <span className="font-medium">{theme.location}</span>
                          </div>
                          <span className="px-3 py-1 bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] text-xs font-semibold rounded-full" style={{ color: '#E65100' }}>
                            {theme.category}
                          </span>
                        </div>

                        {/* Collaboration Preview */}
                        {theme.collaboration && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-[#F3E5F5] to-[#E1BEE7] rounded-lg">
                            <div className="text-sm font-medium line-clamp-2" style={{ color: '#7B1FA2' }}>
                              {theme.collaboration.length > 80 ? `${theme.collaboration.substring(0, 80)}...` : theme.collaboration}
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <button
                          className="w-full bg-gradient-to-r from-[#1976D2] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Eye size={16} />
                          {t('themes.card.viewProfile')}
                          <ExternalLink size={14} />
                        </button>
                      </div>

                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#1976D2]/20 transition-all duration-300"></div>
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
                      <thead>
                        <tr style={{ backgroundColor: theme.backgroundSoft, borderBottom: '2px solid #e2e8f0' }}>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('page_name')}
                          >
                            <div className="flex items-center gap-2">
                              {t('themes.table.theme')} {getSortIcon('page_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('platform')}
                          >
                            <div className="flex items-center gap-2">
                              {t('themes.table.platform')} {getSortIcon('platform')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('category')}
                          >
                            <div className="flex items-center gap-2">
                              {t('themes.table.category')} {getSortIcon('category')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('no_of_followers')}
                          >
                            <div className="flex items-center gap-2">
                              {t('themes.table.followers')} {getSortIcon('no_of_followers')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('location')}
                          >
                            <div className="flex items-center gap-2">
                              {t('themes.table.location')} {getSortIcon('location')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('themes.table.action')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedThemes.map((theme, index) => (
                          <tr
                            key={theme.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handleThemeClick(theme)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryLight }}
                                >
                                  {getPlatformIcon(theme.platform)}
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {theme.page_name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    @{theme.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {theme.platform}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {theme.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {formatFollowers(theme.no_of_followers)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {theme.location}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                style={{ backgroundColor: theme.primary }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleThemeClick(theme);
                                }}
                              >
                                <Eye size={14} className="inline mr-1" />
                                {t('themes.table.view')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border border-[#E0E0E0] rounded-lg transition-colors ${currentPage === page
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
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme.backgroundSoft }}
              >
                <Hash size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                {t('themes.empty.title')}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                {t('themes.empty.desc')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPlatformFilter('');
                  setCategoryFilter('');
                  setLocationFilter('');
                  setFollowerFilter('');
                }}
                className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('themes.empty.clear')}
              </button>
            </div>
          )}
        </main>
      </div>

      <UserFooter />

      <AuthModal
        isOpen={showAuth}
        onClose={handleCloseAuth}
        onLoginSuccess={handleCloseAuth}
      />
    </div>
  );
};

export default ThemesPage;