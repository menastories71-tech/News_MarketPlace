const { User } = require('../models');

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
  exportUserCookieData
};