import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, Mic, Globe, Star, ExternalLink, Shield,
  Link as LinkIcon, FileText, CheckCircle, Users, Clock,
  BarChart3, Target, Award, TrendingUp, MapPin, Calendar,
  Eye, Heart, Share, Instagram, Youtube, Twitter, Facebook,
  MessageCircle, Mail
} from 'lucide-react';
import { getIdFromSlug } from '../utils/slugify';
import ShareButtons from '../components/common/ShareButtons';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';

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

const PodcasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [podcaster, setPodcaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    views: 0,
    listeners: 0,
    rating: 0,
    episodes: 0
  });

  useEffect(() => {
    if (id) {
      fetchPodcasterDetails();
    }
  }, [id]);

  const fetchPodcasterDetails = async () => {
    try {
      setLoading(true);
      const realId = getIdFromSlug(id);
      console.log('Fetching podcaster details for ID:', realId);

      const response = await api.get(`/podcasters/approved/${realId}`);
      setPodcaster(response.data.podcaster || response.data);
    } catch (error) {
      console.error('Error fetching podcaster details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        navigate('/podcasters');
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
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    const shareData = {
      title: podcaster.podcast_name,
      text: `Check out this podcast: ${podcaster.podcast_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(t('podcasterDetail.actions.linkCopied'));
      });
    }
  };

  const handleViewStats = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    const realStats = {
      views: (parseInt(podcaster.podcast_ig_followers) || 0) * 8,
      listeners: (parseInt(podcaster.podcast_ig_followers) || 0) * 0.15,
      rating: (parseInt(podcaster.podcast_ig_followers) || 0) >= 50000 ? 4.9 : 4.3,
      episodes: Math.floor(((parseInt(podcaster.podcast_ig_followers) || 0)) / 3000) + 10
    };

    setStats(realStats);
    setShowStats(true);
  };

  const handleContactForPodcast = () => {
    navigate('/contact-us');
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-4 bg-slate-100 rounded" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-8 space-y-10">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-4">
                    <div className="h-10 w-3/4 bg-slate-200 rounded" />
                    <div className="flex gap-6">
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-200 rounded" />
                  <div className="h-10 w-48 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-50 rounded" />
                    <div className="h-4 w-5/6 bg-slate-50 rounded" />
                    <div className="h-4 w-4/6 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-200 rounded" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 bg-slate-50 rounded-lg border border-slate-100" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border p-6 space-y-6">
                <div className="h-6 w-1/2 bg-slate-200 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-slate-50 rounded-lg" />
                  <div className="h-16 bg-slate-50 rounded-lg" />
                </div>
                <div className="h-10 w-1/2 mx-auto bg-slate-100 rounded-lg" />
              </div>
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <div className="h-6 w-1/2 bg-slate-200 rounded mb-4" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-4 h-4 bg-slate-100 rounded" />
                    <div className="h-4 w-full bg-slate-50 rounded" />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg border p-8 space-y-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto" />
                <div className="h-6 w-3/4 mx-auto bg-slate-200 rounded" />
                <div className="h-12 w-full bg-slate-100 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!podcaster) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Mic size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              {t('podcasterDetail.notFound.title')}
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {t('podcasterDetail.notFound.desc')}
            </p>
            <button
              onClick={() => navigate('/podcasters')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              {t('podcasterDetail.back')}
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <SEO
        title={`${podcaster.podcast_name} | Podcast Host`}
        description={podcaster.cta || `Connect with ${podcaster.podcast_host}, host of ${podcaster.podcast_name}, on VaaS Solutions. Explore top podcasts and media influencers.`}
        image={podcaster.image || 'https://vaas.solutions/logo.png'}
        url={window.location.href}
        type="profile"
      />
      <Schema
        type="person"
        data={{
          name: podcaster.podcast_host,
          jobTitle: "Podcaster",
          description: podcaster.cta,
          image: podcaster.image, // Check if image exists in podcaster object
          url: podcaster.podcast_website || window.location.href,
          socialLinks: [
            podcaster.podcast_ig,
            podcaster.podcast_linkedin,
            podcaster.podcast_facebook,
            podcaster.youtube_channel_url,
            podcaster.twitter
          ].filter(Boolean)
        }}
      />
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: theme.textSecondary }}>
            <button
              onClick={() => navigate('/podcasters')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              {t('podcasterDetail.breadcrumb.back')}
            </button>
            <span>/</span>
            <span>{t('podcasterDetail.breadcrumb.current')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Podcaster Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Mic size={32} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                      {podcaster.podcast_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Mic size={16} />
                        <span>{t('podcasterDetail.host')} {podcaster.podcast_host || t('podcasters.card.unknownHost')}</span>
                      </div>
                      {podcaster.podcast_region && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{podcaster.podcast_region}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{t('podcasterDetail.added')} {formatDate(podcaster.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website Link */}
                {podcaster.podcast_website && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      {t('podcasterDetail.website')}
                    </h3>
                    <a
                      href={podcaster.podcast_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <ExternalLink size={16} />
                      {podcaster.podcast_website}
                    </a>
                  </div>
                )}

                {/* Description/About */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    {t('podcasterDetail.about')}
                  </h3>
                  <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                    <p>
                      {podcaster.cta || 'This is a professional podcast offering engaging content and valuable insights. Join us for compelling discussions and expert interviews that inform and entertain.'}
                    </p>
                    {podcaster.podcast_focus_industry && (
                      <p className="mt-4">
                        <strong>{t('podcasterDetail.focus')}:</strong> {podcaster.podcast_focus_industry}
                      </p>
                    )}
                    {podcaster.podcast_target_audience && (
                      <p className="mt-4">
                        <strong>{t('podcasterDetail.targetAudience')}:</strong> {podcaster.podcast_target_audience}
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    {t('podcasterDetail.social')}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {podcaster.podcast_ig && (
                      <a
                        href={podcaster.podcast_ig}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#E4405F' }}
                      >
                        <Instagram size={16} />
                        Instagram
                      </a>
                    )}
                    {podcaster.youtube_channel_url && (
                      <a
                        href={podcaster.youtube_channel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#FF0000' }}
                      >
                        <Youtube size={16} />
                        YouTube
                      </a>
                    )}
                    {podcaster.spotify_channel_url && (
                      <a
                        href={podcaster.spotify_channel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#1DB954' }}
                      >
                        <Mic size={16} />
                        Spotify
                      </a>
                    )}
                    {podcaster.podcast_linkedin && (
                      <a
                        href={podcaster.podcast_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#0077B5' }}
                      >
                        <ExternalLink size={16} />
                        LinkedIn
                      </a>
                    )}
                    {podcaster.podcast_facebook && (
                      <a
                        href={podcaster.podcast_facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#1877F2' }}
                      >
                        <Facebook size={16} />
                        Facebook
                      </a>
                    )}
                    {podcaster.tiktok && (
                      <a
                        href={podcaster.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#000000' }}
                      >
                        <MessageCircle size={16} />
                        TikTok
                      </a>
                    )}
                  </div>
                </div>

                {/* Instagram Embed */}
                {podcaster.podcast_ig_username && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                      {t('podcasterDetail.instagramLatest')}
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <blockquote
                        className="instagram-media"
                        data-instgrm-permalink={`https://www.instagram.com/${podcaster.podcast_ig_username}/`}
                        data-instgrm-version="14"
                        style={{
                          maxWidth: '540px',
                          width: 'calc(100% - 2px)',
                          borderRadius: '12px',
                          border: '1px solid rgb(219, 219, 219)',
                          boxShadow: 'none',
                          display: 'block',
                          margin: '0 auto',
                          minWidth: '326px',
                          padding: '0px'
                        }}
                      >
                        <div style={{ padding: '16px' }}>
                          <a
                            href={`https://www.instagram.com/${podcaster.podcast_ig_username}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#FFFFFF',
                              lineHeight: '0',
                              padding: '0 0',
                              textAlign: 'center',
                              textDecoration: 'none',
                              width: '100%'
                            }}
                          >
                            View this post on Instagram
                          </a>
                        </div>
                      </blockquote>
                      <script async src="//www.instagram.com/embed.js"></script>
                    </div>
                  </div>
                )}

                {/* Contact CTA */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('podcasterDetail.cta.title')}</h3>
                        <p className="text-gray-600">{t('podcasterDetail.cta.desc', { name: podcaster.podcast_name })}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleContactForPodcast}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail size={18} />
                      {t('podcasterDetail.cta.button')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Stats Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('podcasterDetail.stats.title')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.primary }}>
                      {formatFollowers(podcaster.podcast_ig_followers)}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('podcasterDetail.stats.followers')}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.success }}>
                      {podcaster.podcast_ig_engagement_rate ? `${podcaster.podcast_ig_engagement_rate}%` : 'N/A'}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>{t('podcasterDetail.stats.engagement')}</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleViewStats}
                    className="text-sm text-white px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    {t('podcasterDetail.stats.viewDetailed')}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  {t('podcasterDetail.quickInfo.title')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Award size={16} style={{ color: theme.info }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('podcasterDetail.quickInfo.status')}: <span className="text-green-600 font-medium">{t('podcasterDetail.quickInfo.approved')}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: theme.secondary }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('podcasterDetail.quickInfo.host')}: {podcaster.podcast_host || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} style={{ color: theme.warning }} />
                    <span style={{ color: theme.textSecondary }}>
                      {t('podcasterDetail.quickInfo.focus')}: {podcaster.podcast_focus_industry || 'General'}
                    </span>
                  </div>
                  {podcaster.podcast_ig_prominent_guests && (
                    <div className="flex items-start gap-2">
                      <Star size={16} style={{ color: theme.primary }} />
                      <div style={{ color: theme.textSecondary }}>
                        <div className="font-medium">{t('podcasterDetail.quickInfo.prominentGuests')}:</div>
                        <div className="text-xs mt-1">{podcaster.podcast_ig_prominent_guests}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact CTA Sidebar */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mic className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('podcasterDetail.sidebarCta.title')}</h4>
                  <p className="text-sm text-gray-600 mb-4">{t('podcasterDetail.sidebarCta.desc', { name: podcaster.podcast_name })}</p>
                  <button
                    onClick={handleContactForPodcast}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {t('podcasterDetail.sidebarCta.button')}
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
                {isSaved ? t('podcasterDetail.actions.saved') : t('podcasterDetail.actions.save')}
              </span>
            </button>
            <ShareButtons
              url={window.location.href}
              title={podcaster?.podcast_name || 'Podcast'}
              description={podcaster?.cta || ''}
            />
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

      {/* Stats Modal */}
      {showStats && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => setShowStats(false)}>
          <div style={{
            backgroundColor: theme.background,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                {t('podcasterDetail.statsModal.title')}
              </h2>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.primary,
                  marginBottom: '4px'
                }}>
                  {stats.views.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('podcasterDetail.statsModal.totalViews')}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.success,
                  marginBottom: '4px'
                }}>
                  {stats.listeners.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('podcasterDetail.statsModal.monthlyListeners')}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.warning,
                  marginBottom: '4px'
                }}>
                  {stats.rating}★
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('podcasterDetail.statsModal.avgRating')}
                </div>
              </div>

              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.info,
                  marginBottom: '4px'
                }}>
                  {stats.episodes}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('podcasterDetail.statsModal.totalEpisodes')}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.primaryLight,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: theme.primary
              }}>
                {t('podcasterDetail.statsModal.performanceSummary')}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: theme.textSecondary
              }}>
                {t('podcasterDetail.statsModal.performanceDesc', { rating: stats.rating })}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {t('podcasterDetail.statsModal.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcasterDetail;