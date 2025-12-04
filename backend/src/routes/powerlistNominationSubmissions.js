const express = require('express');
const router = express.Router();
const powerlistNominationSubmissionController = require('../controllers/powerlistNominationSubmissionController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Public route for submitting nomination
router.post('/', powerlistNominationSubmissionController.createValidation, powerlistNominationSubmissionController.create);

// Get all nomination submissions (admin only)
router.get('/', verifyAdminToken, requireAdminPanelAccess, powerlistNominationSubmissionController.getAll);

// Get nomination submission by ID (admin only)
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistNominationSubmissionController.getById);

// Update nomination submission (admin only)
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistNominationSubmissionController.updateValidation, powerlistNominationSubmissionController.update);

// Delete nomination submission (admin only)
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistNominationSubmissionController.delete);

// Update nomination submission status (admin only)
router.put('/:id/status', verifyAdminToken, requireAdminPanelAccess, powerlistNominationSubmissionController.updateStatus);

module.exports = router;