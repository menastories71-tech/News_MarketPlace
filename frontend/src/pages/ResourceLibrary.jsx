import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Lightbulb, TrendingUp, Search, Filter, Tag, Calendar, User, Eye, Download } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const ResourceLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', count: 48 },
    { id: 'templates', name: 'Templates', count: 15 },
    { id: 'best-practices', name: 'Best Practices', count: 12 },
    { id: 'industry-insights', name: 'Industry Insights', count: 10 },
    { id: 'case-studies', name: 'Case Studies', count: 8 },
    { id: 'whitepapers', name: 'Whitepapers', count: 3 }
  ];

  const resourceTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'document', name: 'Documents' },
    { id: 'template', name: 'Templates' },
    { id: 'guide', name: 'Guides' },
    { id: 'report', name: 'Reports' }
  ];

  const resources = [
    {
      id: '1',
      title: 'Journalism Best Practices Guide',
      description: 'Comprehensive guide covering ethical standards, fact-checking, source verification, and professional journalism practices.',
      category: 'best-practices',
      type: 'guide',
      tags: ['Journalism', 'Ethics', 'Standards'],
      views: 2345,
      downloads: 1234,
      author: 'Sarah Johnson',
      dateAdded: '2024-01-15',
      featured: true,
      icon: BookOpen,
      color: '#1976D2'
    },
    {
      id: '2',
      title: 'Media Industry Trends 2024',
      description: 'In-depth analysis of current trends shaping the media industry, including digital transformation and audience engagement strategies.',
      category: 'industry-insights',
      type: 'report',
      tags: ['Trends', 'Industry', 'Analysis'],
      views: 1890,
      downloads: 892,
      author: 'Michael Chen',
      dateAdded: '2024-01-12',
      featured: true,
      icon: TrendingUp,
      color: '#00796B'
    },
    {
      id: '3',
      title: 'Content Marketing Template Library',
      description: 'Collection of professional templates for content marketing, including social media posts, blog articles, and email campaigns.',
      category: 'templates',
      type: 'template',
      tags: ['Marketing', 'Content', 'Templates'],
      views: 1567,
      downloads: 1234,
      author: 'Emily Rodriguez',
      dateAdded: '2024-01-10',
      featured: false,
      icon: FileText,
      color: '#9C27B0'
    },
    {
      id: '4',
      title: 'Successful PR Campaign Case Study',
      description: 'Detailed case study of a successful PR campaign, including strategy, execution, and measurable results.',
      category: 'case-studies',
      type: 'document',
      tags: ['PR', 'Case Study', 'Success'],
      views: 1123,
      downloads: 567,
      author: 'David Thompson',
      dateAdded: '2024-01-08',
      featured: true,
      icon: Lightbulb,
      color: '#FF9800'
    },
    {
      id: '5',
      title: 'Digital Media Strategy Whitepaper',
      description: 'Comprehensive whitepaper on developing and implementing effective digital media strategies for modern organizations.',
      category: 'whitepapers',
      type: 'document',
      tags: ['Digital Media', 'Strategy', 'Whitepaper'],
      views: 890,
      downloads: 445,
      author: 'Lisa Wang',
      dateAdded: '2024-01-05',
      featured: false,
      icon: FileText,
      color: '#4CAF50'
    },
    {
      id: '6',
      title: 'Fact-Checking Best Practices',
      description: 'Essential guidelines and techniques for accurate fact-checking in journalism and content creation.',
      category: 'best-practices',
      type: 'guide',
      tags: ['Fact-Checking', 'Accuracy', 'Verification'],
      views: 1456,
      downloads: 789,
      author: 'Robert Kim',
      dateAdded: '2024-01-03',
      featured: false,
      icon: BookOpen,
      color: '#1976D2'
    },
    {
      id: '7',
      title: 'Social Media Engagement Insights',
      description: 'Research-based insights on maximizing social media engagement and building authentic audience connections.',
      category: 'industry-insights',
      type: 'report',
      tags: ['Social Media', 'Engagement', 'Insights'],
      views: 1234,
      downloads: 678,
      author: 'Sarah Johnson',
      dateAdded: '2024-01-01',
      featured: false,
      icon: TrendingUp,
      color: '#00796B'
    },
    {
      id: '8',
      title: 'Press Release Template Collection',
      description: 'Professional press release templates for various industries and announcement types.',
      category: 'templates',
      type: 'template',
      tags: ['Press Release', 'Templates', 'PR'],
      views: 987,
      downloads: 556,
      author: 'Michael Chen',
      dateAdded: '2023-12-28',
      featured: false,
      icon: FileText,
      color: '#9C27B0'
    },
    {
      id: '9',
      title: 'Crisis Communication Best Practices',
      description: 'Proven strategies and best practices for effective crisis communication and reputation management.',
      category: 'best-practices',
      type: 'guide',
      tags: ['Crisis', 'Communication', 'Management'],
      views: 876,
      downloads: 445,
      author: 'Emily Rodriguez',
      dateAdded: '2023-12-25',
      featured: false,
      icon: BookOpen,
      color: '#F44336'
    },
    {
      id: '10',
      title: 'Media Relations Success Story',
      description: 'Case study detailing successful media relations campaign and relationship-building strategies.',
      category: 'case-studies',
      type: 'document',
      tags: ['Media Relations', 'Case Study', 'Success'],
      views: 765,
      downloads: 334,
      author: 'David Thompson',
      dateAdded: '2023-12-22',
      featured: false,
      icon: Lightbulb,
      color: '#FF9800'
    },
    {
      id: '11',
      title: 'Content Strategy Framework',
      description: 'Comprehensive framework for developing and executing effective content strategies across multiple channels.',
      category: 'best-practices',
      type: 'guide',
      tags: ['Content Strategy', 'Framework', 'Planning'],
      views: 654,
      downloads: 223,
      author: 'Lisa Wang',
      dateAdded: '2023-12-20',
      featured: false,
      icon: BookOpen,
      color: '#1976D2'
    },
    {
      id: '12',
      title: 'Future of Journalism Report',
      description: 'In-depth report on the future of journalism, including technological trends and industry evolution.',
      category: 'industry-insights',
      type: 'report',
      tags: ['Journalism', 'Future', 'Trends'],
      views: 543,
      downloads: 112,
      author: 'Robert Kim',
      dateAdded: '2023-12-18',
      featured: false,
      icon: TrendingUp,
      color: '#00796B'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesType && matchesSearch;
  });

  const featuredResources = filteredResources.filter(r => r.featured);
  const regularResources = filteredResources.filter(r => !r.featured);

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5F5] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Resource Library
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Comprehensive collection of documents, templates, best practices, and industry insights to support your work.
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
                placeholder="Search resources, tags, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#9C27B0] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === type.id
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#212121] mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => {
                const IconComponent = resource.icon;
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-lg shadow-md border-2 border-[#9C27B0] p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${resource.color}20`, color: resource.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="px-2 py-1 bg-[#9C27B0] text-white text-xs font-medium rounded">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#212121] mb-2">{resource.title}</h3>
                    <p className="text-[#757575] mb-4 line-clamp-2">{resource.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#F5F5F5] text-[#757575] text-xs rounded flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#757575] pt-4 border-t border-[#E0E0E0]">
                      <span className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {resource.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {resource.downloads.toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Resources */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#212121] mb-6">All Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularResources.map((resource) => {
              const IconComponent = resource.icon;
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
                  </div>
                  <h3 className="text-xl font-semibold text-[#212121] mb-2">{resource.title}</h3>
                  <p className="text-[#757575] mb-4 line-clamp-2">{resource.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#F5F5F5] text-[#757575] text-xs rounded flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#757575] mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {resource.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(resource.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#757575] pt-4 border-t border-[#E0E0E0]">
                    <span className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {resource.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {resource.downloads.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#212121] mb-6">Library Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#1976D2] mb-2">
                {resources.length}
              </div>
              <div className="text-[#757575]">Total Resources</div>
            </div>
            <div className="bg-[#E0F2F1] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#00796B] mb-2">
                {resources.filter(r => r.type === 'template').length}
              </div>
              <div className="text-[#757575]">Templates</div>
            </div>
            <div className="bg-[#F3E5F5] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#9C27B0] mb-2">
                {resources.filter(r => r.type === 'guide').length}
              </div>
              <div className="text-[#757575]">Guides</div>
            </div>
            <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {resources.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()}
              </div>
              <div className="text-[#757575]">Total Downloads</div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default ResourceLibrary;

