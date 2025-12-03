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
  const navigate = useNavigate();
  const [powerlists, setPowerlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states - Updated for powerlist nominations
  const [industryFilter, setIndustryFilter] = useState('');
  const [companyOrIndividualFilter, setCompanyOrIndividualFilter] = useState('');
  const [locationRegionFilter, setLocationRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('approved'); // Default to approved

  // Sorting state
  const [sortField, setSortField] = useState('publication_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showPowerlistForm, setShowPowerlistForm] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
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
      if (statusFilter) params.append('status', statusFilter);

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
  }, [searchTerm, industryFilter, companyOrIndividualFilter, locationRegionFilter, statusFilter]);

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
    setStatusFilter('approved'); // Reset to default
  };

  const hasActiveFilters = () => {
    return industryFilter || companyOrIndividualFilter || locationRegionFilter || statusFilter !== 'approved';
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
    navigate(`/power-lists/${powerlist.id}`);
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
        case 'approved': return 'Approved';
        case 'pending': return 'Pending';
        case 'rejected': return 'Rejected';
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
              style={{
                borderBottom: `2px solid ${theme.primary}`,
                borderRight: `2px solid transparent`
              }}
            ></div>
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading powerlist nominations...</p>
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
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Powerlist Nominations
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Discover prestigious powerlist nominations from leading publications and organizations across industries.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search publications, powerlist names, or industries..."
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

            {/* Submit Profile Button */}
            <div className="mt-8">
              <button
                onClick={handleShowPowerlistForm}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-[#00796B] text-white hover:bg-[#004D40]"
              >
                <User size={18} />
                Submit Your Profile
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
                  Basic Filters
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Industry
                    </label>
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Industries</option>
                      {getUniqueIndustries().map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company/Individual Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Type
                    </label>
                    <select
                      value={companyOrIndividualFilter}
                      onChange={(e) => setCompanyOrIndividualFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Types</option>
                      {getUniqueCompanyOrIndividual().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Region Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Location
                    </label>
                    <select
                      value={locationRegionFilter}
                      onChange={(e) => setLocationRegionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Locations</option>
                      {getUniqueRegions().map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
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
                  {totalCount} nominations found
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
                  <option value="publication_name-asc">Publication (A-Z)</option>
                  <option value="publication_name-desc">Publication (Z-A)</option>
                  <option value="power_list_name-asc">Power List (A-Z)</option>
                  <option value="power_list_name-desc">Power List (Z-A)</option>
                  <option value="industry-asc">Industry (A-Z)</option>
                  <option value="industry-desc">Industry (Z-A)</option>
                  <option value="company_or_individual-asc">Type (A-Z)</option>
                  <option value="company_or_individual-desc">Type (Z-A)</option>
                  <option value="location_region-asc">Location (A-Z)</option>
                  <option value="location_region-desc">Location (Z-A)</option>
                  <option value="status-asc">Status (A-Z)</option>
                  <option value="status-desc">Status (Z-A)</option>
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
                  {sortedPowerlists.map((nomination, index) => (
                    <motion.div
                      key={nomination.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handlePowerlistClick(nomination)}
                      className="bg-white rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden relative"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Heart Icon */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.682l-1.318-1.364a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                            Top Creator
                          </span>
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                            Responds Fast
                          </span>
                        </div>
                      </div>

                      {/* Profile Image */}
                      <div className="relative h-64 overflow-hidden">
                        {nomination.image ? (
                          <img
                            src={nomination.image}
                            alt={nomination.publication_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"
                          >
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <User size={48} className="text-white" />
                            </div>
                          </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                            <Eye size={12} className="text-white" />
                            <span className="text-white text-xs font-medium">
                              {Math.floor(Math.random() * 100) + 10}k
                            </span>
                          </div>
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                            <Users size={12} className="text-white" />
                            <span className="text-white text-xs font-medium">UGC</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        {/* Name and Rating */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {nomination.publication_name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={`${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-900 ml-1">5.0</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {nomination.power_list_name} • {nomination.company_or_individual}
                        </p>

                        {/* Location */}
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin size={14} className="mr-2" />
                          <span>{nomination.location_region || 'Global'}</span>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ${Math.floor(Math.random() * 400) + 100}
                          </div>
                          <div className="text-sm text-gray-500">
                            {nomination.industry || 'General'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                              Publication {getSortIcon('publication_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('power_list_name')}
                          >
                            <div className="flex items-center gap-2">
                              Power List {getSortIcon('power_list_name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('industry')}
                          >
                            <div className="flex items-center gap-2">
                              Industry {getSortIcon('industry')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('company_or_individual')}
                          >
                            <div className="flex items-center gap-2">
                              Type {getSortIcon('company_or_individual')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('location_region')}
                          >
                            <div className="flex items-center gap-2">
                              Location {getSortIcon('location_region')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-2">
                              Status {getSortIcon('status')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPowerlists.map((nomination, index) => (
                          <tr
                            key={nomination.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handlePowerlistClick(nomination)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryLight }}
                                >
                                  <Building size={20} style={{ color: theme.primary }} />
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {nomination.publication_name}
                                  </div>
                                  {nomination.tentative_month && (
                                    <div className="text-xs" style={{ color: theme.textSecondary }}>
                                      Expected: {nomination.tentative_month}
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
                <Award size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                No nominations found
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                We couldn't find any powerlist nominations matching your search criteria.
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