import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const BlogListingPage = () => {
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
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              Blog
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Stay updated with the latest insights, tips, and trends in journalism and media.
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
                placeholder="Search blogs..."
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {category.name} ({category.count})
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-[#1976D2]/30 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="aspect-video bg-[#E0E0E0] relative">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <span className="text-xs text-gray-500 font-medium">No Image</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                          {blog.category || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-[#212121] line-clamp-2 leading-tight mb-2 hover:text-[#1976D2] transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {getExcerpt(blog.content)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#1976D2]" />
                          <span className="font-medium">{formatDate(blog.publishDate)}</span>
                        </span>
                      </div>

                      <Link
                        to={`/blog/${blog.id}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {blogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#757575] text-lg">No blogs found matching your criteria.</p>
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
      </section>

      <UserFooter />
    </div>
  );
};

export default BlogListingPage;