const express = require('express');
const router = express.Router();
const pressPackController = require('../controllers/pressPackController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');

// User routes (authenticated users can view press packs)
router.get('/', verifyToken, pressPackController.getAll);
router.get('/public', pressPackController.getPublic);

// Bulk operations routes (must come before parameterized routes to avoid conflicts)
router.post('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.bulkCreate);
router.put('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.bulkUpdate);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.bulkDelete);

// Bulk upload and export
router.get('/admin/template', verifyAdminToken, requireAdminPanelAccess, pressPackController.downloadTemplate);
router.post('/admin/bulk-upload', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.csvUpload.single('file'), pressPackController.bulkUpload);
router.get('/admin/export', verifyAdminToken, requireAdminPanelAccess, pressPackController.downloadCSV);

// Admin routes (admins can manage all press packs)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.createValidation, pressPackController.create);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.updateValidation, pressPackController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.delete);

// Publication management routes
router.get('/:id/publications', verifyToken, pressPackController.getPublications);
router.post('/:id/publications/:publicationId', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.addPublication);
router.delete('/:id/publications/:publicationId', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), pressPackController.removePublication);

// User parameterized routes
router.get('/:id', verifyToken, pressPackController.getById);

module.exports = router;