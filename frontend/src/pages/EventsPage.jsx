import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import EventRegistrationModal from '../components/user/EventRegistrationModal';
import ApplicationModal from '../components/user/ApplicationModal';
import CosmicButton from '../components/common/CosmicButton';
import api from '../services/api';
import {
  MapPin, Calendar, Tag, DollarSign, Search, Filter, ArrowRight,
  Globe, Users, Award, Music, Camera, Landmark, Info, X
} from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    month: '',
    event_type: '',
    is_free: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationRoleType, setApplicationRoleType] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      city: '',
      month: '',
      event_type: '',
      is_free: ''
    });
    setSearchQuery('');
  };

  const handleRegisterInterest = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleCloseModal = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
  };

  const handleApplyRole = (event, roleType) => {
    setSelectedEvent(event);
    setApplicationRoleType(roleType);
    setShowApplicationModal(true);
  };

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedEvent(null);
    setApplicationRoleType(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'Government Summit': return <Landmark size={14} />;
      case 'Power List': return <Award size={14} />;
      case 'Membership': return <Users size={14} />;
      case 'Leisure Events': return <Globe size={14} />;
      case 'Sports Events': return <Globe size={14} />;
      case 'Music Festival': return <Music size={14} />;
      case 'Art Festival': return <Camera size={14} />;
      default: return <Tag size={14} />;
    }
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'Government Summit': 'bg-blue-50 text-blue-600 border-blue-200',
      'Power List': 'bg-purple-50 text-purple-600 border-purple-200',
      'Membership': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'Leisure Events': 'bg-amber-50 text-amber-600 border-amber-200',
      'Sports Events': 'bg-rose-50 text-rose-600 border-rose-200',
      'Music Festival': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
      'Art Festival': 'bg-indigo-50 text-indigo-600 border-indigo-200'
    };
    return colors[eventType] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const eventTypes = [
    'Government Summit', 'Power List', 'Membership', 'Leisure Events',
    'Sports Events', 'Music Festival', 'Art Festival'
  ];

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <UserHeader />

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 md:pt-16 md:pb-20">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6 font-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-700 uppercase tracking-widest">Explore Opportunities</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 tracking-tight font-primary">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Event Marketplace</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light mb-12 font-secondary">
              Unlock sponsorships, guest appearances, and speaking opportunities at top business, lifestyle, and government events worldwide. Connect with the top 1% of professionals.
            </p>

            {/* Premium Search Bar */}
            <div className="max-w-3xl mx-auto relative group px-4">
              <div className="absolute inset-0 bg-blue-600/20 blur-xl group-focus-within:bg-blue-600/30 transition-all duration-300 opacity-0 group-hover:opacity-100 -z-10" />
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 p-2 overflow-hidden transition-all duration-300 hover:border-blue-400 group-focus-within:border-blue-500">
                <Search className="ml-4 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events, cities, or industry types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 text-lg outline-none"
                />
                <button
                  onClick={() => fetchEvents()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 hidden md:block shadow-lg shadow-blue-500/20 uppercase tracking-wide text-sm"
                >
                  Find Events
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-amber-600 mt-8 flex items-center justify-center space-x-2 bg-amber-50 rounded-full px-4 py-2 w-fit mx-auto border border-amber-100 shadow-sm font-primary">
              <Info size={16} />
              <span>Full event catalog launching soon. Currently displaying curated previews.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sticky Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72 space-y-6 flex-shrink-0"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-28">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 flex items-center space-x-3 text-lg font-primary">
                  <Filter size={20} className="text-blue-600" />
                  <span>Refine Feed</span>
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Location</label>
                  <input
                    type="text"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none mb-3 font-secondary"
                  />
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-secondary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Category</label>
                  <select
                    value={filters.event_type}
                    onChange={(e) => handleFilterChange('event_type', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-secondary appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Timing</label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-secondary appearance-none cursor-pointer"
                  >
                    <option value="">Any Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Investment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('is_free', filters.is_free === 'true' ? '' : 'true')}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border uppercase tracking-widest ${filters.is_free === 'true' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => handleFilterChange('is_free', filters.is_free === 'false' ? '' : 'false')}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border uppercase tracking-widest ${filters.is_free === 'false' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      Paid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Events Results Section */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-10 px-2">
              <p className="text-slate-500 text-sm font-medium font-secondary">
                Found <span className="text-slate-900 font-bold">{filteredEvents.length}</span> luxury curated events
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-[2.5rem] h-[500px] animate-pulse border border-slate-100 shadow-sm" />
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
                <AnimatePresence>
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                      className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-[0_20px_50px_rgba(8,112,184,0.12)] transition-all duration-700 flex flex-col h-full relative"
                    >
                      {/* Event Banner Placeholder / Image */}
                      <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 relative group-hover:h-32 transition-all duration-700 ease-in-out">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {getEventTypeIcon(event.event_type)}
                        </div>
                      </div>

                      <div className="p-8 pt-6 flex-1 flex flex-col relative z-10 -mt-8 bg-white rounded-t-[2.5rem]">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border text-[10px] font-black tracking-widest uppercase font-primary ${getEventTypeColor(event.event_type)}`}>
                            {getEventTypeIcon(event.event_type)}
                            <span>{event.event_type}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] font-primary uppercase shadow-sm ${event.is_free ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                            {event.is_free ? 'GUEST PASS' : 'EXCLUSIVE'}
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight font-primary">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 font-secondary opacity-80 group-hover:opacity-100 transition-opacity">
                            {event.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
                          <div className="flex items-center p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50/50 transition-colors border border-transparent group-hover:border-blue-100/50">
                            <MapPin className="text-blue-500 mr-3 shrink-0" size={18} />
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                              <p className="text-xs font-bold text-slate-700 truncate font-secondary">{event.city || 'TBA'}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50/50 transition-colors border border-transparent group-hover:border-indigo-100/50">
                            <Calendar className="text-indigo-500 mr-3 shrink-0" size={18} />
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                              <p className="text-xs font-bold text-slate-700 font-secondary">{formatDate(event.start_date)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                          {event.custom_form_fields && (
                            <button
                              onClick={() => handleRegisterInterest(event)}
                              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs tracking-[0.2em] uppercase hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-lg shadow-slate-900/10 group-hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-95 font-primary"
                            >
                              <span>Register Interest</span>
                              <ArrowRight size={14} />
                            </button>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {event.enable_sponsor && (
                              <button
                                onClick={() => handleApplyRole(event, 'sponsor')}
                                className="py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all font-primary active:scale-95"
                              >
                                Sponsor
                              </button>
                            )}
                            {event.enable_media_partner && (
                              <button
                                onClick={() => handleApplyRole(event, 'media_partner')}
                                className="py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all font-primary active:scale-95"
                              >
                                Media
                              </button>
                            )}
                            {event.enable_speaker && (
                              <button
                                onClick={() => handleApplyRole(event, 'speaker')}
                                className="py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all font-primary active:scale-95"
                              >
                                Speaker
                              </button>
                            )}
                            {event.enable_guest && (
                              <button
                                onClick={() => handleApplyRole(event, 'guest')}
                                className="py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all font-primary active:scale-95"
                              >
                                Guest
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-40 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm px-6"
              >
                <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-slate-100 shadow-inner">
                  <Search size={44} className="text-slate-300" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 font-primary">No exclusive events found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-12 font-secondary">We couldn't find any events matching your selected refinements. Try adjusting your search query or filters.</p>
                <button
                  onClick={clearFilters}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 font-primary hover:scale-105 active:scale-95"
                >
                  Reset Experience
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      <UserFooter />

      <AnimatePresence>
        {showRegistrationModal && (
          <EventRegistrationModal
            isOpen={showRegistrationModal}
            onClose={handleCloseModal}
            event={selectedEvent}
          />
        )}

        {showApplicationModal && (
          <ApplicationModal
            isOpen={showApplicationModal}
            onClose={handleCloseApplicationModal}
            event={selectedEvent}
            roleType={applicationRoleType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage;