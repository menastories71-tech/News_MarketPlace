import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radio, Search, Filter, Globe, MapPin, User, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
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

const RadioPage = () => {
  const [radios, setRadios] = useState([]);
  const [filteredRadios, setFilteredRadios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedEmirate, setSelectedEmirate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchRadios();
  }, []);

  useEffect(() => {
    filterRadios();
  }, [radios, searchQuery, selectedLanguage, selectedEmirate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRadios.length]);

  const fetchRadios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/radios');
      let radiosData = response.data.radios || [];

      // Client-side search for better results
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase().trim();
        radiosData = radiosData.filter(radio => {
          return (
            radio.radio_name?.toLowerCase().includes(searchLower) ||
            radio.frequency?.toLowerCase().includes(searchLower) ||
            radio.radio_popular_rj?.toLowerCase().includes(searchLower) ||
            radio.radio_language?.toLowerCase().includes(searchLower) ||
            radio.emirate_state?.toLowerCase().includes(searchLower)
          );
        });
      }

      setRadios(radiosData);
    } catch (err) {
      console.error('Error fetching radios:', err);
      setError('Failed to load radios. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterRadios = useCallback(() => {
    let filtered = radios.filter(radio => {
      const matchesSearch = radio.radio_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           radio.frequency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           radio.radio_popular_rj.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = selectedLanguage === 'all' || radio.radio_language === selectedLanguage;
      const matchesEmirate = selectedEmirate === 'all' || radio.emirate_state === selectedEmirate;
      return matchesSearch && matchesLanguage && matchesEmirate;
    });
    setFilteredRadios(filtered);
  }, [radios, searchQuery, selectedLanguage, selectedEmirate]);

  const languages = ['all', ...new Set(radios.map(radio => radio.radio_language).filter(Boolean))];
  const emirates = ['all', ...new Set(radios.map(radio => radio.emirate_state).filter(Boolean))];

  // Pagination logic
  const paginatedRadios = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRadios.slice(startIndex, endIndex);
  }, [filteredRadios, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRadios.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const handleCardClick = (radioId) => {
    navigate(`/radio/${radioId}`);
  };

  const clearAllFilters = () => {
    setSelectedLanguage('all');
    setSelectedEmirate('all');
    resetPagination();
  };

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Enhanced Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-[#1976D2] rounded-full p-4">
                <Radio className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Radio Stations
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Discover radio stations across the UAE. Find your favorite frequencies, languages, and popular RJ hosts.
            </p>
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
                  <Radio size={16} className="text-[#1976D2]" />
                  Radio Filters
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang === 'all' ? 'All Languages' : lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Emirate Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Emirate
                    </label>
                    <select
                      value={selectedEmirate}
                      onChange={(e) => setSelectedEmirate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {emirates.map(emirate => (
                        <option key={emirate} value={emirate}>
                          {emirate === 'all' ? 'All Emirates' : emirate}
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
                placeholder="Search by name, frequency, or RJ..."
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


                <span className="text-sm font-medium text-[#212121]">
                  {filteredRadios.length} radio stations found
                  {totalPages > 1 && (
                    <span className="ml-2 text-[#757575]">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                  {searchQuery && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchQuery}"
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Radios Display */}
          {loading ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
                style={{
                  borderBottom: `2px solid ${theme.primary}`,
                  borderRight: `2px solid transparent`
                }}
              ></div>
              <p className="text-lg" style={{ color: theme.textSecondary }}>Loading radio stations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <>
              {/* Enhanced Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRadios.map((radio) => (
                  <motion.div
                    key={radio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleCardClick(radio.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-[#1976D2] rounded-full p-3">
                          <Radio className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-3 py-1 rounded-full">
                          {radio.frequency}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#212121] mb-3">
                        {radio.radio_name}
                      </h3>
                      <div className="space-y-3 text-sm text-[#757575]">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#1976D2]" />
                          <span className="font-medium">Language:</span> {radio.radio_language}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#1976D2]" />
                          <span className="font-medium">Emirate:</span> {radio.emirate_state}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#1976D2]" />
                          <span className="font-medium">Popular RJ:</span> {radio.radio_popular_rj}
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="w-full bg-[#1976D2] text-white py-2 rounded-lg hover:bg-[#1565C0] transition-colors font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-[#E0E0E0] bg-white text-[#212121] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#1976D2] text-white border-[#1976D2]'
                              : 'border-[#E0E0E0] bg-white text-[#212121] hover:bg-[#F5F5F5]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-[#E0E0E0] bg-white text-[#212121] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && filteredRadios.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                    <Radio className="w-12 h-12 text-[#BDBDBD]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                    No radio stations found
                  </h3>
                  <p className="text-[#757575] text-lg max-w-md mx-auto">
                    We couldn't find any radio stations matching your search criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      clearAllFilters();
                      resetPagination();
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

export default RadioPage;