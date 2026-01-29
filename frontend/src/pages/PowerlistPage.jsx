import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import PowerlistSubmissionForm from '../components/user/PowerlistSubmissionForm';
import {
  Search, Filter, Eye, Grid, List, ExternalLink, Building, User, UserCheck,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Users, MapPin, Globe, Star,
  Calendar, Award, Link as LinkIcon, Bookmark
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Skeleton from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import { createSlugPath } from '../utils/slugify';
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

const PowerlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [powerlists, setPowerlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
        className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200 p-3 sm:p-4 
          ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`}
        style={{ width: isMobile ? '260px' : '300px' }}
      >
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {sharePlatforms.map((p) => (
            <a
              key={p.name}
              href={p.link(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-sm"
              style={{ backgroundColor: p.color }}
              title={p.name}
            >
              <Icon name={p.icon} size={isMobile ? 16 : 18} />
            </a>
          ))}
          <button
            onClick={() => handleCopy(url, id)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${
              copiedId === id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={copiedId === id ? 'Copied!' : 'Copy link'}
          >
            <Icon name={copiedId === id ? 'check-circle' : 'link'} size={isMobile ? 16 : 18} />
          </button>
        </div>
      </motion.div>
    );
  };

  // Filter states - Updated for powerlist nominations
  const [industryFilter, setIndustryFilter] = useState('');
  const [companyOrIndividualFilter, setCompanyOrIndividualFilter] = useState('');
  const [locationRegionFilter, setLocationRegionFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(''); // New month filter
  const [publicationFilter, setPublicationFilter] = useState(''); // New publication filter

  // Sorting state
  const [sortField, setSortField] = useState('publication_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showPowerlistForm, setShowPowerlistForm] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
    };
    window.addEventListener('resize', onResize);
    onResize();

    // Set initial sidebar state based on width
    if (window.innerWidth < 1280) {
      setSidebarOpen(false);
    }

    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPowerlists();
  }, []);

  const fetchPowerlists = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add pagination
      params.append('page', page.toString());
      params.append('limit', '20'); // Show 20 per page for better UX

      // Add search parameters
      if (searchTerm.trim()) {
        params.append('publication_name', searchTerm.trim());
        params.append('power_list_name', searchTerm.trim());
      }

      // Add filter parameters
      if (industryFilter) params.append('industry', industryFilter);
      if (companyOrIndividualFilter) params.append('company_or_individual', companyOrIndividualFilter);
      if (locationRegionFilter) params.append('location_region', locationRegionFilter);
      if (monthFilter) params.append('tentative_month', monthFilter);
      if (publicationFilter) params.append('publication_name', publicationFilter);

      // Use the powerlist nominations endpoint for approved nominations
      const response = await api.get(`/powerlist-nominations/public?${params.toString()}`);

      setPowerlists(response.data.nominations || []);
      setTotalCount(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.pages || 1);
      setCurrentPage(response.data.pagination?.page || 1);
    } catch (error) {
      console.error('Error fetching powerlist nominations:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPowerlists([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPowerlists();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, industryFilter, companyOrIndividualFilter, locationRegionFilter, monthFilter, publicationFilter]);

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPowerlists(page);
  };

  // Sorting logic
  const sortedPowerlists = useMemo(() => {
    return [...powerlists].sort((a, b) => {
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
  }, [powerlists, sortField, sortDirection]);

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
    setIndustryFilter('');
    setCompanyOrIndividualFilter('');
    setLocationRegionFilter('');
    setMonthFilter('');
    setPublicationFilter('');
  };

  const hasActiveFilters = () => {
    return industryFilter || companyOrIndividualFilter || locationRegionFilter || monthFilter || publicationFilter;
  };

  // Get unique values for filter options
  const getUniqueIndustries = () => {
    const industries = powerlists.map(p => p.industry).filter(Boolean);
    return [...new Set(industries)].sort();
  };

  const getUniqueRegions = () => {
    const regions = powerlists.map(p => p.location_region).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const getUniqueCompanyOrIndividual = () => {
    const types = powerlists.map(p => p.company_or_individual).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getUniqueMonths = () => {
    const months = powerlists.map(p => p.tentative_month).filter(Boolean);
    return [...new Set(months)].sort();
  };

  const getUniquePublications = () => {
    const publications = powerlists.map(p => p.publication_name).filter(Boolean);
    return [...new Set(publications)].sort();
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleShowPowerlistForm = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setShowPowerlistForm(true);
    }
  };

  const handleClosePowerlistForm = () => {
    setShowPowerlistForm(false);
  };

  const handlePowerlistSuccess = () => {
    setShowPowerlistForm(false);
    fetchPowerlists(currentPage);
  };

  const handlePowerlistClick = (powerlist) => {
    navigate(`/power-lists/${createSlugPath(powerlist.power_list_name, powerlist.id)}`);
  };

  // Image URL helper function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    // Construct full URL using api baseURL or fallback
    const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getFallbackColor = (name) => {
    const colors = [
      '#1976D2', // blue
      '#00796B', // teal
      '#7B1FA2', // purple
      '#C2185B', // pink
      '#E64A19', // deep orange
      '#388E3C', // green
      '#F57C00', // orange
      '#455A64', // blue grey
    ];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
      switch (status) {
        case 'approved':
          return { backgroundColor: theme.success + '20', color: theme.success };
        case 'pending':
          return { backgroundColor: theme.warning + '20', color: theme.warning };
        case 'rejected':
          return { backgroundColor: theme.danger + '20', color: theme.danger };
        default:
          return { backgroundColor: theme.backgroundSoft, color: theme.textSecondary };
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'approved': return t('powerlist.status.approved');
        case 'pending': return t('powerlist.status.pending');
        case 'rejected': return t('powerlist.status.rejected');
        default: return status;
      }
    };

    return (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={getStatusStyle(status)}
      >
        {getStatusText(status)}
      </span>
    );
  };

  if (loading && powerlists.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-[#E3F2FD] to-white">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-lg" />
            <Skeleton className="h-12 w-48 mx-auto rounded-lg mt-4" />
          </div>
        </section>
        <div className="flex max-w-7xl mx-auto p-6 gap-6">
          <aside className="w-1/4 hidden md:block">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <div className="space-y-6">
              <div className="p-4 border rounded-lg space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </aside>
          <main className="flex-1">
            <Skeleton className="h-20 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border overflow-hidden h-80 relative">
                  <Skeleton className="h-full w-full" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
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
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <SEO
        title="Media Power Lists | Influential Personalities & Brands | News Marketplace"
        description="Discover and nominate influential personalities and brands across various industries in our curated Media Power Lists."
      />
      <Schema
        type="collection"
        data={{
          title: "Media Power Lists",
          description: "A directory of the most influential people and companies in the media industry.",
          items: powerlists.slice(0, 10).map(item => ({
            name: item.power_list_name,
            description: item.description,
            url: window.location.origin + `/power-lists/${createSlugPath(item.power_list_name, item.id)}`
          }))
        }}
      />
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
              {t('powerlist.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('powerlist.hero.desc')}
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              {t('powerlist.hero.disclaimer')}
            </p>

            {/* Search Bar & Share Buttons */}
            <div className="max-w-4xl mx-auto mt-8 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder={t('powerlist.hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white shadow-md shadow-slate-200/50"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2" size={window.innerWidth < 640 ? 16 : 20} style={{ color: theme.textSecondary }} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="bg-white p-2 px-3 sm:px-4 rounded-lg border border-[#E0E0E0] shadow-md shadow-slate-200/50 flex items-center gap-2 relative">
                <span className="hidden sm:inline text-sm font-medium text-[#757575] border-r pr-2 mr-2">{t('common.share', 'Share')}:</span>
                <button
                  onClick={() => setActiveShareId(activeShareId === 'hero' ? null : 'hero')}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="share" size={isMobile ? 16 : 18} />
                </button>
                {renderShareMenu(window.location.href, t('powerlist.hero.title'), 'hero')}
              </div>
            </div>

            {/* Submit Profile Button */}
            <div className="mt-8">
              <button
                onClick={handleShowPowerlistForm}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors bg-[#00796B] text-white hover:bg-[#004D40] text-sm sm:text-base"
              >
                <User size={isMobile ? 16 : 18} />
                {t('powerlist.hero.submitProfile')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className={`max-w-[1600px] mx-auto flex flex-col lg:flex-row relative`}>
        {/* Enhanced Filters Sidebar - Slide over on Mobile/Tablet, Sticky on Desktop */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 lg:hidden ${sidebarOpen ? 'opacity-100 z-[100]' : 'opacity-0 pointer-events-none z-[-1]'}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`
            fixed lg:sticky lg:top-20 top-0 left-0 h-full lg:h-[calc(100vh-80px)] 
            bg-white shadow-2xl lg:shadow-none z-[110] lg:z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
            w-[280px] sm:w-[320px] lg:w-[300px] flex-shrink-0
            border-r border-gray-100
          `}
        >
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#212121] flex items-center gap-2">
                <Filter size={isMobile ? 18 : 20} className="text-[#1976D2]" />
                {t('powerlist.filters.title')}
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
                <h4 className="font-medium sm:font-semibold text-sm sm:text-base text-[#212121] mb-3 flex items-center gap-2">
                  <Users size={isMobile ? 14 : 16} className="text-[#1976D2]" />
                  {t('powerlist.filters.basic')}
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('powerlist.filters.industry')}
                    </label>
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('powerlist.filters.allIndustries')}</option>
                      {getUniqueIndustries().map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                      <option value="Other">{t('powerlist.filters.other')}</option>
                    </select>
                  </div>

                  {/* Company/Individual Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('powerlist.filters.type')}
                    </label>
                    <select
                      value={companyOrIndividualFilter}
                      onChange={(e) => setCompanyOrIndividualFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('powerlist.filters.allTypes')}</option>
                      {getUniqueCompanyOrIndividual().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="Other">{t('powerlist.filters.other')}</option>
                    </select>
                  </div>

                  {/* Location Region Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('powerlist.filters.location')}
                    </label>
                    <select
                      value={locationRegionFilter}
                      onChange={(e) => setLocationRegionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('powerlist.filters.allLocations')}</option>
                      {getUniqueRegions().map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('powerlist.filters.month')}
                    </label>
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('powerlist.filters.allMonths')}</option>
                      {getUniqueMonths().map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Publication Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      {t('powerlist.filters.publication')}
                    </label>
                    <select
                      value={publicationFilter}
                      onChange={(e) => setPublicationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">{t('powerlist.filters.allPublications')}</option>
                      {getUniquePublications().map(publication => (
                        <option key={publication} value={publication}>{publication}</option>
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
                {t('powerlist.filters.clear')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Enhanced */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
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
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border bg-[#F5F5F5] hover:bg-[#E0E0E0] transition-colors text-sm"
                    style={{ borderColor: theme.borderLight }}
                  >
                    <Filter size={14} />
                    <span className="text-[#212121]">{t('powerlist.controls.filters')}</span>
                  </button>
                )}

                {/* View Toggle */}
                <div className="flex items-center bg-[#F5F5F5] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'grid'
                      ? 'bg-white shadow-sm text-[#1976D2]'
                      : 'text-[#757575] hover:text-[#212121]'
                      }`}
                  >
                    <Grid size={isMobile ? 14 : 16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white shadow-sm text-[#1976D2]'
                      : 'text-[#757575] hover:text-[#212121]'
                      }`}
                  >
                    <List size={isMobile ? 14 : 16} />
                  </button>
                </div>

                <span className="text-xs sm:text-sm font-medium text-[#212121]">
                  {t('powerlist.controls.found', { count: totalCount })}
                  {searchTerm && (
                    <span className="ml-1 sm:ml-2 text-[#757575] hidden sm:inline">
                      {t('powerlist.controls.for')} "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium text-[#757575] hidden sm:inline">{t('powerlist.controls.sortBy')}</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 border border-[#E0E0E0] rounded-lg text-xs sm:text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="publication_name-asc">{t('powerlist.controls.sortOptions.publicationAsc')}</option>
                  <option value="publication_name-desc">{t('powerlist.controls.sortOptions.publicationDesc')}</option>
                  <option value="power_list_name-asc">{t('powerlist.controls.sortOptions.powerListAsc')}</option>
                  <option value="power_list_name-desc">{t('powerlist.controls.sortOptions.powerListDesc')}</option>
                  <option value="industry-asc">{t('powerlist.controls.sortOptions.industryAsc')}</option>
                  <option value="industry-desc">{t('powerlist.controls.sortOptions.industryDesc')}</option>
                  <option value="company_or_individual-asc">{t('powerlist.controls.sortOptions.typeAsc')}</option>
                  <option value="company_or_individual-desc">{t('powerlist.controls.sortOptions.typeDesc')}</option>
                  <option value="location_region-asc">{t('powerlist.controls.sortOptions.locationAsc')}</option>
                  <option value="location_region-desc">{t('powerlist.controls.sortOptions.locationDesc')}</option>
                  <option value="status-asc">{t('powerlist.controls.sortOptions.statusAsc')}</option>
                  <option value="status-desc">{t('powerlist.controls.sortOptions.statusDesc')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Powerlists Display */}
          {sortedPowerlists.length > 0 ? (
            <>
              {/* Enhanced Grid View with Image Backgrounds */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPowerlists.map((nomination, index) => {
                    const imageUrl = getImageUrl(nomination.image);

                    return (
                      <motion.div
                        key={nomination.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        onClick={() => handlePowerlistClick(nomination)}
                        className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden h-80"
                        style={{
                          boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                        }}
                      >
                        {/* Enhanced Background Image with Error Handling */}
                        <div className="absolute inset-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={nomination.publication_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}

                          {/* Fallback Initials UI (more premium than generic logo) */}
                          <div
                            className="w-full h-full items-center justify-center flex flex-col gap-4 text-white"
                            style={{
                              backgroundColor: getFallbackColor(nomination.publication_name),
                              display: imageUrl ? 'none' : 'flex'
                            }}
                          >
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-4xl font-bold">
                              {getInitials(nomination.publication_name)}
                            </div>
                            <span className="text-lg font-medium opacity-80">{nomination.publication_name}</span>
                          </div>

                          {/* Dark overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          {/* Industry Badge */}
                          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex flex-col gap-2">
                            {nomination.industry && (
                              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 text-white text-[10px] sm:text-xs font-medium rounded-full">
                                {nomination.industry}
                              </span>
                            )}
                          </div>
                        </div>




                        {/* Bottom Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-5 text-white">
                          {/* Name */}
                          <div className="mb-2 sm:mb-3">
                            <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-blue-200 transition-colors line-clamp-1">
                              {nomination.publication_name}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-white/90 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {nomination.power_list_name}
                            {nomination.description && (
                              <span className="block text-white/70 text-[10px] sm:text-xs mt-1 line-clamp-1">
                                {nomination.description}
                              </span>
                            )}
                          </p>

                          {/* Location and Type Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs sm:text-sm text-white/80">
                              <MapPin size={isMobile ? 12 : 14} className="mr-1" />
                              <span className="line-clamp-1">{nomination.location_region || t('powerlist.defaults.global')}</span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setActiveShareId(activeShareId === nomination.id ? null : nomination.id)}
                                  className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                                >
                                  <Icon name="share" size={isMobile ? 14 : 18} />
                                </button>
                                {renderShareMenu(
                                  `${window.location.origin}/power-lists/${createSlugPath(nomination.power_list_name, nomination.id)}`,
                                  nomination.power_list_name,
                                  nomination.id,
                                  'right'
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xs sm:text-sm font-medium text-white">
                                  {nomination.tentative_month && (
                                    <div className="flex items-center gap-1">
                                      <Calendar size={isMobile ? 10 : 12} />
                                      <span className="hidden sm:inline">{nomination.tentative_month}</span>
                                      <span className="sm:hidden">{nomination.tentative_month.substring(0, 3)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-[10px] sm:text-xs text-white/70 line-clamp-1">
                                  {nomination.company_or_individual}
                                </div>
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
                            onClick={() => handleSort('publication_name')}
                          >
                            <div className="flex items-center gap-2">
                              {t('powerlist.table.publication')} {getSortIcon('publication_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('power_list_name')}
                          >
                            <div className="flex items-center gap-2">
                              {t('powerlist.table.powerList')} {getSortIcon('power_list_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('industry')}
                          >
                            <div className="flex items-center gap-2">
                              {t('powerlist.table.industry')} {getSortIcon('industry')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('company_or_individual')}
                          >
                            <div className="flex items-center gap-2">
                              {t('powerlist.table.type')} {getSortIcon('company_or_individual')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('location_region')}
                          >
                            <div className="flex items-center gap-2">
                              {t('powerlist.table.location')} {getSortIcon('location_region')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-2">
                              {t('powerlist.table.status')} {getSortIcon('status')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {t('powerlist.table.action')}
                          </th>

                        </tr>
                      </thead>
                      <tbody>
                        {sortedPowerlists.map((nomination, index) => {
                          const imageUrl = getImageUrl(nomination.image);

                          return (
                            <tr
                              key={nomination.id}
                              className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                              style={{ borderColor: theme.borderLight }}
                              onClick={() => handlePowerlistClick(nomination)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {/* Enhanced image/logo display */}
                                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={nomination.publication_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
                                      style={{ display: imageUrl ? 'none' : 'flex' }}
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
                                      {nomination.publication_name}
                                    </div>
                                    {nomination.tentative_month && (
                                      <div className="text-[10px] sm:text-xs flex items-center gap-1" style={{ color: theme.textSecondary }}>
                                        <Calendar size={isMobile ? 8 : 10} />
                                        <span className="hidden sm:inline">Expected: {nomination.tentative_month}</span>
                                        <span className="sm:hidden">{nomination.tentative_month}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {nomination.power_list_name}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {nomination.industry || 'General'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {nomination.company_or_individual}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {nomination.location_region || 'Global'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={nomination.status} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
                                    style={{ backgroundColor: theme.primary }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                                    onClick={() => handlePowerlistClick(nomination)}
                                  >
                                    <Eye size={isMobile ? 12 : 14} />
                                    <span className="hidden sm:inline">{t('powerlist.table.view')}</span>
                                    <span className="sm:hidden">View</span>
                                  </button>
                                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => setActiveShareId(activeShareId === nomination.id ? null : nomination.id)}
                                      className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                    >
                                      <Icon name="share" size={isMobile ? 14 : 16} />
                                    </button>
                                    {renderShareMenu(
                                      `${window.location.origin}/power-lists/${createSlugPath(nomination.power_list_name, nomination.id)}`,
                                      nomination.power_list_name,
                                      nomination.id,
                                      'right'
                                    )}
                                  </div>
                                </div>
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
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ backgroundColor: theme.backgroundSoft }}
              >
                <Award size={isMobile ? 32 : 48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: theme.textPrimary }}>
                {t('powerlist.empty.title')}
              </h3>
              <p className="mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4" style={{ color: theme.textSecondary }}>
                {t('powerlist.empty.desc')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAllFilters();
                }}
                className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('powerlist.empty.clear')}
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

      {/* Powerlist Submission Form Modal */}
      {showPowerlistForm && (
        <PowerlistSubmissionForm
          onClose={handleClosePowerlistForm}
          onSuccess={handlePowerlistSuccess}
        />
      )}
    </div>
  );
};

export default PowerlistPage;