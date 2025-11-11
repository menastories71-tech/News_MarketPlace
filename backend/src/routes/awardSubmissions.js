const express = require('express');
const router = express.Router();
const awardSubmissionController = require('../controllers/awardSubmissionController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// User submission route with authentication
router.post('/', verifyToken, awardSubmissionController.submitValidation, awardSubmissionController.create);

// Admin routes for managing submissions
router.get('/', verifyAdminToken, requireAdminPanelAccess, awardSubmissionController.getAll);

// Admin search route
router.get('/search', verifyAdminToken, requireAdminPanelAccess, awardSubmissionController.search);

module.exports = router;