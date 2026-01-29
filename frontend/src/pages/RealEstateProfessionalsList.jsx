import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  Search, Filter, Eye, Heart, Share, Grid, List, Star, Clock,
  TrendingUp, Globe, BookOpen, Award, Target, Zap, CheckCircle,
  ExternalLink, MapPin, Calendar, DollarSign, BarChart3, Users,
  Link as LinkIcon, Image as ImageIcon, FileText, Shield,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Newspaper, Plus,
  User, Building, Building2, Crown
} from 'lucide-react';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import { createSlugPath } from '../utils/slugify';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
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
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const RealEstateProfessionalsList = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState([]);
  const [allProfessionals, setAllProfessionals] = useState([]); // Store unfiltered list for filter options
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [professionTypeFilter, setProfessionTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [languagesFilter, setLanguagesFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
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
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchAllProfessionals(); // Initial load to get all data for filter options
  }, []);

  const fetchAllProfessionals = async () => {
    try {
      const response = await api.get('/real-estate-professionals?limit=1000');
      const pros = response.data.professionals || [];
      setAllProfessionals(pros);
      setProfessionals(pros); // Also set as current professionals
    } catch (error) {
      console.error('Error fetching all professionals:', error);
      setAllProfessionals([]);
      setProfessionals([]);
    }
  };

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProfessionals();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, genderFilter, professionTypeFilter, languagesFilter, locationFilter]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: '1000'
      });

      // Enhanced search across multiple fields
      if (searchTerm.trim()) {
        params.append('first_name', searchTerm.trim());
        params.append('last_name', searchTerm.trim());
      }

      if (genderFilter) params.append('gender', genderFilter);
      if (professionTypeFilter) params.append('profession_type', professionTypeFilter);
      if (locationFilter) params.append('current_residence_city', locationFilter);
      if (languagesFilter) params.append('languages', languagesFilter);

      const response = await api.get(`/real-estate-professionals?${params.toString()}`);
      let pros = response.data.professionals || [];

      // Client-side search for better results
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        pros = pros.filter(pro =>
          pro.first_name?.toLowerCase().includes(searchLower) ||
          pro.last_name?.toLowerCase().includes(searchLower) ||
          pro.nationality?.toLowerCase().includes(searchLower) ||
          pro.current_residence_city?.toLowerCase().includes(searchLower) ||
          pro.gender?.toLowerCase().includes(searchLower)
        );
      }

      setProfessionals(pros);

      // Store unfiltered list for filter options when no filters are applied
      const hasAnyFilter = genderFilter || professionTypeFilter || locationFilter || languagesFilter || searchTerm.trim();
      if (!hasAnyFilter) {
        setAllProfessionals(pros);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setProfessionals([]);
        setAllProfessionals([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // No additional frontend filtering needed since all filtering is done on backend
  const filteredProfessionals = useMemo(() => {
    return [...professionals];
  }, [professionals]);

  // Sorting logic
  const sortedProfessionals = useMemo(() => {
    return [...filteredProfessionals].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'no_of_followers') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
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
  }, [filteredProfessionals, sortField, sortDirection]);

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
    setProfessionTypeFilter('');
    setGenderFilter('');
    setLanguagesFilter('');
    setLocationFilter('');
    setSearchTerm('');
    // Reset to show all professionals
    setProfessionals(allProfessionals);
  };

  const hasActiveFilters = () => {
    return professionTypeFilter || genderFilter || languagesFilter || locationFilter || searchTerm.trim();
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleProfessionalClick = (professional) => {
    navigate(`/real-estate-professionals/${createSlugPath(`${professional.first_name} ${professional.last_name}`, professional.id)}`);
  };


  const getUniqueLanguages = () => {
    const allLanguages = allProfessionals.flatMap(pro => pro.languages || []);
    return [...new Set(allLanguages)].sort();
  };

  const getUniqueLocations = () => {
    const locations = allProfessionals.map(pro => pro.current_residence_city).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const getProfessionTypeIcon = (professional) => {
    if (professional.real_estate_agency_owner) return <Crown size={16} className="text-yellow-500" />;
    if (professional.real_estate_agent) return <User size={16} className="text-blue-500" />;
    if (professional.developer_employee) return <Building2 size={16} className="text-green-500" />;
    return <User size={16} className="text-gray-500" />;
  };

  const getProfessionTypeLabel = (professional) => {
    if (professional.real_estate_agency_owner) return t('realEstateProfessionals.filters.agencyOwner');
    if (professional.real_estate_agent) return t('realEstateProfessionals.filters.agent');
    if (professional.developer_employee) return t('realEstateProfessionals.filters.developerEmployee');
    return t('realEstateProfessionals.list.professional');
  };

  if (loading && professionals.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto text-center animate-pulse">
            <div className="h-16 w-3/4 mx-auto mb-6 bg-slate-200 rounded-lg" />
            <div className="h-6 w-1/2 mx-auto mb-8 bg-slate-100 rounded" />
            <div className="h-14 w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-lg" />
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
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 border border-slate-200 rounded-lg flex flex-col animate-pulse">
                  <div className="flex justify-between mb-6">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-3/4 bg-slate-200 rounded" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded" />
                      <div className="h-4 w-2/3 bg-slate-100 rounded" />
                    </div>
                    <div className="h-12 w-20 bg-slate-50 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="h-6 w-1/2 mx-auto bg-slate-200 rounded" />
                      <div className="h-3 w-3/4 mx-auto bg-slate-100 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 w-1/4 mx-auto bg-slate-200 rounded" />
                      <div className="h-3 w-3/4 mx-auto bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 w-16 bg-blue-50 rounded-full" />
                    <div className="h-6 w-16 bg-blue-50 rounded-full" />
                  </div>
                  <div className="h-12 w-full bg-slate-200 rounded-lg mt-auto" />
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
      <SEO
        title="Real Estate Professionals | Industry Experts | News Marketplace"
        description="Connect with leading real estate professionals, agency owners, and agents from around the world."
      />
      <Schema
        type="collection"
        data={{
          title: "Real Estate Professionals Directory",
          description: "A directory of verified real estate professionals and industry experts.",
          items: sortedProfessionals.slice(0, 10).map(pro => ({
            name: `${pro.first_name} ${pro.last_name}`,
            description: getProfessionTypeLabel(pro),
            url: window.location.origin + `/real-estate-professionals/${createSlugPath(`${pro.first_name} ${pro.last_name}`, pro.id)}`
          }))
        }}
      />
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
              {t('realEstateProfessionals.title')}
            </h1>
            <p className="text-base md:text-lg text-[#757575] max-w-2xl mx-auto leading-relaxed font-light mb-6">
              {t('realEstateProfessionals.desc')}
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4 mb-6">
              {t('realEstateProfessionals.disclaimer')}
            </p>

            {/* Search Bar & Share Button */}
            <div className="max-w-4xl mx-auto mt-6 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder={t('realEstateProfessionals.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-[#E0E0E0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white shadow-sm"
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
              <div className="bg-white p-2 px-4 rounded-lg border border-[#E0E0E0] shadow-sm flex items-center gap-2 relative">
                <span className="text-sm font-medium text-[#757575] border-r pr-2 mr-2">{t('common.share', 'Share')}:</span>
                <button
                  onClick={() => setActiveShareId(activeShareId === 'hero' ? null : 'hero')}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="share" size={18} />
                </button>
                {renderShareMenu(window.location.href, t('realEstateProfessionals.title'), 'hero')}
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
                {t('realEstateProfessionals.filters.title')}
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
                  <User size={16} className="text-[#1976D2]" />
                  {t('realEstateProfessionals.filters.basicFilters')}
                </h4>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Profession Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('realEstateProfessionals.filters.professionType')}
                    </label>
                    <select
                      value={professionTypeFilter}
                      onChange={(e) => setProfessionTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('realEstateProfessionals.filters.allTypes')}</option>
                      <option value="agency_owner">{t('realEstateProfessionals.filters.agencyOwner')}</option>
                      <option value="agent">{t('realEstateProfessionals.filters.agent')}</option>
                      <option value="developer_employee">{t('realEstateProfessionals.filters.developerEmployee')}</option>
                    </select>
                  </div>


                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('realEstateProfessionals.filters.gender')}
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('realEstateProfessionals.filters.allGenders')}</option>
                      <option value="Male">{t('realEstateProfessionals.filters.male')}</option>
                      <option value="Female">{t('realEstateProfessionals.filters.female')}</option>
                      <option value="Other">{t('realEstateProfessionals.filters.other')}</option>
                    </select>
                  </div>

                  {/* Languages Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('realEstateProfessionals.filters.languages')}
                    </label>
                    <select
                      value={languagesFilter}
                      onChange={(e) => setLanguagesFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('realEstateProfessionals.filters.allLanguages')}</option>
                      {getUniqueLanguages().map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>


                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('realEstateProfessionals.filters.location')}
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('realEstateProfessionals.filters.allLocations')}</option>
                      {getUniqueLocations().map(location => (
                        <option key={location} value={location}>{location}</option>
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
                Clear All Filters
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
                    <Filter size={16} />
                    <span className="text-[#212121]">{t('realEstateProfessionals.filters.mobileTitle')}</span>
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
                  {t('realEstateProfessionals.controls.found', { count: sortedProfessionals.length })}
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      {t('realEstateProfessionals.controls.for')} "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">{t('realEstateProfessionals.controls.sortBy')}</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="first_name-asc">{t('realEstateProfessionals.controls.sortOptions.nameAsc')}</option>
                  <option value="first_name-desc">{t('realEstateProfessionals.controls.sortOptions.nameDesc')}</option>
                  <option value="no_of_followers-desc">{t('realEstateProfessionals.controls.sortOptions.followersDesc')}</option>
                  <option value="no_of_followers-asc">{t('realEstateProfessionals.controls.sortOptions.followersAsc')}</option>
                  <option value="nationality-asc">{t('realEstateProfessionals.controls.sortOptions.nationalityAsc')}</option>
                  <option value="gender-asc">{t('realEstateProfessionals.controls.sortOptions.genderAsc')}</option>
                  <option value="current_residence_city-asc">{t('realEstateProfessionals.controls.sortOptions.locationAsc')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professionals Display */}
          {sortedProfessionals.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-3 gap-6">
                  {sortedProfessionals.map((professional, index) => (
                    <motion.div
                      key={professional.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handleProfessionalClick(professional)}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Enhanced Professional Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                              {professional.first_name} {professional.last_name}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              {getProfessionTypeIcon(professional)}
                              <span className="ml-2">{getProfessionTypeLabel(professional)}</span>
                            </div>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <User size={14} className="mr-2" />
                              <span>{professional.gender || t('realEstateProfessionals.card.genderNotSpecified')}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <MapPin size={14} className="mr-2" />
                              <span>{professional.current_residence_city || t('realEstateProfessionals.card.locationNotSpecified')}</span>
                            </div>
                          </div>
                          <div className="w-20 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 rounded-lg p-1 shadow-sm">
                            {professional.image ? (
                              <img
                                src={professional.image}
                                alt={`${professional.first_name} ${professional.last_name}`}
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

                        {/* Enhanced Professional Info */}
                        <div className="grid grid-cols-2 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.primary }}>{professional.no_of_followers || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('realEstateProfessionals.card.followers')}</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: professional.verified_tick ? '#4CAF50' : '#F44336' }}>
                              {professional.verified_tick ? '✓' : '✗'}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>{t('realEstateProfessionals.card.verified')}</div>
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {professional.languages && professional.languages.length > 0 ? (
                            professional.languages.slice(0, 3).map(lang => (
                              <span key={lang} className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E3F2FD', color: theme.primary }}>
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFF3E0', color: theme.warning }}>
                              {t('realEstateProfessionals.card.languagesNotSpecified')}
                            </span>
                          )}
                        </div>

                        {/* Enhanced CTA Button & Share */}
                        <div className="flex gap-2 items-center">
                          <button
                            className="flex-1 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            style={{ backgroundColor: theme.primary }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            <Eye size={16} />
                            {t('realEstateProfessionals.card.viewProfile')}
                            <ExternalLink size={14} />
                          </button>
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveShareId(activeShareId === professional.id ? null : professional.id);
                              }}
                              className="p-3 bg-slate-50 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                              <Icon name="share" size={18} />
                            </button>
                            {renderShareMenu(
                              `${window.location.origin}/real-estate-professionals/${createSlugPath(`${professional.first_name} ${professional.last_name}`, professional.id)}`,
                              `${professional.first_name} ${professional.last_name}`,
                              professional.id,
                              'right'
                            )}
                          </div>
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
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('first_name')}
                          >
                            <div className="flex items-center gap-2">
                              {t('realEstateProfessionals.list.professional')} {getSortIcon('first_name')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('realEstateProfessionals.list.type')}
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('current_residence_city')}
                          >
                            <div className="flex items-center gap-2">
                              {t('realEstateProfessionals.list.location')} {getSortIcon('current_residence_city')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('nationality')}
                          >
                            <div className="flex items-center gap-2">
                              {t('realEstateProfessionals.list.nationality')} {getSortIcon('nationality')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('realEstateProfessionals.list.gender')}
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('no_of_followers')}
                          >
                            <div className="flex items-center gap-2">
                              {t('realEstateProfessionals.list.followers')} {getSortIcon('no_of_followers')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('realEstateProfessionals.list.languages')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('realEstateProfessionals.list.action')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedProfessionals.map((professional, index) => (
                          <tr
                            key={professional.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handleProfessionalClick(professional)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-10 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 rounded-lg p-1">
                                  {professional.image ? (
                                    <img
                                      src={professional.image}
                                      alt={`${professional.first_name} ${professional.last_name}`}
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
                                    {professional.first_name} {professional.last_name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    {professional.verified_tick && <span className="text-green-600">✓ {t('realEstateProfessionals.list.verified')}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getProfessionTypeIcon(professional)}
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {getProfessionTypeLabel(professional)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {professional.current_residence_city || t('realEstateProfessionals.list.notSpecified')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {professional.nationality || t('realEstateProfessionals.list.notSpecified')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {professional.gender || t('realEstateProfessionals.list.notSpecified')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-lg font-bold" style={{ color: theme.success }}>
                                {professional.no_of_followers || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {professional.languages && professional.languages.length > 0 ? (
                                  professional.languages.slice(0, 2).map(lang => (
                                    <span key={lang} className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#F3E5F5', color: theme.info }}>
                                      {lang}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-500">{t('realEstateProfessionals.list.none')}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                  style={{ backgroundColor: theme.primary }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                                >
                                  <Eye size={14} className="inline mr-1" />
                                  {t('realEstateProfessionals.list.view')}
                                </button>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveShareId(activeShareId === professional.id ? null : professional.id);
                                    }}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                  >
                                    <Icon name="share" size={16} />
                                  </button>
                                  {renderShareMenu(
                                    `${window.location.origin}/real-estate-professionals/${createSlugPath(`${professional.first_name} ${professional.last_name}`, professional.id)}`,
                                    `${professional.first_name} ${professional.last_name}`,
                                    professional.id,
                                    'right'
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
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
                <User size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                {t('realEstateProfessionals.empty.title')}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                {t('realEstateProfessionals.empty.desc')}
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
                {t('realEstateProfessionals.empty.clear')}
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
    </div>
  );
};

export default RealEstateProfessionalsList;