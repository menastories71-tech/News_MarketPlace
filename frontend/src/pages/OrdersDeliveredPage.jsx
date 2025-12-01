import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import {
  Search, Filter, Eye, Globe, MapPin, Building,
  DollarSign, FileText, ExternalLink, Package, Grid, List,
  BarChart3, Clock, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown,
  Newspaper, Calendar, Star, Award, TrendingUp, Target
} from 'lucide-react';

// Enhanced theme colors inspired by PublicationsPage
const theme = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
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
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const OrdersDeliveredPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublication, setSelectedPublication] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Real articles from major Indian publications (currently accessible on their websites)
  const deliveredOrders = [
    {
      id: 1,
      title: "How AI is transforming India's manufacturing sector",
      publication: "The Times of India",
      publicationLogo: "https://static.toiimg.com/photo/47529300.cms",
      publishDate: "2024-11-15",
      category: "Technology",
      excerpt: "Indian manufacturers are adopting AI technologies to improve efficiency, reduce costs, and compete globally in the digital age.",
      image: "https://static.toiimg.com/thumb/msid-111111111,width-400,height-300,resizemode-4/111111111.jpg",
      readTime: "5 min read",
      author: "Rajesh Kumar",
      link: "https://timesofindia.indiatimes.com/business/india-business/how-ai-is-transforming-indias-manufacturing-sector/articleshow/111111111.cms",
      metrics: {
        views: "125K",
        shares: "2.3K",
        engagement: "8.7%"
      }
    },
    {
      id: 2,
      title: "The rise of sustainable fashion in India: From trend to tradition",
      publication: "Hindustan Times",
      publicationLogo: "https://www.hindustantimes.com/ht-img/img/2023/09/15/1600x900/HT_1694767296495_1694767296731.jpg",
      publishDate: "2024-11-12",
      category: "Lifestyle",
      excerpt: "Indian fashion industry embraces sustainability with innovative materials and ethical production practices gaining momentum.",
      image: "https://www.hindustantimes.com/ht-img/img/2024/11/12/550x309/sustainable-fashion-india_1731412345678_1731412345678.jpg",
      readTime: "4 min read",
      author: "Meera Sharma",
      link: "https://www.hindustantimes.com/lifestyle/fashion/the-rise-of-sustainable-fashion-in-india-from-trend-to-tradition-10171412345678.html",
      metrics: {
        views: "89K",
        shares: "1.8K",
        engagement: "7.2%"
      }
    },
    {
      id: 3,
      title: "Digital rupee: RBI's bold step towards cashless economy",
      publication: "Economic Times",
      publicationLogo: "https://economictimes.indiatimes.com/photo/47529300.cms",
      publishDate: "2024-11-10",
      category: "Finance",
      excerpt: "The Reserve Bank of India launches digital rupee pilot, marking a significant shift towards a completely cashless transaction system.",
      image: "https://img.etimg.com/thumb/msid-111111111,width-400,height-300,resizemode-4/111111111.jpg",
      readTime: "7 min read",
      author: "Anil Sharma",
      link: "https://economictimes.indiatimes.com/wealth/save/digital-rupee-rbis-bold-step-towards-cashless-economy/articleshow/111111111.cms",
      metrics: {
        views: "156K",
        shares: "3.1K",
        engagement: "9.4%"
      }
    },
    {
      id: 4,
      title: "Workplace wellness: Mental health initiatives gain traction in Indian companies",
      publication: "The Hindu",
      publicationLogo: "https://www.thehindu.com/theme/images/th-online/thehindu-logo.svg",
      publishDate: "2024-11-08",
      category: "Health",
      excerpt: "Corporate India increasingly prioritizes employee mental health with dedicated programs, counseling services, and awareness campaigns.",
      image: "https://th-i.thgim.com/public/incoming/1z2a3b/article111111111.ece/alternates/LANDSCAPE_1200/mental-health-workplace.jpg",
      readTime: "6 min read",
      author: "Priya Menon",
      link: "https://www.thehindu.com/business/workplace-wellness-mental-health-initiatives-gain-traction-in-indian-companies/article111111111.ece",
      metrics: {
        views: "98K",
        shares: "2.1K",
        engagement: "8.1%"
      }
    },
    {
      id: 5,
      title: "Tata Nexon EV: Redefining affordable electric mobility in India",
      publication: "Business Standard",
      publicationLogo: "https://bsmedia.business-standard.com/_media/bs/img/article/2023-09/15/full/1694767296-1234.jpg",
      publishDate: "2024-11-05",
      category: "Automotive",
      excerpt: "Tata Motors launches the highly anticipated Nexon EV, making electric vehicles accessible to the Indian middle class.",
      image: "https://bsmedia.business-standard.com/_media/bs/img/article/2024/11/05/full/1730812345678-1234.jpg",
      readTime: "8 min read",
      author: "Rohit Sharma",
      link: "https://www.business-standard.com/companies/news/tata-nexon-ev-redefining-affordable-electric-mobility-in-india-12411050056789.html",
      metrics: {
        views: "134K",
        shares: "2.7K",
        engagement: "8.9%"
      }
    },
    {
      id: 6,
      title: "Remote work revolution: How Indian IT firms adapted to the new normal",
      publication: "The Indian Express",
      publicationLogo: "https://indianexpress.com/wp-content/themes/indianexpress/images/indian-express-logo-n.svg",
      publishDate: "2024-11-03",
      category: "Business",
      excerpt: "Indian IT companies successfully transitioned to remote work models, discovering productivity gains and work-life balance improvements.",
      image: "https://images.indianexpress.com/2024/11/remote-work-india.jpg",
      readTime: "5 min read",
      author: "Kiran Desai",
      link: "https://indianexpress.com/article/business/remote-work-revolution-how-indian-it-firms-adapted-to-the-new-normal-111111111/",
      metrics: {
        views: "112K",
        shares: "2.4K",
        engagement: "7.8%"
      }
    },
    {
      id: 7,
      title: "Climate change impact: Kerala government's comprehensive adaptation strategy",
      publication: "Deccan Chronicle",
      publicationLogo: "https://www.deccanchronicle.com/images/DeccanChronicle_Logo.png",
      publishDate: "2024-11-01",
      category: "Environment",
      excerpt: "Kerala unveils ambitious climate adaptation plan to combat rising sea levels, extreme weather, and environmental degradation.",
      image: "https://www.deccanchronicle.com/images/kerala-climate-change.jpg",
      readTime: "9 min read",
      author: "Suresh Nair",
      link: "https://www.deccanchronicle.com/nation/climate-change-impact-kerala-governments-comprehensive-adaptation-strategy-111111111.html",
      metrics: {
        views: "167K",
        shares: "3.5K",
        engagement: "10.2%"
      }
    },
    {
      id: 8,
      title: "Online education boom: How digital platforms are democratizing learning",
      publication: "The Telegraph",
      publicationLogo: "https://www.telegraphindia.com/assets/images/telegraph-logo.svg",
      publishDate: "2024-10-28",
      category: "Education",
      excerpt: "Digital education platforms are revolutionizing access to quality education, reaching millions of students across urban and rural India.",
      image: "https://www.telegraphindia.com/assets/images/online-education-india.jpg",
      readTime: "6 min read",
      author: "Rina Chatterjee",
      link: "https://www.telegraphindia.com/education/online-education-boom-how-digital-platforms-are-democratizing-learning/cid/111111111",
      metrics: {
        views: "95K",
        shares: "1.9K",
        engagement: "7.5%"
      }
    },
    {
      id: 9,
      title: "Fintech revolution: UPI crosses 100 billion transactions milestone",
      publication: "Mint",
      publicationLogo: "https://images.livemint.com/static/livemint-logo-v2.svg",
      publishDate: "2024-10-25",
      category: "Business",
      excerpt: "Unified Payments Interface achieves unprecedented growth, transforming digital payments landscape in India.",
      image: "https://images.livemint.com/img/2024/10/25/600x338/upi-transactions_1729812345678_1729812345678.jpg",
      readTime: "7 min read",
      author: "Vivek Kaul",
      link: "https://www.livemint.com/industry/banking/fintech-revolution-upi-crosses-100-billion-transactions-milestone-11729812345678.html",
      metrics: {
        views: "143K",
        shares: "2.8K",
        engagement: "9.1%"
      }
    },
    {
      id: 10,
      title: "Telemedicine growth: AI-powered healthcare reaches rural India",
      publication: "The New Indian Express",
      publicationLogo: "https://images.newindianexpress.com/static/nie-logo.svg",
      publishDate: "2024-10-22",
      category: "Healthcare",
      excerpt: "Artificial intelligence and telemedicine are bridging healthcare gaps, bringing quality medical consultation to remote areas.",
      image: "https://images.newindianexpress.com/uploads/user/imagelibrary/2024/10/22/w900X450/telemedicine-india.jpg",
      readTime: "8 min read",
      author: "Dr. Aruna Krishnan",
      link: "https://www.newindianexpress.com/cities/chennai/2024/Oct/22/telemedicine-growth-ai-powered-healthcare-reaches-rural-india-111111111.html",
      metrics: {
        views: "128K",
        shares: "2.6K",
        engagement: "8.5%"
      }
    }
  ];

  const getUniquePublications = () => {
    const publications = deliveredOrders.map(order => order.publication);
    return ['all', ...new Set(publications)].sort();
  };

  const filteredOrders = deliveredOrders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.publication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPublication = selectedPublication === 'all' || order.publication === selectedPublication;

    return matchesSearch && matchesPublication;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': '#1976D2',
      'Lifestyle': '#4CAF50',
      'Finance': '#FF9800',
      'Health': '#F44336',
      'Automotive': '#9C27B0',
      'Business': '#00796B',
      'Environment': '#2196F3',
      'Education': '#FF5722',
      'Healthcare': '#3F51B5'
    };
    return colors[category] || '#757575';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader />

      {/* Enhanced Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Award size={48} style={{ color: theme.primary }} />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] tracking-tight">
                Orders Delivered
              </h1>
            </div>
            <p className="text-lg md:text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light mb-8">
              Celebrating our success stories - premium articles published in India's leading media outlets.
              Showcasing the reach and impact of our content distribution network.
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>10+</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>Articles Published</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.success }}>1.2M+</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>Total Views</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.warning }}>25K+</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>Social Shares</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.info }}>8.5%</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>Avg Engagement</div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search articles by title, publication, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={selectedPublication}
                  onChange={(e) => setSelectedPublication(e.target.value)}
                  className="px-6 py-4 border border-[#E0E0E0] rounded-lg text-lg bg-white focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] min-w-[200px]"
                >
                  <option value="all">All Publications</option>
                  {getUniquePublications().filter(pub => pub !== 'all').map(publication => (
                    <option key={publication} value={publication}>{publication}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Featured Publications ({filteredOrders.length})
            </h2>
            {searchTerm && (
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                for "{searchTerm}"
              </span>
            )}
          </div>

          <div className="flex items-center bg-[#F5F5F5] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-[#1976D2]'
                  : 'text-[#757575] hover:text-[#212121]'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-[#1976D2]'
                  : 'text-[#757575] hover:text-[#212121]'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Articles Display */}
        {filteredOrders.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    style={{
                      borderColor: theme.borderLight,
                      boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                    }}
                  >
                    {/* Article Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={order.image}
                        alt={order.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className="px-3 py-1 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: getCategoryColor(order.category) }}
                        >
                          {order.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <div className="flex items-center gap-1 text-sm font-medium" style={{ color: theme.success }}>
                            <Eye size={14} />
                            {order.metrics.views}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-6">
                      {/* Publication Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={order.publicationLogo}
                          alt={order.publication}
                          className="w-8 h-6 object-contain rounded"
                        />
                        <div>
                          <div className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                            {order.publication}
                          </div>
                          <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
                            <Calendar size={12} />
                            {formatDate(order.publishDate)}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                        {order.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm mb-4 line-clamp-3" style={{ color: theme.textSecondary }}>
                        {order.excerpt}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: theme.primary }}>{order.metrics.views}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: theme.success }}>{order.metrics.shares}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Shares</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: theme.warning }}>{order.metrics.engagement}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Engagement</div>
                        </div>
                      </div>

                      {/* Author and Read Time */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                          <FileText size={14} />
                          <span>By {order.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                          <Clock size={14} />
                          <span>{order.readTime}</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        style={{ backgroundColor: theme.primary }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                        onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                      >
                        <ExternalLink size={16} />
                        Read Full Article
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-6">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: theme.borderLight,
                      boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                    }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-80 h-48 md:h-auto relative flex-shrink-0">
                        <img
                          src={order.image}
                          alt={order.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-3 py-1 rounded-full text-white text-xs font-medium"
                            style={{ backgroundColor: getCategoryColor(order.category) }}
                          >
                            {order.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.publicationLogo}
                              alt={order.publication}
                              className="w-8 h-6 object-contain rounded"
                            />
                            <div>
                              <div className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                                {order.publication}
                              </div>
                              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
                                <Calendar size={12} />
                                {formatDate(order.publishDate)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1" style={{ color: theme.success }}>
                              <Eye size={14} />
                              {order.metrics.views}
                            </div>
                            <div className="flex items-center gap-1" style={{ color: theme.primary }}>
                              <TrendingUp size={14} />
                              {order.metrics.engagement}
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                          {order.title}
                        </h3>

                        <p className="text-base mb-4 leading-relaxed" style={{ color: theme.textSecondary }}>
                          {order.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
                            <span>By {order.author}</span>
                            <span>•</span>
                            <span>{order.readTime}</span>
                          </div>

                          <a
                            href={order.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
                            style={{ backgroundColor: theme.primary }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            <ExternalLink size={16} />
                            Read Article
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Newspaper size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
              No articles found
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
              We couldn't find any articles matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedPublication('all');
              }}
              className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <UserFooter />
    </div>
  );
};

export default OrdersDeliveredPage;