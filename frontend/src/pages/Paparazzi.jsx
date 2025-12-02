import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera, Search, Filter, Globe, MapPin, Users, DollarSign, Plus, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

const PaparazziPage = () => {
  const [paparazzi, setPaparazzi] = useState([]);
  const [filteredPaparazzi, setFilteredPaparazzi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPaparazzi();
  }, []);

  useEffect(() => {
    filterPaparazzi();
  }, [paparazzi, searchQuery, selectedPlatform, selectedCategory, selectedLocation]);

  const fetchPaparazzi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/paparazzi');
      let paparazziData = response.data.paparazzi || [];

      // Client-side search for better results
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase().trim();
        paparazziData = paparazziData.filter(p => {
          return (
            p.page_name?.toLowerCase().includes(searchLower) ||
            p.username?.toLowerCase().includes(searchLower) ||
            p.category?.toLowerCase().includes(searchLower) ||
            p.location?.toLowerCase().includes(searchLower) ||
            p.platform?.toLowerCase().includes(searchLower)
          );
        });
      }

      setPaparazzi(paparazziData);
    } catch (err) {
      console.error('Error fetching paparazzi:', err);
      setError('Failed to load paparazzi. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterPaparazzi = useCallback(() => {
    let filtered = paparazzi.filter(p => {
      const matchesSearch = p.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
      const matchesCategory = selectedCategory === 'all' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesLocation = selectedLocation === 'all' || (p.location && p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      return matchesSearch && matchesPlatform && matchesCategory && matchesLocation;
    });
    setFilteredPaparazzi(filtered);
  }, [paparazzi, searchQuery, selectedPlatform, selectedCategory, selectedLocation]);

  const platforms = ['all', ...new Set(paparazzi.map(p => p.platform).filter(Boolean))];
  const categories = ['all', ...new Set(paparazzi.map(p => p.category).filter(Boolean))];
  const locations = ['all', ...new Set(paparazzi.map(p => p.location).filter(Boolean))];

  const handleCardClick = (paparazziId) => {
    navigate(`/paparazzi/${paparazziId}`);
  };

  const handleSubmitNew = () => {
    if (!isAuthenticated) {
      // TODO: Show login modal or redirect to login
      alert('Please login to submit new paparazzi');
      return;
    }
    navigate('/paparazzi/submit');
  };

  const clearAllFilters = () => {
    setSelectedPlatform('all');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price) => {
    return price ? `$${price}` : 'Contact for pricing';
  };

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Enhanced Hero Section */}
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-[#1976D2] rounded-full p-4">
                <Camera className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Paparazzi Network
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Connect with professional paparazzi across social media platforms. Find the perfect photographer for your content needs.
            </p>
            <div className="mt-8">
              <button
                onClick={handleSubmitNew}
                className="inline-flex items-center gap-2 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565C0] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Submit New Paparazzi
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
              {/* Enhanced Filter Sections */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Camera size={16} className="text-[#1976D2]" />
                  Paparazzi Filters
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Platform Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Platform
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {platforms.map(platform => (
                        <option key={platform} value={platform}>
                          {platform === 'all' ? 'All Platforms' : platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {locations.map(location => (
                        <option key={location} value={location}>
                          {location === 'all' ? 'All Locations' : location}
                        </option>
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
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, username, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

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
                  {filteredPaparazzi.length} paparazzi found
                  {searchQuery && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchQuery}"
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Paparazzi Display */}
          {loading ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
                style={{
                  borderBottom: `2px solid ${theme.primary}`,
                  borderRight: `2px solid transparent`
                }}
              ></div>
              <p className="text-lg" style={{ color: theme.textSecondary }}>Loading paparazzi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPaparazzi.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCardClick(p.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-[#1976D2] rounded-full p-3">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-3 py-1 rounded-full">
                            {p.platform}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#212121] mb-2 line-clamp-2">
                          {p.page_name}
                        </h3>
                        <p className="text-sm text-[#757575] mb-3">@{p.username}</p>
                        <div className="space-y-2 text-sm text-[#757575]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{formatFollowers(p.followers_count)} followers</span>
                          </div>
                          {p.category && (
                            <div className="flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              <span>{p.category}</span>
                            </div>
                          )}
                          {p.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{p.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#E0E0E0]">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-[#1976D2] font-medium">
                              {formatPrice(p.price_reel_with_tag)}
                            </span>
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
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Paparazzi
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Platform
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Followers
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Location
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Price
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPaparazzi.map((p, index) => (
                          <tr
                            key={p.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handleCardClick(p.id)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryLight }}
                                >
                                  <Camera size={20} style={{ color: theme.primary }} />
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {p.page_name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    @{p.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium" style={{ color: theme.primary }}>
                                {p.platform}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {formatFollowers(p.followers_count)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {p.category || 'General'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {p.location || 'Global'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium" style={{ color: theme.success }}>
                                {formatPrice(p.price_reel_with_tag)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                style={{ backgroundColor: theme.primary }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!loading && !error && filteredPaparazzi.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-12 h-12 text-[#BDBDBD]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                    No paparazzi found
                  </h3>
                  <p className="text-[#757575] text-lg max-w-md mx-auto">
                    We couldn't find any paparazzi matching your search criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      clearAllFilters();
                    }}
                    className="mt-6 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <UserFooter />
    </div>
  );
};

export default PaparazziPage;