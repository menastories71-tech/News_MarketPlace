import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationArray } from '../hooks/useTranslation';
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
  const { t, language } = useLanguage();
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

  // Real scraped articles from major Indian publications (currently live on their websites)
  const deliveredOrders = [
    {
      id: 1,
      title: "Black Friday boost: Online sales in India jump 27%; FMCG, beauty & personal care leads growth",
      publication: "The Times of India",
      publicationLogo: "https://static.toiimg.com/photo/47529300.cms",
      publishDate: "2024-12-01",
      category: "Business",
      excerpt: "India Business News: Black Friday sales in India surged 27% this year, driven by strong performance in healthy food, beauty, and home categories. The global shopping event",
      image: "https://static.toiimg.com/photo/92222747.cms",
      readTime: "4 min read",
      author: "TOI Correspondent",
      link: "https://timesofindia.indiatimes.com/business/india-business/black-friday-boost-online-sales-in-india-jump-27-fmcg-beauty-personal-care-leads-growth/articleshow/125691809.cms",
      metrics: {
        views: "95K",
        shares: "1.0K",
        engagement: "12.6%"
      }
    },
    {
      id: 2,
      title: "Silver price today: Silver hits new record high, crosses Rs 1.78 lakh; will it hit Rs 2 lakh mark soon?",
      publication: "The Times of India",
      publicationLogo: "https://static.toiimg.com/photo/47529300.cms",
      publishDate: "2024-12-01",
      category: "Business",
      excerpt: "India Business News: Silver futures surged to new highs on the MCX, driven by anticipated US Fed rate cuts, a weaker dollar, and strong industrial demand. Experts see a si",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&crop=center",
      readTime: "6 min read",
      author: "TOI Correspondent",
      link: "https://timesofindia.indiatimes.com/business/india-business/silver-price-today-silver-hits-new-record-high-crosses-rs-1-78-lakh-will-it-hit-rs-2-lakh-mark-soon/articleshow/125688688.cms",
      metrics: {
        views: "135K",
        shares: "2.7K",
        engagement: "12.3%"
      }
    },
    {
      id: 3,
      title: "Parliament winter session | Dec 1 highlights: Discussion on SIR not ruled out, says Rijiju; LS, RS adjourned",
      publication: "Hindustan Times",
      publicationLogo: "https://www.hindustantimes.com/ht-img/img/2023/09/15/1600x900/HT_1694767296495_1694767296731.jpg",
      publishDate: "2024-12-01",
      category: "News",
      excerpt: "Parliament winter session | Dec 1 highlights: Both Lok Sabha and Rajya Sabha resumed after being adjourned till 2 PM on Monday. In the lower house, the opposition continued its sloganeering over SIR. Lok Sabha was adjourned for the day later as ruckus continued. Rajya Sabha was adjourned too later.| India News",
      image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=250&fit=crop&crop=center",
      readTime: "7 min read",
      author: "HT Correspondent",
      link: "https://www.hindustantimes.com/india-news/parliament-winter-session-2025-live-updates-lok-sabha-rajya-sabha-government-opposition-agenda-december-1-news-101764554102646.html",
      metrics: {
        views: "137K",
        shares: "1.2K",
        engagement: "10.0%"
      }
    },
    {
      id: 4,
      title: "Cyclone Ditwah live updates: Storm weakens but rain continues in Tamil Nadu; 334 killed in Sri Lanka",
      publication: "Hindustan Times",
      publicationLogo: "https://www.hindustantimes.com/ht-img/img/2023/09/15/1600x900/HT_1694767296495_1694767296731.jpg",
      publishDate: "2024-12-01",
      category: "News",
      excerpt: "Cyclone Ditwah live updates: IMD has predicted heavy to very heavy rain at a few places over Tiruvallur, Ranipet, Kancheepuram, Chennai, Chengalpattu and Vellore districts on Monday.| India News",
      image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=250&fit=crop&crop=center",
      readTime: "5 min read",
      author: "HT Correspondent",
      link: "https://www.hindustantimes.com/india-news/cyclone-ditwah-tracker-live-updates-tamil-nadu-chennai-weather-rain-andhra-pradesh-sri-lanka-101764550865450.html",
      metrics: {
        views: "50K",
        shares: "4.3K",
        engagement: "7.1%"
      }
    },
    {
      id: 5,
      title: "India bonds skid to over two-month low on rupee slide, rate-cut doubts",
      publication: "Economic Times",
      publicationLogo: "https://img.etimg.com/photo/msid-111111111,quality-100/et-logo.jpg",
      publishDate: "2024-12-01",
      category: "Markets",
      excerpt: "Indian government bonds slipped on Monday, with the benchmark note closing at its lowest in more than two months, as robust economic growth data dimmed rate-cut hopes and as a tumbling rupee added to the pressure.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&crop=center",
      readTime: "8 min read",
      author: "Reuters",
      link: "https://economictimes.indiatimes.com/markets/bonds/india-bonds-skid-to-over-two-month-low-on-rupee-slide-rate-cut-doubts/articleshow/125694502.cms",
      metrics: {
        views: "111K",
        shares: "2.1K",
        engagement: "5.2%"
      }
    },
    {
      id: 6,
      title: "Stock Radar: 40% rally in 3 months! What should investors do with Shriram Finance stock?",
      publication: "Economic Times",
      publicationLogo: "https://img.etimg.com/photo/msid-111111111,quality-100/et-logo.jpg",
      publishDate: "2024-12-01",
      category: "Markets",
      excerpt: "Shriram Finance shares have surged over 40% in three months, reaching record highs and signaling further upward potential. Experts suggest buying for a target of Rs 930 within weeks, citing a strong monthly chart breakout and bullish pennant pattern. The stock's robust performance and trading above key moving averages indicate a strong uptrend, with dips presenting buying opportunities.",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop&crop=center",
      readTime: "8 min read",
      author: "ET Bureau",
      link: "https://economictimes.indiatimes.com/markets/stocks/news/stock-radar-40-rally-in-3-months-what-should-investors-do-with-shriram-finance-stock/articleshow/125646322.cms",
      metrics: {
        views: "66K",
        shares: "1.0K",
        engagement: "5.5%"
      }
    }
  ];

  // Dynamic translation for orders content
  const { translatedItems: translatedOrders, isTranslating } = useTranslationArray(
    deliveredOrders,
    ['title', 'excerpt'],
    true
  );

  // Use translated orders for display
  const displayOrders = translatedOrders.length > 0 ? translatedOrders : deliveredOrders;

  const getUniquePublications = () => {
    const publications = displayOrders.map(order => order.publication);
    return ['all', ...new Set(publications)].sort();
  };

  const filteredOrders = displayOrders.filter(order => {
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
                {t('ordersDelivered.hero.title')}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light mb-8">
              {t('ordersDelivered.hero.desc')}
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>6</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>{t('ordersDelivered.stats.articles')}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.success }}>594K</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>{t('ordersDelivered.stats.views')}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.warning }}>12.3K</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>{t('ordersDelivered.stats.shares')}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2" style={{ color: theme.info }}>8.8%</div>
                <div className="text-sm" style={{ color: theme.textSecondary }}>{t('ordersDelivered.stats.engagement')}</div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={t('ordersDelivered.search.placeholder')}
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
                  <option value="all">{t('ordersDelivered.filter.all')}</option>
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
              {t('ordersDelivered.list.title')} ({filteredOrders.length})
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
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                ? 'bg-white shadow-sm text-[#1976D2]'
                : 'text-[#757575] hover:text-[#212121]'
                }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                ? 'bg-white shadow-sm text-[#1976D2]'
                : 'text-[#757575] hover:text-[#212121]'
                }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Articles Display */}
        {isTranslating ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg border border-[#E0E0E0] overflow-hidden">
                <div className="h-48 bg-slate-100" />
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-slate-100 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-3 bg-slate-200 rounded" />
                      <div className="w-16 h-2 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-5 bg-slate-200 rounded" />
                    <div className="w-full h-5 bg-slate-200 rounded" />
                  </div>
                  <div className="h-20 bg-slate-50 rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="h-4 bg-slate-100 rounded" />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-4 w-16 bg-slate-100 rounded" />
                  </div>
                  <div className="h-10 w-full bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
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
                          <div className="text-xs" style={{ color: theme.textSecondary }}>{t('ordersDelivered.list.views')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: theme.success }}>{order.metrics.shares}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>{t('ordersDelivered.list.shares')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: theme.warning }}>{order.metrics.engagement}</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>{t('ordersDelivered.list.engagement')}</div>
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
                        {t('ordersDelivered.list.readMore')}
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
                            {t('ordersDelivered.list.readMore')}
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
              {t('ordersDelivered.noResults.title')}
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
              {t('ordersDelivered.noResults.desc')}
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
              {t('ordersDelivered.noResults.clear')}
            </button>
          </div>
        )}
      </div>

      <UserFooter />
    </div>
  );
};

export default OrdersDeliveredPage;