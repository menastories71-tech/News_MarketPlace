import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';

// Theme colors matching the existing design
const theme = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
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
  borderDark: '#757575'
};

const PublicationsPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'rating'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [groups, setGroups] = useState([]);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetchPublications();
    fetchGroups();
  }, []);

  const fetchPublications = async () => {
    try {
      const params = new URLSearchParams({
        live_on_platform: 'true',
        limit: '100' // Fetch more for user browsing
      });

      if (searchTerm) params.append('publication_name', searchTerm);
      if (groupFilter) params.append('group_name', groupFilter);
      if (regionFilter) params.append('region', regionFilter);

      const response = await api.get(`/publications?${params}`);
      let pubs = response.data.publications || [];

      // Sort publications
      pubs = sortPublications(pubs);

      setPublications(pubs);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const sortPublications = (pubs) => {
    return pubs.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.publication_name.toLowerCase();
          bValue = b.publication_name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.publication_price) || 0;
          bValue = parseFloat(b.publication_price) || 0;
          break;
        case 'rating':
          // Using DA as a proxy for rating since there's no explicit rating field
          aValue = parseInt(a.da) || 0;
          bValue = parseInt(b.da) || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  useEffect(() => {
    if (publications.length > 0) {
      const sorted = sortPublications([...publications]);
      setPublications(sorted);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPublications();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, groupFilter, regionFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getUniqueRegions = () => {
    const regions = publications.map(pub => pub.publication_region).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const getUniqueGroupNames = () => {
    const groupNames = publications.map(pub => pub.group_name).filter(Boolean);
    return [...new Set(groupNames)].sort();
  };

  const PublicationCard = ({ publication }) => {
    const formatPrice = (price) => {
      const numPrice = parseFloat(price);
      return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Contact for pricing';
    };

    const getRatingStars = (da) => {
      const rating = Math.min(Math.max(Math.round((parseInt(da) || 0) / 20), 1), 5);
      return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (viewMode === 'grid') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="newspaper" size="lg" className="text-blue-400" />
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
              {publication.publication_grade || 'Standard'}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
              {publication.publication_name}
            </h3>

            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Icon name="building-office" size="sm" className="mr-1" />
              {publication.group_name || 'Independent'}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Icon name="map-pin" size="sm" className="mr-1" />
              {publication.publication_region}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-green-600">
                {formatPrice(publication.publication_price)}
              </div>
              <div className="flex items-center text-yellow-500 text-sm">
                {getRatingStars(publication.da)}
                <span className="ml-1 text-gray-600">({publication.da || 0})</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>DA: {publication.da || 0}</span>
              <span>DR: {publication.dr || 0}</span>
              <span>TAT: {publication.agreement_tat || 0}d</span>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              View Details
            </button>
          </div>
        </div>
      );
    }

    // List view
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="newspaper" size="md" className="text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {publication.publication_name}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Icon name="building-office" size="xs" className="mr-1" />
                    {publication.group_name || 'Independent'}
                  </div>
                  <div className="flex items-center">
                    <Icon name="map-pin" size="xs" className="mr-1" />
                    {publication.publication_region}
                  </div>
                  <div className="flex items-center">
                    <Icon name="globe-alt" size="xs" className="mr-1" />
                    {publication.publication_language}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span>Grade: {publication.publication_grade || 'Standard'}</span>
                  <span>DA: {publication.da || 0}</span>
                  <span>DR: {publication.dr || 0}</span>
                  <span>Words: {publication.words_limit || 'N/A'}</span>
                  <span>Images: {publication.number_of_images || 0}</span>
                  <span>TAT: {publication.agreement_tat || 0} days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col md:items-end space-y-2">
            <div className="text-xl font-bold text-green-600">
              {formatPrice(publication.publication_price)}
            </div>
            <div className="flex items-center text-yellow-500">
              {getRatingStars(publication.da)}
              <span className="ml-1 text-gray-600 text-sm">({publication.da || 0})</span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="arrow-path" size="lg" className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading publications...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Publications
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover premium news publications and find the perfect platform for your content
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Icon name="magnifying-glass" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search publications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon name="squares-2x2" size="sm" className="inline mr-2" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon name="bars-3" size="sm" className="inline mr-2" />
                List
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Groups</option>
                {getUniqueGroupNames().map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Regions</option>
                {getUniqueRegions().map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <Icon name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size="sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {publications.length} publication{publications.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Publications Grid/List */}
        {publications.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {publications.map(publication => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icon name="newspaper" size="lg" className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      <UserFooter />
    </div>
  );
};

export default PublicationsPage;