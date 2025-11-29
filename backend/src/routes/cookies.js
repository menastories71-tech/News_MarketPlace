const express = require('express');
const router = express.Router();
const cookieController = require('../controllers/cookieController');
const rateLimit = require('../middleware/rateLimit');

// Cookie preferences routes
router.post('/preferences', rateLimit.apiLimiter, cookieController.storeCookiePreferences);
router.get('/preferences', rateLimit.apiLimiter, cookieController.getCookiePreferences);

// User activity tracking
router.post('/track', rateLimit.apiLimiter, cookieController.trackUserActivity);

// GDPR compliance routes
router.get('/user/:userId/data', rateLimit.apiLimiter, cookieController.getUserTrackingData);
router.delete('/user/:userId/data', rateLimit.apiLimiter, cookieController.deleteUserCookieData);
router.get('/user/:userId/export', rateLimit.apiLimiter, cookieController.exportUserCookieData);

module.exports = router;