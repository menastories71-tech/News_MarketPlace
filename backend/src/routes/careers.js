const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');
const { careerSubmitLimit } = require('../middleware/rateLimit');

// Bulk operations routes (admin only) - must come first to avoid conflicts with parameterized routes
router.get('/download-template', verifyAdminToken, requireAdminPanelAccess, careerController.downloadTemplate);
router.get('/download-csv', verifyAdminToken, requireAdminPanelAccess, careerController.downloadCSV);
router.post('/bulk-upload', verifyAdminToken, requireAdminPanelAccess, careerController.csvUpload.single('file'), careerController.bulkUpload);

router.put('/bulk-approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), careerController.bulkApprove);
router.put('/bulk-reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), careerController.bulkReject);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_careers'), (req, res) => {
  // Bulk delete implementation would go here
  res.status(501).json({ error: 'Bulk delete not implemented yet' });
});

// Public routes (anyone can view active careers)
router.get('/', careerController.getAll);

// User routes (authenticated users can create and view their own career submissions)
router.post('/', verifyToken, careerSubmitLimit, careerController.createValidation, careerController.create);
router.get('/my', verifyToken, careerController.getMyCareers);

// Admin routes (admins can manage all career submissions)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_careers'), careerController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_careers'), careerController.createValidation, careerController.create);

// User parameterized routes (users can view and edit their own submissions)
router.get('/:id', verifyToken, careerController.getById);
router.put('/:id', verifyToken, requireOwnership('career'), careerController.updateValidation, careerController.update);
router.delete('/:id', verifyToken, requireOwnership('career'), careerController.delete);

// Admin parameterized routes (admins can manage specific careers)
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_careers'), careerController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_careers'), careerController.updateValidation, careerController.update);
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), careerController.approveCareer);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), careerController.rejectCareer);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_careers'), careerController.delete);

// Status management (admin only)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), (req, res) => {
  // Status update implementation would go here
  res.status(501).json({ error: 'Status update not implemented yet' });
});

// Approval/Rejection endpoints (admin only)
router.post('/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), careerController.approveCareer);
router.post('/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_careers'), careerController.rejectCareer);

module.exports = router;