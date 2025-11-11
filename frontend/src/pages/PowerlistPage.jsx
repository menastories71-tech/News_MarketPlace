import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import PowerlistSubmissionForm from '../components/user/PowerListSubmissionForm';
import {
  Search, Filter, Eye, Heart, Share, Grid, List, Star, Clock,
  TrendingUp, Globe, BookOpen, Award, Target, Zap, CheckCircle,
  ExternalLink, MapPin, Calendar, DollarSign, BarChart3, Users,
  Link as LinkIcon, Image as ImageIcon, FileText, Shield, User, Building
} from 'lucide-react';

// Updated theme colors matching the color palette from PDF
const theme = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
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

const PowerlistPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [powerlists, setPowerlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showPowerlistForm, setShowPowerlistForm] = useState(false);

  useEffect(() => {
    fetchPowerlists();
  }, []);

  const fetchPowerlists = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('name', searchTerm);
      if (industryFilter) params.append('company_industry', industryFilter);
      if (genderFilter) params.append('gender', genderFilter);
      if (regionFilter) params.append('region', regionFilter);

      const response = await api.get(`/powerlist/public?${params.toString()}`);
      let powerlistsData = response.data.powerlists || [];

      setPowerlists(powerlistsData);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching powerlists:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPowerlists([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPowerlists(1); // Reset to first page on filter change
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, industryFilter, genderFilter, regionFilter]);

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
    // Refresh the powerlists to include the new submission if approved
    fetchPowerlists(currentPage);
  };

  const getUniqueIndustries = () => {
    const industries = powerlists.map(p => p.company_industry).filter(Boolean);
    return [...new Set(industries)].sort();
  };

  const getUniqueRegions = () => {
    // Assuming region can be derived from passport nationality or other fields
    const regions = powerlists.map(p => p.passport_nationality_one).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const handlePowerlistClick = (powerlist) => {
    navigate(`/power-lists/${powerlist.id}`);
  };

  const handlePageChange = (page) => {
    fetchPowerlists(page);
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading powerlist...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              Powerlist Directory
            </h1>
            <p className="text-lg mb-8" style={{ color: theme.textSecondary }}>
              {totalCount} Influential Professionals Available
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, company, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                  style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
              style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
            >
              <Filter size={16} style={{ color: theme.textPrimary }} />
              <span style={{ color: theme.textPrimary }}>Filters</span>
            </button>

             {/* Submit Profile Button */}
              <button
                onClick={handleShowPowerlistForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.secondary, color: 'white' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.secondaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.secondary}
              >
                <User size={16} />
                Submit Your Profile
              </button>
           </motion.div>
         </div>
       </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="px-4 sm:px-6 lg:px-8 border-b" style={{ backgroundColor: theme.backgroundAlt }}>
          <div className="max-w-7xl mx-auto py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                  Industry
                </label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                  style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                >
                  <option value="">All Industries</option>
                  {getUniqueIndustries().map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                  style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                  Region
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                  style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                >
                  <option value="">All Regions</option>
                  {getUniqueRegions().map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Powerlists Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {powerlists.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {powerlists.map((powerlist, index) => (
                  <motion.div
                    key={powerlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handlePowerlistClick(powerlist)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                  >
                    {/* Powerlist Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                            {powerlist.name}
                          </h3>
                          <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                            <Building size={14} className="mr-2" />
                            <span>{powerlist.current_company || 'Independent'}</span>
                          </div>
                          <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                            <User size={14} className="mr-2" />
                            <span>{powerlist.position || 'Professional'}</span>
                          </div>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: theme.primaryLight }}
                        >
                          <User size={24} style={{ color: theme.primary }} />
                        </div>
                      </div>

                      {/* Industry and Location */}
                      <div className="grid grid-cols-2 gap-2 text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.primary }}>
                            {powerlist.company_industry || 'General'}
                          </div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Industry</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.success }}>
                            {powerlist.passport_nationality_one || 'Global'}
                          </div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Location</div>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {powerlist.linkedin_url && (
                          <a
                            href={powerlist.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                        {powerlist.instagram_url && (
                          <a
                            href={powerlist.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                          >
                            <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.794.265 4.14.52c-.704.265-1.302.663-1.894 1.254C1.654 2.366 1.256 2.964.992 3.668c-.255.654-.4 1.45-.453 2.65C.48 7.524.466 7.924.466 11.545s.014 4.021.067 5.227c.053 1.2.198 1.996.453 2.65.264.704.662 1.302 1.254 1.894.592.592 1.19.99 1.894 1.254.654.255 1.45.4 2.65.453 1.206.053 1.606.067 5.227.067s4.021-.014 5.227-.067c1.2-.053 1.996-.198 2.65-.453.704-.264 1.302-.662 1.894-1.254.592-.592.99-1.19 1.254-1.894.255-.654.4-1.45.453-2.65.053-1.206.067-1.606.067-5.227s-.014-4.021-.067-5.227c-.053-1.2-.198-1.996-.453-2.65-.264-.704-.662-1.302-1.254-1.894C20.634 1.654 20.036 1.256 19.332.992c-.654-.255-1.45-.4-2.65-.453C16.041.48 15.641.466 12.02.466c-.005 0-.01 0-.015-.001zm.005 1.78c3.578 0 4.001.013 5.204.066 1.122.05 1.74.236 2.145.392.494.192.854.423 1.228.797.374.374.605.734.797 1.228.156.405.342 1.023.392 2.145.053 1.203.066 1.626.066 5.204 0 3.578-.013 4.001-.066 5.204-.05 1.122-.236 1.74-.392 2.145-.192.494-.423.854-.797 1.228-.374.374-.734.605-1.228.797-.405.156-1.023.342-2.145.392-1.203.053-1.626.066-5.204.066-3.578 0-4.001-.013-5.204-.066-1.122-.05-1.74-.236-2.145-.392-.494-.192-.854-.423-1.228-.797-.374-.374-.605-.734-.797-1.228-.156-.405-.342-1.023-.392-2.145-.053-1.203-.066-1.626-.066-5.204 0-3.578.013-4.001.066-5.204.05-1.122.236-1.74.392-2.145.192-.494.423-.854.797-1.228.374-.374.734-.605 1.228-.797.405-.156 1.023-.342 2.145-.392C8.015 2.259 8.437 2.246 12.015 2.246c.005 0 .01 0 .015.001z"/>
                              <path d="M12.017 6.124c-3.767 0-6.827 3.06-6.827 6.826 0 3.767 3.06 6.827 6.827 6.827s6.827-3.06 6.827-6.827c0-3.766-3.06-6.826-6.827-6.826zm0 11.283c-2.472 0-4.477-2.005-4.477-4.477 0-2.472 2.005-4.477 4.477-4.477s4.477 2.005 4.477 4.477c0 2.472-2.005 4.477-4.477 4.477z"/>
                              <circle cx="17.072" cy="6.928" r="1.5"/>
                            </svg>
                          </a>
                        )}
                      </div>

                      {/* CTA Button */}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: theme.borderLight }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                        }`}
                        style={{ borderColor: theme.borderLight }}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: theme.borderLight }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
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
                We couldn't find any professionals matching your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIndustryFilter('');
                  setGenderFilter('');
                  setRegionFilter('');
                  fetchPowerlists(1);
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
        </div>
      </section>

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