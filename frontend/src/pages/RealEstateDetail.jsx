import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ArrowLeft, Home, MapPin, DollarSign, Bed, Bath, Square, ImageIcon,
  ExternalLink, Shield, CheckCircle, Clock, Heart, Share, Mail,
  Phone, MessageCircle, Calendar, Eye
} from 'lucide-react';

// Updated theme colors matching the color palette from PDF
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

const RealEstateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [realEstate, setRealEstate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchRealEstateDetails();
    }
  }, [id]);

  const fetchRealEstateDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/real-estates/approved/${id}`);
      setRealEstate(response.data.realEstate || response.data);
    } catch (error) {
      console.error('Error fetching real estate details:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        navigate('/real-estates');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    const shareData = {
      title: realEstate.title,
      text: `Check out this property: ${realEstate.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  const handleAddProperty = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    // Navigate to add property form or show modal
    navigate('/real-estates/add');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (realEstate.images && realEstate.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === realEstate.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (realEstate.images && realEstate.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? realEstate.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
              style={{
                borderBottom: `2px solid ${theme.primary}`,
                borderRight: `2px solid transparent`
              }}
            ></div>
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading property details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!realEstate) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: theme.backgroundSoft }}
            >
              <Home size={48} style={{ color: theme.textDisabled }} />
            </div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
              Property Not Found
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              The property you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/real-estates')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              Back to Properties
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-b" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: theme.textSecondary }}>
            <button
              onClick={() => navigate('/real-estates')}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <ArrowLeft size={16} />
              Back to Properties
            </button>
            <span>/</span>
            <span>Property Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Property Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Home size={32} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                      {realEstate.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{realEstate.location}</span>
                      </div>
                      {realEstate.property_type && (
                        <div className="flex items-center gap-2">
                          <Home size={16} />
                          <span>{realEstate.property_type}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Listed {formatDate(realEstate.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
                    {formatPrice(realEstate.price)}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    Property Price
                  </div>
                </div>

                {/* Image Gallery */}
                {realEstate.images && realEstate.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                      Property Images
                    </h3>
                    <div className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={`/api/uploads/real-estates/${realEstate.images[currentImageIndex]}`}
                          alt={`${realEstate.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {realEstate.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            ‹
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {realEstate.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {realEstate.images.length}
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Property Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {realEstate.bedrooms && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Bed size={20} style={{ color: theme.primary }} />
                        <div>
                          <div className="font-semibold">{realEstate.bedrooms}</div>
                          <div className="text-sm text-gray-600">Bedrooms</div>
                        </div>
                      </div>
                    )}
                    {realEstate.bathrooms && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Bath size={20} style={{ color: theme.primary }} />
                        <div>
                          <div className="font-semibold">{realEstate.bathrooms}</div>
                          <div className="text-sm text-gray-600">Bathrooms</div>
                        </div>
                      </div>
                    )}
                    {realEstate.area_sqft && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Square size={20} style={{ color: theme.primary }} />
                        <div>
                          <div className="font-semibold">{realEstate.area_sqft}</div>
                          <div className="text-sm text-gray-600">Sq Ft</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin size={20} style={{ color: theme.primary }} />
                      <div>
                        <div className="font-semibold">{realEstate.location}</div>
                        <div className="text-sm text-gray-600">Location</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    Description
                  </h3>
                  <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                    <p>{realEstate.description}</p>
                  </div>
                </div>

                {/* Contact/Inquire CTA */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Interested in this property?</h3>
                        <p className="text-gray-600">Contact us for more information or to schedule a viewing</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/contact-us')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Mail size={18} />
                        Contact Us
                      </button>
                      {isAuthenticated && (
                        <button
                          onClick={handleAddProperty}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Home size={18} />
                          Add Property
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Property Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Property Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Price:</span>
                    <span className="font-semibold" style={{ color: theme.primary }}>
                      {formatPrice(realEstate.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Type:</span>
                    <span>{realEstate.property_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Location:</span>
                    <span>{realEstate.location}</span>
                  </div>
                  {realEstate.bedrooms && (
                    <div className="flex justify-between">
                      <span style={{ color: theme.textSecondary }}>Bedrooms:</span>
                      <span>{realEstate.bedrooms}</span>
                    </div>
                  )}
                  {realEstate.bathrooms && (
                    <div className="flex justify-between">
                      <span style={{ color: theme.textSecondary }}>Bathrooms:</span>
                      <span>{realEstate.bathrooms}</span>
                    </div>
                  )}
                  {realEstate.area_sqft && (
                    <div className="flex justify-between">
                      <span style={{ color: theme.textSecondary }}>Area:</span>
                      <span>{realEstate.area_sqft} sq ft</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Status:</span>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: isSaved ? theme.danger : theme.borderLight,
                      backgroundColor: isSaved ? theme.danger + '20' : 'transparent',
                      color: isSaved ? theme.danger : theme.textSecondary
                    }}
                  >
                    <Heart size={16} style={{ color: isSaved ? theme.danger : theme.danger, fill: isSaved ? theme.danger : 'none' }} />
                    <span>{isSaved ? 'Saved' : 'Save Property'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: theme.borderLight,
                      color: theme.textSecondary
                    }}
                  >
                    <Share size={16} style={{ color: theme.primary }} />
                    <span>Share Property</span>
                  </button>
                </div>
              </div>

              {/* Contact CTA Sidebar */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Need More Info?</h4>
                  <p className="text-sm text-gray-600 mb-4">Get detailed information about this property</p>
                  <button
                    onClick={() => navigate('/contact-us')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
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

export default RealEstateDetail;