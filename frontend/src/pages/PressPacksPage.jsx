import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  Search, Filter, Eye, Globe, MapPin, Building,
  DollarSign, FileText, ExternalLink, Package, Grid, List,
  BarChart3, Clock, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown,
  Newspaper
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
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const PressPacksPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pressPacks, setPressPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [regionFilter, setRegionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [indexedFilter, setIndexedFilter] = useState('');
  const [wordsLimitRange, setWordsLimitRange] = useState([0, 10000]);

  // Sorting state
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPressPacks();
  }, []);

  const fetchPressPacks = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        is_active: 'true'
      });

      // Enhanced search across multiple fields
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        params.append('name', searchTerm.trim());
      }

      if (regionFilter) params.append('region', regionFilter);
      if (industryFilter) params.append('niche', industryFilter);
      if (languageFilter) params.append('language', languageFilter);

      const response = await api.get(`/admin/press-releases?${params.toString()}`);
      let packs = response.data.pressReleases || [];

      // Client-side filtering for price range, content writing assistance, words limit
      packs = packs.filter(pack => {
        const price = parseFloat(pack.price) || 0;
        const words = parseInt(pack.word_limit) || 0;
        const contentWriting = pack.content_writing_assistance;

        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        const wordsMatch = words >= wordsLimitRange[0] && words <= wordsLimitRange[1];
        const contentWritingMatch = !indexedFilter || (indexedFilter === 'true' ? contentWriting : !contentWriting);

        return priceMatch && wordsMatch && contentWritingMatch;
      });

      setPressPacks(packs);
      setTotalPages(Math.ceil(packs.length / 20)); // Simple pagination
      setTotalCount(packs.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching press packs:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPressPacks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPressPacks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, regionFilter, industryFilter, languageFilter]);

  // Filtering logic
  const filteredPressPacks = useMemo(() => {
    let filtered = [...pressPacks];

    // Price range filter
    filtered = filtered.filter(pack => {
      const price = parseFloat(pack.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Words limit filter
    filtered = filtered.filter(pack => {
      const words = parseInt(pack.word_limit) || 0;
      return words >= wordsLimitRange[0] && words <= wordsLimitRange[1];
    });

    // Indexed filter
    if (indexedFilter) {
      filtered = filtered.filter(pack =>
        pack.indexed === (indexedFilter === 'true')
      );
    }

    return filtered;
  }, [pressPacks, priceRange, wordsLimitRange, indexedFilter]);

  // Sorting logic
  const sortedPressPacks = useMemo(() => {
    return [...filteredPressPacks].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'created_at') {
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
  }, [filteredPressPacks, sortField, sortDirection]);

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
    setIndustryFilter('');
    setLanguageFilter('');
    setPriceRange([0, 5000]);
    setWordsLimitRange([0, 10000]);
    setIndexedFilter('');
  };

  const hasActiveFilters = () => {
    return regionFilter || industryFilter || languageFilter ||
           priceRange[0] > 0 || priceRange[1] < 5000 ||
           wordsLimitRange[0] > 0 || wordsLimitRange[1] < 10000 ||
           indexedFilter;
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getUniqueRegions = () => {
    const regions = pressPacks.map(p => p.region).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const getUniqueNiches = () => {
    const niches = pressPacks.map(p => p.niche).filter(Boolean);
    return [...new Set(niches)].sort();
  };

  const getUniqueLanguages = () => {
    const languages = pressPacks.map(p => p.language).filter(Boolean);
    return [...new Set(languages)].sort();
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const handlePackClick = (packId) => {
    navigate(`/press-packs/${packId}`);
  };

  const handlePageChange = (page) => {
    fetchPressPacks(page);
  };

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-100', label: '$0 - $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500-1000', label: '$500 - $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000+', label: '$5,000+' }
  ];

  if (loading && pressPacks.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#E0E0E0] border-t-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading press releases...</p>
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
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Press Release Services
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Professional press release writing and distribution services to maximize your media coverage and reach target audiences effectively.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search press releases by name, region, or niche..."
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
                  <Globe size={16} className="text-[#1976D2]" />
                  Basic Filters
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Region Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Region
                    </label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Regions</option>
                      {getUniqueRegions().map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Niche
                    </label>
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Niches</option>
                      {getUniqueNiches().map(niche => (
                        <option key={niche} value={niche}>{niche}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Language
                    </label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Languages</option>
                      {getUniqueLanguages().map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Package Metrics Section */}
              <div className="bg-[#E3F2FD] rounded-lg p-4 border border-[#1976D2]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#1976D2]" />
                  Package Metrics
                </h4>

                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-[#1976D2]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#1976D2]"
                    />
                  </div>
                </div>

                {/* Words Limit Range */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Word Limit: {wordsLimitRange[0]} - {wordsLimitRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={wordsLimitRange[0]}
                      onChange={(e) => setWordsLimitRange([parseInt(e.target.value), wordsLimitRange[1]])}
                      className="w-full accent-[#1976D2]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={wordsLimitRange[1]}
                      onChange={(e) => setWordsLimitRange([wordsLimitRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#1976D2]"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-[#E0F2F1] rounded-lg p-4 border border-[#00796B]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#00796B]" />
                  Features
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                    <input
                      type="checkbox"
                      checked={indexedFilter === 'true'}
                      onChange={(e) => setIndexedFilter(e.target.checked ? 'true' : '')}
                      className="rounded accent-[#00796B]"
                    />
                    <span className="text-sm" style={{ color: theme.textPrimary }}>Content Writing Included</span>
                  </label>
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
                    <span className="text-[#212121]">Filters</span>
                  </button>
                )}

                {/* View Toggle */}
                <div className="flex items-center bg-[#F5F5F5] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-[#1976D2]'
                        : 'text-[#757575] hover:text-[#212121]'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-[#1976D2]'
                        : 'text-[#757575] hover:text-[#212121]'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                <span className="text-sm font-medium text-[#212121]">
                  {sortedPressPacks.length} press releases found
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">Sort by:</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="region-asc">Region (A-Z)</option>
                  <option value="niche-asc">Niche (A-Z)</option>
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Press Packs Display */}
          {sortedPressPacks.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                  {sortedPressPacks.map((pack, index) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handlePackClick(pack.id)}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Enhanced Pack Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                              {pack.name}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <MapPin size={14} className="mr-2" />
                              <span>{pack.region}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <Building size={14} className="mr-2" />
                              <span>{pack.niche}</span>
                            </div>
                          </div>
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.primaryLight }}
                          >
                            <Package size={24} className="text-[#1976D2]" />
                          </div>
                        </div>

                        {/* Enhanced Press Release Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.primary }}>{pack.distribution_media_websites || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Media Websites</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.success }}>{pack.guaranteed_media_placements || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Guaranteed</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.warning }}>{pack.word_limit || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Words</div>
                          </div>
                        </div>

                        {/* Enhanced Price and Features */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xl font-bold" style={{ color: theme.success }}>
                            {formatPrice(pack.price)}
                          </div>
                          <div className="flex items-center text-sm" style={{ color: theme.warning }}>
                            <Clock size={14} className="mr-1" />
                            <span>{pack.turnaround_time} days</span>
                          </div>
                        </div>

                        {/* Enhanced Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pack.content_writing_assistance && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F5E8', color: theme.success }}>
                              Content Writing
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFF3E0', color: theme.warning }}>
                            {pack.niche}
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
                          View Details
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
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-2">
                              Press Release {getSortIcon('name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('region')}
                          >
                            <div className="flex items-center gap-2">
                              Region {getSortIcon('region')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('niche')}
                          >
                            <div className="flex items-center gap-2">
                              Niche {getSortIcon('niche')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('price')}
                          >
                            <div className="flex items-center gap-2">
                              Price {getSortIcon('price')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Websites
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Features
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPressPacks.map((pack, index) => (
                          <tr
                            key={pack.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handlePackClick(pack.id)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryLight }}
                                >
                                  <Package size={20} className="text-[#1976D2]" />
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {pack.name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    {pack.region}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {pack.region}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {pack.niche}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-lg font-bold" style={{ color: theme.success }}>
                                {formatPrice(pack.price)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div style={{ color: theme.primary }}>{pack.distribution_media_websites || 0} Media Websites</div>
                                <div style={{ color: theme.success }}>{pack.guaranteed_media_placements || 0} Guaranteed</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {pack.indexed && (
                                  <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#E8F5E8', color: theme.success }}>
                                    Indexed
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
                                View
                              </button>
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
                <Package size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                No press releases found
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                We couldn't find any press releases matching your search criteria.
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
                Clear All Filters
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

export default PressPacksPage;