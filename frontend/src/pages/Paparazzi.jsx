import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera, Search, Filter, Globe, MapPin, Users, DollarSign, Plus, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { createSlugPath } from '../utils/slugify';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationArray } from '../hooks/useTranslation';

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

const PaparazziPage = () => {
  const { t } = useLanguage();
  const [paparazzi, setPaparazzi] = useState([]);
  const { translatedItems: translatedPaparazzi, isTranslating } = useTranslationArray(paparazzi, ['category', 'region_focused']);
  const [filteredPaparazzi, setFilteredPaparazzi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPaparazzi();
  }, []);

  useEffect(() => {
    filterPaparazzi();
  }, [translatedPaparazzi, searchQuery, selectedCategory, selectedLocation]);

  const fetchPaparazzi = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add search and filter parameters
      if (searchQuery.trim()) {
        params.append('instagram_page_name', searchQuery.trim());
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedLocation && selectedLocation !== 'all') {
        params.append('region_focused', selectedLocation);
      }

      const response = await api.get(`/admin/paparazzi-creations/public/list?${params.toString()}`);
      const paparazziData = response.data.paparazziCreations || [];

      setPaparazzi(paparazziData);
    } catch (err) {
      console.error('Error fetching paparazzi:', err);
      setError('Failed to load paparazzi. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterPaparazzi = useCallback(() => {
    let filtered = translatedPaparazzi.filter(p => {
      const matchesSearch = p.instagram_page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.region_focused && p.region_focused.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesLocation = selectedLocation === 'all' || (p.region_focused && p.region_focused.toLowerCase().includes(selectedLocation.toLowerCase()));
      return matchesSearch && matchesCategory && matchesLocation;
    });
    setFilteredPaparazzi(filtered);
  }, [translatedPaparazzi, searchQuery, selectedCategory, selectedLocation]);

  const categories = ['all', ...new Set(translatedPaparazzi.map(p => p.category).filter(Boolean))];
  const locations = ['all', ...new Set(translatedPaparazzi.map(p => p.region_focused).filter(Boolean))];

  const handleCardClick = (paparazzi) => {
    navigate(`/paparazzi/${createSlugPath(paparazzi.instagram_page_name, paparazzi.id)}`);
  };

  const handleSubmitNew = () => {
    if (!isAuthenticated) {
      // TODO: Show login modal or redirect to login
      alert('Please login to submit new paparazzi');
      return;
    }
    navigate('/paparazzi/submit');
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price) => {
    return price ? `$${price}` : 'Contact for pricing';
  };

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
              {t('paparazzi.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('paparazzi.hero.subtitle')}
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              {t('paparazzi.hero.disclaimer')}
            </p>
            <div className="mt-8">
              <button
                onClick={handleSubmitNew}
                className="inline-flex items-center gap-2 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565C0] transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('paparazzi.submitNew')}
              </button>
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
                {t('paparazzi.filters.title')}
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
                  <Camera size={16} className="text-[#1976D2]" />
                  {t('paparazzi.filters.basic')}
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('paparazzi.filters.category')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? t('paparazzi.filters.allCategories') : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('paparazzi.filters.location')}
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {locations.map(location => (
                        <option key={location} value={location}>
                          {location === 'all' ? t('paparazzi.filters.allLocations') : location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                {t('paparazzi.filters.clear')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Enhanced */}
        <main className={`flex-1 p-6 min-w-0 ${isMobile ? 'order-1' : ''}`}>
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={t('paparazzi.hero.searchPlaceholder')}
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
                    <span className="text-[#212121]">{t('paparazzi.controls.filters')}</span>
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
                  {filteredPaparazzi.length} paparazzi found
                  {searchQuery && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchQuery}"
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Paparazzi Display */}
          {loading ? (
            <div className="animate-pulse space-y-8">
              {/* Search Bar Skeleton */}
              <div className="max-w-2xl mx-auto h-14 bg-slate-100 rounded-lg mb-8" />

              {/* Controls Bar Skeleton */}
              <div className="bg-white rounded-lg border p-6 mb-6 flex justify-between items-center">
                <div className="h-8 w-32 bg-slate-100 rounded" />
                <div className="h-8 w-24 bg-slate-50 rounded" />
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg border p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full" />
                      <div className="h-6 w-20 bg-blue-50 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 bg-slate-200 rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-slate-100 rounded" />
                        <div className="h-4 w-1/4 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="h-4 bg-slate-50 rounded" />
                      <div className="h-4 bg-slate-50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPaparazzi.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCardClick(p)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <img
                            src={p.profile_dp_logo || "/logo.png"}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#E0E0E0]"
                            onError={(e) => {
                              e.target.src = "/logo.png";
                            }}
                          />
                          <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-3 py-1 rounded-full">
                            {t('paparazzi.card.instagram')}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#212121] mb-2 line-clamp-2">
                          {p.instagram_page_name}
                        </h3>
                        <div className="space-y-2 text-sm text-[#757575]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{formatFollowers(p.no_of_followers)} {t('paparazzi.card.followers')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <small>{t('paparazzi.card.asOf')} 01st Dec 2025</small>
                          </div>
                          {p.category && (
                            <div className="flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              <span>{p.category}</span>
                            </div>
                          )}
                          {p.region_focused && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{p.region_focused}</span>
                            </div>
                          )}
                          {p.instagram_url && (
                            <div className="flex items-center gap-2 pt-2 border-t border-[#E0E0E0]">
                              <Globe className="w-4 h-4" />
                              <a href={p.instagram_url} target="_blank" rel="noopener noreferrer" className="text-[#1976D2] hover:underline">
                                {t('paparazzi.card.viewProfile')}
                              </a>
                            </div>
                          )}
                        </div>
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
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.page')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.followers')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.category')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.region')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.url')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.image')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('paparazzi.table.action')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPaparazzi.map((p, index) => (
                          <tr
                            key={p.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handleCardClick(p)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryLight }}
                                >
                                  <Camera size={20} style={{ color: theme.primary }} />
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {p.instagram_page_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <span className="text-sm font-medium" style={{ color: theme.primary }}>
                                  {formatFollowers(p.no_of_followers)}
                                </span>
                                <div className="text-xs" style={{ color: theme.textSecondary }}>
                                  {t('paparazzi.card.asOf')} 01st Dec 2025
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {p.category || 'General'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {p.region_focused || 'Global'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {p.instagram_url ? (
                                <a href={p.instagram_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: theme.primary }}>
                                  {t('paparazzi.table.viewProfile')}
                                </a>
                              ) : (
                                <span className="text-sm" style={{ color: theme.textSecondary }}>{t('paparazzi.table.na')}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <img
                                src={p.profile_dp_logo || "/logo.png"}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/logo.png";
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                style={{ backgroundColor: theme.primary }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                              >
                                {t('paparazzi.table.viewDetails')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!loading && !error && filteredPaparazzi.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-12 h-12 text-[#BDBDBD]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                    {t('paparazzi.empty.title')}
                  </h3>
                  <p className="text-[#757575] text-lg max-w-md mx-auto">
                    {t('paparazzi.empty.desc')}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      clearAllFilters();
                    }}
                    className="mt-6 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors"
                  >
                    {t('paparazzi.empty.clear')}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <UserFooter />
    </div>
  );
};

export default PaparazziPage;