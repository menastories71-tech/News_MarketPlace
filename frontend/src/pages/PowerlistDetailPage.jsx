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
  Mail, Phone, MessageSquare
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
  const [powerlist, setPowerlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPowerlistDetails();
    }
  }, [id]);

  const fetchPowerlistDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching powerlist details for ID:', id);

      const response = await api.get(`/powerlist/public/${id}`);
      console.log('Powerlist details response:', response.data);

      setPowerlist(response.data.powerlist || response.data);
    } catch (error) {
      console.error('Error fetching powerlist details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        // Handle error - maybe navigate back or show error message
        console.error('Failed to load powerlist details');
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

      // Here you would typically call an API to save/unsave the powerlist
      // await api.post(`/powerlist/${id}/save`, { saved: !isSaved });
    } catch (error) {
      console.error('Error saving powerlist:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: powerlist.name,
      text: `Check out this professional profile: ${powerlist.name}`,
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading profile details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!powerlist) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <User size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              Profile Not Found
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/power-lists')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              Back to Powerlist
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
              Back to Powerlist
            </button>
            <span>/</span>
            <span>Profile Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Profile Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <User size={32} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                      {powerlist.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span>{powerlist.current_company || 'Independent Professional'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        <span>{powerlist.position || 'Professional'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Joined {formatDate(powerlist.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                      <Mail size={20} style={{ color: theme.primary }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: theme.textPrimary }}>Email</div>
                        <div className="text-sm" style={{ color: theme.textSecondary }}>{powerlist.email}</div>
                      </div>
                    </div>
                    {powerlist.calling_number && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <Phone size={20} style={{ color: theme.success }} />
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.textPrimary }}>Phone</div>
                          <div className="text-sm" style={{ color: theme.textSecondary }}>{powerlist.calling_number}</div>
                        </div>
                      </div>
                    )}
                    {powerlist.whatsapp && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <MessageSquare size={20} style={{ color: theme.info }} />
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.textPrimary }}>WhatsApp</div>
                          <div className="text-sm" style={{ color: theme.textSecondary }}>{powerlist.whatsapp}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>Basic Details</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        <li className="flex items-center gap-2">
                          <User size={14} />
                          <span>Gender: {powerlist.gender || 'Not specified'}</span>
                        </li>
                        {powerlist.date_of_birth && (
                          <li className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>DOB: {formatDate(powerlist.date_of_birth)}</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <Building size={14} />
                          <span>Industry: {powerlist.company_industry || 'General'}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>Location & Citizenship</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        {powerlist.passport_nationality_one && (
                          <li className="flex items-center gap-2">
                            <Globe size={14} />
                            <span>Nationality: {powerlist.passport_nationality_one}</span>
                          </li>
                        )}
                        {powerlist.passport_nationality_two && (
                          <li className="flex items-center gap-2">
                            <Globe size={14} />
                            <span>Dual Passport: {powerlist.passport_nationality_two}</span>
                          </li>
                        )}
                        {powerlist.uae_permanent_residence && (
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} style={{ color: theme.success }} />
                            <span>UAE Permanent Resident</span>
                          </li>
                        )}
                        {powerlist.other_permanent_residency && (
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} style={{ color: theme.success }} />
                            <span>Other Residency: {powerlist.other_residency_mention}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {(powerlist.linkedin_url || powerlist.instagram_url || powerlist.facebook_url || powerlist.personal_website || powerlist.company_website) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                      Online Presence
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {powerlist.linkedin_url && (
                        <a
                          href={powerlist.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: '#0077B5', color: 'white' }}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      {powerlist.instagram_url && (
                        <a
                          href={powerlist.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: '#E4405F', color: 'white' }}
                        >
                          Instagram
                        </a>
                      )}
                      {powerlist.facebook_url && (
                        <a
                          href={powerlist.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: '#1877F2', color: 'white' }}
                        >
                          Facebook
                        </a>
                      )}
                      {powerlist.personal_website && (
                        <a
                          href={powerlist.personal_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: theme.secondary, color: 'white' }}
                        >
                          <Globe size={16} />
                          Personal Website
                        </a>
                      )}
                      {powerlist.company_website && (
                        <a
                          href={powerlist.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: theme.info, color: 'white' }}
                        >
                          <Building size={16} />
                          Company Website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {powerlist.message && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Additional Information
                    </h3>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.backgroundSoft }}>
                      <p style={{ color: theme.textSecondary }}>{powerlist.message}</p>
                    </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: theme.success + '10' }}>
                    <CheckCircle size={20} style={{ color: theme.success }} />
                    <span className="text-sm" style={{ color: theme.textSecondary }}>
                      This professional has agreed to the terms and conditions of the platform.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Profile Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Profile Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Status</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                      Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Industry</span>
                    <span style={{ color: theme.textPrimary }}>{powerlist.company_industry || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Company</span>
                    <span style={{ color: theme.textPrimary }}>{powerlist.current_company || 'Independent'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: theme.textSecondary }}>Position</span>
                    <span style={{ color: theme.textPrimary }}>{powerlist.position || 'Professional'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Get In Touch
                </h3>
                <div className="space-y-3">
                  <a
                    href={`mailto:${powerlist.email}`}
                    className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  >
                    <Mail size={16} />
                    Send Email
                  </a>
                  {powerlist.calling_number && (
                    <a
                      href={`tel:${powerlist.calling_number}`}
                      className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.success }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#388E3C'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.success}
                    >
                      <Phone size={16} />
                      Call Now
                    </a>
                  )}
                  {powerlist.whatsapp && (
                    <a
                      href={`https://wa.me/${powerlist.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <MessageSquare size={16} />
                      WhatsApp
                    </a>
                  )}
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