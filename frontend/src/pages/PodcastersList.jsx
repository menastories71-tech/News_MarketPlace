import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Mic, Users, MapPin, Globe, Instagram, Youtube, ExternalLink, Plus, Clock, CheckCircle } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import PodcasterSubmissionForm from '../components/user/PodcasterSubmissionForm';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PodcastersList = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [podcasters, setPodcasters] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubmissionsLoading, setUserSubmissionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'my-submissions'

  useEffect(() => {
    fetchPodcasters();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-submissions') {
      fetchUserSubmissions();
    }
  }, [isAuthenticated, activeTab]);

  const fetchPodcasters = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50, // Get more for grid display
      };

      if (searchQuery) {
        params.podcast_name = searchQuery;
      }

      if (selectedCategory !== 'all') {
        if (selectedCategory === 'regions') {
          // For regions, we might need to handle differently, but for now use focus industry
          params.podcast_focus_industry = selectedCategory;
        } else {
          params.podcast_focus_industry = selectedCategory;
        }
      }

      const response = await api.get('/podcasters/approved', { params });
      setPodcasters(response.data.podcasters);
      setError(null);
    } catch (err) {
      console.error('Error fetching podcasters:', err);
      setError('Failed to load podcasters');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      setUserSubmissionsLoading(true);
      const response = await api.get('/podcasters/my');
      setUserSubmissions(response.data.podcasters);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
    } finally {
      setUserSubmissionsLoading(false);
    }
  };

  // Extract unique categories from podcasters
  const categories = React.useMemo(() => {
    const industries = [...new Set(podcasters.map(p => p.podcast_focus_industry).filter(Boolean))];
    const regions = [...new Set(podcasters.map(p => p.podcast_region).filter(Boolean))];

    const cats = [
      { id: 'all', name: 'All Podcasters', count: podcasters.length },
    ];

    industries.forEach(industry => {
      const count = podcasters.filter(p => p.podcast_focus_industry === industry).length;
      cats.push({ id: industry, name: industry, count });
    });

    return cats;
  }, [podcasters]);

  const filteredPodcasters = podcasters.filter(podcaster => {
    const matchesCategory = selectedCategory === 'all' ||
      podcaster.podcast_focus_industry === selectedCategory ||
      podcaster.podcast_region === selectedCategory;
    const matchesSearch = !searchQuery ||
      podcaster.podcast_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcaster.podcast_host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcaster.podcast_focus_industry?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Podcasters Directory
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light mb-8">
              Discover approved podcasters in our network. Connect with industry professionals and explore podcasting opportunities.
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
                  Submit Podcaster
                </motion.button>
              )}
              {!isAuthenticated && (
                <div className="text-center">
                  <p className="text-[#757575] mb-2">Want to submit your podcast?</p>
                  <Link
                    to="/login"
                    className="text-[#1976D2] hover:text-[#0D47A1] font-medium"
                  >
                    Login to submit
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
                Approved Podcasters
              </button>
              <button
                onClick={() => setActiveTab('my-submissions')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'my-submissions'
                    ? 'bg-white text-[#1976D2] shadow-sm'
                    : 'text-[#757575] hover:text-[#212121]'
                }`}
              >
                My Submissions
              </button>
            </div>
          )}

          {/* Search Bar - only show for approved tab or when not authenticated */}
          {(activeTab === 'approved' || !isAuthenticated) && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search podcasters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                />
              </div>
            </div>
          )}

          {/* Categories - only show for approved tab */}
          {(activeTab === 'approved' || !isAuthenticated) && (
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
          )}
        </div>
      </section>

      {/* Podcasters Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {/* Approved Podcasters Tab */}
          {(activeTab === 'approved' || !isAuthenticated) && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2]"></div>
                  <p className="mt-4 text-[#757575]">Loading podcasters...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-[#757575] text-lg">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPodcasters.map((podcaster) => (
                    <Link key={podcaster.id} to={`/podcasters/${podcaster.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                      {/* Image */}
                      <div className="relative aspect-video bg-[#E0E0E0]">
                        {podcaster.image ? (
                          <img
                            src={`/api/uploads/podcasters/${podcaster.image}`}
                            alt={podcaster.podcast_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
                            <Mic className="w-16 h-16 text-[#757575]" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <div className="bg-[#4CAF50] text-white px-2 py-1 rounded text-xs font-medium">
                            Approved
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-[#212121] line-clamp-2 flex-1">
                            {podcaster.podcast_name}
                          </h3>
                        </div>
                        <p className="text-sm text-[#757575] mb-2">
                          By {podcaster.podcast_host || 'Unknown Host'}
                        </p>
                        {podcaster.podcast_focus_industry && (
                          <p className="text-sm text-[#1976D2] font-medium mb-2">
                            {podcaster.podcast_focus_industry}
                          </p>
                        )}
                        {podcaster.podcast_region && (
                          <div className="flex items-center gap-1 text-sm text-[#757575] mb-3">
                            <MapPin className="w-4 h-4" />
                            {podcaster.podcast_region}
                          </div>
                        )}

                        {/* Social Links */}
                        <div className="flex gap-2 mb-3">
                          {podcaster.podcast_website && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(podcaster.podcast_website, '_blank', 'noopener,noreferrer');
                              }}
                              className="p-2 bg-[#F5F5F5] rounded-lg hover:bg-[#E0E0E0] transition-colors"
                            >
                              <Globe className="w-4 h-4 text-[#1976D2]" />
                            </button>
                          )}
                          {podcaster.podcast_ig && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(podcaster.podcast_ig, '_blank', 'noopener,noreferrer');
                              }}
                              className="p-2 bg-[#F5F5F5] rounded-lg hover:bg-[#E0E0E0] transition-colors"
                            >
                              <Instagram className="w-4 h-4 text-[#1976D2]" />
                            </button>
                          )}
                          {podcaster.youtube_channel_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(podcaster.youtube_channel_url, '_blank', 'noopener,noreferrer');
                              }}
                              className="p-2 bg-[#F5F5F5] rounded-lg hover:bg-[#E0E0E0] transition-colors"
                            >
                              <Youtube className="w-4 h-4 text-[#1976D2]" />
                            </button>
                          )}
                        </div>

                        {podcaster.podcast_target_audience && (
                          <div className="flex items-center gap-1 text-sm text-[#757575]">
                            <Users className="w-4 h-4" />
                            Target: {podcaster.podcast_target_audience}
                          </div>
                        )}
                      </div>
                    </motion.div>
                   </Link>
                  ))}
                </div>
              )}

              {!loading && !error && filteredPodcasters.length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Mic className="w-16 h-16 text-[#BDBDBD] mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#212121] mb-2">No Approved Podcasters Yet</h3>
                  <p className="text-[#757575] text-lg mb-6">Be the first to submit your podcast and get featured!</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="bg-[#1976D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0D47A1] transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Submit Your Podcast
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* My Submissions Tab */}
          {isAuthenticated && activeTab === 'my-submissions' && (
            <>
              {userSubmissionsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2]"></div>
                  <p className="mt-4 text-[#757575]">Loading your submissions...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userSubmissions.map((podcaster) => (
                    <motion.div
                      key={podcaster.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden"
                    >
                    {/* Image */}
                    <div className="relative aspect-video bg-[#E0E0E0]">
                      {podcaster.image ? (
                        <img
                          src={`/api/uploads/podcasters/${podcaster.image}`}
                          alt={podcaster.podcast_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
                          <Mic className="w-16 h-16 text-[#757575]" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                          podcaster.status === 'approved' ? 'bg-[#4CAF50] text-white' :
                          podcaster.status === 'rejected' ? 'bg-[#F44336] text-white' :
                          'bg-[#FF9800] text-white'
                        }`}>
                          {podcaster.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                           podcaster.status === 'rejected' ? <ExternalLink className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {podcaster.status.charAt(0).toUpperCase() + podcaster.status.slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-[#212121] line-clamp-2 flex-1">
                          {podcaster.podcast_name}
                        </h3>
                      </div>
                      <p className="text-sm text-[#757575] mb-2">
                        By {podcaster.podcast_host || 'Unknown Host'}
                      </p>
                      {podcaster.podcast_focus_industry && (
                        <p className="text-sm text-[#1976D2] font-medium mb-2">
                          {podcaster.podcast_focus_industry}
                        </p>
                      )}

                      {/* Status and Date */}
                      <div className="flex items-center justify-between text-sm text-[#757575] mb-3">
                        <span>Submitted: {new Date(podcaster.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Rejection Reason */}
                      {podcaster.status === 'rejected' && podcaster.rejection_reason && (
                        <div className="bg-[#FFF3E0] border border-[#FF9800] rounded p-2 mb-3">
                          <p className="text-sm text-[#E65100] font-medium">Rejection Reason:</p>
                          <p className="text-sm text-[#BF360C]">{podcaster.rejection_reason}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      {podcaster.status === 'pending' && (
                        <button
                          onClick={() => setShowSubmissionForm(true)}
                          className="w-full bg-[#1976D2] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors text-sm"
                        >
                          Edit Submission
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
                    <Mic className="w-16 h-16 text-[#BDBDBD] mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#212121] mb-2">No Submissions Yet</h3>
                  <p className="text-[#757575] text-lg mb-6">Submit your first podcast to get started!</p>
                  <button
                    onClick={() => setShowSubmissionForm(true)}
                    className="bg-[#1976D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0D47A1] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Submit Your Podcast
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <UserFooter />

      {/* Podcaster Submission Form Modal */}
      {showSubmissionForm && (
        <PodcasterSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            setShowSubmissionForm(false);
            // Refresh data based on active tab
            if (activeTab === 'approved' || !isAuthenticated) {
              fetchPodcasters();
            }
            if (activeTab === 'my-submissions') {
              fetchUserSubmissions();
            }
          }}
        />
      )}
    </div>
  );
};

export default PodcastersList;