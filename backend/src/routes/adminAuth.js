const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { verifyAdminToken, verifyAdminRefreshToken, requireAdminRole } = require('../middleware/auth');

// Public admin routes
router.post('/login', adminAuthController.loginValidation, adminAuthController.login);

// Protected admin routes
router.post('/refresh-token', verifyAdminRefreshToken, adminAuthController.refreshToken);
router.post('/logout', verifyAdminToken, adminAuthController.logout);
router.get('/profile', verifyAdminToken, adminAuthController.getProfile);
router.put('/profile', verifyAdminToken, adminAuthController.updateProfileValidation, adminAuthController.updateProfile);
router.put('/change-password', verifyAdminToken, adminAuthController.changePasswordValidation, adminAuthController.changePassword);

// Role checking routes
router.get('/check-role/:role', verifyAdminToken, adminAuthController.checkRole);
router.post('/check-any-role', verifyAdminToken, adminAuthController.checkAnyRole);
router.get('/role-level', verifyAdminToken, adminAuthController.getRoleLevel);

// Super admin only routes (example)
router.get('/super-admin-only', verifyAdminToken, requireAdminRole(['super_admin']), (req, res) => {
  res.json({ message: 'This is accessible only to super admins' });
});

// Content manager and above routes
router.get('/content-manager-plus', verifyAdminToken, requireAdminRole(['super_admin', 'content_manager']), (req, res) => {
  res.json({ message: 'This is accessible to content managers and above' });
});

// Editor and above routes
router.get('/editor-plus', verifyAdminToken, requireAdminRole(['super_admin', 'content_manager', 'editor']), (req, res) => {
  res.json({ message: 'This is accessible to editors and above' });
});

// User management routes
router.get('/users', verifyAdminToken, requireAdminRole(['super_admin', 'content_manager']), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;