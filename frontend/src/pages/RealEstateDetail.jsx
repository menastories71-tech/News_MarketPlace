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
  Phone, MessageCircle, Calendar, Eye, Star, BookOpen, Target,
  TrendingUp, Award, Zap, Users, Globe, FileText, BarChart3
} from 'lucide-react';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
// Removed ShareButtons import to implement manually

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
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Local Share State
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
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
        className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-3 
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
      title: `${realEstate.first_name} ${realEstate.last_name} - Real Estate Professional`,
      text: `Check out this professional: ${realEstate.first_name} ${realEstate.last_name}`,
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

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setIsOrdering(true);

    try {
      // Create contact data for API
      const contactData = {
        professionalId: realEstate.id,
        professionalName: `${realEstate.first_name} ${realEstate.last_name}`,
        profession: realEstate.real_estate_agent ? 'Real Estate Agent' : realEstate.real_estate_agency_owner ? 'Agency Owner' : 'Developer Employee',
        customerInfo: orderFormData,
        contactDate: new Date().toISOString()
      };

      // Submit contact to backend
      const response = await api.post('/real-estates/contact', contactData);

      if (response.data.success) {
        alert('Message sent successfully! The professional will contact you soon.');
        setShowOrderModal(false);
        setOrderFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error sending message. Please try again.';
      alert(errorMessage);
    } finally {
      setIsOrdering(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-64 bg-slate-200 rounded mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-8 space-y-10">
                <div className="flex items-start gap-8">
                  <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-white shadow" />
                  <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                      <div className="h-10 w-3/4 bg-slate-200 rounded" />
                      <div className="flex gap-4">
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-4 w-40 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-32 bg-blue-50 rounded-full" />
                      <div className="h-8 w-32 bg-teal-50 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t">
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-slate-50 rounded" />
                      <div className="h-4 w-1/2 bg-slate-50 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-slate-50 rounded" />
                      <div className="h-4 w-1/2 bg-slate-50 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border p-6 space-y-8">
                <div className="text-center space-y-3">
                  <div className="h-10 w-1/2 mx-auto bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 mx-auto bg-slate-100 rounded" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 bg-slate-100 rounded" />
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-12 w-full bg-slate-200 rounded-lg" />
              </div>
            </div>
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
              Professional Not Found
            </h1>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              The professional profile you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/real-estates')}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={16} />
              Back to Professionals
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <SEO
        title={`${realEstate.first_name} ${realEstate.last_name} - Real Estate Professional`}
        description={realEstate.description || `Connect with ${realEstate.first_name} ${realEstate.last_name}, a verified real estate professional.`}
        image={realEstate.image}
        type="profile"
      />
      <Schema
        type="real-estate"
        data={{
          title: `${realEstate.first_name} ${realEstate.last_name}`,
          description: realEstate.description,
          image: realEstate.image,
          datePosted: realEstate.created_at,
          price: 0, // Profile doesn't have a single price
          location: realEstate.current_residence_city || realEstate.location
        }}
      />
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
              Back to Professionals
            </button>
            <span>/</span>
            <span>Professional Profile</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Professional Profile Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
                    {realEstate.image ? (
                      <img
                        src={realEstate.image}
                        alt={`${realEstate.first_name} ${realEstate.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/logo.png';
                        }}
                      />
                    ) : (
                      <img
                        src="/logo.png"
                        alt="Profile"
                        className="w-12 h-12 object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                        {realEstate.first_name} {realEstate.last_name}
                      </h1>
                      {realEstate.verified_tick && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                          <CheckCircle size={12} />
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      {realEstate.real_estate_agent && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2" style={{ backgroundColor: theme.primaryLight, color: theme.primaryDark }}>
                          Real Estate Agent
                        </span>
                      )}
                      {realEstate.real_estate_agency_owner && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2" style={{ backgroundColor: theme.secondaryLight, color: theme.secondaryDark }}>
                          Agency Owner
                        </span>
                      )}
                      {realEstate.developer_employee && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2" style={{ backgroundColor: theme.info + '20', color: theme.info }}>
                          Developer Employee
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{realEstate.current_residence_city || realEstate.location}</span>
                      </div>
                      {realEstate.nationality && (
                        <div className="flex items-center gap-2">
                          <Globe size={16} />
                          <span>{realEstate.nationality}</span>
                        </div>
                      )}
                      {realEstate.no_of_followers && (
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{realEstate.no_of_followers.toLocaleString()} followers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {/* Description/About */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                    About This Professional
                  </h3>
                  <div className="prose max-w-none" style={{ color: theme.textSecondary }}>
                    <p>
                      {realEstate.description || 'A dedicated real estate professional committed to providing exceptional service and expertise in the property market.'}
                    </p>
                    {realEstate.gender && (
                      <p className="mt-4">
                        <strong>Gender:</strong> {realEstate.gender}
                      </p>
                    )}
                    {realEstate.languages && realEstate.languages.length > 0 && (
                      <p className="mt-4">
                        <strong>Languages:</strong> {realEstate.languages.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>Professional Details</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        {realEstate.real_estate_agent && (
                          <li className="flex items-center gap-2">
                            <Award size={14} />
                            <span>Real Estate Agent</span>
                          </li>
                        )}
                        {realEstate.real_estate_agency_owner && (
                          <li className="flex items-center gap-2">
                            <Target size={14} />
                            <span>Agency Owner</span>
                          </li>
                        )}
                        {realEstate.developer_employee && (
                          <li className="flex items-center gap-2">
                            <Zap size={14} />
                            <span>Developer Employee</span>
                          </li>
                        )}
                        {realEstate.no_of_followers && (
                          <li className="flex items-center gap-2">
                            <Users size={14} />
                            <span>{realEstate.no_of_followers.toLocaleString()} followers</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: theme.textPrimary }}>Background & Location</h4>
                      <ul className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                        {realEstate.current_residence_city && (
                          <li className="flex items-center gap-2">
                            <MapPin size={14} />
                            <span>Location: {realEstate.current_residence_city}</span>
                          </li>
                        )}
                        {realEstate.nationality && (
                          <li className="flex items-center gap-2">
                            <Globe size={14} />
                            <span>Nationality: {realEstate.nationality}</span>
                          </li>
                        )}
                        {realEstate.verified_tick && (
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} style={{ color: theme.success }} />
                            <span>Verified Professional</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Joined: {formatDate(realEstate.created_at)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Connect & Follow
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {realEstate.ig_url && (
                      <a
                        href={realEstate.ig_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                        style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E4405F' }}>
                          <span className="text-white font-bold text-sm">IG</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>Instagram</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>
                            {realEstate.no_of_followers ? `${realEstate.no_of_followers.toLocaleString()} followers` : 'Follow'}
                          </div>
                        </div>
                      </a>
                    )}
                    {realEstate.linkedin && (
                      <a
                        href={realEstate.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                        style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0077B5' }}>
                          <span className="text-white font-bold text-sm">LI</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>LinkedIn</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Connect</div>
                        </div>
                      </a>
                    )}
                    {realEstate.facebook && (
                      <a
                        href={realEstate.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                        style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1877F2' }}>
                          <span className="text-white font-bold text-sm">FB</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>Facebook</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Like & Follow</div>
                        </div>
                      </a>
                    )}
                    {realEstate.youtube && (
                      <a
                        href={realEstate.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                        style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF0000' }}>
                          <span className="text-white font-bold text-sm">YT</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>YouTube</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Subscribe</div>
                        </div>
                      </a>
                    )}
                    {realEstate.tiktok && (
                      <a
                        href={realEstate.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                        style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                          <span className="text-white font-bold text-sm">TT</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>TikTok</div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Follow</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>


                {/* Professional Specialties */}
                {realEstate.amenities && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Specialties & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {realEstate.amenities.split(',').map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: theme.primaryLight, color: theme.primaryDark }}
                        >
                          {specialty.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold mb-2" style={{ color: theme.primary }}>
                    Get In Touch
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    Connect with this professional
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Profession</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {realEstate.real_estate_agent ? 'Agent' : realEstate.real_estate_agency_owner ? 'Agency Owner' : 'Developer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Location</span>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      {realEstate.current_residence_city || realEstate.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>Status</span>
                    <span className="font-medium" style={{ color: theme.success }}>
                      {realEstate.verified_tick ? 'Verified' : 'Active'}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? 'Processing...' : (isAuthenticated ? 'Add to Cart' : 'Sign In to Connect')}
                </button>
              </div>

              {/* Professional Metrics */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Professional Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.primary }}>
                      {realEstate.no_of_followers ? Math.floor(realEstate.no_of_followers / 1000) + 'K' : 0}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>Followers</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: theme.success }}>
                      {realEstate.verified_tick ? '✓' : '○'}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>Verified</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                    <div className="text-lg font-bold mb-1" style={{ color: theme.info }}>
                      {realEstate.languages ? realEstate.languages.length : 0}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>Languages</div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Quick Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Award size={16} style={{ color: theme.info }} />
                    <span style={{ color: theme.textSecondary }}>
                      Role: {realEstate.real_estate_agent ? 'Real Estate Agent' : realEstate.real_estate_agency_owner ? 'Agency Owner' : 'Developer Employee'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: theme.success }} />
                    <span style={{ color: theme.textSecondary }}>
                      Joined: {formatDate(realEstate.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: theme.secondary }} />
                    <span style={{ color: theme.textSecondary }}>
                      Location: {realEstate.current_residence_city || realEstate.location}
                    </span>
                  </div>
                  {realEstate.languages && realEstate.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Target size={16} style={{ color: theme.warning }} />
                      <span style={{ color: theme.textSecondary }}>
                        Languages: {realEstate.languages.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Actions */}
      <section className="px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: isSaved ? theme.danger : theme.borderLight,
                backgroundColor: isSaved ? theme.danger + '20' : 'transparent',
                color: isSaved ? theme.danger : theme.textSecondary
              }}
            >
              <Heart size={16} style={{ color: isSaved ? theme.danger : theme.danger, fill: isSaved ? theme.danger : 'none' }} />
              <span style={{ color: isSaved ? theme.danger : theme.textSecondary }}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveShareId(activeShareId === 'pro' ? null : 'pro')}
                className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[#E0E0E0] text-slate-600 hover:bg-gray-50 transition-all font-medium"
              >
                <Icon name="share" size={16} />
                <span>{t('common.share', 'Share')}</span>
              </button>
              {renderShareMenu(window.location.href, `${realEstate.first_name} ${realEstate.last_name}`, 'pro')}
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

      {/* Inquiry Modal */}
      {showOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setShowOrderModal(false)}>
          <div style={{
            backgroundColor: theme.background,
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header - Fixed */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px 24px',
              borderBottom: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                Contact Professional
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundSoft}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Content - Scrollable */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                backgroundColor: theme.backgroundSoft,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  {realEstate.first_name} {realEstate.last_name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.textSecondary }}>Profession:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primary }}>
                    {realEstate.real_estate_agent ? 'Real Estate Agent' : realEstate.real_estate_agency_owner ? 'Agency Owner' : 'Developer Employee'}
                  </span>
                </div>
                {realEstate.no_of_followers && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ color: theme.textSecondary }}>Followers:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>
                      {realEstate.no_of_followers.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <form id="inquiry-form" onSubmit={handleOrderSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={orderFormData.fullName}
                      onChange={(e) => setOrderFormData({ ...orderFormData, fullName: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={orderFormData.email}
                      onChange={(e) => setOrderFormData({ ...orderFormData, email: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={orderFormData.phone}
                      onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '6px'
                    }}>
                      Additional Message
                    </label>
                    <textarea
                      value={orderFormData.message}
                      onChange={(e) => setOrderFormData({ ...orderFormData, message: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: theme.background,
                        resize: 'vertical'
                      }}
                      placeholder="Any specific questions or requirements..."
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer - Fixed */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px 24px 24px',
              borderTop: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.backgroundSoft,
                  color: theme.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={isOrdering}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="inquiry-form"
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={isOrdering}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {isOrdering ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateDetail;