import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import AwardSubmissionForm from '../components/user/AwardSubmissionForm';
import {
  ArrowLeft, Globe, BookOpen, Star, ExternalLink, Shield,
  Link as LinkIcon, Image as ImageIcon, FileText, CheckCircle,
  DollarSign, Clock, BarChart3, Target, Award, TrendingUp,
  MapPin, Calendar, Users, Zap, Eye, Heart, Share, User, Building,
  Mail, Phone, MessageSquare
} from 'lucide-react';

const AwardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [award, setAward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showAwardForm, setShowAwardForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAwardDetails();
    }
  }, [id]);

  const fetchAwardDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching award details for ID:', id);

      const response = await api.get(`/awards/${id}`);
      console.log('Award details response:', response.data);

      setAward(response.data.award || response.data);
    } catch (error) {
      console.error('Error fetching award details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        // Handle error - maybe navigate back or show error message
        console.error('Failed to load award details');
        navigate('/awards');
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

  const handleShowAwardForm = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setShowAwardForm(true);
    }
  };

  const handleCloseAwardForm = () => {
    setShowAwardForm(false);
  };

  const handleAwardSuccess = () => {
    setShowAwardForm(false);
    // Could refresh or show success message
  };

  const handleShare = () => {
    const shareData = {
      title: award.award_name,
      text: `Check out this award: ${award.award_name}`,
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
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#E0E0E0] border-t-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading award details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!award) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
              <Award className="w-12 h-12 text-[#BDBDBD]" />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-[#212121]">
              Award Not Found
            </h1>
            <p className="mb-8 text-[#757575]">
              The award you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/awards')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors bg-[#1976D2] hover:bg-[#0D47A1]"
            >
              <ArrowLeft size={16} />
              Back to Awards
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6 text-[#757575]">
            <button
              onClick={() => navigate('/awards')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              Back to Awards
            </button>
            <span>/</span>
            <span>Award Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-8">
                {/* Award Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#E3F2FD]">
                    <Award size={32} color="#1976D2" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3 text-[#212121]">
                      {award.award_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#757575]">
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span>{award.award_organiser_name || 'Organiser TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{award.tentative_month || 'Month TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        <span>{award.company_focused_individual_focused || 'General Focus'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {award.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                      About the Award
                    </h3>
                    <div className="p-4 rounded-lg border border-[#E0E0E0] bg-[#F5F5F5]">
                      <p className="text-[#757575]">{award.description}</p>
                    </div>
                  </div>
                )}

                {/* Guests */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                    Special Guests
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {award.chief_guest && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F5]">
                        <Star size={20} color="#1976D2" />
                        <div>
                          <div className="text-sm font-medium text-[#212121]">Chief Guest</div>
                          <div className="text-sm text-[#757575]">{award.chief_guest}</div>
                        </div>
                      </div>
                    )}
                    {award.celebrity_guest && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F5]">
                        <Star size={20} color="#9C27B0" />
                        <div>
                          <div className="text-sm font-medium text-[#212121]">Celebrity Guest</div>
                          <div className="text-sm text-[#757575]">{award.celebrity_guest}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(award.website || award.linkedin || award.instagram) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                      Connect with the Organiser
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {award.website && (
                        <a
                          href={award.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#00796B] text-white hover:bg-[#004D40]"
                        >
                          <Globe size={16} />
                          Website
                        </a>
                      )}
                      {award.linkedin && (
                        <a
                          href={award.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#0077B5] text-white hover:opacity-90"
                        >
                          LinkedIn
                        </a>
                      )}
                      {award.instagram && (
                        <a
                          href={award.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#E4405F] text-white hover:opacity-90"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div className="mb-8">
                  <button
                    onClick={handleShowAwardForm}
                    className="w-full text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg bg-[#1976D2] hover:bg-[#0D47A1]"
                  >
                    <ExternalLink size={20} />
                    {award.cta_text || 'Apply for this Award'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Award Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                  Award Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Name</span>
                    <span className="text-[#212121]">{award.award_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Organiser</span>
                    <span className="text-[#212121]">{award.award_organiser_name || 'TBA'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Month</span>
                    <span className="text-[#212121]">{award.tentative_month || 'TBA'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#757575]">Focus</span>
                    <span className="text-[#212121]">{award.company_focused_individual_focused || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Share Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#212121]">
                  Share Award
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors bg-[#9C27B0] hover:opacity-90"
                  >
                    <Share size={16} />
                    Share Award
                  </button>
                </div>
              </div>
            </div>
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

      {/* Award Submission Form Modal */}
      {showAwardForm && (
        <AwardSubmissionForm
          award={award}
          onClose={handleCloseAwardForm}
          onSuccess={handleAwardSuccess}
        />
      )}
    </div>
  );
};

export default AwardDetailPage;