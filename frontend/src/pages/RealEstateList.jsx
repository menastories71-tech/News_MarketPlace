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
  Home, Bed, Bath, Square
} from 'lucide-react';
import Skeleton from '../components/common/Skeleton';
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

const RealEstateList = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [professionTypeFilter, setProfessionTypeFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [languagesFilter, setLanguagesFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('name');
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
    fetchRealEstates();
  }, []);

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRealEstates();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, professionTypeFilter, nationalityFilter, languagesFilter, genderFilter, locationFilter]);

  const fetchRealEstates = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: '1000'
      });

      // Enhanced search across multiple fields
      if (searchTerm.trim()) {
        params.append('title', searchTerm.trim());
      }

      if (professionTypeFilter) params.append('profession', professionTypeFilter);
      if (nationalityFilter) params.append('nationality', nationalityFilter);
      if (languagesFilter) params.append('languages', languagesFilter);
      if (genderFilter) params.append('gender', genderFilter);
      if (locationFilter) params.append('location', locationFilter);

      const response = await api.get(`/real-estates?${params.toString()}`);
      let estates = response.data.realEstates || [];

      // Client-side search for better results
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        estates = estates.filter(estate => {
          return (
            estate.name?.toLowerCase().includes(searchLower) ||
            estate.profession?.toLowerCase().includes(searchLower) ||
            estate.nationality?.toLowerCase().includes(searchLower) ||
            estate.languages?.toLowerCase().includes(searchLower) ||
            estate.location?.toLowerCase().includes(searchLower) ||
            estate.description?.toLowerCase().includes(searchLower)
          );
        });
      }

      setRealEstates(estates);
    } catch (error) {
      console.error('Error fetching real estates:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setRealEstates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredRealEstates = useMemo(() => {
    let filtered = [...realEstates];

    // Apply filters
    if (professionTypeFilter) {
      filtered = filtered.filter(estate =>
        estate.profession?.toLowerCase().includes(professionTypeFilter.toLowerCase())
      );
    }

    if (nationalityFilter) {
      filtered = filtered.filter(estate =>
        estate.nationality?.toLowerCase().includes(nationalityFilter.toLowerCase())
      );
    }

    if (languagesFilter) {
      filtered = filtered.filter(estate =>
        estate.languages?.toLowerCase().includes(languagesFilter.toLowerCase())
      );
    }

    if (genderFilter) {
      filtered = filtered.filter(estate =>
        estate.gender?.toLowerCase().includes(genderFilter.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(estate =>
        estate.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    return filtered;
  }, [realEstates, professionTypeFilter, nationalityFilter, languagesFilter, genderFilter, locationFilter]);

  // Sorting logic
  const sortedRealEstates = useMemo(() => {
    return [...filteredRealEstates].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'followers') {
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
  }, [filteredRealEstates, sortField, sortDirection]);

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
    setNationalityFilter('');
    setLanguagesFilter('');
    setGenderFilter('');
    setLocationFilter('');
  };

  const hasActiveFilters = () => {
    return professionTypeFilter || nationalityFilter || languagesFilter || genderFilter || locationFilter;
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleRealEstateClick = (realEstate) => {
    navigate(`/real-estates/${realEstate.id}`);
  };

  // Get unique values for filter options
  const getUniqueLocations = () => {
    const locations = realEstates.map(estate => estate.location).filter(Boolean);
    const uniqueLocations = [...new Set(locations)].sort();
    return uniqueLocations;
  };

  const getUniqueProfessionTypes = () => {
    const professions = realEstates.map(estate => estate.profession).filter(Boolean);
    return [...new Set(professions)].sort();
  };

  const getUniqueNationalities = () => {
    const nationalities = realEstates.map(estate => estate.nationality).filter(Boolean);
    return [...new Set(nationalities)].sort();
  };

  const getUniqueLanguages = () => {
    const languages = realEstates.map(estate => estate.languages).filter(Boolean);
    return [...new Set(languages)].sort();
  };

  const getUniqueGenders = () => {
    const genders = realEstates.map(estate => estate.gender).filter(Boolean);
    return [...new Set(genders)].sort();
  };

  const formatFollowers = (followers) => {
    const numFollowers = parseInt(followers) || 0;
    if (numFollowers >= 1000000) {
      return `${(numFollowers / 1000000).toFixed(1)}M`;
    } else if (numFollowers >= 1000) {
      return `${(numFollowers / 1000).toFixed(1)}K`;
    }
    return numFollowers.toString();
  };

  if (loading && realEstates.length === 0) {
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
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </aside>
          <main className="flex-1">
            <Skeleton className="h-20 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-lg" />
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
        title="Real Estate Professional Influencers | News Marketplace"
        description="Connect with a diverse network of real estate agency owners, agents, and marketing experts to amplify your brand equity and drive sales."
      />
      <Schema
        type="collection"
        data={{
          title: "Real Estate Professional Influencers",
          description: "Diverse network of real estate professionals including agency owners, agents, and marketing experts.",
          items: sortedRealEstates.map(estate => ({
            name: estate.name,
            description: `${estate.profession} in ${estate.location} with ${formatFollowers(estate.followers)} followers.`,
            url: window.location.origin + `/real-estates/${estate.id}`,
            image: estate.images?.[0]
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
              Connect with a Diverse Network of Real Estate Professional Influencers
            </h1>
            <p className="text-base md:text-lg text-[#757575] max-w-2xl mx-auto leading-relaxed font-light mb-6">

              Explore a wide range of real estate agency owners, agents, and marketing experts from different countries, languages, genders, and age groups. Partner with professionals who not only enhance your brand equity and amplify organic marketing but also drive substantial sales.
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              The current page is for representation purpose only, the comprehensive list will be live soon
            </p>

            {/* Search Bar & Share Button */}
            <div className="max-w-4xl mx-auto mt-6 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search professionals..."
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
                <span className="text-sm font-medium text-[#757575] border-r pr-2 mr-2">Share:</span>
                <button
                  onClick={() => setActiveShareId(activeShareId === 'hero' ? null : 'hero')}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="share" size={18} />
                </button>
                {renderShareMenu(window.location.href, "Real Estate Professional Influencers", 'hero')}
              </div>
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
              {/* Basic Filters */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Users size={16} className="text-[#1976D2]" />
                  Professional Filters
                </h4>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Profession Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Profession
                    </label>
                    <select
                      value={professionTypeFilter}
                      onChange={(e) => setProfessionTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Professions</option>
                      {getUniqueProfessionTypes().map(profession => (
                        <option key={profession} value={profession}>{profession}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nationality Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Nationality
                    </label>
                    <select
                      value={nationalityFilter}
                      onChange={(e) => setNationalityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Nationalities</option>
                      {getUniqueNationalities().map(nationality => (
                        <option key={nationality} value={nationality}>{nationality}</option>
                      ))}
                    </select>
                  </div>

                  {/* Languages Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Languages
                    </label>
                    <select
                      value={languagesFilter}
                      onChange={(e) => setLanguagesFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Languages</option>
                      {getUniqueLanguages().map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Gender
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Genders</option>
                      {getUniqueGenders().map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Locations</option>
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
                  {sortedRealEstates.length} professionals found
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
                  <option value="profession-asc">Profession (A-Z)</option>
                  <option value="profession-desc">Profession (Z-A)</option>
                  <option value="followers-desc">Followers (High to Low)</option>
                  <option value="followers-asc">Followers (Low to High)</option>
                  <option value="location-asc">Location (A-Z)</option>
                  <option value="nationality-asc">Nationality (A-Z)</option>
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real Estates Display */}
          {sortedRealEstates.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {sortedRealEstates.map((realEstate, index) => (
                    <motion.div
                      key={realEstate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handleRealEstateClick(realEstate)}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Professional Image */}
                      <div className="relative h-48 overflow-hidden">
                        {realEstate.images && realEstate.images.length > 0 ? (
                          <img
                            src={realEstate.images[0]}
                            alt={realEstate.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = '/placeholder-professional.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Users size={48} className="text-gray-400" />
                          </div>
                        )}
                        {/* Verification Badge */}
                        {realEstate.verification_status === 'verified' && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                            <CheckCircle size={14} />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Professional Details */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                            {realEstate.name}
                          </h3>
                          <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                            <Users size={14} className="mr-2" />
                            <span>{realEstate.profession}</span>
                          </div>
                          <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                            <MapPin size={14} className="mr-2" />
                            <span>{realEstate.location}</span>
                          </div>
                        </div>

                        {/* Professional Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.primary }}>
                              {formatFollowers(realEstate.followers || 0)}
                            </div>
                            <div className="text-xs flex items-center justify-center gap-1" style={{ color: theme.textSecondary }}>
                              <Users size={12} />
                              Followers
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: realEstate.verification_status === 'verified' ? theme.success : theme.warning }}>
                              {realEstate.verification_status === 'verified' ? 'Verified' : 'Pending'}
                            </div>
                            <div className="text-xs flex items-center justify-center gap-1" style={{ color: theme.textSecondary }}>
                              <Shield size={12} />
                              Status
                            </div>
                          </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {realEstate.social_media && realEstate.social_media.instagram && (
                            <a
                              href={realEstate.social_media.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
                            >
                              Instagram
                            </a>
                          )}
                          {realEstate.social_media && realEstate.social_media.linkedin && (
                            <a
                              href={realEstate.social_media.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            >
                              LinkedIn
                            </a>
                          )}
                          {realEstate.social_media && realEstate.social_media.twitter && (
                            <a
                              href={realEstate.social_media.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
                            >
                              Twitter
                            </a>
                          )}
                        </div>

                        {/* Enhanced CTA Button & Share */}
                        <div className="flex gap-2 items-center">
                          <button
                            className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            style={{ backgroundColor: theme.primary }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            <Eye size={16} />
                            View Profile
                            <ExternalLink size={14} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveShareId(activeShareId === realEstate.id ? null : realEstate.id);
                              }}
                              className="p-3.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                              <Icon name="share" size={16} />
                            </button>
                            {renderShareMenu(`${window.location.origin}/real-estates/${realEstate.id}`, realEstate.name, realEstate.id, 'right')}
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
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-2">
                              Professional {getSortIcon('name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('profession')}
                          >
                            <div className="flex items-center gap-2">
                              Profession {getSortIcon('profession')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('location')}
                          >
                            <div className="flex items-center gap-2">
                              Location {getSortIcon('location')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('followers')}
                          >
                            <div className="flex items-center gap-2">
                              Followers {getSortIcon('followers')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Verification
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Social Media
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRealEstates.map((realEstate, index) => (
                          <tr
                            key={realEstate.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handleRealEstateClick(realEstate)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                                  {realEstate.images && realEstate.images.length > 0 ? (
                                    <img
                                      src={realEstate.images[0]}
                                      alt={realEstate.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-professional.jpg';
                                      }}
                                    />
                                  ) : (
                                    <Users size={20} className="text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {realEstate.name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    {realEstate.profession}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {realEstate.profession}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {realEstate.location}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <Users size={16} style={{ color: theme.primary }} />
                                <span className="text-sm" style={{ color: theme.textPrimary }}>
                                  {formatFollowers(realEstate.followers || 0)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {realEstate.verification_status === 'verified' ? (
                                  <>
                                    <CheckCircle size={16} style={{ color: theme.success }} />
                                    <span className="text-sm" style={{ color: theme.success }}>
                                      Verified
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={16} style={{ color: theme.warning }} />
                                    <span className="text-sm" style={{ color: theme.warning }}>
                                      Pending
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1">
                                {realEstate.social_media && realEstate.social_media.instagram && (
                                  <a
                                    href={realEstate.social_media.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-500 hover:text-pink-700"
                                  >
                                    <ImageIcon size={16} />
                                  </a>
                                )}
                                {realEstate.social_media && realEstate.social_media.linkedin && (
                                  <a
                                    href={realEstate.social_media.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <LinkIcon size={16} />
                                  </a>
                                )}
                                {realEstate.social_media && realEstate.social_media.twitter && (
                                  <a
                                    href={realEstate.social_media.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-500 hover:text-sky-700"
                                  >
                                    <Newspaper size={16} />
                                  </a>
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
                <Users size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                No professionals found
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                We couldn't find any real estate professionals matching your search criteria.
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

export default RealEstateList;