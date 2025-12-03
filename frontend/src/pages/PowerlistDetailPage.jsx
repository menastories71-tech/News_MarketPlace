import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, Globe, BookOpen, Star, ExternalLink, Shield,
  Link as LinkIcon, Image as ImageIcon, FileText, CheckCircle,
  DollarSign, Clock, BarChart3, Target, Award, TrendingUp,
  MapPin, Calendar, Users, Zap, Eye, Heart, Share, User, Building,
  Mail, Phone, MessageSquare, Bookmark, Award as AwardIcon, ExternalLink as ExternalLinkIcon
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

const PowerlistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [powerlistNomination, setPowerlistNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPowerlistNominationDetails();
    }
  }, [id]);

  const fetchPowerlistNominationDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching powerlist nomination details for ID:', id);

      const response = await api.get(`/powerlist-nominations/public/${id}`);
      console.log('Powerlist nomination details response:', response.data);

      setPowerlistNomination(response.data.nomination || response.data);
    } catch (error) {
      console.error('Error fetching powerlist nomination details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        // Handle error - maybe navigate back or show error message
        console.error('Failed to load powerlist nomination details');
        navigate('/power-lists');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    try {
      // Simulate save action
      setIsSaved(!isSaved);
      console.log('Save toggled:', !isSaved);

      // Here you would typically call an API to save/unsave the powerlist nomination
      // await api.post(`/powerlist-nominations/${id}/save`, { saved: !isSaved });
    } catch (error) {
      console.error('Error saving powerlist nomination:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: powerlistNomination?.power_list_name || 'Powerlist Nomination',
      text: `Check out this powerlist nomination: ${powerlistNomination?.power_list_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        // Ultimate fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
      });
    }
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
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={getStatusStyle(status)}
      >
        {getStatusText(status)}
      </span>
    );
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading nomination details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!powerlistNomination) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <AwardIcon size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              Nomination Not Found
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              The powerlist nomination you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/power-lists')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              Back to Nominations
            </button>
          </div>
        </div>
        <UserFooter />
        {showAuth && (
          <AuthModal
            isOpen={showAuth}
            onClose={handleCloseAuth}
            onLoginSuccess={handleCloseAuth}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: theme.textSecondary }}>
            <button
              onClick={() => navigate('/power-lists')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              Back to Nominations
            </button>
            <span>/</span>
            <span>Nomination Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Header with Image Background */}
                <div className="relative mb-8">
                  {/* Cover Image */}
                  <div className="h-64 rounded-lg overflow-hidden mb-6">
                    {powerlistNomination.image ? (
                      <img
                        src={powerlistNomination.image}
                        alt={powerlistNomination.publication_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.secondaryLight})`
                        }}
                      >
                        <Building size={64} style={{ color: theme.primary }} />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={powerlistNomination.status} />
                    </div>
                  </div>

                  {/* Publication and Power List Info */}
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                        {powerlistNomination.publication_name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-6 text-sm mb-4" style={{ color: theme.textSecondary }}>
                        <div className="flex items-center gap-2">
                          <AwardIcon size={16} />
                          <span className="font-medium">{powerlistNomination.power_list_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{powerlistNomination.company_or_individual}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{powerlistNomination.location_region || 'Global'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Created {formatDate(powerlistNomination.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                      {powerlistNomination.industry || 'General'}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>Industry</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold" style={{ color: theme.secondary }}>
                      {powerlistNomination.company_or_individual}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>Type</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold" style={{ color: theme.info }}>
                      {powerlistNomination.location_region || 'Global'}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>Region</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold" style={{ color: theme.success }}>
                      {powerlistNomination.tentative_month || 'TBD'}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>Timeline</div>
                  </div>
                </div>

                {/* Links Section */}
                {(powerlistNomination.website_url || powerlistNomination.last_power_list_url) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                      External Links
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {powerlistNomination.website_url && (
                        <a
                          href={powerlistNomination.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: theme.primary, color: 'white' }}
                        >
                          <Globe size={16} />
                          Visit Website
                          <ExternalLinkIcon size={14} />
                        </a>
                      )}
                      {powerlistNomination.last_power_list_url && (
                        <a
                          href={powerlistNomination.last_power_list_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: theme.secondary, color: 'white' }}
                        >
                          <BookOpen size={16} />
                          Last Power List
                          <ExternalLinkIcon size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {powerlistNomination.message && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Additional Information
                    </h3>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.backgroundSoft }}>
                      <p style={{ color: theme.textSecondary }}>{powerlistNomination.message}</p>
                    </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: theme.success + '10' }}>
                    <CheckCircle size={20} style={{ color: theme.success }} />
                    <span className="text-sm" style={{ color: theme.textSecondary }}>
                      This nomination has been reviewed and approved by our team.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Nomination Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Nomination Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Status</span>
                    <StatusBadge status={powerlistNomination.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Industry</span>
                    <span style={{ color: theme.textPrimary }}>{powerlistNomination.industry || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Type</span>
                    <span style={{ color: theme.textPrimary }}>{powerlistNomination.company_or_individual}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Location</span>
                    <span style={{ color: theme.textPrimary }}>{powerlistNomination.location_region || 'Global'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Expected Month</span>
                    <span style={{ color: theme.textPrimary }}>{powerlistNomination.tentative_month || 'TBD'}</span>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {powerlistNomination.website_url && (
                    <a
                      href={powerlistNomination.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                    >
                      <Globe size={16} />
                      Visit Website
                      <ExternalLinkIcon size={14} />
                    </a>
                  )}
                  
                  {powerlistNomination.last_power_list_url && (
                    <a
                      href={powerlistNomination.last_power_list_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.secondary }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.secondaryDark}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.secondary}
                    >
                      <BookOpen size={16} />
                      View Last List
                      <ExternalLinkIcon size={14} />
                    </a>
                  )}

                  <button
                    onClick={() => navigate('/power-lists')}
                    className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.info }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#7B1FA2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.info}
                  >
                    <ArrowLeft size={16} />
                    Back to Nominations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Actions */}
      <section className="px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: isSaved ? theme.danger : theme.borderLight,
                backgroundColor: isSaved ? theme.danger + '20' : 'transparent',
                color: isSaved ? theme.danger : theme.textSecondary
              }}
            >
              <Heart size={16} style={{ color: isSaved ? theme.danger : theme.danger, fill: isSaved ? theme.danger : 'none' }} />
              <span style={{ color: isSaved ? theme.danger : theme.textSecondary }}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: theme.borderLight,
                color: theme.textSecondary
              }}
            >
              <Share size={16} style={{ color: theme.primary }} />
              <span style={{ color: theme.textSecondary }}>Share</span>
            </button>
          </div>
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

export default PowerlistDetailPage;