import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ArrowRight, Clock } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Skeleton from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationObject, useTranslationArray } from '../hooks/useTranslation';
import { getIdFromSlug, createSlugPath } from '../utils/slugify';
import Icon from '../components/common/Icon';


// Custom styles for blog content
const blogContentStyles = `
  .blog-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
    font-size: 14px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .blog-content th,
  .blog-content td {
    border: 1px solid #e5e7eb;
    padding: 12px 16px;
    text-align: left;
  }

  .blog-content th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #374151;
  }

  .blog-content tr:nth-child(even) {
    background-color: #f9fafb;
  }

  .blog-content tr:hover {
    background-color: #f3f4f6;
  }

  .blog-content ul, .blog-content ol {
    padding-left: 20px;
    margin: 16px 0;
  }

  .blog-content li {
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .blog-content blockquote {
    border-left: 4px solid #1976D2;
    padding-left: 16px;
    margin: 20px 0;
    font-style: italic;
    color: #374151;
    background-color: #E3F2FD;
    padding: 16px;
    border-radius: 0 8px 8px 0;
  }

  .blog-content code {
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9em;
  }

  .blog-content pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 20px 0;
  }

  .blog-content pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }
`;

const BlogDetailPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderShareMenu = (url, title, id) => {
    const isOpen = activeShareId === id;
    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-3"
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

  // Translate main blog content - with null safety
  const { translatedObject: rawTranslatedBlog } = useTranslationObject(blog, ['title', 'content', 'category']);
  // Ensure translatedBlog is never null - fallback to original blog or empty object
  const translatedBlog = rawTranslatedBlog || blog || {};

  // Prepare related blogs for translation (including excerpts)
  const relatedBlogsForTranslation = React.useMemo(() => {
    return relatedBlogs.map(b => ({
      ...b,
      excerpt: getExcerpt(b.content)
    }));
  }, [relatedBlogs]);

  // Translate related blogs
  const { translatedItems: translatedRelatedBlogs } = useTranslationArray(relatedBlogsForTranslation, ['title', 'category', 'excerpt']);


  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);

      // Extract real ID if slug is passed
      const realId = getIdFromSlug(id);

      // Fetch the specific blog
      const blogResponse = await fetch(`/api/blogs/${realId}`);
      const blogData = await blogResponse.json();

      if (blogData.blog) {
        setBlog(blogData.blog);
        // Fetch related blogs (same category, excluding current blog)
        fetchRelatedBlogs(blogData.blog.category, blogData.blog.id);
      } else {
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category, currentBlogId) => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 4,
        ...(category && category !== 'all' && { category })
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      // Filter out the current blog and limit to 3
      const related = (data.blogs || [])
        .filter(b => b.id !== currentBlogId)
        .slice(0, 3);

      setRelatedBlogs(related);
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('blogs.dateNotAvailable', 'Date not available');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('blogs.invalidDate', 'Invalid Date');
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  function getExcerpt(content, maxLength = 150) {
    if (!content) return '';
    // Strip HTML tags for excerpt
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Navigation Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Category Badge Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-10 md:h-16 w-3/4 mb-6" />

          {/* Author info Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Image Skeleton */}
          <Skeleton className="aspect-[16/9] md:aspect-[21/9] w-full rounded-lg mb-12" />

          {/* Content Skeleton */}
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-6 w-10/12" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <style dangerouslySetInnerHTML={{ __html: blogContentStyles }} />
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#212121] mb-4">{t('blogs.notFound', 'Blog Not Found')}</h1>
            <p className="text-[#757575] mb-8">{t('blogs.notFoundDesc', "The blog you're looking for doesn't exist or has been removed.")}</p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565C0] transition-colors"
            >
              <ArrowLeft size={16} />
              {t('blogs.backToBlogs', 'Back to Blogs')}
            </Link>
          </div>
        </div>
        <UserFooter />
      </div>

    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={translatedBlog.title}
        description={getExcerpt(translatedBlog.content)}
        image={translatedBlog.image}
        url={window.location.href}
        type="article"
      />
      <Schema
        type="article"
        data={{
          headline: translatedBlog.title,
          description: getExcerpt(translatedBlog.content),
          image: translatedBlog.image,
          datePublished: translatedBlog.publishDate,
          author: "News Marketplace",
          url: window.location.href
        }}
      />
      <UserHeader />

      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm font-medium"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              <ArrowLeft size={16} />
              {t('blogs.backToArticles', 'Back to Articles')}
            </button>
          </div>

          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                border: '1px solid #BBDEFB'
              }}>
              {t(`blogs.categories.${translatedBlog.category}`, translatedBlog.category || 'News')}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>
            {translatedBlog.title}
          </h1>

          {/* Author and Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1976D2' }}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>News Marketplace</div>
                <div className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>{t('Publisher', 'Publisher')}</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(translatedBlog.publishDate)}
              </div>
              <div className="hidden sm:block text-gray-400">•</div>
              <div>{Math.ceil((translatedBlog.content?.replace(/<[^>]*>/g, '').length || 0) / 200)} {t('articles.minRead', 'min read')}</div>
            </div>
          </div>
        </div>

        {translatedBlog.image && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="relative">
              <div className="aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={translatedBlog.image}
                  alt={translatedBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Article Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-sm p-8 md:p-12 lg:p-16">
            <div
              className="blog-content leading-relaxed"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                lineHeight: '1.6',
                fontSize: '16px',
                color: '#212121'
              }}
              dangerouslySetInnerHTML={{ __html: translatedBlog.content }}
            />

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center relative">
              <button
                onClick={() => setActiveShareId(activeShareId === 'blog' ? null : 'blog')}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold shadow-sm"
              >
                <Icon name="share" size={18} />
                <span>{t('common.share', 'Share Article')}</span>
              </button>
              {renderShareMenu(window.location.href, translatedBlog.title, 'blog')}
            </div>
          </article>

          {/* Article Meta Footer */}
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1976D2' }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>News Marketplace</div>
                  <div className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>{t('Published', 'Published')} {formatDate(translatedBlog.publishDate)}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>
                <span>{Math.ceil((translatedBlog.content?.replace(/<[^>]*>/g, '').length || 0) / 200)} {t('articles.minRead', 'min read')}</span>
                <span className="hidden sm:block" style={{ color: '#BDBDBD' }}>•</span>
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>{translatedBlog.category || 'News'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {translatedRelatedBlogs.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>
                {t('blogs.relatedArticles')}
              </h2>
              <p className="max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>
                {t('blogs.moreStories')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {translatedRelatedBlogs.map((relatedBlog) => (
                <motion.div
                  key={relatedBlog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => navigate(`/blog/${createSlugPath(relatedBlog.title, relatedBlog.id)}`)}
                  className="group bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                    {relatedBlog.image ? (
                      <img
                        src={relatedBlog.image}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
                        <User className="w-12 h-12" style={{ color: '#BDBDBD' }} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{
                        backgroundColor: '#1976D2',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {t(`blogs.categories.${relatedBlog.category}`, relatedBlog.category || 'News')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm mb-3 line-clamp-3 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>
                      {relatedBlog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-3" style={{ color: '#757575' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(relatedBlog.publishDate)}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${createSlugPath(relatedBlog.title, relatedBlog.id)}`}
                      className="inline-flex items-center gap-2 font-medium text-sm transition-colors hover:opacity-80"
                      style={{
                        color: '#1976D2',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      {t('blogs.readArticle', 'Read More')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All Articles */}
            <div className="text-center mt-8">
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#1976D2',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {t('blogs.viewAllArticles')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <UserFooter />
    </div>
  );
};

export default BlogDetailPage;