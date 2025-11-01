const adminAuthService = require('../services/adminAuthService');
const { body, validationResult } = require('express-validator');

class AdminAuthController {
  // Validation rules
  loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
  ];

  changePasswordValidation = [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  ];

  updateProfileValidation = [
    body('first_name').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('last_name').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail(),
  ];

  // Login admin
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      const result = await adminAuthService.login(email, password);

      // Set refresh token in httpOnly cookie
      res.cookie('adminRefreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return access token in response (don't send refresh token)
      const { refreshToken, ...tokensToSend } = result.tokens;

      res.json({
        ...result,
        tokens: tokensToSend
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.adminRefreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const tokens = await adminAuthService.refreshAccessToken(refreshToken);

      // Set new refresh token in cookie
      res.cookie('adminRefreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return new access token
      const { refreshToken: newRefreshToken, ...tokensToSend } = tokens;

      res.json({
        accessToken: tokensToSend.accessToken,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Admin token refresh error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Logout admin
  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie('adminRefreshToken');

      // If admin ID from token, log the logout
      const adminId = req.admin?.adminId;
      if (adminId) {
        await adminAuthService.logout(adminId);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get admin profile
  async getProfile(req, res) {
    try {
      const adminId = req.admin.adminId;
      const admin = await adminAuthService.getProfile(adminId);
      res.json({ admin });
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update admin profile
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const adminId = req.admin.adminId;
      const updateData = req.body;

      const admin = await adminAuthService.updateProfile(adminId, updateData);
      res.json({ admin, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update admin profile error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Change admin password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const adminId = req.admin.adminId;
      const { currentPassword, newPassword } = req.body;

      const result = await adminAuthService.changePassword(adminId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      console.error('Change admin password error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Check admin role
  async checkRole(req, res) {
    try {
      const adminId = req.admin.adminId;
      const { role } = req.params;

      const hasRole = await adminAuthService.hasRole(adminId, role);
      res.json({ hasRole });
    } catch (error) {
      console.error('Check admin role error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Check admin roles (any of the specified roles)
  async checkAnyRole(req, res) {
    try {
      const adminId = req.admin.adminId;
      const roles = req.body.roles; // Array of roles

      if (!Array.isArray(roles)) {
        return res.status(400).json({ error: 'Roles must be an array' });
      }

      const hasAnyRole = await adminAuthService.hasAnyRole(adminId, roles);
      res.json({ hasAnyRole });
    } catch (error) {
      console.error('Check admin any role error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get admin role level
  async getRoleLevel(req, res) {
    try {
      const adminId = req.admin.adminId;
      const roleLevel = await adminAuthService.getRoleLevel(adminId);
      res.json({ roleLevel });
    } catch (error) {
      console.error('Get admin role level error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdminAuthController();