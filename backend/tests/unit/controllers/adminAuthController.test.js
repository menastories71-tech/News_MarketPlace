const adminAuthController = require('../../../src/controllers/adminAuthController');
const adminAuthService = require('../../../src/services/adminAuthService');

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    exists: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    isNumeric: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn()
}));

// Mock the admin auth service
jest.mock('../../../src/services/adminAuthService');

describe('AdminAuthController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      cookies: {},
      admin: { adminId: 1 }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login admin successfully', async () => {
      const mockResult = {
        admin: { id: 1, email: 'admin@test.com' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
        message: 'Login successful'
      };

      mockReq.body = { email: 'admin@test.com', password: 'password123' };
      adminAuthService.login.mockResolvedValue(mockResult);

      await adminAuthController.login(mockReq, mockRes);

      expect(adminAuthService.login).toHaveBeenCalledWith('admin@test.com', 'password123');
      expect(mockRes.cookie).toHaveBeenCalledWith('adminRefreshToken', 'refresh-token', expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith({
        ...mockResult,
        tokens: { accessToken: 'access-token' }
      });
    });

    it('should handle validation errors', async () => {
      mockReq.body = { email: 'invalid-email', password: '' };

      // Mock validation result
      const mockValidationResult = {
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid email' }]
      };

      // Mock the validationResult function
      const { validationResult } = require('express-validator');
      validationResult.mockReturnValue(mockValidationResult);

      await adminAuthController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [{ msg: 'Invalid email' }]
      });
    });

    it('should handle login errors', async () => {
      mockReq.body = { email: 'admin@test.com', password: 'wrongpass' };
      adminAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await adminAuthController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      mockReq.cookies.adminRefreshToken = 'valid-refresh-token';

      adminAuthService.refreshAccessToken.mockResolvedValue(mockTokens);

      await adminAuthController.refreshToken(mockReq, mockRes);

      expect(adminAuthService.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockRes.cookie).toHaveBeenCalledWith('adminRefreshToken', 'new-refresh', expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'new-access',
        message: 'Token refreshed successfully'
      });
    });

    it('should handle missing refresh token', async () => {
      await adminAuthController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Refresh token required' });
    });

    it('should handle invalid refresh token', async () => {
      mockReq.cookies.adminRefreshToken = 'invalid-token';
      adminAuthService.refreshAccessToken.mockRejectedValue(new Error('Invalid token'));

      await adminAuthController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
  });

  describe('logout', () => {
    it('should logout admin successfully', async () => {
      adminAuthService.logout.mockResolvedValue({ message: 'Logged out' });

      await adminAuthController.logout(mockReq, mockRes);

      expect(adminAuthService.logout).toHaveBeenCalledWith(1);
      expect(mockRes.clearCookie).toHaveBeenCalledWith('adminRefreshToken');
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should handle logout without admin ID', async () => {
      mockReq.admin = undefined;

      await adminAuthController.logout(mockReq, mockRes);

      expect(adminAuthService.logout).not.toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith('adminRefreshToken');
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  describe('getProfile', () => {
    it('should get admin profile', async () => {
      const mockProfile = { id: 1, email: 'admin@test.com', first_name: 'Test' };
      adminAuthService.getProfile.mockResolvedValue(mockProfile);

      await adminAuthController.getProfile(mockReq, mockRes);

      expect(adminAuthService.getProfile).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({ admin: mockProfile });
    });

    it('should handle profile fetch error', async () => {
      adminAuthService.getProfile.mockRejectedValue(new Error('Admin not found'));

      await adminAuthController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Admin not found' });
    });
  });

  describe('updateProfile', () => {
    it('should update admin profile', async () => {
      const updateData = { first_name: 'Updated' };
      const mockUpdatedAdmin = { id: 1, first_name: 'Updated' };

      mockReq.body = updateData;
      adminAuthService.updateProfile.mockResolvedValue(mockUpdatedAdmin);

      await adminAuthController.updateProfile(mockReq, mockRes);

      expect(adminAuthService.updateProfile).toHaveBeenCalledWith(1, updateData);
      expect(mockRes.json).toHaveBeenCalledWith({
        admin: mockUpdatedAdmin,
        message: 'Profile updated successfully'
      });
    });

    it('should handle validation errors in profile update', async () => {
      mockReq.body = { email: 'invalid-email' };

      const mockValidationResult = {
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid email format' }]
      };

      const { validationResult } = require('express-validator');
      validationResult.mockReturnValue(mockValidationResult);

      await adminAuthController.updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [{ msg: 'Invalid email format' }]
      });
    });
  });

  describe('changePassword', () => {
    it('should change admin password', async () => {
      const passwordData = { currentPassword: 'oldpass', newPassword: 'newpass' };
      const mockResult = { message: 'Password changed successfully' };

      mockReq.body = passwordData;
      adminAuthService.changePassword.mockResolvedValue(mockResult);

      await adminAuthController.changePassword(mockReq, mockRes);

      expect(adminAuthService.changePassword).toHaveBeenCalledWith(1, 'oldpass', 'newpass');
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle password change validation errors', async () => {
      mockReq.body = { currentPassword: '', newPassword: '123' };

      const mockValidationResult = {
        isEmpty: () => false,
        array: () => [{ msg: 'Password too short' }]
      };

      const { validationResult } = require('express-validator');
      validationResult.mockReturnValue(mockValidationResult);

      await adminAuthController.changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [{ msg: 'Password too short' }]
      });
    });
  });

  describe('checkRole', () => {
    it('should check admin role', async () => {
      mockReq.params = { role: 'super_admin' };
      adminAuthService.hasRole.mockResolvedValue(true);

      await adminAuthController.checkRole(mockReq, mockRes);

      expect(adminAuthService.hasRole).toHaveBeenCalledWith(1, 'super_admin');
      expect(mockRes.json).toHaveBeenCalledWith({ hasRole: true });
    });
  });

  describe('checkAnyRole', () => {
    it('should check if admin has any of the specified roles', async () => {
      const roles = ['editor', 'content_manager'];
      mockReq.body = { roles };

      adminAuthService.hasAnyRole.mockResolvedValue(true);

      await adminAuthController.checkAnyRole(mockReq, mockRes);

      expect(adminAuthService.hasAnyRole).toHaveBeenCalledWith(1, roles);
      expect(mockRes.json).toHaveBeenCalledWith({ hasAnyRole: true });
    });

    it('should handle missing roles array', async () => {
      mockReq.body = {};

      await adminAuthController.checkAnyRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Roles must be an array' });
    });
  });

  describe('getRoleLevel', () => {
    it('should get admin role level', async () => {
      adminAuthService.getRoleLevel.mockResolvedValue(5);

      await adminAuthController.getRoleLevel(mockReq, mockRes);

      expect(adminAuthService.getRoleLevel).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({ roleLevel: 5 });
    });
  });
});