const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');

// User routes (authenticated users can create and view groups)
router.post('/', verifyToken, groupController.createValidation, groupController.create);
router.get('/', verifyToken, groupController.getAll);
router.get('/:id', verifyToken, groupController.getById);
router.put('/:id', verifyToken, requireOwnership('group'), groupController.updateValidation, groupController.update);
router.delete('/:id', verifyToken, requireOwnership('group'), groupController.delete);

// Admin routes (admins can manage all groups and perform bulk operations)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.createValidation, groupController.create);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.updateValidation, groupController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.delete);

// Get publications for a specific group
router.get('/:id/publications', verifyToken, groupController.getPublications);

// Admin routes (admins can manage all groups and perform bulk operations)
router.post('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.bulkCreate);
router.put('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.bulkUpdate);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.bulkDelete);

// Status management (admin only)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), groupController.updateStatus);

module.exports = router;