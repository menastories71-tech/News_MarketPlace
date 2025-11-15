const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// All routes require admin authentication and super admin permission
const superAdminMiddleware = [verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('system_admin')];

// Role routes
router.get('/roles', superAdminMiddleware, rolePermissionController.getAllRoles);
router.get('/roles/:id', superAdminMiddleware, rolePermissionController.getRoleById);
router.post('/roles', superAdminMiddleware, rolePermissionController.createRoleValidation, rolePermissionController.createRole);
router.put('/roles/:id', superAdminMiddleware, rolePermissionController.updateRoleValidation, rolePermissionController.updateRole);
router.delete('/roles/:id', superAdminMiddleware, rolePermissionController.deleteRole);

// Permission routes
router.get('/permissions', superAdminMiddleware, rolePermissionController.getAllPermissions);
router.get('/permissions/:id', superAdminMiddleware, rolePermissionController.getPermissionById);
router.post('/permissions', superAdminMiddleware, rolePermissionController.createPermissionValidation, rolePermissionController.createPermission);
router.put('/permissions/:id', superAdminMiddleware, rolePermissionController.updatePermissionValidation, rolePermissionController.updatePermission);
router.delete('/permissions/:id', superAdminMiddleware, rolePermissionController.deletePermission);

// Role-Permission relationship routes
router.post('/roles/:roleId/permissions/:permissionId', superAdminMiddleware, rolePermissionController.assignPermissionToRole);
router.delete('/roles/:roleId/permissions/:permissionId', superAdminMiddleware, rolePermissionController.removePermissionFromRole);
router.get('/roles/:id/permissions', superAdminMiddleware, rolePermissionController.getRolePermissions);
router.put('/roles/:id/permissions', superAdminMiddleware, rolePermissionController.setRolePermissions);

// Utility routes
router.get('/resources', superAdminMiddleware, rolePermissionController.getResources);

module.exports = router;