import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import {
  ArrowLeft, Calendar, User, Newspaper, Globe, Instagram, Facebook,
  Share2, Bookmark, Eye, Clock, Heart, FileText
} from 'lucide-react';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);

      // Check if this is an AI article (slug contains 'ai-' prefix) or manual article
      let endpoint;
      if (slug && slug.startsWith('ai-')) {
        // AI article - extract ID from slug (format: ai-{id})
        const aiId = slug.replace('ai-', '');
        endpoint = `/article-submissions/approved-ai-articles/${aiId}`;
      } else {
        // Manual article
        endpoint = `/article-submissions/approved-articles/${slug}`;
      }

      const response = await api.get(endpoint);
      setArticle(response.data.article);
      // Simulate view count increment
      setViewCount(response.data.article?.view_count || Math.floor(Math.random() * 1000) + 100);
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/articles');
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

  const handleBackToArticles = () => {
    navigate('/articles');
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.sub_title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Format AI article content if not already formatted
  const formatArticleContent = (content) => {
    if (!content) return '';

    // If content already contains HTML tags, return as is
    if (content.includes('<h1') || content.includes('<h2') || content.includes('<p>') || content.includes('<ul>')) {
      return content;
    }

    // Process markdown content
    const lines = content.split('\n');
    let formattedContent = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip empty lines at the beginning
      if (line === '' && formattedContent === '') continue;

      // Handle main title (# Title)
      if (line.startsWith('# ') && !line.includes('##')) {
        const title = line.substring(2);
        formattedContent += `<h1 style="font-size: 2.5rem; font-weight: 800; color: #212121; margin: 2rem 0 1.5rem 0; line-height: 1.2;">${title}</h1>`;
        continue;
      }

      // Handle section headers (## Header)
      if (line.startsWith('## ')) {
        // Close any open paragraph
        if (formattedContent.endsWith('</p>')) {
          formattedContent = formattedContent.slice(0, -4);
        } else if (formattedContent && !formattedContent.endsWith('>')) {
          formattedContent += '</p>';
        }

        const header = line.substring(3);
        formattedContent += `<h2 style="font-size: 1.8rem; font-weight: 700; color: #212121; margin: 3rem 0 1.5rem 0; padding-bottom: 0.5rem; border-bottom: 3px solid #1976D2;">${header}</h2>`;
        continue;
      }

      // Handle bullet points (- item) or lines that look like list items
      if (line.startsWith('- ')) {
        if (!inList) {
          formattedContent += '<ul style="margin: 1.5rem 0; padding-left: 2rem; list-style-type: disc; color: #000;">';
          inList = true;
        }
        const item = line.substring(2);
        formattedContent += `<li style="font-size: 1.1rem; line-height: 1.8; color: #212121; margin-bottom: 0.5rem; display: list-item;">${item}</li>`;
        continue;
      }

      // Handle lines that look like list items (after a header that suggests a list)
      if (!line.startsWith('#') && !line.startsWith('*') && line.trim() &&
          (formattedContent.includes('Key Achievements') ||
           formattedContent.includes('Achievements') ||
           formattedContent.includes('Highlights')) &&
          !inList && line.length > 2 && line.length < 150 &&
          !line.includes('This comprehensive') &&
          !line.includes('This journey') &&
          !line.includes('These forward-looking') &&
          !line.includes('Through this detailed exploration')) {

        // Start a list if we haven't already
        if (!inList) {
          formattedContent += '<ul style="margin: 1.5rem 0; padding-left: 2rem; list-style-type: disc; color: #000;">';
          inList = true;
        }
        formattedContent += `<li style="font-size: 1.1rem; line-height: 1.8; color: #212121; margin-bottom: 0.5rem; display: list-item;">${line}</li>`;
        continue;
      }

      // Handle end of list
      if (inList && (line === '' || (!line.startsWith('- ') && !line.match(/^[A-Z]/)))) {
        formattedContent += '</ul>';
        inList = false;
      }

      // Handle regular paragraphs
      if (line && !line.startsWith('#') && !line.startsWith('- ') && !line.startsWith('*')) {
        if (!formattedContent.includes('<p>') || formattedContent.endsWith('</p>') || formattedContent.endsWith('</h2>') || formattedContent.endsWith('</ul>')) {
          formattedContent += `<p style="font-size: 1.1rem; line-height: 1.8; color: #212121; margin-bottom: 1.5rem;">${line}`;
        } else {
          formattedContent += ` ${line}`;
        }
      }

      // Handle attribution line
      if (line.startsWith('*') && line.includes('generated using AI')) {
        if (formattedContent.endsWith('</p>')) {
          formattedContent = formattedContent.slice(0, -4);
        }
        formattedContent += `<div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #E0E0E0; font-size: 0.9rem; color: #757575; font-style: italic;">${line.substring(1)}</div>`;
      }
    }

    // Close any open tags
    if (inList) {
      formattedContent += '</ul>';
    }
    if (formattedContent && !formattedContent.endsWith('</p>') && !formattedContent.endsWith('</div>')) {
      formattedContent += '</p>';
    }

    return formattedContent;
  };

  // Theme colors from color palette
  const theme = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
    primaryLight: '#E3F2FD',
    secondary: '#00796B',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#9C27B0',
    textPrimary: '#212121',
    textSecondary: '#757575',
    background: '#FFFFFF',
    backgroundAlt: '#FAFAFA',
    backgroundSoft: '#F5F5F5',
    borderLight: '#E0E0E0',
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
              style={{
                border: `4px solid ${theme.primaryLight}`,
                borderTop: `4px solid ${theme.primary}`
              }}
            ></div>
            <p style={{ color: theme.textSecondary, fontSize: '18px' }}>Loading article...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Newspaper size={48} style={{ color: theme.textSecondary }} />
            </div>
            <h3 style={{ color: theme.textPrimary, fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
              Article not found
            </h3>
            <p style={{ color: theme.textSecondary, marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              The article you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBackToArticles}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.primary,
                color: theme.background,
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = theme.primaryDark}
              onMouseOut={(e) => e.target.style.backgroundColor = theme.primary}
            >
              Back to Articles
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* SEO Meta Tags for AI Articles */}
      {article.article_type === 'ai' && (
        <>
          <title>{article.name || 'AI Generated Article'} | News MarketPlace</title>
          <meta name="description" content={article.background ? article.background.substring(0, 160) : 'AI generated article on News MarketPlace'} />
          {article.seo_keywords && <meta name="keywords" content={article.seo_keywords} />}
          {article.person_name && <meta name="author" content={article.person_name} />}
          {article.geo_location && <meta name="geo.region" content={article.geo_location} />}
          {article.company_name && <meta property="article:publisher" content={article.company_name} />}
          <meta property="og:title" content={article.name || 'AI Generated Article'} />
          <meta property="og:description" content={article.background ? article.background.substring(0, 160) : 'AI generated article'} />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={article.name || 'AI Generated Article'} />
          <meta name="twitter:description" content={article.background ? article.background.substring(0, 160) : 'AI generated article'} />
        </>
      )}

      {/* SEO Meta Tags for Manual Articles */}
      {article.article_type !== 'ai' && (
        <>
          <title>{article.title} | News MarketPlace</title>
          <meta name="description" content={article.sub_title || article.article_text?.substring(0, 160) || 'Article on News MarketPlace'} />
          {article.by_line && <meta name="author" content={article.by_line} />}
          <meta property="og:title" content={article.title} />
          <meta property="og:description" content={article.sub_title || article.article_text?.substring(0, 160) || 'Article'} />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={article.title} />
          <meta name="twitter:description" content={article.sub_title || article.article_text?.substring(0, 160) || 'Article'} />
        </>
      )}

      <UserHeader />

      {/* Navigation Bar */}
      <section style={{ padding: '16px 24px', backgroundColor: theme.background, borderBottom: `1px solid ${theme.borderLight}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={handleBackToArticles}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              color: theme.primary,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.primaryLight}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={16} />
            Back to Articles
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.background} 100%)`,
        padding: '48px 24px',
        borderBottom: `1px solid ${theme.borderLight}`
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: theme.success,
              color: theme.background,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              <Eye size={14} />
              {viewCount.toLocaleString()} views
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '800',
              color: theme.textPrimary,
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              {article.article_type === 'ai' ? (article.name || 'AI Generated Article') : article.title}
            </h1>

            {article.article_type !== 'ai' && article.sub_title && (
              <p style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                color: theme.textSecondary,
                maxWidth: '800px',
                margin: '0 auto 24px',
                lineHeight: '1.4'
              }}>
                {article.sub_title}
              </p>
            )}

            {/* SEO Keywords for AI articles */}
            {article.article_type === 'ai' && article.seo_keywords && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {article.seo_keywords.split(',').map((keyword, index) => (
                  <span key={`${keyword.trim()}-${index}`} style={{
                    padding: '4px 12px',
                    backgroundColor: theme.primaryLight,
                    color: theme.primary,
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleBookmark}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: isBookmarked ? theme.primary : theme.background,
                  color: isBookmarked ? theme.background : theme.primary,
                  border: `1px solid ${theme.primary}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>

              <button
                onClick={toggleLike}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: isLiked ? theme.error : theme.background,
                  color: isLiked ? theme.background : theme.error,
                  border: `1px solid ${theme.error}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                {isLiked ? 'Liked' : 'Like'}
              </button>

              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: theme.info,
                  color: theme.background,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#7B1FA2'}
                onMouseOut={(e) => e.target.style.backgroundColor = theme.info}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section style={{ padding: '48px 24px', backgroundColor: theme.background }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              backgroundColor: theme.background,
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: `1px solid ${theme.borderLight}`,
              overflow: 'hidden'
            }}
          >
            {/* Article Images */}
            <div style={{ padding: '32px' }}>
              {article.image1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  style={{ marginBottom: '32px' }}
                >
                  <img
                    src={`/api/uploads/article-submissions/${article.image1}`}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }}
                  />
                </motion.div>
              )}

              {/* Article Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '32px',
                  padding: '24px',
                  backgroundColor: theme.backgroundSoft,
                  borderRadius: '12px'
                }}
              >
                {article.article_type !== 'ai' && article.by_line && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: theme.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={20} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Author
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: 0 }}>
                        {article.by_line}
                      </p>
                    </div>
                  </div>
                )}

                {article.article_type === 'ai' && article.user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#E3F2FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={20} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Generated by
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: 0 }}>
                        {article.user.first_name} {article.user.last_name}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#E8F5E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Newspaper size={20} style={{ color: theme.success }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Publication
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: 0 }}>
                      {article.publication?.publication_name || 'Not Assigned'}
                    </p>
                  </div>
                </div>

                {article.article_type === 'ai' && article.story_type && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#F3E5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={20} style={{ color: '#9C27B0' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Story Type
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: 0, textTransform: 'capitalize' }}>
                        {article.story_type}
                      </p>
                    </div>
                  </div>
                )}

                {article.article_type !== 'ai' && article.tentative_publish_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF3E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={20} style={{ color: theme.warning }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Published
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: 0 }}>
                        {formatDate(article.tentative_publish_date)}
                      </p>
                    </div>
                  </div>
                )}

                {article.article_type === 'ai' && article.created_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF3E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={20} style={{ color: theme.warning }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Generated
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, margin: 0 }}>
                        {formatDate(article.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Article Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{ marginBottom: '32px' }}
              >
                {article.article_type === 'ai' ? (
                   <div
                     style={{
                       fontSize: '18px',
                       lineHeight: '1.8',
                       color: theme.textPrimary,
                       fontWeight: '400'
                     }}
                     dangerouslySetInnerHTML={{ __html: formatArticleContent(article.generated_content) }}
                   />
                 ) : (
                  <div style={{
                    fontSize: '18px',
                    lineHeight: '1.8',
                    color: theme.textPrimary,
                    whiteSpace: 'pre-wrap',
                    fontWeight: '400'
                  }}>
                    {article.article_text}
                  </div>
                )}
              </motion.div>

              {/* Secondary Image */}
              {article.image2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  style={{ marginBottom: '32px' }}
                >
                  <img
                    src={`/api/uploads/article-submissions/${article.image2}`}
                    alt={`${article.title} - secondary`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }}
                  />
                </motion.div>
              )}

              {/* Social Links */}
              {(article.website_link || article.instagram_link || article.facebook_link) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  style={{
                    borderTop: `1px solid ${theme.borderLight}`,
                    paddingTop: '32px'
                  }}
                >
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: theme.textPrimary,
                    marginBottom: '24px'
                  }}>
                    Connect & Follow
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {article.website_link && (
                      <a
                        href={article.website_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 20px',
                          backgroundColor: theme.primary,
                          color: theme.background,
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = theme.primaryDark;
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(25, 118, 210, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = theme.primary;
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
                        }}
                      >
                        <Globe size={18} />
                        Visit Website
                      </a>
                    )}
                    {article.instagram_link && (
                      <a
                        href={article.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 20px',
                          background: 'linear-gradient(135deg, #E4405F 0%, #9C27B0 100%)',
                          color: theme.background,
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(228, 64, 95, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(228, 64, 95, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(228, 64, 95, 0.3)';
                        }}
                      >
                        <Instagram size={18} />
                        Follow on Instagram
                      </a>
                    )}
                    {article.facebook_link && (
                      <a
                        href={article.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 20px',
                          backgroundColor: '#1877F2',
                          color: theme.background,
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#166FE5';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(24, 119, 242, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#1877F2';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.3)';
                        }}
                      >
                        <Facebook size={18} />
                        Follow on Facebook
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default ArticleDetailPage;