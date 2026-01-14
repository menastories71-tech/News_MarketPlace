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
// User management routes (manage users permission required)
router.get('/users/export', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_users'), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.findAll();

    const headers = [
      'ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Verified',
      'Phone Code', 'Phone Number', 'City', 'State', 'Country', 'Designation',
      'Created At', 'Last Login'
    ];

    let csv = headers.join(',') + '\n';

    users.forEach(user => {
      const escape = (text) => {
        if (text === null || text === undefined) return '';
        const stringValue = String(text);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const row = [
        user.id,
        escape(user.first_name),
        escape(user.last_name),
        escape(user.email),
        escape(user.role),
        user.is_active ? 'Active' : 'Inactive',
        user.is_verified ? 'Yes' : 'No',
        escape(user.phone_code),
        escape(user.phone_number),
        escape(user.city),
        escape(user.state),
        escape(user.country),
        escape(user.designation),
        user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
        user.last_login ? new Date(user.last_login).toISOString().split('T')[0] : 'Never'
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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