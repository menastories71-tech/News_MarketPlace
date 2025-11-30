import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon, Image as ImageIcon, FileText, Shield, Ban,
  AlertTriangle, Cigarette, Pill, Gamepad2
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

const PublicationsPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchPublications();
    fetchGroups();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        live_on_platform: 'true',
        limit: '100'
      });

      if (searchTerm) params.append('publication_name', searchTerm);
      if (groupFilter) params.append('group_name', groupFilter);
      if (regionFilter) params.append('region', regionFilter);

      const response = await api.get(`/publications?${params.toString()}`);
      let pubs = response.data.publications || [];

      // Filter for approved, active publications
      pubs = pubs.filter(pub => {
        return pub.status === 'approved' &&
               pub.is_active === true &&
               pub.live_on_platform === true;
      });

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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPublications();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, groupFilter, regionFilter, industryFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getUniqueRegions = () => {
    const regions = publications.map(pub => pub.publication_region).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const getUniqueGroupNames = () => {
    const groupNames = publications.map(pub => pub.group_name).filter(Boolean);
    return [...new Set(groupNames)].sort();
  };

  const getUniqueIndustries = () => {
    const industries = publications.map(pub => pub.publication_primary_industry).filter(Boolean);
    return [...new Set(industries)].sort();
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Contact for pricing';
  };

  const getRatingStars = (da) => {
    const rating = Math.min(Math.max(Math.round((parseInt(da) || 0) / 20), 1), 5);
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handlePublicationClick = (publication) => {
    navigate(`/publications/${publication.id}`);
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
    <div className="min-h-screen bg-white">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Hero Section - prnews.io inspired */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              Publications
            </h1>
            {/* <p className="text-lg mb-4" style={{ color: theme.textSecondary }}>
              All Publications ({publications.length} Available)
            </p> */}
            <p className="text-base mb-8" style={{ color: theme.textSecondary }}>
              Discover verified media outlets and submit your articles for publication across various industries and regions.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, topic, or region..."
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
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                  Publication Group
                </label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                  style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                >
                  <option value="">All Groups</option>
                  {getUniqueGroupNames().map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
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
            </div>
          </div>
        </section>
      )}

      {/* View Toggle Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#212121]">Publications ({publications.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                <Grid size={16} className="mr-2" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                <List size={16} className="mr-2" />
                List
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {publications.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {publications.map((publication, index) => (
                <motion.div
                  key={publication.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => handlePublicationClick(publication)}
                  className={`bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow cursor-pointer group overflow-hidden ${
                    viewMode === 'list' ? 'p-4' : ''
                  }`}
                >
                  {viewMode === 'list' ? (
                    // Compact List View - Responsive down to 320px
                    <div className="flex flex-col gap-2">
                      {/* Main content row */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                          style={{ backgroundColor: theme.primaryLight }}
                        >
                          <Icon name="newspaper" size="xs" style={{ color: theme.primary }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-[#1976D2] transition-colors leading-tight" style={{ color: theme.textPrimary }}>
                            {publication.publication_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
                            <span className="flex items-center">
                              <Globe size={10} className="mr-1" />
                              {publication.publication_region}
                            </span>
                            <span className="flex items-center">
                              <BookOpen size={10} className="mr-1" />
                              {publication.publication_language}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics and actions row */}
                      <div className="flex flex-col gap-2 ml-11">
                        {/* First row: Metrics and price */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold" style={{ color: theme.primary }}>DA: {publication.da || 0}</span>
                            <span className="font-semibold" style={{ color: theme.success }}>DR: {publication.dr || 0}</span>
                            <span className="flex items-center gap-1">
                              <FileText size={10} />
                              <span>{publication.word_limit || '500-2000'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <ImageIcon size={10} />
                              <span>{publication.allowed_images || '3-5'}</span>
                            </span>
                            <div className="text-xs font-bold ml-2" style={{ color: theme.success }}>
                              {formatPrice(publication.publication_price)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {publication.sponsored_or_not && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F5E8', color: theme.success }}>
                                  Sponsored
                                </span>
                              )}
                              {publication.do_follow_link && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#F3E5F5', color: theme.info }}>
                                  Do-follow
                                </span>
                              )}
                            </div>
                            <button
                              className="text-white font-medium py-1.5 px-2 rounded-md transition-all duration-200 flex items-center gap-1 text-xs whitespace-nowrap"
                              style={{ backgroundColor: theme.primary }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                            >
                              <Eye size={12} />
                              View
                            </button>
                          </div>
                        </div>

                        {/* Second row: Restrictions and example link */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
                            {publication.restricted_topics && publication.restricted_topics.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Ban size={10} />
                                <div className="flex gap-1">
                                  {publication.restricted_topics.includes('adult') && <AlertTriangle size={8} className="text-red-500" />}
                                  {publication.restricted_topics.includes('gambling') && <Gamepad2 size={8} className="text-red-500" />}
                                  {publication.restricted_topics.includes('drugs') && <Pill size={8} className="text-red-500" />}
                                  {publication.restricted_topics.includes('alcohol') && <Cigarette size={8} className="text-red-500" />}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            {publication.example_article_url && (
                              <a
                                href={publication.example_article_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline"
                                style={{ color: theme.primary }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon size={10} />
                                <span>Example</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Grid View (original layout)
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                            {publication.publication_name}
                          </h3>
                          <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                            <Globe size={14} className="mr-2" />
                            <span>{publication.publication_region}</span>
                          </div>
                          <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                            <BookOpen size={14} className="mr-2" />
                            <span>{publication.publication_language}</span>
                          </div>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: theme.primaryLight }}
                        >
                          <Icon name="newspaper" size="lg" style={{ color: theme.primary }} />
                        </div>
                      </div>

                      {/* SEO Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <div>
                          <div className="text-lg font-semibold" style={{ color: theme.primary }}>{publication.da || 0}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>DA</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold" style={{ color: theme.success }}>{publication.dr || 0}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>DR</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold" style={{ color: theme.warning }}>{publication.da || 0}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Rating</div>
                        </div>
                      </div>

                      {/* Price and Features */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-bold" style={{ color: theme.success }}>
                          {formatPrice(publication.publication_price)}
                        </div>
                        <div className="flex items-center text-sm" style={{ color: theme.warning }}>
                          <Star size={14} className="mr-1" />
                          <span>4.{Math.floor(Math.random() * 9) + 1}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {publication.sponsored_or_not && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F5E8', color: theme.success }}>
                            Sponsored
                          </span>
                        )}
                        {publication.do_follow_link && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F3E5F5', color: theme.info }}>
                            Do-follow
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFF8E1', color: theme.warning }}>
                          {publication.agreement_tat || 0}d TAT
                        </span>
                      </div>

                      {/* Additional Publication Details */}
                      <div className="space-y-2 mb-4">
                        {/* Word Count and Images */}
                        <div className="flex items-center justify-between text-xs" style={{ color: theme.textSecondary }}>
                          <div className="flex items-center gap-1">
                            <FileText size={12} />
                            <span>{publication.word_limit || '500-2000'} words</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ImageIcon size={12} />
                            <span>{publication.allowed_images || '3-5'} images</span>
                          </div>
                        </div>

                        {/* Restricted Topics */}
                        {publication.restricted_topics && publication.restricted_topics.length > 0 && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: theme.textSecondary }}>
                            <Ban size={12} />
                            <span className="mr-1">Restricted:</span>
                            <div className="flex gap-1">
                              {publication.restricted_topics.includes('adult') && <AlertTriangle size={10} className="text-red-500" />}
                              {publication.restricted_topics.includes('gambling') && <Gamepad2 size={10} className="text-red-500" />}
                              {publication.restricted_topics.includes('drugs') && <Pill size={10} className="text-red-500" />}
                              {publication.restricted_topics.includes('alcohol') && <Cigarette size={10} className="text-red-500" />}
                            </div>
                          </div>
                        )}

                        {/* Example Article Link */}
                        {publication.example_article_url && (
                          <div className="flex items-center gap-1 text-xs">
                            <LinkIcon size={12} style={{ color: theme.primary }} />
                            <a
                              href={publication.example_article_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: theme.primary }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Example Article
                            </a>
                          </div>
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
                        View Details
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme.backgroundSoft }}
              >
                <Globe size={48} style={{ color: theme.textDisabled }} />
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
                  setGroupFilter('');
                  setRegionFilter('');
                  setIndustryFilter('');
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
    </div>
  );
};

export default PublicationsPage;