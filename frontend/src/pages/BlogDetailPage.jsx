import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);

      // Fetch the specific blog
      const blogResponse = await fetch(`/api/blogs/${id}`);
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
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    // Strip HTML tags for excerpt
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2]"></div>
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
            <h1 className="text-2xl font-semibold text-[#212121] mb-4">Blog Not Found</h1>
            <p className="text-[#757575] mb-8">The blog you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565C0] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blogs
            </Link>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              Back to Articles
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
              {blog.category || 'News'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>
            {blog.title}
          </h1>

          {/* Author and Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1976D2' }}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>News Marketplace</div>
                <div className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>Publisher</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.publishDate)}
              </div>
              <div className="hidden sm:block text-gray-400">•</div>
              <div>{Math.ceil((blog.content?.replace(/<[^>]*>/g, '').length || 0) / 200)} min read</div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {blog.image && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="relative">
              <div className="aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={blog.image}
                  alt={blog.title}
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
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
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
                  <div className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>Published {formatDate(blog.publishDate)}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>
                <span>{Math.ceil((blog.content?.replace(/<[^>]*>/g, '').length || 0) / 200)} min read</span>
                <span className="hidden sm:block" style={{ color: '#BDBDBD' }}>•</span>
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>{blog.category || 'News'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#212121' }}>
                Related Articles
              </h2>
              <p className="max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif', color: '#757575' }}>
                More stories you might be interested in
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <motion.div
                  key={relatedBlog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300"
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
                        {relatedBlog.category || 'News'}
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
                      {getExcerpt(relatedBlog.content)}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-3" style={{ color: '#757575' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(relatedBlog.publishDate)}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${relatedBlog.id}`}
                      className="inline-flex items-center gap-2 font-medium text-sm transition-colors hover:opacity-80"
                      style={{
                        color: '#1976D2',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Read More
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
                View All Articles
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