const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const {
  verifyAdminToken,
  verifyAdminRefreshToken,
  requireAdminRole,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Public admin routes
router.post('/login', adminAuthController.loginValidation, adminAuthController.login);

// Protected admin routes (require admin panel access)
router.post('/refresh-token', verifyAdminRefreshToken, adminAuthController.refreshToken);
router.post('/logout', verifyAdminToken, requireAdminPanelAccess, adminAuthController.logout);
router.get('/profile', verifyAdminToken, requireAdminPanelAccess, adminAuthController.getProfile);
router.put('/profile', verifyAdminToken, requireAdminPanelAccess, adminAuthController.updateProfileValidation, adminAuthController.updateProfile);
router.put('/change-password', verifyAdminToken, requireAdminPanelAccess, adminAuthController.changePasswordValidation, adminAuthController.changePassword);

// Role checking routes
router.get('/check-role/:role', verifyAdminToken, requireAdminPanelAccess, adminAuthController.checkRole);
router.post('/check-any-role', verifyAdminToken, requireAdminPanelAccess, adminAuthController.checkAnyRole);
router.get('/role-level', verifyAdminToken, requireAdminPanelAccess, adminAuthController.getRoleLevel);

// Super admin only routes (system admin permission required)
router.get('/super-admin-only', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('system_admin'), (req, res) => {
  res.json({ message: 'This is accessible only to super admins' });
});

// Content manager and above routes (manage users permission required)
router.get('/content-manager-plus', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_users'), (req, res) => {
  res.json({ message: 'This is accessible to content managers and above' });
});

// Editor and above routes (manage publications permission required)
router.get('/editor-plus', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), (req, res) => {
  res.json({ message: 'This is accessible to editors and above' });
});

// User management routes (manage users permission required)
router.get('/users', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_users'), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin management routes (manage admins permission required)
router.get('/admins', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_admins'), async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const admins = await Admin.findAll();
    res.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;