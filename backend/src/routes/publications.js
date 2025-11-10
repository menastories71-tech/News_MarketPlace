const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publicationController');
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

// User routes (authenticated users can create and view publications)
router.post('/', verifyToken, requirePublicationSubmissionRights, publicationSubmitLimit, publicationController.createValidation, publicationController.create);
router.get('/', verifyToken, publicationController.getAll);
router.get('/:id', verifyToken, publicationController.getById);
router.put('/:id', verifyToken, requireOwnership('publication'), publicationController.updateValidation, publicationController.update);
router.delete('/:id', verifyToken, requireOwnership('publication'), publicationController.delete);

// Admin routes (admins can manage all publications and perform bulk operations)
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.createValidation, publicationController.create);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.updateValidation, publicationController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.delete);
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.getAll);

router.post('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.bulkCreate);
router.put('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.bulkUpdate);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.bulkDelete);

// Bulk upload from file (admin only)
router.post('/bulk-upload', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.bulkUpload);

// Template downloads (admin only)
router.get('/template/csv', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.downloadCSVTemplate);
router.get('/template/excel', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.downloadExcelTemplate);

// Bulk edit common fields (admin only)
router.patch('/bulk-edit', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publicationController.bulkEdit);

// Status management (admin only)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_publications'), publicationController.updateStatus);

// Approval/Rejection endpoints (admin only)
router.post('/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_publications'), publicationController.approvePublication);
router.post('/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_publications'), publicationController.rejectPublication);

module.exports = router;