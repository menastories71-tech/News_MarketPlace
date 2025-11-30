import React, { useState, useEffect } from 'react';
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
  Search, Eye, Grid, List, ExternalLink, Building, User, UserCheck
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showPowerlistForm, setShowPowerlistForm] = useState(false);

  useEffect(() => {
    fetchPowerlists();
  }, []);

  const fetchPowerlists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/powerlist/public');
      setPowerlists(response.data.powerlists || []);
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

  // Simple search functionality
  const handleSearch = () => {
    fetchPowerlists();
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
    fetchPowerlists();
  };

  const handlePowerlistClick = (powerlist) => {
    navigate(`/power-lists/${powerlist.id}`);
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

      {/* Enhanced Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Powerlist Directory
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Connect with influential professionals and industry leaders who can amplify your brand and drive meaningful impact.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search professionals by name, company, or industry..."
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

      {/* Main Content - Simple Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border" style={{ borderColor: theme.borderLight }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1976D2] text-white shadow-sm'
                  : 'text-[#757575] hover:text-[#212121]'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1976D2] text-white shadow-sm'
                  : 'text-[#757575] hover:text-[#212121]'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Powerlists Display */}
        {powerlists.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {powerlists.map((powerlist, index) => (
                  <motion.div
                    key={powerlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handlePowerlistClick(powerlist)}
                    className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    style={{
                      borderColor: theme.borderLight,
                      boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                    }}
                  >
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
                          <UserCheck size={24} style={{ color: theme.primary }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.primary }}>
                            {powerlist.company_industry || 'General'}
                          </div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Industry</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.success }}>
                            {powerlist.gender || 'Not specified'}
                          </div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Gender</div>
                        </div>
                      </div>

                      <div className="text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <div className="text-sm font-medium" style={{ color: theme.info }}>
                          {powerlist.passport_nationality_one || 'Global'}
                        </div>
                        <div className="text-xs" style={{ color: theme.textSecondary }}>Location</div>
                      </div>

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

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-lg border overflow-hidden" style={{
                borderColor: theme.borderLight,
                boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
              }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: theme.backgroundSoft, borderBottom: '2px solid #e2e8f0' }}>
                        <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Professional</th>
                        <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Industry</th>
                        <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {powerlists.map((powerlist, index) => (
                        <tr key={powerlist.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: theme.primaryLight }}
                              >
                                <UserCheck size={20} style={{ color: theme.primary }} />
                              </div>
                              <div>
                                <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                  {powerlist.name}
                                </div>
                                <div className="text-sm" style={{ color: theme.textSecondary }}>
                                  {powerlist.position}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: theme.textPrimary }}>
                              {powerlist.current_company || 'Independent'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: theme.textPrimary }}>
                              {powerlist.company_industry || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: theme.textPrimary }}>
                              {powerlist.gender || 'Not specified'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: theme.textPrimary }}>
                              {powerlist.passport_nationality_one || 'Global'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handlePowerlistClick(powerlist)}
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
              No powerlist entries are currently available.
            </p>
          </div>
        )}
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