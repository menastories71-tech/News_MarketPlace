import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, FileImage, Search, Filter, Calendar, User, CheckCircle2 } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';


import { useLanguage } from '../context/LanguageContext';

const DownloadCenter = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedItems, setDownloadedItems] = useState(new Set(['1', '3', '5']));

  const categories = [
    { id: 'all', name: t('downloadCenter.categories.all'), count: 10 },
    { id: 'questionnaires', name: t('downloadCenter.categories.questionnaires'), count: 2 },
    { id: 'templates', name: t('downloadCenter.categories.templates'), count: 5 },
    { id: 'guides', name: t('downloadCenter.categories.guides'), count: 2 },
    { id: 'documents', name: t('downloadCenter.categories.documents'), count: 1 }
  ];

  const resources = [
    {
      id: '1',
      title: 'PR Media Inquiry Questionnaire',
      description: 'Comprehensive questionnaire template for media inquiries and PR requests.',
      category: 'questionnaires',
      type: 'document',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      downloads: 1234,
      author: 'Sarah Johnson',
      dateAdded: '2024-01-15',
      downloadUrl: '/downloads/pr-media-inquiry-questionnaire.pdf',
      icon: FileText,
      color: '#1976D2'
    },
    {
      id: '2',
      title: 'News Article Template',
      description: 'Professional template for writing news articles with proper structure and formatting.',
      category: 'templates',
      type: 'document',
      fileType: 'DOCX',
      fileSize: '156 KB',
      downloads: 892,
      author: 'Michael Chen',
      dateAdded: '2024-01-10',
      downloadUrl: '/downloads/news-article-template.docx',
      icon: FileText,
      color: '#00796B'
    },
    {
      id: '3',
      title: 'Press Release Template',
      description: 'Ready-to-use press release template with best practices and formatting guidelines.',
      category: 'templates',
      type: 'document',
      fileType: 'DOCX',
      fileSize: '89 KB',
      downloads: 1567,
      author: 'Emily Rodriguez',
      dateAdded: '2024-01-08',
      downloadUrl: '/downloads/press-release-template.docx',
      icon: FileText,
      color: '#9C27B0'
    },
    {
      id: '4',
      title: 'Media Kit Template',
      description: 'Complete media kit template including company information, press releases, and images.',
      category: 'templates',
      type: 'document',
      fileType: 'ZIP',
      fileSize: '5.2 MB',
      downloads: 445,
      author: 'David Thompson',
      dateAdded: '2024-01-05',
      downloadUrl: '/downloads/media-kit-template.zip',
      icon: FileImage,
      color: '#FF9800'
    },
    {
      id: '5',
      title: 'PR Campaign Planning Guide',
      description: 'Step-by-step guide for planning and executing successful PR campaigns.',
      category: 'guides',
      type: 'document',
      fileType: 'PDF',
      fileSize: '3.1 MB',
      downloads: 678,
      author: 'Lisa Wang',
      dateAdded: '2024-01-12',
      downloadUrl: '/downloads/pr-campaign-planning-guide.pdf',
      icon: FileText,
      color: '#4CAF50'
    },
    {
      id: '6',
      title: 'Interview Questionnaire Template',
      description: 'Structured questionnaire for conducting journalist interviews.',
      category: 'questionnaires',
      type: 'document',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      downloads: 334,
      author: 'Robert Kim',
      dateAdded: '2024-01-03',
      downloadUrl: '/downloads/interview-questionnaire-template.pdf',
      icon: FileText,
      color: '#1976D2'
    },
    {
      id: '7',
      title: 'Content Calendar Template',
      description: 'Excel template for planning and scheduling content across multiple channels.',
      category: 'templates',
      type: 'spreadsheet',
      fileType: 'XLSX',
      fileSize: '45 KB',
      downloads: 789,
      author: 'Sarah Johnson',
      dateAdded: '2024-01-14',
      downloadUrl: '/downloads/content-calendar-template.xlsx',
      icon: FileSpreadsheet,
      color: '#00796B'
    },
    {
      id: '8',
      title: 'Media Contact Database Template',
      description: 'Organized template for managing media contacts and relationships.',
      category: 'templates',
      type: 'spreadsheet',
      fileType: 'XLSX',
      fileSize: '67 KB',
      downloads: 556,
      author: 'Michael Chen',
      dateAdded: '2024-01-11',
      downloadUrl: '/downloads/media-contact-database-template.xlsx',
      icon: FileSpreadsheet,
      color: '#9C27B0'
    },
    {
      id: '9',
      title: 'Crisis Communication Guide',
      description: 'Comprehensive guide for handling crisis communication and media relations.',
      category: 'guides',
      type: 'document',
      fileType: 'PDF',
      fileSize: '4.5 MB',
      downloads: 223,
      author: 'Emily Rodriguez',
      dateAdded: '2024-01-07',
      downloadUrl: '/downloads/crisis-communication-guide.pdf',
      icon: FileText,
      color: '#F44336'
    },
    {
      id: '10',
      title: 'Brand Guidelines Document',
      description: 'Template for creating comprehensive brand guidelines and style guides.',
      category: 'documents',
      type: 'document',
      fileType: 'PDF',
      fileSize: '2.9 MB',
      downloads: 445,
      author: 'David Thompson',
      dateAdded: '2024-01-09',
      downloadUrl: '/downloads/brand-guidelines-document.pdf',
      icon: FileText,
      color: '#FF9800'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    // Mark as downloaded
    setDownloadedItems(new Set([...downloadedItems, resourceId]));

    // Use the download URL from the resource data
    const downloadUrl = resource.downloadUrl;

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Downloading resource ${resourceId}: ${resource.title}`);
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'PDF': return '#F44336';
      case 'DOCX': return '#1976D2';
      case 'XLSX': return '#4CAF50';
      case 'ZIP': return '#FF9800';
      default: return '#757575';
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF3E0] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              {t('downloadCenter.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('downloadCenter.hero.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder={t('downloadCenter.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-[#FF9800] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                  }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const IconComponent = resource.icon;
              const isDownloaded = downloadedItems.has(resource.id);

              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${resource.color}20`, color: resource.color }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {isDownloaded && (
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                    )}
                  </div>

                  <div className="mb-2">
                    <span
                      className="px-2 py-1 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: getFileTypeColor(resource.fileType) }}
                    >
                      {resource.fileType}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[#212121] mb-2">{resource.title}</h3>
                  <p className="text-[#757575] mb-4 line-clamp-2">{resource.description}</p>

                  <div className="flex items-center justify-between text-sm text-[#757575] mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {resource.downloads.toLocaleString()}
                    </span>
                    <span>{resource.fileSize}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#757575] mb-4 pt-4 border-t border-[#E0E0E0]">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {resource.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(resource.dateAdded).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownload(resource.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isDownloaded
                        ? 'bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB] border border-[#00796B]/20'
                        : 'bg-[#1976D2] text-white hover:bg-[#0D47A1] hover:shadow-lg'
                      }`}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        {t('downloadCenter.labels.downloaded')}
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {t('downloadCenter.labels.download')}
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">{t('downloadCenter.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Download Statistics */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#212121] mb-6">{t('downloadCenter.stats.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#1976D2] mb-2">
                {downloadedItems.size}
              </div>
              <div className="text-[#757575]">{t('downloadCenter.stats.total')}</div>
            </div>
            <div className="bg-[#E0F2F1] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#00796B] mb-2">
                {resources.filter(r => downloadedItems.has(r.id) && r.category === 'templates').length}
              </div>
              <div className="text-[#757575]">{t('downloadCenter.stats.templates')}</div>
            </div>
            <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {resources.filter(r => downloadedItems.has(r.id) && r.category === 'guides').length}
              </div>
              <div className="text-[#757575]">{t('downloadCenter.stats.guides')}</div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default DownloadCenter;

