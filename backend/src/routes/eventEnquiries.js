const express = require('express');
const router = express.Router();
const eventEnquiryController = require('../controllers/eventEnquiryController');
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Public route for submitting event enquiry
router.post('/', eventEnquiryController.submitValidation, eventEnquiryController.submitEnquiry);

// Admin routes (admins can view and manage event enquiries)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_event_enquiries'), eventEnquiryController.getAll);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_event_enquiries'), eventEnquiryController.getById);
router.put('/admin/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_event_enquiries'), eventEnquiryController.updateStatusValidation, eventEnquiryController.updateStatus);

module.exports = router;