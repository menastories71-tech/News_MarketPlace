import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, User, ArrowRight, Clock, Eye, MessageCircle, TrendingUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationArray } from '../hooks/useTranslation';


const BlogListingPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatedCategories, setUpdatedCategories] = useState([
    { id: 'all', name: 'All Blogs', count: 0 },
    { id: 'news', name: 'News', count: 0 },
    { id: 'journalism', name: 'Journalism', count: 0 },
    { id: 'content-creation', name: 'Content Creation', count: 0 },
    { id: 'marketing', name: 'Marketing & PR', count: 0 }
  ]);

  const categories = [
    { id: 'all', name: 'All Blogs', count: 0 },
    { id: 'news', name: 'News', count: 0 },
    { id: 'journalism', name: 'Journalism', count: 0 },
    { id: 'content-creation', name: 'Content Creation', count: 0 },
    { id: 'marketing', name: 'Marketing & PR', count: 0 }
  ];

  // Update category counts based on fetched blogs
  const updateCategoryCounts = (blogs, categoryList) => {
    const counts = {
      all: blogs.length,
      news: blogs.filter(blog => blog.category?.toLowerCase().includes('news')).length,
      journalism: blogs.filter(blog => blog.category?.toLowerCase().includes('journalism')).length,
      'content-creation': blogs.filter(blog => blog.category?.toLowerCase().includes('content') || blog.category?.toLowerCase().includes('creation')).length,
      marketing: blogs.filter(blog => blog.category?.toLowerCase().includes('marketing') || blog.category?.toLowerCase().includes('pr')).length
    };
    return categoryList.map(cat => ({ ...cat, count: counts[cat.id] || 0 }));
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, searchQuery, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      setBlogs(data.blogs || []);
      setTotalPages(data.pagination?.pages || 1);

      // Update category counts based on all blogs
      const allBlogs = data.blogs || [];
      const updatedCats = updateCategoryCounts(allBlogs, categories);
      setUpdatedCategories(updatedCats);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    // Strip HTML tags for excerpt
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
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

  // Prepare blogs for translation (including excerpts)
  const blogsForTranslation = React.useMemo(() => {
    return blogs.map(blog => ({
      ...blog,
      excerpt: getExcerpt(blog.content)
    }));
  }, [blogs]);

  // Translate blogs
  const { translatedItems: translatedBlogs } = useTranslationArray(blogsForTranslation, ['title', 'category', 'excerpt']);


  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

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
              {t('blogs.pageTitle')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('blogs.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder={t('blogs.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {updatedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                  }`}
              >
                {t(`blogs.categories.${category.id}`, category.name)} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2]"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {translatedBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-[#1976D2]/40 transition-all duration-700 hover:-translate-y-3 relative cursor-pointer"
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1976D2]/5 via-transparent to-[#9C27B0]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                    {/* Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#E3F2FD] to-[#F3E5F5] flex items-center justify-center relative">
                          <div className="text-center z-20">
                            <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                              <User className="w-10 h-10 text-[#1976D2]" />
                            </div>
                            <span className="text-sm text-[#757575] font-medium">{t('articles.featured', 'Featured Article')}</span>
                          </div>
                          {/* Decorative elements */}
                          <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
                          <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm bg-opacity-90">
                          {blog.category || 'General'}
                        </span>
                      </div>

                      {/* Reading Time Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          5 min
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                        <Link
                          to={`/blog/${blog.id}`}
                          className="bg-white text-[#1976D2] px-6 py-3 rounded-full font-semibold hover:bg-[#1976D2] hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg"
                        >
                          {t('blogs.readArticle')}
                        </Link>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative z-20">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#212121] line-clamp-2 leading-tight mb-3 group-hover:text-[#1976D2] transition-colors duration-300">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                          {blog.excerpt}
                        </p>
                      </div>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-4 h-4 text-[#1976D2]" />
                            <span className="font-medium">{formatDate(blog.publishDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-[#FF9800]" />
                            <span className="font-medium">{Math.floor(Math.random() * 500) + 100}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-[#4CAF50]" />
                            <span className="font-medium">{Math.floor(Math.random() * 20) + 1}</span>
                          </div>
                        </div>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1976D2] to-[#9C27B0] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#212121]">News Marketplace</p>
                          <p className="text-xs text-gray-500">Content Team</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-medium text-green-600">{t('Popular', 'Popular')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {translatedBlogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#757575] text-lg">{t('blogs.noBlogsFound')}</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${currentPage === page
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
                      className="px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section >

      <UserFooter />
    </div >
  );
};

export default BlogListingPage;