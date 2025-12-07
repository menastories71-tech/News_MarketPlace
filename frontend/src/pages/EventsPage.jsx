import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
// import DisclaimerTicker from '../components/common/DisclaimerTicker';
import EventRegistrationModal from '../components/user/EventRegistrationModal';
import ApplicationModal from '../components/user/ApplicationModal';
import CosmicButton from '../components/common/CosmicButton';
import api from '../services/api';
import {
  MapPin, Calendar, Tag, DollarSign
} from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'Government Summit': 'bg-blue-100 text-blue-800',
      'Power List': 'bg-purple-100 text-purple-800',
      'Membership': 'bg-green-100 text-green-800',
      'Leisure Events': 'bg-yellow-100 text-yellow-800',
      'Sports Events': 'bg-red-100 text-red-800',
      'Music Festival': 'bg-pink-100 text-pink-800',
      'Art Festival': 'bg-indigo-100 text-indigo-800'
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#1976D2] border-t-transparent"></div>
            <p className="text-lg text-[#757575]">Loading events...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <UserHeader />

      {/* Disclaimer Ticker */}
      {/* <DisclaimerTicker /> */}

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
              Events
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Discover and register for upcoming events in the news and media industry.
            </p>
            <p className="text-sm md:text-base text-[#FF9800] max-w-2xl mx-auto leading-relaxed font-medium mt-4">
              The current page is for representation purpose only, the comprehensive list will be live soon
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">Country</label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                placeholder="Filter by country"
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Filter by city"
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
              >
                <option value="">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">Event Type</label>
              <select
                value={filters.event_type}
                onChange={(e) => handleFilterChange('event_type', e.target.value)}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
              >
                <option value="">All Types</option>
                <option value="Government Summit">Government Summit</option>
                <option value="Power List">Power List</option>
                <option value="Membership">Membership</option>
                <option value="Leisure Events">Leisure Events</option>
                <option value="Sports Events">Sports Events</option>
                <option value="Music Festival">Music Festival</option>
                <option value="Art Festival">Art Festival</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">Price</label>
              <select
                value={filters.is_free}
                onChange={(e) => handleFilterChange('is_free', e.target.value)}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
              >
                <option value="">All Events</option>
                <option value="true">Free</option>
                <option value="false">Paid</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow p-6"
                >
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                      <Tag size={12} className="mr-1" />
                      {event.event_type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${event.is_free ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      <DollarSign size={12} className="mr-1" />
                      {event.is_free ? 'Free' : 'Paid'}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-[#212121] line-clamp-2">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-sm text-[#757575] mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {(event.country || event.city) && (
                      <div className="flex items-center text-sm text-[#757575]">
                        <MapPin size={14} className="mr-2 text-[#1976D2]" />
                        <span>{[event.city, event.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}

                    {event.start_date && (
                      <div className="flex items-center text-sm text-[#757575]">
                        <Calendar size={14} className="mr-2 text-[#1976D2]" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {event.custom_form_fields && (
                      <CosmicButton
                        onClick={() => handleRegisterInterest(event)}
                        variant="small"
                        className="w-full"
                      >
                        Register Interest
                      </CosmicButton>
                    )}

                    {event.enable_sponsor && (
                      <CosmicButton
                        onClick={() => handleApplyRole(event, 'sponsor')}
                        variant="small"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Apply as Sponsor
                      </CosmicButton>
                    )}

                    {event.enable_media_partner && (
                      <CosmicButton
                        onClick={() => handleApplyRole(event, 'media_partner')}
                        variant="small"
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Apply as Media Partner
                      </CosmicButton>
                    )}

                    {event.enable_speaker && (
                      <CosmicButton
                        onClick={() => handleApplyRole(event, 'speaker')}
                        variant="small"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Apply as Speaker
                      </CosmicButton>
                    )}

                    {event.enable_guest && (
                      <CosmicButton
                        onClick={() => handleApplyRole(event, 'guest')}
                        variant="small"
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        Apply as Guest
                      </CosmicButton>
                    )}

                    {!event.custom_form_fields && !event.enable_sponsor && !event.enable_media_partner && !event.enable_speaker && !event.enable_guest && (
                      <div className="text-center text-sm text-[#757575] py-3">
                        Registration not available
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#F5F5F5]">
                <Calendar size={48} className="text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-[#212121]">
                No events found
              </h3>
              <p className="mb-6 max-w-md mx-auto text-[#757575]">
                We couldn't find any events matching your search criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      <UserFooter />

      {/* Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={handleCloseModal}
        event={selectedEvent}
      />

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={handleCloseApplicationModal}
        event={selectedEvent}
        roleType={applicationRoleType}
      />
    </div>
  );
};

export default EventsPage;