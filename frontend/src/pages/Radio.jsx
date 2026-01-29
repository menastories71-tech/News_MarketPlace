import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Skeleton from '../components/common/Skeleton';
import Icon from '../components/common/Icon';
import api from '../services/api';
import { createSlugPath } from '../utils/slugify';
import SEO from '../components/common/SEO';
// Removed ShareButtons import to implement manually

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
import { useTranslationArray } from '../hooks/useTranslation';

const RadioPage = () => {
  const { t } = useLanguage();
  const [radios, setRadios] = useState([]);
  const { translatedItems: translatedRadios, isTranslating } = useTranslationArray(radios, ['description', 'radio_language', 'emirate_state', 'radio_popular_rj', 'radio_name']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeShareId, setActiveShareId] = useState(null);
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

  // Local Share State
  const [copiedId, setCopiedId] = useState(null);

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
        <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center justify-center gap-2">
          {sharePlatforms.map((p) => (
            <a
              key={p.name}
              href={p.link(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: p.color }}
            >
              <Icon name={p.icon} size={16} />
            </a>
          ))}
          <button
            onClick={() => handleCopy(url, id)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copiedId === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Icon name={copiedId === id ? 'check-circle' : 'link'} size={16} />
          </button>
        </div>
      </motion.div>
    );
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
    return [...translatedRadios].sort((a, b) => {
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
  }, [translatedRadios, sortField, sortDirection]);

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
    const languages = new Set(translatedRadios.map(radio => radio.radio_language).filter(Boolean));
    return Array.from(languages).sort();
  };

  const getUniqueEmirates = () => {
    const emirates = new Set(translatedRadios.map(radio => radio.emirate_state).filter(Boolean));
    return Array.from(emirates).sort();
  };

  const filteredRadios = useMemo(() => {
    let result = translatedRadios;
    return result;
  }, [translatedRadios]);

  const handleRadioClick = (radio) => {
    navigate(`/radio/${createSlugPath(radio.radio_name, radio.id)}`);
  };

  if (loading && radios.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-[#E3F2FD] to-white animate-pulse">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <div className="h-16 w-3/4 bg-slate-200 rounded mx-auto" />
            <div className="h-6 w-1/2 bg-slate-100 rounded mx-auto" />
            <div className="h-14 w-full max-w-2xl bg-white border border-slate-200 rounded-lg mx-auto" />
          </div>
        </section>
        <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-6 gap-6 animate-pulse">
          <aside className="w-full md:w-80 space-y-6">
            <div className="h-8 w-1/2 bg-slate-100 rounded" />
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-4">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-white border border-slate-200 rounded" />
              <div className="h-10 w-full bg-white border border-slate-200 rounded" />
            </div>
            <div className="h-12 w-full bg-slate-100 rounded-lg" />
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-lg border p-6 mb-6 flex justify-between items-center">
              <div className="h-8 w-32 bg-slate-100 rounded" />
              <div className="h-8 w-40 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-80 relative overflow-hidden">
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="h-6 w-16 bg-blue-100 rounded-full" />
                    <div className="h-6 w-20 bg-green-100 rounded-full" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3 bg-gradient-to-t from-white/20 to-transparent">
                    <div className="h-6 w-3/4 bg-white/40 rounded" />
                    <div className="h-4 w-full bg-white/40 rounded" />
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-white/40 rounded" />
                      <div className="h-4 w-16 bg-white/40 rounded" />
                    </div>
                  </div>
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
      <SEO
        title="Radio Stations & Broadcasters | Global Media Directory"
        description="Explore the best Radio Stations & Broadcasters on VaaS Solutions. Connect with industry leaders and grow your presence."
      />
      <UserHeader />

      {/* Enhanced Hero Section */}
      <section className="relative py-8 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 border-b border-blue-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#212121] mb-4 sm:mb-6 tracking-tight">
              {t('radio.hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light px-4">
              {t('radio.hero.subtitle')}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-semibold mt-3 sm:mt-4 bg-orange-50 inline-block px-3 py-1 rounded-full border border-orange-100 uppercase tracking-wider">
              {t('radio.hero.disclaimer')}
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mt-6 sm:mt-10 flex flex-col items-stretch gap-4 px-2">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  placeholder={t('radio.hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 sm:py-4 border border-[#E0E0E0] rounded-xl text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1976D2] bg-white shadow-lg shadow-blue-900/5 transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Icon name="search" size="sm" className="group-focus-within:text-[#1976D2] transition-colors text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
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
          width: sidebarOpen ? (isMobile ? '100%' : '25%') : '0'
        }}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#212121] flex items-center gap-2">
                <Icon name="filter" size="sm" className="text-[#1976D2]" />
                {t('radio.filters.title')}
              </h3>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-[#757575] transition-colors"
                >
                  <Icon name="x" size="sm" />
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Filters */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Icon name="radio" size="xs" className="text-[#1976D2]" />
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
            boxShadow: '0 8px 10px rgba(2,6,23,0.06)'
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
                    <Icon name="filter" size="xs" />
                    <span className="text-[#212121] font-medium">{t('radio.controls.filters')}</span>
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
                    <Icon name="grid" size="xs" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white shadow-sm text-[#1976D2]'
                      : 'text-[#757575] hover:text-[#212121]'
                      }`}
                  >
                    <Icon name="list" size="xs" />
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
              {/* Grid View with Restored Design */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {translatedRadios.map((radio, index) => {
                    return (
                      <motion.div
                        key={radio.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        onClick={() => handleRadioClick(radio)}
                        className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group h-72 sm:h-80 ${activeShareId === radio.id ? 'z-[100]' : 'z-10'}`}
                      >
                        {/* Background Image Container with Overflow-Hidden */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          {radio.image_url ? (
                            <img
                              src={radio.image_url}
                              alt={radio.radio_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}

                          {/* Fallback logo */}
                          <div
                            className="w-full h-full flex items-center justify-center bg-slate-100"
                            style={{ display: radio.image_url ? 'none' : 'flex' }}
                          >
                            <img
                              src="/logo.png"
                              alt="Logo"
                              className="w-2/3 h-2/3 object-contain opacity-20"
                            />
                          </div>

                          {/* Dark overlay for image */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pr-4">
                          <span className="px-3 py-1 bg-[#1976D2] text-white text-[10px] font-bold rounded-full shadow-lg border border-white/20">
                            {radio.frequency}
                          </span>
                        </div>

                        {/* Bottom Content Overlay - Restored Layout */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors line-clamp-1 flex-1 leading-tight">
                              {radio.radio_name}
                            </h3>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveShareId(activeShareId === radio.id ? null : radio.id);
                                }}
                                className="!p-1.5 rounded-xl text-white hover:text-blue-300 hover:bg-white/10 transition-colors border border-white/20"
                              >
                                <Icon name="share" size={16} />
                              </button>
                              {renderShareMenu(
                                `${window.location.origin}/radio/${createSlugPath(radio.radio_name, radio.id)}`,
                                radio.radio_name,
                                radio.id,
                                'right'
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-white/90 text-sm mb-3 line-clamp-2 font-medium">
                            {radio.description || t('radio.card.broadcasting', { name: radio.radio_name, frequency: radio.frequency })}
                          </p>

                          {/* Location and Info Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                              <Icon name="map-pin" size="xs" className="mr-1.5" />
                              <span className="font-semibold uppercase tracking-wider">{radio.emirate_state || 'UAE'}</span>
                            </div>

                            {radio.radio_language && (
                              <div className="text-xs font-bold bg-emerald-500/80 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                {radio.radio_language}
                              </div>
                            )}
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
                                <div className="flex items-center gap-3">
                                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                                    {radio.frequency}
                                  </span>
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveShareId(activeShareId === radio.id ? null : radio.id);
                                      }}
                                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                                    >
                                      <Icon name="share" size={16} />
                                    </button>
                                    {renderShareMenu(
                                      `${window.location.origin}/radio/${createSlugPath(radio.radio_name, radio.id)}`,
                                      radio.radio_name,
                                      radio.id,
                                      'right'
                                    )}
                                  </div>
                                </div>
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
                <Icon name="radio" size="md" className="text-slate-300" />
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
