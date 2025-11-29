const User = require('../models/User');

// Store user cookie preferences
const storeCookiePreferences = async (req, res) => {
  try {
    const { userId, preferences, consentId, ipAddress, userAgent } = req.body;

    // Validate required fields
    if (!preferences || !consentId) {
      return res.status(400).json({
        error: true,
        message: 'Preferences and consentId are required'
      });
    }

    // Store cookie preferences in database
    // For now, we'll use a simple approach - in production you'd want proper user tracking
    const cookieData = {
      userId: userId || null,
      preferences: JSON.stringify(preferences),
      consentId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Here you would save to a cookie_preferences table
    // For now, we'll just return success
    console.log('Cookie preferences stored:', cookieData);

    res.json({
      success: true,
      message: 'Cookie preferences stored successfully',
      consentId
    });

  } catch (error) {
    console.error('Error storing cookie preferences:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to store cookie preferences'
    });
  }
};

// Get user cookie preferences
const getCookiePreferences = async (req, res) => {
  try {
    const { userId, consentId } = req.query;

    // Here you would query the database for cookie preferences
    // For now, return a mock response
    const mockPreferences = {
      userId,
      consentId,
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockPreferences
    });

  } catch (error) {
    console.error('Error retrieving cookie preferences:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve cookie preferences'
    });
  }
};

// Track user activity (analytics)
const trackUserActivity = async (req, res) => {
  try {
    const { userId, event, data, url, userAgent, timestamp } = req.body;

    // Validate required fields
    if (!event || !userId) {
      return res.status(400).json({
        error: true,
        message: 'Event and userId are required'
      });
    }

    // Store tracking data
    const trackingData = {
      userId,
      event,
      data: JSON.stringify(data || {}),
      url,
      userAgent: userAgent || req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date()
    };

    // Here you would save to an analytics_events table
    console.log('User activity tracked:', trackingData);

    res.json({
      success: true,
      message: 'User activity tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking user activity:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to track user activity'
    });
  }
};

// Get user tracking data (for GDPR compliance)
const getUserTrackingData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: true,
        message: 'User ID is required'
      });
    }

    // Here you would query the database for user's tracking data
    // For now, return mock data
    const mockTrackingData = {
      userId,
      totalEvents: 0,
      events: [],
      dataCollected: {
        pagesViewed: [],
        timeSpent: 0,
        lastActivity: new Date().toISOString()
      },
      consentGiven: true,
      consentDate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockTrackingData
    });

  } catch (error) {
    console.error('Error retrieving user tracking data:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve user tracking data'
    });
  }
};

// Delete user cookie data (GDPR compliance)
const deleteUserCookieData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: true,
        message: 'User ID is required'
      });
    }

    // Here you would delete all cookie and tracking data for the user
    console.log('Deleting cookie data for user:', userId);

    res.json({
      success: true,
      message: 'User cookie data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user cookie data:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete user cookie data'
    });
  }
};

// Get all users' cookie data (Admin only)
const getAllUsersCookieData = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Admin access required'
      });
    }

    // Here you would query the database for all users' cookie and tracking data
    // For now, return mock data with comprehensive information
    const mockAllUsersData = [
      {
        userId: 'user_001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        cookiePreferences: {
          necessary: true,
          analytics: true,
          marketing: false,
          consentId: 'consent_123456',
          timestamp: '2024-01-15T10:30:00Z'
        },
        trackingData: {
          totalEvents: 45,
          pagesViewed: ['/home', '/services', '/contact', '/about'],
          timeSpent: 1250, // seconds
          lastActivity: '2024-01-20T14:25:00Z',
          events: [
            { event: 'page_view', url: '/home', timestamp: '2024-01-20T10:00:00Z' },
            { event: 'button_click', data: { button: 'contact_us' }, timestamp: '2024-01-20T10:15:00Z' }
          ]
        },
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.100',
          location: {
            country: 'United States',
            region: 'California',
            city: 'San Francisco',
            latitude: 37.7749,
            longitude: -122.4194
          },
          browser: 'Chrome',
          os: 'Windows 10'
        },
        consentHistory: [
          { consentId: 'consent_123456', timestamp: '2024-01-15T10:30:00Z', preferences: { necessary: true, analytics: true, marketing: false } },
          { consentId: 'consent_789012', timestamp: '2024-01-10T09:15:00Z', preferences: { necessary: true, analytics: false, marketing: false } }
        ]
      },
      {
        userId: 'user_002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        cookiePreferences: {
          necessary: true,
          analytics: false,
          marketing: true,
          consentId: 'consent_789012',
          timestamp: '2024-01-18T16:45:00Z'
        },
        trackingData: {
          totalEvents: 23,
          pagesViewed: ['/home', '/blog', '/products'],
          timeSpent: 890,
          lastActivity: '2024-01-19T11:20:00Z',
          events: [
            { event: 'page_view', url: '/blog', timestamp: '2024-01-19T09:30:00Z' },
            { event: 'form_submit', data: { form: 'newsletter' }, timestamp: '2024-01-19T09:45:00Z' }
          ]
        },
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
          ipAddress: '10.0.0.50',
          location: {
            country: 'Canada',
            region: 'Ontario',
            city: 'Toronto',
            latitude: 43.6532,
            longitude: -79.3832
          },
          browser: 'Safari',
          os: 'macOS'
        },
        consentHistory: [
          { consentId: 'consent_789012', timestamp: '2024-01-18T16:45:00Z', preferences: { necessary: true, analytics: false, marketing: true } }
        ]
      }
    ];

    res.json({
      success: true,
      data: mockAllUsersData,
      totalUsers: mockAllUsersData.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving all users cookie data:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve all users cookie data'
    });
  }
};

// Export user cookie data (GDPR compliance)
const exportUserCookieData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: true,
        message: 'User ID is required'
      });
    }

    // Here you would gather all user data for export
    const exportData = {
      userId,
      cookiePreferences: {},
      trackingData: [],
      consentHistory: [],
      exportDate: new Date().toISOString()
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="cookie-data-${userId}.json"`);

    res.json(exportData);

  } catch (error) {
    console.error('Error exporting user cookie data:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to export user cookie data'
    });
  }
};

module.exports = {
  storeCookiePreferences,
  getCookiePreferences,
  trackUserActivity,
  getUserTrackingData,
  deleteUserCookieData,
  exportUserCookieData,
  getAllUsersCookieData
};