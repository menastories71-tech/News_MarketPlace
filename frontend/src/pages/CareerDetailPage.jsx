import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  MapPin, Calendar, DollarSign, Building, User, Clock,
  CheckCircle, ExternalLink, ArrowLeft, Share, Heart
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

const CareerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchCareerDetails();
  }, [id]);

  const fetchCareerDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/careers/${id}`);
      setCareer(response.data.career);
    } catch (error) {
      console.error('Error fetching career details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else if (error.response?.status === 404) {
        navigate('/careers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleApplyNow = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowApplyModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${career.title} - ${career.company || 'Company'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this job opportunity: ${career.title}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(url, title);
      }
    } else {
      fallbackShare(url, title);
    }
  };

  const fallbackShare = (url, title) => {
    // Copy to clipboard as fallback
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    });
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    // Toggle saved state
    setIsSaved(!isSaved);

    // Here you would typically make an API call to save/unsave the career
    // For now, we'll just toggle the local state
    if (!isSaved) {
      alert('Career saved to your favorites!');
    } else {
      alert('Career removed from favorites!');
    }
  };

  const formatSalary = (salary) => {
    const numSalary = parseFloat(salary);
    return numSalary > 0 ? `$${numSalary.toLocaleString()}` : 'Salary not specified';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading career details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Icon name="exclamation-triangle" size="48" style={{ color: theme.textDisabled }} />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
              Career Not Found
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
              The career opportunity you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/careers')}
              className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            >
              Back to Careers
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Breadcrumb */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/careers')}
              className="flex items-center space-x-1 hover:text-[#1976D2] transition-colors"
              style={{ color: theme.textSecondary }}
            >
              <ArrowLeft size={16} />
              <span>Careers</span>
            </button>
            <span style={{ color: theme.textDisabled }}>/</span>
            <span style={{ color: theme.textPrimary }} className="font-medium truncate">
              {career.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b" style={{ borderColor: theme.borderLight }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                    {career.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
                    <div className="flex items-center space-x-2">
                      <Building size={16} />
                      <span>{career.company || 'Company not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{career.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{career.type || 'Type not specified'}</span>
                    </div>
                  </div>
                </div>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <Icon name="briefcase" size="32" style={{ color: theme.primary }} />
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={18} style={{ color: theme.success }} />
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>Salary</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: theme.success }}>
                    {formatSalary(career.salary)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={18} style={{ color: theme.primary }} />
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>Posted</span>
                  </div>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    {formatDate(career.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={18} style={{ color: theme.success }} />
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>Status</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: theme.success }}>
                    Active
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                  Job Description
                </h2>
                <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                  {career.description ? (
                    <div className="whitespace-pre-wrap">{career.description}</div>
                  ) : (
                    <p>No description provided.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t" style={{ borderColor: theme.borderLight }}>
                <button
                  onClick={handleApplyNow}
                  className="flex-1 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                >
                  <ExternalLink size={18} />
                  Apply Now
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  style={{ color: theme.textPrimary }}
                >
                  <Share size={18} />
                  Share
                </button>
                <button
                  onClick={handleSave}
                  className={`px-6 py-3 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isSaved ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ color: isSaved ? '#D32F2F' : theme.textPrimary }}
                >
                  <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <UserFooter />

      {/* Apply Now Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                Apply for this position
              </h3>
              <button
                onClick={handleCloseApplyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2" style={{ color: theme.textPrimary }}>
                {career.title}
              </h4>
              <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
                {career.company || 'Company not specified'} • {career.location || 'Location not specified'}
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  To apply for this position, please send your resume and cover letter to:
                </p>
                <p className="font-medium mt-2" style={{ color: theme.primary }}>
                  careers@newsmarketplace.com
                </p>
              </div>

              <div className="text-sm" style={{ color: theme.textSecondary }}>
                <p className="mb-2">Include the following in your application:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Position title in the subject line</li>
                  <li>Your resume (PDF format preferred)</li>
                  <li>A brief cover letter explaining your interest</li>
                  <li>Any relevant portfolio or work samples</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseApplyModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                style={{ color: theme.textPrimary }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Copy email to clipboard
                  navigator.clipboard.writeText('careers@newsmarketplace.com').then(() => {
                    alert('Email address copied to clipboard!');
                    handleCloseApplyModal();
                  });
                }}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                Copy Email
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CareerDetailPage;