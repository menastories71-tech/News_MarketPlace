import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, ExternalLink, Globe, Calendar, Building, User, MapPin, Tag
} from 'lucide-react';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import Icon from '../components/common/Icon';
// Removed ShareButtons import to implement manually

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

const PublishedWorkDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const [publishedWork, setPublishedWork] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAuth, setShowAuth] = useState(false);

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sharePlatforms = [
    { name: 'Telegram', icon: 'telegram', color: '#0088cc', link: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', link: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + '\n' + u)}` },
    { name: 'Facebook', icon: 'facebook', color: '#1877F2', link: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { name: 'X', icon: 'x-logo', color: '#000000', link: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', link: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` }
  ];

  const renderShareMenu = (url, title, id, align = 'center') => {
    const isOpen = activeShareId === id;
    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200 p-3 
          ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`}
        style={{ width: isMobile ? '220px' : '280px' }}
      >
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-2">
          {sharePlatforms.map((p) => (
            <a
              key={p.name}
              href={p.link(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-sm"
              style={{ backgroundColor: p.color }}
            >
              <Icon name={p.icon} size={18} />
            </a>
          ))}
          <button
            onClick={() => handleCopy(url, id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copiedId === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Icon name={copiedId === id ? 'check-circle' : 'link'} size={18} />
          </button>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    if (id) {
      fetchPublishedWorkDetails();
    }
  }, [id]);

  const fetchPublishedWorkDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching published work details for ID:', id);

      const response = await api.get(`/published-works/${id}`);
      console.log('Published work details response:', response.data);

      setPublishedWork(response.data.publishedWork || response.data);
    } catch (error) {
      console.error('Error fetching published work details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        console.error('Failed to load published work details');
        navigate('/published-works');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading published work details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!publishedWork) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Globe size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              Published Work Not Found
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              The published work you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/published-works')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              Back to Published Works
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
      <SEO
        title={`${publishedWork.publication_name} | Published Work | News Marketplace`}
        description={`Details about the work "${publishedWork.publication_name}" published on ${formatDate(publishedWork.article_date)} for ${publishedWork.company_name}.`}
      />
      <Schema
        type="article"
        data={{
          headline: publishedWork.publication_name,
          description: publishedWork.description || `Article published on ${publishedWork.publication_name}`,
          datePublished: publishedWork.article_date,
          author: publishedWork.person_name,
          publisher: publishedWork.publication_name,
          url: publishedWork.article_link || window.location.href
        }}
      />
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: theme.textSecondary }}>
            <button
              onClick={() => navigate('/published-works')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              Back to Published Works
            </button>
            <span>/</span>
            <span>Published Work Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Published Work Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Globe size={32} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                      {publishedWork.publication_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Tag size={16} />
                        <span>SN: {publishedWork.sn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Published: {formatDate(publishedWork.article_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span>{publishedWork.company_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publication Website */}
                {publishedWork.publication_website && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Publication Website
                    </h3>
                    <a
                      href={publishedWork.publication_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <ExternalLink size={16} />
                      {publishedWork.publication_website}
                    </a>
                  </div>
                )}

                {/* Article Link */}
                {publishedWork.article_link && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Article Link
                    </h3>
                    <a
                      href={publishedWork.article_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.success }}
                    >
                      <ExternalLink size={16} />
                      View Article
                    </a>
                  </div>
                )}

                {/* Description */}
                {publishedWork.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Description
                    </h3>
                    <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                      <p>{publishedWork.description}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {publishedWork.tags && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {publishedWork.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: theme.primaryLight, color: theme.primaryDark }}
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Details Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Article Year</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publishedWork.article_year || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Publication Date</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {formatDate(publishedWork.article_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Company</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publishedWork.company_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Person</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publishedWork.person_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Industry</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publishedWork.industry}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Company Country</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publishedWork.company_country}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Individual Country</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {publishedWork.individual_country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {publishedWork.publication_website && (
                    <a
                      href={publishedWork.publication_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Globe size={16} />
                      Visit Publication
                    </a>
                  )}
                  {publishedWork.article_link && (
                    <a
                      href={publishedWork.article_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.success }}
                    >
                      <ExternalLink size={16} />
                      Read Article
                    </a>
                  )}

                  <div className="pt-4 mt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-center" style={{ color: theme.textSecondary }}>
                      Share this work
                    </h4>
                    <div className="flex justify-center">
                      <div className="flex justify-center relative">
                        <button
                          onClick={() => setActiveShareId(activeShareId === 'work' ? null : 'work')}
                          className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[#E0E0E0] text-slate-600 hover:bg-gray-50 transition-all font-medium"
                        >
                          <Icon name="share" size={16} />
                          <span>Share</span>
                        </button>
                        {renderShareMenu(window.location.href, publishedWork.publication_name, 'work')}
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};

export default PublishedWorkDetailPage;