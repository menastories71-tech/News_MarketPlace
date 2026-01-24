import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radio, Search, Filter, Globe, MapPin, User, Grid, List, ExternalLink, Building, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';

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

import { useLanguage } from '../context/LanguageContext';

const RadioPage = () => {
  const { t } = useLanguage();
  const [radios, setRadios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [languageFilter, setLanguageFilter] = useState('');
  const [emirateFilter, setEmirateFilter] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('radio_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchRadios();
  }, []);

  const fetchRadios = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add pagination
      params.append('page', page.toString());
      params.append('limit', '20'); // Show 20 per page for better UX

      // Add search parameters
      if (searchTerm.trim()) {
        params.append('radio_name', searchTerm.trim());
        params.append('frequency', searchTerm.trim());
      }

      // Add filter parameters
      if (languageFilter) params.append('radio_language', languageFilter);
      if (emirateFilter) params.append('emirate_state', emirateFilter);

      const response = await api.get(`/radios?${params.toString()}`);

      setRadios(response.data.radios || []);
      setTotalCount(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.pages || 1);
      setCurrentPage(response.data.pagination?.page || 1);
    } catch (error) {
      console.error('Error fetching radios:', error);
      setRadios([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRadios();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, languageFilter, emirateFilter]);

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRadios(page);
  };

  // Sorting logic
  const sortedRadios = useMemo(() => {
    return [...radios].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
  }, [radios, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearAllFilters = () => {
    setLanguageFilter('');
    setEmirateFilter('');
  };

  const hasActiveFilters = () => {
    return languageFilter || emirateFilter;
  };

  // Get unique values for filter options
  const getUniqueLanguages = () => {
    const languages = radios.map(r => r.radio_language).filter(Boolean);
    return [...new Set(languages)].sort();
  };

  const getUniqueEmirates = () => {
    const emirates = radios.map(r => r.emirate_state).filter(Boolean);
    return [...new Set(emirates)].sort();
  };

  const handleRadioClick = (radio) => {
    navigate(`/radio/${radio.id}`);
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
              {t('radio.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('radio.hero.subtitle')}
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              {t('radio.hero.disclaimer')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('radio.hero.searchPlaceholder')}
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
                {t('radio.filters.title')}
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
                  <Radio size={16} className="text-[#1976D2]" />
                  {t('radio.filters.basic')}
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('radio.filters.language')}
                    </label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('radio.filters.allLanguages')}</option>
                      {getUniqueLanguages().map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>

                  {/* Emirate Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('radio.filters.emirate')}
                    </label>
                    <select
                      value={emirateFilter}
                      onChange={(e) => setEmirateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('radio.filters.allEmirates')}</option>
                      {getUniqueEmirates().map(emirate => (
                        <option key={emirate} value={emirate}>{emirate}</option>
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
                {t('radio.filters.clear')}
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
                    <span className="text-[#212121]">{t('radio.controls.filters')}</span>
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
                  {t('radio.controls.found', { count: totalCount })}
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      {t('radio.controls.for')} "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">{t('radio.controls.sortBy')}</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="radio_name-asc">{t('radio.controls.sortOptions.nameAsc')}</option>
                  <option value="radio_name-desc">{t('radio.controls.sortOptions.nameDesc')}</option>
                  <option value="frequency-asc">{t('radio.controls.sortOptions.frequencyAsc')}</option>
                  <option value="frequency-desc">{t('radio.controls.sortOptions.frequencyDesc')}</option>
                  <option value="radio_language-asc">{t('radio.controls.sortOptions.languageAsc')}</option>
                  <option value="radio_language-desc">{t('radio.controls.sortOptions.languageDesc')}</option>
                  <option value="emirate_state-asc">{t('radio.controls.sortOptions.emirateAsc')}</option>
                  <option value="emirate_state-desc">{t('radio.controls.sortOptions.emirateDesc')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Radios Display */}
          {sortedRadios.length > 0 ? (
            <>
              {/* Enhanced Grid View with Image Backgrounds */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedRadios.map((radio, index) => {
                    return (
                      <motion.div
                        key={radio.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        onClick={() => handleRadioClick(radio)}
                        className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden h-80"
                        style={{
                          boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                        }}
                      >
                        {/* Enhanced Background Image with Error Handling */}
                        <div className="absolute inset-0">
                          {radio.image_url ? (
                            <img
                              src={radio.image_url}
                              alt={radio.radio_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback to logo if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'block';
                              }}
                              onLoad={(e) => {
                                // Hide fallback if image loads successfully
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'none';
                                }
                              }}
                            />
                          ) : null}

                          {/* Fallback logo */}
                          <div
                            className={`w-full h-full ${radio.image_url ? 'hidden' : 'block'}`}
                            style={{ display: radio.image_url ? 'none' : 'block' }}
                          >
                            <img
                              src="/logo.png"
                              alt="Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Dark overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        </div>


                        {/* Enhanced Status Badges */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                            {radio.frequency}
                          </span>
                          {radio.radio_language && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                              {radio.radio_language}
                            </span>
                          )}
                        </div>

                        {/* Enhanced Engagement Stats */}
                        <div className="absolute top-16 right-4 z-20 flex flex-col gap-2">
                          {radio.radio_popular_rj && (
                            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                              <User className="w-4 h-4 text-white" />
                              <span className="text-white text-xs font-medium">
                                {radio.radio_popular_rj}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 text-white">
                          {/* Name and Rating */}
                          <div className="mb-3">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors line-clamp-1">
                              {radio.radio_name}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">
                            {radio.description || t('radio.card.broadcasting', { name: radio.radio_name, frequency: radio.frequency })}
                          </p>

                          {/* Location and Type Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-white/80">
                              <MapPin size={14} className="mr-1" />
                              <span>{radio.emirate_state || 'UAE'}</span>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-white">
                                {radio.radio_language}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Enhanced List View */}
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
                            onClick={() => handleSort('radio_name')}
                          >
                            <div className="flex items-center gap-2">
                              {t('radio.table.name')} {getSortIcon('radio_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('frequency')}
                          >
                            <div className="flex items-center gap-2">
                              {t('radio.table.frequency')} {getSortIcon('frequency')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('radio_language')}
                          >
                            <div className="flex items-center gap-2">
                              {t('radio.table.language')} {getSortIcon('radio_language')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('emirate_state')}
                          >
                            <div className="flex items-center gap-2">
                              {t('radio.table.emirate')} {getSortIcon('emirate_state')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('radio.table.popularRj')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('radio.table.action')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRadios.map((radio, index) => {
                          return (
                            <tr
                              key={radio.id}
                              className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                              style={{ borderColor: theme.borderLight }}
                              onClick={() => handleRadioClick(radio)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {/* Enhanced image/logo display */}
                                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    {radio.image_url ? (
                                      <img
                                        src={radio.image_url}
                                        alt={radio.radio_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className={`w-full h-full flex items-center justify-center ${radio.image_url ? 'hidden' : 'flex'}`}
                                      style={{ display: radio.image_url ? 'none' : 'flex' }}
                                    >
                                      <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                      {radio.radio_name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {radio.frequency}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {radio.radio_language || t('radio.table.na')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {radio.emirate_state || t('radio.table.na')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {radio.radio_popular_rj || t('radio.table.na')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                  style={{ backgroundColor: theme.primary }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                                >
                                  {t('radio.table.viewDetails')}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                <Radio size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                {t('radio.empty.title')}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                {t('radio.empty.desc')}
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
                {t('radio.empty.clear')}
              </button>
            </div>
          )}
        </main>
      </div>

      <UserFooter />
    </div>
  );
};

export default RadioPage;