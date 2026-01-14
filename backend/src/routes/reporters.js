const express = require('express');
const router = express.Router();
const reporterController = require('../controllers/reporterController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');
const { reporterSubmitLimit } = require('../middleware/rateLimit');

// User routes (authenticated users can create and view their own reporter submissions)
router.post('/', verifyToken, reporterSubmitLimit, reporterController.createValidation, reporterController.create);
router.get('/my', verifyToken, reporterController.getMyReporters);

// Bulk upload and export
router.get('/admin/template', verifyAdminToken, requireAdminPanelAccess, reporterController.downloadTemplate);
router.post('/admin/bulk-upload', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), reporterController.csvUpload.single('file'), reporterController.bulkUpload);
router.get('/admin/export', verifyAdminToken, requireAdminPanelAccess, reporterController.downloadCSV);

// Admin routes (admins can manage all reporter submissions)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), reporterController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), reporterController.createValidation, reporterController.create);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), reporterController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), reporterController.updateValidation, reporterController.update);
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), reporterController.approveReporter);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), reporterController.rejectReporter);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), reporterController.delete);

// User parameterized routes (users can view and edit their own submissions)
router.get('/:id', verifyToken, reporterController.getById);
router.put('/:id', verifyToken, requireOwnership('reporter'), reporterController.updateValidation, reporterController.update);
router.delete('/:id', verifyToken, requireOwnership('reporter'), reporterController.delete);

// Bulk operations routes (admin only)
router.put('/admin/bulk-approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), reporterController.bulkApprove);
router.put('/admin/bulk-reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), reporterController.bulkReject);
router.delete('/admin/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_reporters'), (req, res) => {
  // Bulk delete implementation would go here
  res.status(501).json({ error: 'Bulk delete not implemented yet' });
});

// Status management (admin only)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), (req, res) => {
  // Status update implementation would go here
  res.status(501).json({ error: 'Status update not implemented yet' });
});

// Approval/Rejection endpoints (admin only)
router.post('/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), reporterController.approveReporter);
router.post('/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_reporters'), reporterController.rejectReporter);

module.exports = router;