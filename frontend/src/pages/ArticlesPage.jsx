import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import {
  ExternalLink, Eye, FileText, Calendar, User, Newspaper, Grid, List, Filter, ChevronDown, ChevronUp, Search as SearchIcon
} from 'lucide-react';

const ArticlesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [articleTypeFilter, setArticleTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publicationFilter, setPublicationFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchPublications();
  }, [currentPage, isAuthenticated, activeTab]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      let endpoint;
      if (activeTab === 'my' && isAuthenticated) {
        // Show user's own articles and AI articles
        endpoint = `/article-submissions/my-all-articles?${params.toString()}`;
      } else {
        // Show all approved articles (manual + AI)
        endpoint = `/article-submissions/all-approved-articles?${params.toString()}`;
      }

      const response = await api.get(endpoint);
      setArticles(response.data.articles || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalArticles(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublications = async () => {
    try {
      const response = await api.get('/publications?limit=1000&live_on_platform=true');
      setPublications(response.data.publications || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleManualSubmission = () => {
    if (isAuthenticated) {
      navigate('/submit-article');
    } else {
      setShowAuth(true);
    }
  };

  const handleAISubmission = () => {
    if (isAuthenticated) {
      navigate('/ai-article-questionnaire');
    } else {
      setShowAuth(true);
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

  const getUniquePublications = () => {
    const pubs = articles.map(article => article.publication?.publication_name).filter(Boolean);
    return [...new Set(pubs)].sort();
  };

  const getDateRangeOptions = () => [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' }
  ];

  const isWithinDateRange = (dateString, range) => {
    if (range === 'all') return true;
    const date = new Date(dateString);
    const now = new Date();
    const days = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '1year': 365
    };
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days[range];
  };

  // Clean HTML tags and markdown symbols from preview text
  const cleanPreviewText = (text) => {
    if (!text) return '';

    let cleaned = text;

    // Remove HTML tags (including incomplete ones)
    cleaned = cleaned.replace(/<[^>]*>?/g, '');

    // Remove markdown headers (any # at start of line or followed by space)
    cleaned = cleaned.replace(/^#+\s*/gm, '');
    cleaned = cleaned.replace(/#\s+/g, '');

    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Inline code
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links
    cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, ''); // List markers
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Numbered lists

    // Remove any remaining # symbols at the beginning of words
    cleaned = cleaned.replace(/\b#\w+/g, '');

    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  };

  const filteredArticles = (() => {
    let filtered = articles.filter(article => {
      if (!searchTerm) return true;

      if (activeTab === 'my') {
        // For user's articles (manual + AI articles)
        if (article.article_type === 'ai') {
          return [
            article.story_type,
            article.publication?.publication_name,
            article.status
          ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
        } else {
          return [
            article.title,
            article.sub_title,
            article.by_line,
            article.publication?.publication_name,
            article.status
          ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
        }
      } else {
        // For all articles (mixed manual and AI)
        if (article.article_type === 'ai') {
          return [
            article.story_type,
            article.publication?.publication_name,
            article.status
          ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
        } else {
          return [
            article.title,
            article.sub_title,
            article.by_line,
            article.publication?.publication_name
          ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
        }
      }
    });

    // Apply additional filters
    filtered = filtered.filter(article => {
      if (articleTypeFilter !== 'all') {
        if (article.article_type === 'ai') {
          if (article.story_type !== articleTypeFilter) return false;
        } else {
          return false; // Hide manual articles when specific story type is selected
        }
      }

      if (statusFilter !== 'all' && activeTab === 'my') {
        if (article.status !== statusFilter) return false;
      }

      if (publicationFilter !== 'all') {
        if (article.publication?.publication_name !== publicationFilter) return false;
      }

      if (dateRangeFilter !== 'all') {
        if (!isWithinDateRange(article.created_at, dateRangeFilter)) return false;
      }

      return true;
    });

    return filtered;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#1976D2] border-t-transparent"></div>
            <p className="text-lg text-[#757575]">Loading articles...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SEO
        title="Articles - News Marketplace"
        description="Browse published articles on News Marketplace. Discover stories, insights, and content from various publications and authors."
        keywords="articles, news marketplace, published articles, stories, content, publications"
      />
      <Schema
        type="breadcrumb"
        data={[
          { name: "Home", url: window.location.origin },
          { name: "Articles", url: window.location.href }
        ]}
      />
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
              Articles
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {activeTab === 'my'
                ? `${totalArticles} Your Articles`
                : `Upload the self-written article, or write a professional article as per the respective publication's guidelines with the help of Artificial Intelligence (AI) to expedite publishing.`
              }
            </p>

            {/* Article Type Visual Cues */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-[#E0E0E0] shadow-sm">
                <FileText size={16} className="text-[#1976D2]" />
                <span className="text-sm font-medium text-[#212121]">Profile</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-[#E0E0E0] shadow-sm">
                <Newspaper size={16} className="text-[#4CAF50]" />
                <span className="text-sm font-medium text-[#212121]">Editorial</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-[#E0E0E0] shadow-sm">
                <FileText size={16} className="text-[#FF9800]" />
                <span className="text-sm font-medium text-[#212121]">Advertorial</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-[#E0E0E0] shadow-sm">
                <Newspaper size={16} className="text-[#9C27B0]" />
                <span className="text-sm font-medium text-[#212121]">Listicle</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={handleManualSubmission}
                className="px-6 py-3 bg-[#1976D2] text-white rounded-lg font-medium hover:bg-[#0D47A1] transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Manual Article Submission
              </button>
              <button
                onClick={handleAISubmission}
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#388E3C] transition-colors flex items-center justify-center gap-2"
              >
                <Newspaper size={18} />
                Create AI Article
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-[#1976D2] text-[#1976D2]'
                  : 'border-transparent text-[#757575] hover:text-[#212121]'
              }`}
            >
              All Articles
            </button>
            {isAuthenticated && (
              <button
                onClick={() => {
                  setActiveTab('my');
                  setCurrentPage(1);
                  setSearchTerm('');
                }}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my'
                    ? 'border-[#1976D2] text-[#1976D2]'
                    : 'border-transparent text-[#757575] hover:text-[#212121]'
                }`}
              >
                My Articles
              </button>
            )}
          </div>
        </div>
      </section>

      {/* View Toggle and Filters Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#212121]">Articles ({filteredArticles.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFilters
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                <Filter size={16} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                <Grid size={16} className="mr-2" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                <List size={16} className="mr-2" />
                List
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Collapsible Filters */}
      {showFilters && (
        <section className="px-4 sm:px-6 lg:px-8 py-6 bg-[#FAFAFA] border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#212121]">
                    Article Type
                  </label>
                  <select
                    value={articleTypeFilter}
                    onChange={(e) => setArticleTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="profile">Profile</option>
                    <option value="editorial">Editorial</option>
                    <option value="advertorial">Advertorial</option>
                    <option value="listicle">Listicle</option>
                  </select>
                </div>
                {activeTab === 'my' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#212121]">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#212121]">
                    Publication
                  </label>
                  <select
                    value={publicationFilter}
                    onChange={(e) => setPublicationFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] bg-white"
                  >
                    <option value="all">All Publications</option>
                    {getUniquePublications().map(pub => (
                      <option key={pub} value={pub}>{pub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#212121]">
                    Date Range
                  </label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] bg-white"
                  >
                    {getDateRangeOptions().map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setArticleTypeFilter('all');
                    setStatusFilter('all');
                    setPublicationFilter('all');
                    setDateRangeFilter('all');
                  }}
                  className="px-4 py-2 text-[#1976D2] hover:text-[#0D47A1] font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'my'
                    ? "Search by story type, publication, or status..."
                    : "Search by title, subtitle, author, or publication..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] bg-white text-[#212121]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {filteredArticles.length > 0 ? (
            <>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow p-6"
                  >
                    {article.article_type === 'ai' || activeTab === 'my' ? (
                      // AI Article Card - Enhanced Design
                      <>

                        {/* Article Type Badges */}
                        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E3F2FD] text-[#1976D2] capitalize border border-[#1976D2]/20">
                            {article.story_type}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#4CAF50] to-[#388E3C] text-white">
                            ✨ AI Generated
                          </span>
                        </div>

                        {/* Title for AI articles */}
                        {article.name && (
                          <h3 className="text-xl font-bold mb-3 text-[#212121] text-center line-clamp-2 leading-tight">
                            {article.name}
                          </h3>
                        )}

                        {/* Status (only show for user's articles) */}
                        {activeTab === 'my' && (
                          <div className="mb-4 flex justify-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              article.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                              article.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              article.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                            </span>
                          </div>
                        )}

                        {/* Publication */}
                        <div className="flex items-center justify-center text-sm mb-3 p-2 bg-[#F8F9FA] rounded-lg">
                          <Newspaper size={16} className="mr-2 text-[#1976D2]" />
                          <span className="font-medium text-[#757575]">Publication: </span>
                          <span className="text-[#212121] ml-1 font-semibold">{article.publication?.publication_name || 'Not Assigned'}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center justify-center text-sm mb-4 p-2 bg-[#F8F9FA] rounded-lg">
                          <Calendar size={16} className="mr-2 text-[#1976D2]" />
                          <span className="font-medium text-[#757575]">Created: </span>
                          <span className="text-[#212121] ml-1 font-semibold">{formatDate(article.created_at)}</span>
                        </div>

                        {/* Generated Content Preview - Enhanced */}
                        {article.generated_content && (
                          <div className="mb-6 p-4 bg-gradient-to-br from-[#F8F9FA] to-[#E3F2FD] rounded-lg border border-[#E0E0E0]">
                            <div className="flex items-center mb-2">
                              <FileText size={14} className="mr-2 text-[#1976D2]" />
                              <span className="text-xs font-medium text-[#757575] uppercase tracking-wide">Article Preview</span>
                            </div>
                            <p className="text-sm text-[#424242] leading-relaxed line-clamp-4">
                              {cleanPreviewText(article.generated_content.substring(0, 200))}...
                            </p>
                          </div>
                        )}

                        {/* SEO Keywords Preview */}
                        {article.seo_keywords && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {article.seo_keywords.split(',').slice(0, 3).map((keyword, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E8F5E8] text-[#2E7D32] border border-[#2E7D32]/20">
                                  {keyword.trim()}
                                </span>
                              ))}
                              {article.seo_keywords.split(',').length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F5F5F5] text-[#757575]">
                                  +{article.seo_keywords.split(',').length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button - Enhanced */}
                        {activeTab === 'my' ? (
                          <button
                            onClick={() => navigate(`/ai-article-generation/${article.id}`)}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all text-sm bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white hover:from-[#0D47A1] hover:to-[#1976D2] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Eye size={16} />
                            {article.generated_content ? 'Review Article' : 'Generate Article'}
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/articles/ai-${article.id}`)}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all text-sm bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white hover:from-[#0D47A1] hover:to-[#1976D2] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Eye size={16} />
                            View Article
                          </button>
                        )}
                      </>
                    ) : (
                      // Manual Article Card
                      <>
                        {/* Article Type Badge */}
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3E5F5] text-[#9C27B0]">
                            Manual Article
                          </span>
                          {activeTab === 'my' && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.status === 'approved' ? 'bg-green-100 text-green-800' :
                              article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              article.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                            </span>
                          )}
                        </div>

                        {/* Image */}
                        {article.image1 && (
                          <div className="mb-4">
                            <img
                              src={article.image1}
                              alt={article.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-semibold mb-2 text-[#212121] line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Subtitle */}
                        {article.sub_title && (
                          <p className="text-sm text-[#757575] mb-3 line-clamp-2">
                            {article.sub_title}
                          </p>
                        )}

                        {/* Publication */}
                        <div className="flex items-center text-sm mb-2">
                          <Newspaper size={14} className="mr-2 text-[#1976D2]" />
                          <span className="font-medium text-[#757575]">Publication: </span>
                          <span className="text-[#212121] ml-1">{article.publication?.publication_name || 'Not Assigned'}</span>
                        </div>

                        {/* Author */}
                        <div className="flex items-center text-sm mb-2">
                          <User size={14} className="mr-2 text-[#1976D2]" />
                          <span className="font-medium text-[#757575]">Author: </span>
                          <span className="text-[#212121] ml-1">{article.by_line || 'Anonymous'}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center text-sm mb-4">
                          <Calendar size={14} className="mr-2 text-[#1976D2]" />
                          <span className="font-medium text-[#757575]">Date: </span>
                          <span className="text-[#212121] ml-1">{formatDate(article.created_at)}</span>
                        </div>

                        {/* Action Button */}
                        {activeTab === 'my' ? (
                          <div className="text-center text-sm text-[#757575]">
                            {article.status === 'approved' ? (
                              <button
                                onClick={() => navigate(`/articles/${article.slug}`)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                              >
                                <Eye size={14} />
                                View Article
                              </button>
                            ) : (
                              <span className="block py-3">
                                {article.status === 'pending' ? 'Under Review' : 'Review Feedback'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/articles/${article.slug}`)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                          >
                            <Eye size={14} />
                            View Article
                          </button>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-[#1976D2] text-white border-[#1976D2]'
                            : 'border-[#E0E0E0] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#F5F5F5]">
                <FileText size={48} className="text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-[#212121]">
                No articles found
              </h3>
              <p className="mb-6 max-w-md mx-auto text-[#757575]">
                We couldn't find any articles matching your search criteria.
              </p>
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
    </div>
  );
};

export default ArticlesPage;