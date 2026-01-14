const express = require('express');
const router = express.Router();
const affiliateEnquiryController = require('../controllers/affiliateEnquiryController');
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Public route for submitting affiliate enquiry
router.post('/', affiliateEnquiryController.submitValidation, affiliateEnquiryController.submitEnquiry);

// Admin routes (admins can view and manage affiliate enquiries)
router.get('/', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_affiliate_enquiries'), affiliateEnquiryController.getAll);
router.get('/download-csv', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_affiliate_enquiries'), (req, res) => affiliateEnquiryController.downloadCSV(req, res));
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_affiliate_enquiries'), affiliateEnquiryController.getById);
router.put('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_affiliate_enquiries'), affiliateEnquiryController.updateStatusValidation, affiliateEnquiryController.updateStatus);

module.exports = router;