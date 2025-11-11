import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import AwardsListing from '../components/common/AwardsListing';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import AwardSubmissionForm from '../components/user/AwardSubmissionForm';
import {
  Search, Filter, Award, Star, Clock, Globe, BookOpen,
  Target, Zap, CheckCircle, ExternalLink, MapPin, Calendar,
  DollarSign, BarChart3, Users, Link as LinkIcon, Image as ImageIcon,
  FileText, Shield, User, Building, TrendingUp
} from 'lucide-react';

const AwardsPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [focusFilter, setFocusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('award_name', searchTerm);
      if (monthFilter) params.append('award_month', monthFilter);
      if (focusFilter) params.append('award_focus', focusFilter);

      const response = await api.get(`/awards?${params.toString()}`);
      let awardsData = response.data.awards || [];

      setAwards(awardsData);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching awards:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setAwards([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAwards(1); // Reset to first page on filter change
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, monthFilter, focusFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleShowAwardForm = (award) => {
    setSelectedAward(award);
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setShowAwardForm(true);
    }
  };

  const handleCloseAwardForm = () => {
    setShowAwardForm(false);
    setSelectedAward(null);
  };

  const handleAwardSuccess = () => {
    setShowAwardForm(false);
    setSelectedAward(null);
    // Refresh the awards to include the new submission if approved
    fetchAwards(currentPage);
  };

  const getUniqueMonths = () => {
    const months = awards.map(a => a.award_month).filter(Boolean);
    return [...new Set(months)].sort();
  };

  const getUniqueFocuses = () => {
    const focuses = awards.map(a => a.award_focus).filter(Boolean);
    return [...new Set(focuses)].sort();
  };

  const handleAwardClick = (award) => {
    navigate(`/awards/${award.id}`);
  };

  const handlePageChange = (page) => {
    fetchAwards(page);
  };

  if (loading && awards.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#E0E0E0] border-t-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading awards...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Awards Directory
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Discover prestigious awards and recognition opportunities. {totalCount > 0 && `${totalCount} awards available`} for professionals and organizations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder="Search awards by name or organiser..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                showFilters
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Award Month
                </label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Months</option>
                  {getUniqueMonths().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Award Focus
                </label>
                <select
                  value={focusFilter}
                  onChange={(e) => setFocusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Focuses</option>
                  {getUniqueFocuses().map(focus => (
                    <option key={focus} value={focus}>{focus}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Awards Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {awards.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {awards.map((award, index) => (
                  <motion.div
                    key={award.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <AwardsListing
                      award={award}
                      onAwardClick={handleAwardClick}
                      onApplyClick={handleShowAwardForm}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border border-[#E0E0E0] rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#1976D2] text-white border-[#1976D2]'
                            : 'hover:bg-[#F5F5F5] text-[#212121]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                No awards found
              </h3>
              <p className="text-[#757575] text-lg max-w-md mx-auto">
                We couldn't find any awards matching your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setMonthFilter('');
                  setFocusFilter('');
                  fetchAwards(1);
                }}
                className="mt-6 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors"
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

      {/* Award Submission Form Modal */}
      {showAwardForm && selectedAward && (
        <AwardSubmissionForm
          award={selectedAward}
          onClose={handleCloseAwardForm}
          onSuccess={handleAwardSuccess}
        />
      )}
    </div>
  );
};

export default AwardsPage;