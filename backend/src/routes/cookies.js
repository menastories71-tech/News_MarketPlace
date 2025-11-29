const express = require('express');
const router = express.Router();
const cookieController = require('../controllers/cookieController');

// Cookie preferences routes
router.post('/preferences', cookieController.storeCookiePreferences);
router.get('/preferences', cookieController.getCookiePreferences);

// User activity tracking
router.post('/track', cookieController.trackUserActivity);

// GDPR compliance routes
router.get('/user/:userId/data', cookieController.getUserTrackingData);
router.delete('/user/:userId/data', cookieController.deleteUserCookieData);
router.get('/user/:userId/export', cookieController.exportUserCookieData);

// Admin routes
router.get('/admin/all-users-data', cookieController.getAllUsersCookieData);

module.exports = router;