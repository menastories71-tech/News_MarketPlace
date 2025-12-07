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
      const hasAnyFilter = nationalityFilter || genderFilter || professionTypeFilter || locationFilter || languagesFilter || searchTerm.trim();
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
    navigate(`/real-estate-professionals/${professional.id}`);
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
    if (professional.real_estate_agency_owner) return 'Agency Owner';
    if (professional.real_estate_agent) return 'Real Estate Agent';
    if (professional.developer_employee) return 'Developer Employee';
    return 'Professional';
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading real estate professionals...</p>
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
              Real Estate Professionals
            </h1>
            <p className="text-base md:text-lg text-[#757575] max-w-2xl mx-auto leading-relaxed font-light mb-6">
              Connect with trusted real estate professionals and experts in your area.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search professionals..."
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
              {/* Basic Filters */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#1976D2]" />
                  Basic Filters
                </h4>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Profession Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Profession Type
                    </label>
                    <select
                      value={professionTypeFilter}
                      onChange={(e) => setProfessionTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Types</option>
                      <option value="agency_owner">Agency Owner</option>
                      <option value="agent">Real Estate Agent</option>
                      <option value="developer_employee">Developer Employee</option>
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
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
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
                  {sortedProfessionals.length} professionals found
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
                  <option value="first_name-asc">Name (A-Z)</option>
                  <option value="first_name-desc">Name (Z-A)</option>
                  <option value="no_of_followers-desc">Followers (High to Low)</option>
                  <option value="no_of_followers-asc">Followers (Low to High)</option>
                  <option value="nationality-asc">Nationality (A-Z)</option>
                  <option value="gender-asc">Gender (A-Z)</option>
                  <option value="current_residence_city-asc">Location (A-Z)</option>
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
                              <span>{professional.gender || 'Gender not specified'}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <MapPin size={14} className="mr-2" />
                              <span>{professional.current_residence_city || 'Location not specified'}</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {professional.image ? (
                              <img
                                src={professional.image}
                                alt={`${professional.first_name} ${professional.last_name}`}
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

                        {/* Enhanced Professional Info */}
                        <div className="grid grid-cols-2 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-lg font-bold" style={{ color: theme.primary }}>{professional.no_of_followers || 0}</div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Followers</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: professional.verified_tick ? '#4CAF50' : '#F44336' }}>
                              {professional.verified_tick ? '✓' : '✗'}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Verified</div>
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
                              Languages not specified
                            </span>
                          )}
                        </div>

                        {/* Enhanced CTA Button */}
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
                              Professional {getSortIcon('first_name')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Type
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('current_residence_city')}
                          >
                            <div className="flex items-center gap-2">
                              Location {getSortIcon('current_residence_city')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('nationality')}
                          >
                            <div className="flex items-center gap-2">
                              Nationality {getSortIcon('nationality')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Gender
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('no_of_followers')}
                          >
                            <div className="flex items-center gap-2">
                              Followers {getSortIcon('no_of_followers')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Languages
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Action
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
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                                  {professional.image ? (
                                    <img
                                      src={professional.image}
                                      alt={`${professional.first_name} ${professional.last_name}`}
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
                                    {professional.first_name} {professional.last_name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    {professional.verified_tick && <span className="text-green-600">✓ Verified</span>}
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
                                {professional.current_residence_city || 'Not specified'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {professional.nationality || 'Not specified'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {professional.gender || 'Not specified'}
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
                                  <span className="text-xs text-gray-500">None</span>
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
                <User size={48} style={{ color: theme.textDisabled }} />
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

export default RealEstateProfessionalsList;