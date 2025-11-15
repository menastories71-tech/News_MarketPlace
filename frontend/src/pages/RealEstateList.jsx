import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Home, MapPin, DollarSign, Bed, Bath, Square, Plus, Clock, CheckCircle, ImageIcon } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

  const filteredRealEstates = realEstates.filter(realEstate => {
    const matchesCategory = selectedCategory === 'all' || realEstate.location === selectedCategory;
    const matchesSearch = !searchQuery ||
      realEstate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      realEstate.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      realEstate.property_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = (!minPrice || realEstate.price >= parseInt(minPrice)) &&
                         (!maxPrice || realEstate.price <= parseInt(maxPrice));
    const matchesType = !propertyType || realEstate.property_type === propertyType;
    return matchesCategory && matchesSearch && matchesPrice && matchesType;
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

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          {/* Tabs for authenticated users */}
          {isAuthenticated && (
            <div className="flex gap-1 mb-6 bg-[#F5F5F5] p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-white text-[#1976D2] shadow-sm'
                    : 'text-[#757575] hover:text-[#212121]'
                }`}
              >
                Approved Listings
              </button>
              <button
                onClick={() => setActiveTab('my-submissions')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'my-submissions'
                    ? 'bg-white text-[#1976D2] shadow-sm'
                    : 'text-[#757575] hover:text-[#212121]'
                }`}
              >
                My Listings
              </button>
            </div>
          )}

          {/* Search and Filters - only show for approved tab or when not authenticated */}
          {(activeTab === 'approved' || !isAuthenticated) && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setPropertyType('');
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="w-full bg-[#F5F5F5] text-[#212121] px-4 py-2 rounded-lg hover:bg-[#E0E0E0] transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Location Categories */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
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
          )}
        </div>
      </section>

      {/* Real Estates Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {/* Approved Listings Tab */}
          {(activeTab === 'approved' || !isAuthenticated) && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2]"></div>
                  <p className="mt-4 text-[#757575]">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-[#757575] text-lg">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRealEstates.map((realEstate) => (
                    <Link key={realEstate.id} to={`/real-estates/${realEstate.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {/* Image */}
                        <div className="relative aspect-video bg-[#E0E0E0]">
                          {realEstate.images && realEstate.images.length > 0 ? (
                            <img
                              src={`/api/uploads/real-estates/${realEstate.images[0]}`}
                              alt={realEstate.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
                              <Home className="w-16 h-16 text-[#757575]" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <div className="bg-[#4CAF50] text-white px-2 py-1 rounded text-xs font-medium">
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

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-[#212121] line-clamp-2 flex-1">
                              {realEstate.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 text-xl font-bold text-[#1976D2] mb-2">
                            <DollarSign className="w-5 h-5" />
                            {formatPrice(realEstate.price)}
                          </div>

                          {realEstate.location && (
                            <div className="flex items-center gap-1 text-sm text-[#757575] mb-2">
                              <MapPin className="w-4 h-4" />
                              {realEstate.location}
                            </div>
                          )}

                          {realEstate.property_type && (
                            <p className="text-sm text-[#1976D2] font-medium mb-2">
                              {realEstate.property_type}
                            </p>
                          )}

                          {/* Property Details */}
                          <div className="flex items-center gap-4 text-sm text-[#757575] mb-3">
                            {realEstate.bedrooms && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                {realEstate.bedrooms} bed{realEstate.bedrooms !== 1 ? 's' : ''}
                              </div>
                            )}
                            {realEstate.bathrooms && (
                              <div className="flex items-center gap-1">
                                <Bath className="w-4 h-4" />
                                {realEstate.bathrooms} bath{realEstate.bathrooms !== 1 ? 's' : ''}
                              </div>
                            )}
                            {realEstate.area_sqft && (
                              <div className="flex items-center gap-1">
                                <Square className="w-4 h-4" />
                                {realEstate.area_sqft} sqft
                              </div>
                            )}
                          </div>

                          {/* Description Preview */}
                          {realEstate.description && (
                            <p className="text-sm text-[#757575] line-clamp-2">
                              {realEstate.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}

              {!loading && !error && filteredRealEstates.length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Home className="w-16 h-16 text-[#BDBDBD] mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#212121] mb-2">No Properties Found</h3>
                  <p className="text-[#757575] text-lg mb-6">Try adjusting your filters or be the first to list a property!</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="bg-[#1976D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0D47A1] transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your Property
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* My Listings Tab */}
          {isAuthenticated && activeTab === 'my-submissions' && (
            <>
              {userSubmissionsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2]"></div>
                  <p className="mt-4 text-[#757575]">Loading your listings...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userSubmissions.map((realEstate) => (
                    <motion.div
                      key={realEstate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-[#E0E0E0]">
                        {realEstate.images && realEstate.images.length > 0 ? (
                          <img
                            src={`/api/uploads/real-estates/${realEstate.images[0]}`}
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
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-[#212121] line-clamp-2 flex-1">
                            {realEstate.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 text-lg font-bold text-[#1976D2] mb-2">
                          <DollarSign className="w-4 h-4" />
                          {formatPrice(realEstate.price)}
                        </div>

                        {realEstate.location && (
                          <div className="flex items-center gap-1 text-sm text-[#757575] mb-2">
                            <MapPin className="w-4 h-4" />
                            {realEstate.location}
                          </div>
                        )}

                        {/* Status and Date */}
                        <div className="flex items-center justify-between text-sm text-[#757575] mb-3">
                          <span>Listed: {new Date(realEstate.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Rejection Reason */}
                        {realEstate.status === 'rejected' && realEstate.rejection_reason && (
                          <div className="bg-[#FFF3E0] border border-[#FF9800] rounded p-2 mb-3">
                            <p className="text-sm text-[#E65100] font-medium">Rejection Reason:</p>
                            <p className="text-sm text-[#BF360C]">{realEstate.rejection_reason}</p>
                          </div>
                        )}

                        {/* Action Button */}
                        {realEstate.status === 'pending' && (
                          <button
                            onClick={() => setShowSubmissionForm(true)}
                            className="w-full bg-[#1976D2] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors text-sm"
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
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Home className="w-16 h-16 text-[#BDBDBD] mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#212121] mb-2">No Listings Yet</h3>
                  <p className="text-[#757575] text-lg mb-6">Add your first property listing to get started!</p>
                  <button
                    onClick={() => setShowSubmissionForm(true)}
                    className="bg-[#1976D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0D47A1] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your Property
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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