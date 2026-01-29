const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requirePublicationSubmissionRights,
  requireAdminPanelAccess
} = require('../middleware/auth');
const { publicationSubmitLimit } = require('../middleware/rateLimit');

// User routes (authenticated users can create and view themes)
router.post('/', verifyToken, requirePublicationSubmissionRights, publicationSubmitLimit, themeController.createValidation, themeController.create);
router.get('/', verifyToken, themeController.getAll);
router.get('/public', themeController.getPublic);

// Bulk operations routes (must come before parameterized routes to avoid conflicts)
router.post('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.bulkCreate);
router.put('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.bulkUpdate);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.bulkDelete);
router.post('/bulk/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_themes'), themeController.bulkUpdateStatus);

// Bulk upload and export
router.get('/template', verifyAdminToken, requireAdminPanelAccess, themeController.downloadTemplate);
router.post('/bulk-upload', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.csvUpload.single('file'), themeController.bulkUpload);
router.get('/export', verifyAdminToken, requireAdminPanelAccess, themeController.downloadCSV);

// Admin routes (admins can manage all themes and perform bulk operations)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.createValidation, themeController.create);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.updateValidation, themeController.update);
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_themes'), themeController.approveTheme);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_themes'), themeController.rejectTheme);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_themes'), themeController.delete);

// User parameterized routes
router.get('/:id', verifyToken, themeController.getById);
router.put('/:id', verifyToken, requireOwnership('theme'), themeController.updateValidation, themeController.update);
router.delete('/:id', verifyToken, requireOwnership('theme'), themeController.delete);

// Status management (admin only)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_themes'), themeController.updateStatus);

// Approval/Rejection endpoints (admin only)
router.post('/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_themes'), themeController.approveTheme);
router.post('/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_themes'), themeController.rejectTheme);

module.exports = router;