import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/common/Icon';
// Removed ShareButtons import to implement manually
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ExternalLink, Eye
} from 'lucide-react';
import Skeleton from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';


const PublishedWorksPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [publishedWorks, setPublishedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    articleYear: '',
    companyCountry: '',
    individualCountry: '',
    industry: ''
  });

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
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

  const uniqueYears = [...new Set(publishedWorks.map(w => w.article_year).filter(Boolean))].sort();
  const uniqueCompanyCountries = [...new Set(publishedWorks.map(w => w.company_country).filter(Boolean))].sort();
  const uniqueIndividualCountries = [...new Set(publishedWorks.map(w => w.individual_country).filter(Boolean))].sort();
  const uniqueIndustries = [...new Set(publishedWorks.map(w => w.industry).filter(Boolean))].sort();

  const filteredWorks = publishedWorks.filter(work => {
    const matchesSearch = searchTerm === '' || [
      work.publication_name,
      work.company_name,
      work.person_name,
      work.industry,
      work.company_country,
      work.individual_country
    ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = filters.articleYear === '' || work.article_year == filters.articleYear;
    const matchesCompanyCountry = filters.companyCountry === '' || work.company_country === filters.companyCountry;
    const matchesIndividualCountry = filters.individualCountry === '' || work.individual_country === filters.individualCountry;
    const matchesIndustry = filters.industry === '' || work.industry === filters.industry;
    return matchesSearch && matchesYear && matchesCompanyCountry && matchesIndividualCountry && matchesIndustry;
  });

  useEffect(() => {
    fetchPublishedWorks();
  }, []);

  const fetchPublishedWorks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/published-works');
      setPublishedWorks(response.data.publishedWorks || []);
    } catch (error) {
      console.error('Error fetching published works:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPublishedWorks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handlePublishedWorkClick = (publishedWork) => {
    navigate(`/published-works/${publishedWork.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#E3F2FD] to-white border-b">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 border rounded-lg space-y-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SEO
        title={t('publishedWorks.seo.title', 'Published Works | Global Journalism Database | News Marketplace')}
        description={t('publishedWorks.seo.desc', 'Explore our extensive database of published journalistic works from around the globe. Filter by year, industry, and country.')}
      />
      <Schema
        type="collection"
        data={{
          title: t('publishedWorks.title', 'Published Works Database'),
          description: t('publishedWorks.desc', 'A comprehensive collection of published articles and journalistic works verified by News Marketplace.'),
          items: filteredWorks.slice(0, 10).map(work => ({
            name: work.publication_name,
            description: `Published on ${formatDate(work.article_date)} in ${work.industry} industry.`,
            url: window.location.origin + `/published-works/${work.id}`
          }))
        }}
      />
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Disclaimer Ticker */}
      <section className="relative overflow-hidden bg-red-600 text-white py-3">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
          `}
        </style>
        <div className="whitespace-nowrap animate-marquee">
          <span className="inline-block px-4">
            Disclaimer: All information is provided as is. We do not guarantee the accuracy, completeness, or timeliness of the information. Users should verify information independently before making any decisions.
          </span>
          <span className="inline-block px-4">
            Disclaimer: All information is provided as is. We do not guarantee the accuracy, completeness, or timeliness of the information. Users should verify information independently before making any decisions.
          </span>
        </div>
      </section>

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
              {t('publishedWorks.title', 'Published Works')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light mb-8">
              {filteredWorks.length} {t('publishedWorks.articlesAvailable', 'Published Articles Available')}
            </p>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 relative">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r pr-3">{t('common.share', 'Share')}</span>
                <button
                  onClick={() => setActiveShareId(activeShareId === 'hero' ? null : 'hero')}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="share" size={18} />
                </button>
                {renderShareMenu(window.location.href, t('publishedWorks.title'), 'hero')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by publication, company, person, industry, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.articleYear}
              onChange={(e) => setFilters({ ...filters, articleYear: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.companyCountry}
              onChange={(e) => setFilters({ ...filters, companyCountry: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Company Countries</option>
              {uniqueCompanyCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={filters.individualCountry}
              onChange={(e) => setFilters({ ...filters, individualCountry: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Individual Countries</option>
              {uniqueIndividualCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Published Works Cards */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-sm font-semibold text-[#1976D2]">
                      SN: {work.sn}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-[#212121]">
                    {work.publication_name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Year: </span>
                        <span className="text-[#212121]">{work.article_year || 'N/A'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Date: </span>
                        <span className="text-[#212121]">{formatDate(work.article_date)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Company: </span>
                        <span className="text-[#212121]">{work.company_name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Person: </span>
                        <span className="text-[#212121]">{work.person_name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Industry: </span>
                        <span className="text-[#212121]">{work.industry}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Company Country: </span>
                        <span className="text-[#212121]">{work.company_country}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Individual Country: </span>
                        <span className="text-[#212121]">{work.individual_country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="font-medium text-[#757575]">Website: </span>
                      <a
                        href={work.publication_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {work.publication_website.length > 30 ? `${work.publication_website.substring(0, 30)}...` : work.publication_website}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-[#757575]">Article Link: </span>
                      <a
                        href={work.article_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {work.article_link.length > 30 ? `${work.article_link.substring(0, 30)}...` : work.article_link}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePublishedWorkClick(work)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                    >
                      <Eye size={14} />
                      {t('common.viewDetails', 'View Details')}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActiveShareId(activeShareId === work.id ? null : work.id)}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-slate-500"
                      >
                        <Icon name="share" size={16} />
                      </button>
                      {renderShareMenu(
                        `${window.location.origin}/published-works/${work.id}`,
                        work.publication_name,
                        work.id,
                        'right'
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#F5F5F5]">
                <ExternalLink size={48} className="text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-[#212121]">
                No published works found
              </h3>
              <p className="mb-6 max-w-md mx-auto text-[#757575]">
                We couldn't find any published works at the moment.
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

export default PublishedWorksPage;