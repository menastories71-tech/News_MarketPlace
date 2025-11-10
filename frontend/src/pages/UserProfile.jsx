import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import PublicationSubmissionForm from '../components/user/PublicationSubmissionForm';

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

const UserProfile = () => {
  const { user, isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showPublicationDetails, setShowPublicationDetails] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's publications
      const publicationsResponse = await api.get('/publications', {
        params: { submitted_by: user.id }
      });

      // Fetch user's notifications
      const notificationsResponse = await api.get('/notifications');

      setPublications(publicationsResponse.data.publications || []);
      setNotifications(notificationsResponse.data.notifications || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkMultipleAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        await api.patch('/notifications/read-multiple', { notification_ids: unreadIds });
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleViewPublicationDetails = (publication) => {
    setSelectedPublication(publication);
    setShowPublicationDetails(true);
  };

  const handleSubmitPublicationSuccess = () => {
    setShowPublicationForm(false);
    fetchUserData(); // Refresh data
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return theme.success;
      case 'rejected': return theme.danger;
      case 'pending': return theme.warning;
      case 'draft': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'check-circle';
      case 'rejected': return 'x-circle';
      case 'pending': return 'clock';
      case 'draft': return 'document-text';
      default: return 'question-mark-circle';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="lock-closed" size="lg" className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
            <button
              onClick={handleShowAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="arrow-path" size="lg" className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
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
              My Profile
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Manage your publications and stay updated with notifications
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name="user" size="sm" className="inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('publications')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'publications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name="newspaper" size="sm" className="inline mr-2" />
                Publications ({publications.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name="bell" size="sm" className="inline mr-2" />
                Notifications ({notifications.filter(n => !n.is_read).length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <Icon name="exclamation-triangle" size="sm" className="text-red-400 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Icon name="user" size="lg" className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Member since {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {user.first_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {user.last_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Icon name="newspaper" size="md" className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{publications.length}</p>
                        <p className="text-sm text-gray-600">Total Publications</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Icon name="check-circle" size="md" className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {publications.filter(p => p.status === 'approved').length}
                        </p>
                        <p className="text-sm text-gray-600">Approved</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <Icon name="bell" size="md" className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {notifications.filter(n => !n.is_read).length}
                        </p>
                        <p className="text-sm text-gray-600">Unread Notifications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Publications</h2>
                  <button
                    onClick={() => setShowPublicationForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <Icon name="plus" size="sm" className="inline mr-2" />
                    Submit New Publication
                  </button>
                </div>

                {publications.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon name="newspaper" size="lg" className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No publications yet</h3>
                    <p className="text-gray-600 mb-4">Start by submitting your first publication.</p>
                    <button
                      onClick={() => setShowPublicationForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Submit Publication
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publications.map(publication => (
                      <div key={publication.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="newspaper" size="md" className="text-blue-400" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 mb-2">
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

                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>DA: {publication.da || 0}</span>
                                  <span>DR: {publication.dr || 0}</span>
                                  <span>Price: ${publication.publication_price || 0}</span>
                                  <span>Submitted: {formatDate(publication.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end space-y-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              publication.status === 'approved' ? 'bg-green-100 text-green-800' :
                              publication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              publication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <Icon name={getStatusIcon(publication.status)} size="xs" className="mr-1" />
                              {publication.status.charAt(0).toUpperCase() + publication.status.slice(1)}
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewPublicationDetails(publication)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Details
                              </button>
                              {publication.status === 'draft' && (
                                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status History */}
                        {publication.status_history && publication.status_history.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Status History</h4>
                            <div className="space-y-2">
                              {publication.status_history.slice(-3).reverse().map((entry, index) => (
                                <div key={index} className="flex items-center text-xs text-gray-600">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    entry.status === 'approved' ? 'bg-green-500' :
                                    entry.status === 'rejected' ? 'bg-red-500' :
                                    entry.status === 'pending' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                  }`}></div>
                                  <span className="capitalize">{entry.status}</span>
                                  <span className="mx-2">•</span>
                                  <span>{formatDate(entry.changed_at)}</span>
                                  {entry.rejection_reason && (
                                    <span className="ml-2 text-red-600">- {entry.rejection_reason}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleMarkMultipleAsRead}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Mark All as Read
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      Clear All
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon name="bell" size="lg" className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow duration-200 ${
                        !notification.is_read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Icon name={
                                notification.type === 'publication_approved' ? 'check-circle' :
                                notification.type === 'publication_rejected' ? 'x-circle' :
                                'information-circle'
                              } size="sm" className={`${
                                notification.type === 'publication_approved' ? 'text-green-500' :
                                notification.type === 'publication_rejected' ? 'text-red-500' :
                                'text-blue-500'
                              }`} />
                              <h3 className="font-medium text-gray-900">{notification.title}</h3>
                              {!notification.is_read && (
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publication Submission Form Modal */}
      {showPublicationForm && (
        <PublicationSubmissionForm
          onClose={() => setShowPublicationForm(false)}
          onSuccess={handleSubmitPublicationSuccess}
        />
      )}

      {/* Publication Details Modal */}
      {showPublicationDetails && selectedPublication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Publication Details</h2>
                <button
                  onClick={() => setShowPublicationDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="x" size="lg" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publication Name</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {selectedPublication.publication_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <a href={selectedPublication.publication_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {selectedPublication.publication_website}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {selectedPublication.group_name || 'Independent'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {selectedPublication.publication_region}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {selectedPublication.publication_language}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    ${selectedPublication.publication_price || 0}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPublication.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedPublication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedPublication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <Icon name={getStatusIcon(selectedPublication.status)} size="xs" className="mr-1" />
                    {selectedPublication.status.charAt(0).toUpperCase() + selectedPublication.status.slice(1)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submitted</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {formatDate(selectedPublication.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedPublication.da || 0}</div>
                  <div className="text-sm text-gray-600">Domain Authority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedPublication.dr || 0}</div>
                  <div className="text-sm text-gray-600">Domain Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedPublication.agreement_tat || 0}d</div>
                  <div className="text-sm text-gray-600">Agreement TAT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedPublication.words_limit || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Word Limit</div>
                </div>
              </div>

              {selectedPublication.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Reason</h4>
                  <p className="text-red-700">{selectedPublication.rejection_reason}</p>
                </div>
              )}

              {selectedPublication.admin_comments && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Admin Comments</h4>
                  <p className="text-blue-700">{selectedPublication.admin_comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <UserFooter />
    </div>
  );
};

export default UserProfile;