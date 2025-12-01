import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Home, MapPin, DollarSign, Bed, Bath, Square, Plus, Clock, CheckCircle, ImageIcon, Grid, List, ArrowUpDown, ArrowUp, ArrowDown, BarChart3, Eye } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Enhanced theme colors inspired by VideoTutorials
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

const RealEstateList = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [realEstates, setRealEstates] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubmissionsLoading, setUserSubmissionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'my-submissions'

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Additional filter states
  const [bedroomsRange, setBedroomsRange] = useState([0, 10]);
  const [bathroomsRange, setBathroomsRange] = useState([0, 10]);
  const [areaRange, setAreaRange] = useState([0, 10000]);

  // Form state for real estate submission
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: ''
  });
  const [formImages, setFormImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchRealEstates();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, propertyType]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-submissions') {
      fetchUserSubmissions();
    }
  }, [isAuthenticated, activeTab]);

  const fetchRealEstates = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50, // Get more for grid display
      };

      if (searchQuery) {
        params.title = searchQuery;
      }

      if (minPrice) {
        params.min_price = minPrice;
      }

      if (maxPrice) {
        params.max_price = maxPrice;
      }

      if (propertyType) {
        params.property_type = propertyType;
      }

      if (selectedCategory !== 'all') {
        params.location = selectedCategory;
      }

      const response = await api.get('/real-estates/', { params });
      setRealEstates(response.data.realEstates);
      setError(null);
    } catch (err) {
      console.error('Error fetching real estates:', err);
      setError('Failed to load real estate listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      setUserSubmissionsLoading(true);
      const response = await api.get('/real-estates/my');
      setUserSubmissions(response.data.realEstates);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
    } finally {
      setUserSubmissionsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Get reCAPTCHA token if user is authenticated (not admin) - temporarily disabled
      let recaptchaToken = '';
      // TODO: Re-enable reCAPTCHA when properly configured
      // if (window.grecaptcha && !localStorage.getItem('adminAccessToken')) {
      //   recaptchaToken = await window.grecaptcha.execute('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', { action: 'submit' });
      // }

      const submitData = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Add reCAPTCHA token
      if (recaptchaToken) {
        submitData.append('recaptchaToken', recaptchaToken);
      }

      // Add images
      formImages.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await api.post('/real-estates/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        property_type: '',
        bedrooms: '',
        bathrooms: '',
        area_sqft: ''
      });
      setFormImages([]);
      // Refresh user submissions
      fetchUserSubmissions();
      // Close modal after a delay
      setTimeout(() => {
        setShowSubmissionForm(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting real estate:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit property listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setSubmitError('Maximum 10 images allowed');
      return;
    }
    setFormImages(files);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      property_type: '',
      bedrooms: '',
      bathrooms: '',
      area_sqft: ''
    });
    setFormImages([]);
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowSubmissionForm(false);
  };

  // Extract unique categories from real estates
  const categories = React.useMemo(() => {
    const locations = [...new Set(realEstates.map(r => r.location).filter(Boolean))];
    const types = [...new Set(realEstates.map(r => r.property_type).filter(Boolean))];

    const cats = [
      { id: 'all', name: 'All Locations', count: realEstates.length },
    ];

    locations.forEach(location => {
      const count = realEstates.filter(r => r.location === location).length;
      cats.push({ id: location, name: location, count });
    });

    return cats;
  }, [realEstates]);

  const propertyTypes = React.useMemo(() => {
    return [...new Set(realEstates.map(r => r.property_type).filter(Boolean))];
  }, [realEstates]);

  // Sorting logic
  const sortedRealEstates = useMemo(() => {
    return [...realEstates].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'bedrooms' || sortField === 'bathrooms' || sortField === 'area_sqft') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [realEstates, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('');
    setSearchQuery('');
    setSelectedCategory('all');
    setBedroomsRange([0, 10]);
    setBathroomsRange([0, 10]);
    setAreaRange([0, 10000]);
  };

  const hasActiveFilters = () => {
    return minPrice || maxPrice || propertyType || searchQuery || selectedCategory !== 'all' ||
           bedroomsRange[0] > 0 || bedroomsRange[1] < 10 ||
           bathroomsRange[0] > 0 || bathroomsRange[1] < 10 ||
           areaRange[0] > 0 || areaRange[1] < 10000;
  };

  const filteredRealEstates = sortedRealEstates.filter(realEstate => {
    const matchesCategory = selectedCategory === 'all' || realEstate.location === selectedCategory;
    const matchesSearch = !searchQuery ||
      realEstate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      realEstate.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      realEstate.property_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = (!minPrice || realEstate.price >= parseInt(minPrice)) &&
                          (!maxPrice || realEstate.price <= parseInt(maxPrice));
    const matchesType = !propertyType || realEstate.property_type === propertyType;
    const matchesBedrooms = realEstate.bedrooms >= bedroomsRange[0] && realEstate.bedrooms <= bedroomsRange[1];
    const matchesBathrooms = realEstate.bathrooms >= bathroomsRange[0] && realEstate.bathrooms <= bathroomsRange[1];
    const matchesArea = realEstate.area_sqft >= areaRange[0] && realEstate.area_sqft <= areaRange[1];

    return matchesCategory && matchesSearch && matchesPrice && matchesType &&
           matchesBedrooms && matchesBathrooms && matchesArea;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
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
              Real Estate Directory
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light mb-8">
              Discover approved real estate listings in our network. Find your perfect property or list your own.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  onClick={() => setShowSubmissionForm(true)}
                  className="bg-[#1976D2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0D47A1] transition-colors shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Property
                </motion.button>
              )}
              {!isAuthenticated && (
                <div className="text-center">
                  <p className="text-[#757575] mb-2">Want to list your property?</p>
                  <Link
                    to="/login"
                    className="text-[#1976D2] hover:text-[#0D47A1] font-medium"
                  >
                    Login to add listing
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Enhanced Layout */}
      <div className={`${isMobile ? 'flex flex-col' : 'flex'}`}>
        {/* Enhanced Filters Sidebar */}
        <aside className={`${sidebarOpen ? (isMobile ? 'w-full' : 'w-80') : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden ${isMobile ? 'order-2' : ''}`} style={{
          minHeight: isMobile ? 'auto' : 'calc(100vh - 200px)',
          position: isMobile ? 'static' : 'sticky',
          top: isMobile ? 'auto' : '80px',
          zIndex: 10,
          borderRight: isMobile ? 'none' : `1px solid ${theme.borderLight}`,
          borderTop: isMobile ? `1px solid ${theme.borderLight}` : 'none',
          width: isMobile ? '100%' : '25%'
        }}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#212121] flex items-center gap-2">
                <Filter size={20} className="text-[#1976D2]" />
                Filters & Sort
              </h3>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-[#757575]"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Filters */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Home size={16} className="text-[#1976D2]" />
                  Basic Filters
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Property Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Types</option>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Location
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name} ({category.count})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-[#FFF3E0] rounded-lg p-4 border border-[#FF9800]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-[#FF9800]" />
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="Min price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#FF9800] bg-white text-[#212121]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Max price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#FF9800] bg-white text-[#212121]"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-[#E0F2F1] rounded-lg p-4 border border-[#00796B]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#00796B]" />
                  Property Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Bedrooms: {bedroomsRange[0]} - {bedroomsRange[1]}
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={bedroomsRange[0]}
                        onChange={(e) => setBedroomsRange([parseInt(e.target.value), bedroomsRange[1]])}
                        className="w-full accent-[#00796B]"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={bedroomsRange[1]}
                        onChange={(e) => setBedroomsRange([bedroomsRange[0], parseInt(e.target.value)])}
                        className="w-full accent-[#00796B] mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Bathrooms: {bathroomsRange[0]} - {bathroomsRange[1]}
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={bathroomsRange[0]}
                        onChange={(e) => setBathroomsRange([parseFloat(e.target.value), bathroomsRange[1]])}
                        className="w-full accent-[#00796B]"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={bathroomsRange[1]}
                        onChange={(e) => setBathroomsRange([bathroomsRange[0], parseFloat(e.target.value)])}
                        className="w-full accent-[#00796B] mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Area (sqft): {areaRange[0]} - {areaRange[1]}
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={areaRange[0]}
                        onChange={(e) => setAreaRange([parseInt(e.target.value), areaRange[1]])}
                        className="w-full accent-[#00796B]"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={areaRange[1]}
                        onChange={(e) => setAreaRange([areaRange[0], parseInt(e.target.value)])}
                        className="w-full accent-[#00796B] mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Enhanced */}
        <main className={`flex-1 p-6 min-w-0 ${isMobile ? 'order-1' : ''}`}>
          {/* Enhanced Controls Bar */}
          <div className="bg-white rounded-lg shadow-lg border p-6 mb-6" style={{
            borderColor: theme.borderLight,
            boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
          }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-[#F5F5F5] hover:bg-[#E0E0E0] transition-colors"
                    style={{ borderColor: theme.borderLight }}
                  >
                    <Filter size={16} />
                    <span className="text-[#212121]">Filters</span>
                  </button>
                )}

                {/* View Toggle */}
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

                {/* Tabs for authenticated users */}
                {isAuthenticated && (
                  <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('approved')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'approved'
                          ? 'bg-white text-[#1976D2] shadow-sm'
                          : 'text-[#757575] hover:text-[#212121]'
                      }`}
                    >
                      Approved Listings
                    </button>
                    <button
                      onClick={() => setActiveTab('my-submissions')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'my-submissions'
                          ? 'bg-white text-[#1976D2] shadow-sm'
                          : 'text-[#757575] hover:text-[#212121]'
                      }`}
                    >
                      My Listings
                    </button>
                  </div>
                )}

                <span className="text-sm font-medium text-[#212121]">
                  {filteredRealEstates.length} properties found
                  {searchQuery && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchQuery}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">Sort by:</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="location-asc">Location (A-Z)</option>
                  <option value="location-desc">Location (Z-A)</option>
                  <option value="property_type-asc">Type (A-Z)</option>
                  <option value="property_type-desc">Type (Z-A)</option>
                  <option value="bedrooms-desc">Bedrooms (High to Low)</option>
                  <option value="bedrooms-asc">Bedrooms (Low to High)</option>
                  <option value="bathrooms-desc">Bathrooms (High to Low)</option>
                  <option value="bathrooms-asc">Bathrooms (Low to High)</option>
                  <option value="area_sqft-desc">Area (High to Low)</option>
                  <option value="area_sqft-asc">Area (Low to High)</option>
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
                <input
                  type="text"
                  placeholder="Search properties by title, location, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Property Listings */}
          {(activeTab === 'approved' || !isAuthenticated) && (
            <>
              {loading ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <div
                    className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
                    style={{
                      borderBottom: `2px solid ${theme.primary}`,
                      borderRight: `2px solid transparent`
                    }}
                  ></div>
                  <p className="text-lg" style={{ color: theme.textSecondary }}>Loading properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <p className="text-lg" style={{ color: theme.textSecondary }}>{error}</p>
                </div>
              ) : (
                <>
                  {/* Enhanced Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredRealEstates.map((realEstate, index) => (
                        <motion.div
                          key={realEstate.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                          style={{
                            borderColor: theme.borderLight,
                            boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                          }}
                        >
                          <Link to={`/real-estates/${realEstate.id}`}>
                            {/* Enhanced Image Section */}
                            <div className="relative aspect-video bg-[#E0E0E0]">
                              {realEstate.images && realEstate.images.length > 0 ? (
                                <img
                                  src={realEstate.images[0]}
                                  alt={realEstate.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
                                  <Home className="w-16 h-16 text-[#757575]" />
                                </div>
                              )}
                              <div className="absolute top-3 right-3">
                                <div className="bg-[#4CAF50] text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Approved
                                </div>
                              </div>
                              {realEstate.images && realEstate.images.length > 1 && (
                                <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />
                                  {realEstate.images.length}
                                </div>
                              )}
                            </div>

                            {/* Enhanced Content */}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                                    {realEstate.title}
                                  </h3>
                                  <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                                    <MapPin size={14} className="mr-2" />
                                    <span>{realEstate.location || 'Location not specified'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Price and Type */}
                              <div className="grid grid-cols-2 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                                <div>
                                  <div className="text-lg font-bold" style={{ color: theme.primary }}>
                                    {formatPrice(realEstate.price)}
                                  </div>
                                  <div className="text-xs" style={{ color: theme.textSecondary }}>Price</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium" style={{ color: theme.success }}>
                                    {realEstate.property_type || 'Not specified'}
                                  </div>
                                  <div className="text-xs" style={{ color: theme.textSecondary }}>Type</div>
                                </div>
                              </div>

                              {/* Enhanced Property Details */}
                              <div className="grid grid-cols-3 gap-2 text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                                {realEstate.bedrooms && (
                                  <div>
                                    <div className="text-lg font-bold" style={{ color: theme.warning }}>
                                      {realEstate.bedrooms}
                                    </div>
                                    <div className="text-xs" style={{ color: theme.textSecondary }}>Beds</div>
                                  </div>
                                )}
                                {realEstate.bathrooms && (
                                  <div>
                                    <div className="text-lg font-bold" style={{ color: theme.info }}>
                                      {realEstate.bathrooms}
                                    </div>
                                    <div className="text-xs" style={{ color: theme.textSecondary }}>Baths</div>
                                  </div>
                                )}
                                {realEstate.area_sqft && (
                                  <div>
                                    <div className="text-lg font-bold" style={{ color: theme.secondary }}>
                                      {realEstate.area_sqft}
                                    </div>
                                    <div className="text-xs" style={{ color: theme.textSecondary }}>Sqft</div>
                                  </div>
                                )}
                              </div>

                              {/* Enhanced CTA Button */}
                              <button
                                className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                style={{ backgroundColor: theme.primary }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Enhanced List View - Table Format */}
                  {viewMode === 'list' && (
                    <div className="bg-white rounded-lg shadow-lg border overflow-hidden" style={{
                      borderColor: theme.borderLight,
                      boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                    }}>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr style={{ backgroundColor: theme.backgroundSoft, borderBottom: '2px solid #e2e8f0' }}>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('title')}
                              >
                                <div className="flex items-center gap-2">
                                  Property {getSortIcon('title')}
                                </div>
                              </th>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('location')}
                              >
                                <div className="flex items-center gap-2">
                                  Location {getSortIcon('location')}
                                </div>
                              </th>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('property_type')}
                              >
                                <div className="flex items-center gap-2">
                                  Type {getSortIcon('property_type')}
                                </div>
                              </th>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('price')}
                              >
                                <div className="flex items-center gap-2">
                                  Price {getSortIcon('price')}
                                </div>
                              </th>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('bedrooms')}
                              >
                                <div className="flex items-center gap-2">
                                  Beds {getSortIcon('bedrooms')}
                                </div>
                              </th>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('bathrooms')}
                              >
                                <div className="flex items-center gap-2">
                                  Baths {getSortIcon('bathrooms')}
                                </div>
                              </th>
                              <th
                                className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleSort('area_sqft')}
                              >
                                <div className="flex items-center gap-2">
                                  Area {getSortIcon('area_sqft')}
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRealEstates.map((realEstate, index) => (
                              <tr
                                key={realEstate.id}
                                className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                                style={{ borderColor: theme.borderLight }}
                                onClick={() => window.location.href = `/real-estates/${realEstate.id}`}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                                      style={{ backgroundColor: theme.primaryLight }}
                                    >
                                      <Home size={20} style={{ color: theme.primary }} />
                                    </div>
                                    <div>
                                      <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                        {realEstate.title}
                                      </div>
                                      <div className="text-sm" style={{ color: theme.textSecondary }}>
                                        Listed {new Date(realEstate.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                                    {realEstate.location || 'Not specified'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                                    {realEstate.property_type || 'Not specified'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-lg font-bold" style={{ color: theme.success }}>
                                    {formatPrice(realEstate.price)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                                    {realEstate.bedrooms || '—'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                                    {realEstate.bathrooms || '—'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                                    {realEstate.area_sqft ? `${realEstate.area_sqft} sqft` : '—'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                    style={{ backgroundColor: theme.primary }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `/real-estates/${realEstate.id}`;
                                    }}
                                  >
                                    <Eye size={14} className="inline mr-1" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {!loading && !error && filteredRealEstates.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ backgroundColor: theme.backgroundSoft }}
                      >
                        <Home size={48} style={{ color: theme.textDisabled }} />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                        No properties found
                      </h3>
                      <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                        We couldn't find any properties matching your search criteria.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          clearAllFilters();
                        }}
                        className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: theme.primary }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                        onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* My Listings Tab */}
          {isAuthenticated && activeTab === 'my-submissions' && (
            <>
              {userSubmissionsLoading ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <div
                    className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
                    style={{
                      borderBottom: `2px solid ${theme.primary}`,
                      borderRight: `2px solid transparent`
                    }}
                  ></div>
                  <p className="text-lg" style={{ color: theme.textSecondary }}>Loading your listings...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userSubmissions.map((realEstate, index) => (
                    <motion.div
                      key={realEstate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-lg border overflow-hidden"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-[#E0E0E0]">
                        {realEstate.images && realEstate.images.length > 0 ? (
                          <img
                            src={realEstate.images[0]}
                            alt={realEstate.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
                            <Home className="w-16 h-16 text-[#757575]" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                            realEstate.status === 'approved' ? 'bg-[#4CAF50] text-white' :
                            realEstate.status === 'rejected' ? 'bg-[#F44336] text-white' :
                            'bg-[#FF9800] text-white'
                          }`}>
                            {realEstate.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                             realEstate.status === 'rejected' ? <div className="w-3 h-3" /> :
                             <Clock className="w-3 h-3" />}
                            {realEstate.status.charAt(0).toUpperCase() + realEstate.status.slice(1)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: theme.textPrimary }}>
                              {realEstate.title}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <MapPin size={14} className="mr-2" />
                              <span>{realEstate.location || 'Location not specified'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xl font-bold mb-4" style={{ color: theme.primary }}>
                          <DollarSign className="w-5 h-5" />
                          {formatPrice(realEstate.price)}
                        </div>

                        {/* Status and Date */}
                        <div className="flex items-center justify-between text-sm mb-4" style={{ color: theme.textSecondary }}>
                          <span>Listed: {new Date(realEstate.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Rejection Reason */}
                        {realEstate.status === 'rejected' && realEstate.rejection_reason && (
                          <div className="bg-[#FFF3E0] border border-[#FF9800] rounded p-3 mb-4">
                            <p className="text-sm font-medium" style={{ color: theme.danger }}>Rejection Reason:</p>
                            <p className="text-sm" style={{ color: theme.danger }}>{realEstate.rejection_reason}</p>
                          </div>
                        )}

                        {/* Action Button */}
                        {realEstate.status === 'pending' && (
                          <button
                            onClick={() => setShowSubmissionForm(true)}
                            className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            style={{ backgroundColor: theme.primary }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            Edit Listing
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!userSubmissionsLoading && userSubmissions.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: theme.backgroundSoft }}
                  >
                    <Home size={48} style={{ color: theme.textDisabled }} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    No listings yet
                  </h3>
                  <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                    Add your first property listing to get started.
                  </p>
                  <button
                    onClick={() => setShowSubmissionForm(true)}
                    className="text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  >
                    <Plus className="w-5 h-5" />
                    Add Your Property
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <UserFooter />

      {/* Real Estate Submission Form Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#212121]">Add Property Listing</h2>
                <button
                  onClick={resetForm}
                  className="text-[#757575] hover:text-[#212121] text-2xl"
                >
                  ×
                </button>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-4 bg-[#E8F5E8] border border-[#4CAF50] rounded-lg">
                  <p className="text-[#2E7D32] font-medium">Property listing submitted successfully! It will be reviewed by our team.</p>
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-4 bg-[#FFEBEE] border border-[#F44336] rounded-lg">
                  <p className="text-[#C62828] font-medium">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="e.g., Beautiful 3BR Apartment in Downtown"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="Describe your property..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="e.g., 250000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="e.g., New York, NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Property Type
                    </label>
                    <select
                      value={formData.property_type}
                      onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                    >
                      <option value="">Select Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Villa">Villa</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="e.g., 3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="e.g., 2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Area (sqft)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.area_sqft}
                      onChange={(e) => setFormData({...formData, area_sqft: e.target.value})}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                      placeholder="e.g., 1200"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">
                    Property Images (Max 10 images)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1976D2] file:text-white hover:file:bg-[#0D47A1]"
                  />
                  {formImages.length > 0 && (
                    <p className="mt-2 text-sm text-[#757575]">
                      {formImages.length} image{formImages.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-[#F5F5F5] text-[#212121] px-4 py-2 rounded-lg font-medium hover:bg-[#E0E0E0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#1976D2] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateList;