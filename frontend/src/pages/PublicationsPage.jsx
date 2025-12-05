import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import PublicationSubmissionForm from '../components/user/PublicationSubmissionForm';
import {
  Search, Filter, Eye, Heart, Share, Grid, List, Star, Clock,
  TrendingUp, Globe, BookOpen, Award, Target, Zap, CheckCircle,
  ExternalLink, MapPin, Calendar, DollarSign, BarChart3, Users,
  Link as LinkIcon, Image as ImageIcon, FileText, Shield,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Newspaper, Plus
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

const PublicationsPage = () => {
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
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [daRange, setDaRange] = useState([0, 100]);
  const [drRange, setDrRange] = useState([0, 100]);
  const [tatFilter, setTatFilter] = useState([]);
  const [dofollowFilter, setDofollowFilter] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState('publication_name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Groups data
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPublications();
    fetchGroups();
  }, []);

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPublications();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, regionFilter, languageFilter]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        live_on_platform: 'true',
        limit: '100'
      });

      // Enhanced search across multiple fields
      if (searchTerm.trim()) {
        params.append('publication_name', searchTerm.trim());
      }
      
      if (regionFilter) params.append('region', regionFilter);
      if (languageFilter) params.append('language', languageFilter);

      const response = await api.get(`/admin/publication-management?${params.toString()}`);
      let pubs = response.data.publications || [];

      // Client-side search for better results
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        pubs = pubs.filter(pub => {
          return (
            pub.publication_name?.toLowerCase().includes(searchLower) ||
            pub.region?.toLowerCase().includes(searchLower) ||
            pub.language?.toLowerCase().includes(searchLower) ||
            pub.publication_primary_focus?.toLowerCase().includes(searchLower)
          );
        });
      }

      setPublications(pubs);
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

  // Filtering logic
  const filteredPublications = useMemo(() => {
    let filtered = [...publications];

    // Apply filters
    if (regionFilter) {
      filtered = filtered.filter(pub =>
        pub.region?.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }

    if (languageFilter) {
      filtered = filtered.filter(pub =>
        pub.language?.toLowerCase().includes(languageFilter.toLowerCase())
      );
    }

    if (focusFilter) {
      filtered = filtered.filter(pub =>
        pub.publication_primary_focus?.toLowerCase().includes(focusFilter.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(pub => {
      const price = parseFloat(pub.price_usd) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // DA range filter
    filtered = filtered.filter(pub => {
      const da = parseInt(pub.da) || 0;
      return da >= daRange[0] && da <= daRange[1];
    });

    // DR range filter
    filtered = filtered.filter(pub => {
      const dr = parseInt(pub.dr) || 0;
      return dr >= drRange[0] && dr <= drRange[1];
    });

    // TAT filter
    if (tatFilter.length > 0) {
      filtered = filtered.filter(pub => {
        const days = pub.committed_tat;
        return tatFilter.some(tat => {
          switch (tat) {
            case '1-5 days': return days >= 1 && days <= 5;
            case '6-10 days': return days >= 6 && days <= 10;
            case '2-3 weeks': return days >= 14 && days <= 21;
            case '4-6 weeks': return days >= 28 && days <= 42;
            default: return false;
          }
        });
      });
    }

    // Link type filter
    if (dofollowFilter) {
      if (dofollowFilter === 'true') {
        filtered = filtered.filter(pub => pub.do_follow === true);
      } else if (dofollowFilter === 'false') {
        filtered = filtered.filter(pub => pub.do_follow === false);
      }
    }

    return filtered;
  }, [publications, regionFilter, languageFilter, focusFilter,
      priceRange, daRange, drRange, tatFilter, dofollowFilter]);

  // Sorting logic
  const sortedPublications = useMemo(() => {
    return [...filteredPublications].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'price_usd' || sortField === 'da' || sortField === 'dr') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
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
  }, [filteredPublications, sortField, sortDirection]);

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
    setPriceRange([0, 2000]);
    setDaRange([0, 100]);
    setDrRange([0, 100]);
    setTatFilter([]);
    setDofollowFilter('');
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
            priceRange[0] > 0 || priceRange[1] < 2000 ||
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
    navigate(`/publications/${publication.id}`);
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

  if (loading) {
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading publications...</p>
          </div>
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
              Publications
            </h1>
            <p className="text-base md:text-lg text-[#757575] max-w-2xl mx-auto leading-relaxed font-light mb-6">
              Discover credible media outlets to amplify your vision and reach your target audience effectively.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search publications..."
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

                  {/* Industry/Niche Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Industry/Niche
                    </label>
                    <select
                      value={focusFilter}
                      onChange={(e) => setFocusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Industries/Niches</option>
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
                  Price Range
                </h4>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-[#FF9800]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
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
                  SEO Metrics
                </h4>

                {/* DA Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Domain Authority: {daRange[0]} - {daRange[1]}
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
                    Domain Rating: {drRange[0]} - {drRange[1]}
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
                    Link Type
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                      <input
                        type="checkbox"
                        checked={dofollowFilter === 'true'}
                        onChange={(e) => setDofollowFilter(e.target.checked ? 'true' : '')}
                        className="rounded accent-[#1976D2]"
                      />
                      <span className="text-sm" style={{ color: theme.textPrimary }}>Do-follow Links</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                      <input
                        type="checkbox"
                        checked={dofollowFilter === 'false'}
                        onChange={(e) => setDofollowFilter(e.target.checked ? 'false' : '')}
                        className="rounded accent-[#1976D2]"
                      />
                      <span className="text-sm" style={{ color: theme.textPrimary }}>No-follow Links</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* TAT Filter */}
              <div className="bg-[#FFF3E0] rounded-lg p-4 border border-[#FF9800]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#FF9800]" />
                  Turnaround Time
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
                  {sortedPublications.length} publications found
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
                  <option value="publication_name-asc">Name (A-Z)</option>
                  <option value="publication_name-desc">Name (Z-A)</option>
                  <option value="price_usd-asc">Price (Low to High)</option>
                  <option value="price_usd-desc">Price (High to Low)</option>
                  <option value="da-desc">DA (High to Low)</option>
                  <option value="da-asc">DA (Low to High)</option>
                  <option value="dr-desc">DR (High to Low)</option>
                  <option value="dr-asc">DR (Low to High)</option>
                  <option value="region-asc">Region (A-Z)</option>
                  <option value="language-asc">Language (A-Z)</option>
                  <option value="committed_tat-asc">TAT (Fastest)</option>
                  <option value="committed_tat-desc">TAT (Slowest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Publications Display */}
          {sortedPublications.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-3 gap-6">
                  {sortedPublications.map((publication, index) => (
                    <motion.div
                      key={publication.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handlePublicationClick(publication)}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                      style={{ 
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
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
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {publication.image ? (
                              <img
                                src={publication.image}
                                alt={publication.publication_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/logo.png';
                                }}
                              />
                            ) : (
                              <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-8 h-8 object-contain"
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

                        {/* Enhanced Price and Word Count */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xl font-bold" style={{ color: theme.success }}>
                            {formatPrice(publication.price_usd)}
                          </div>
                          <div className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                            {publication.word_limit ? `${publication.word_limit} words` : 'Word count TBA'}
                          </div>
                        </div>

                        {/* Rating Type Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {/* NEW Badge - Show for publications added in last 30 days */}
                          {(() => {
                            const createdDate = new Date(publication.created_at);
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return createdDate > thirtyDaysAgo ? (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                                NEW
                              </span>
                            ) : null;
                          })()}

                          {/* Rating Type Badges */}
                          {publication.rating_type && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              publication.rating_type === 'Customer Choice' ? 'bg-blue-100 text-blue-800' :
                              publication.rating_type === 'Best Seller' ? 'bg-green-100 text-green-800' :
                              publication.rating_type === 'Editor\'s Pick' ? 'bg-purple-100 text-purple-800' :
                              publication.rating_type === 'Trending' ? 'bg-red-100 text-red-800' :
                              publication.rating_type === 'Featured' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {publication.rating_type}
                            </span>
                          )}

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
                            onClick={() => handleSort('publication_name')}
                          >
                            <div className="flex items-center gap-2">
                              Publication {getSortIcon('publication_name')}
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
                            onClick={() => handleSort('language')}
                          >
                            <div className="flex items-center gap-2">
                              Language {getSortIcon('language')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('da')}
                          >
                            <div className="flex items-center gap-2">
                              DA {getSortIcon('da')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('dr')}
                          >
                            <div className="flex items-center gap-2">
                              DR {getSortIcon('dr')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('price_usd')}
                          >
                            <div className="flex items-center gap-2">
                              Price {getSortIcon('price_usd')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('committed_tat')}
                          >
                            <div className="flex items-center gap-2">
                              TAT {getSortIcon('committed_tat')}
                            </div>
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
                        {sortedPublications.map((publication, index) => (
                          <tr 
                            key={publication.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handlePublicationClick(publication)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                                  {publication.image ? (
                                    <img
                                      src={publication.image}
                                      alt={publication.publication_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/logo.png';
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src="/logo.png"
                                      alt="Logo"
                                      className="w-6 h-6 object-contain"
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
                                    Do-follow
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
                <Newspaper size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                No publications found
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                We couldn't find any publications matching your search criteria.
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
   