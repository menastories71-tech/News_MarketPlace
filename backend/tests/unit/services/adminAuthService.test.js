const adminAuthService = require('../../../src/services/adminAuthService');
const Admin = require('../../../src/models/Admin');

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock the Admin model
jest.mock('../../../src/models/Admin');

describe('AdminAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        role: 'super_admin'
      };

      const tokens = adminAuthService.generateTokens(mockAdmin);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        role: 'super_admin'
      };

      const tokens = adminAuthService.generateTokens(mockAdmin);
      const decoded = adminAuthService.verifyAccessToken(tokens.accessToken);

      expect(decoded.adminId).toBe(mockAdmin.id);
      expect(decoded.email).toBe(mockAdmin.email);
      expect(decoded.role).toBe(mockAdmin.role);
      expect(decoded.type).toBe('admin');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        adminAuthService.verifyAccessToken('invalid-token');
      }).toThrow('Invalid or expired access token');
    });

    it('should throw error for non-admin token', () => {
      // Create a regular user token (not admin) using the same secret
      const jwt = require('jsonwebtoken');
      const userToken = jwt.sign(
        {
          userId: 1,
          email: 'user@test.com',
          role: 'user',
          type: 'user' // Not admin type
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      expect(() => {
        adminAuthService.verifyAccessToken(userToken);
      }).toThrow(); // Should throw any error since type is not 'admin'
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        role: 'super_admin'
      };

      const tokens = adminAuthService.generateTokens(mockAdmin);
      const decoded = adminAuthService.verifyRefreshToken(tokens.refreshToken);

      expect(decoded.adminId).toBe(mockAdmin.id);
      expect(decoded.email).toBe(mockAdmin.email);
      expect(decoded.role).toBe(mockAdmin.role);
      expect(decoded.type).toBe('admin');
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        adminAuthService.verifyRefreshToken('invalid-token');
      }).toThrow('Invalid or expired refresh token');
    });
  });

  describe('login', () => {
    it('should login admin successfully', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        first_name: 'Test',
        last_name: 'Admin',
        role: 'super_admin',
        is_active: true,
        verifyPassword: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          first_name: 'Test',
          last_name: 'Admin',
          role: 'super_admin'
        })
      };

      Admin.findByEmail.mockResolvedValue(mockAdmin);

      const result = await adminAuthService.login('admin@test.com', 'password123');

      expect(Admin.findByEmail).toHaveBeenCalledWith('admin@test.com');
      expect(mockAdmin.verifyPassword).toHaveBeenCalledWith('password123');
      expect(mockAdmin.updateLastLogin).toHaveBeenCalled();
      expect(result).toHaveProperty('admin');
      expect(result).toHaveProperty('tokens');
      expect(result.message).toBe('Login successful');
    });

    it('should throw error for non-existent admin', async () => {
      Admin.findByEmail.mockResolvedValue(null);

      await expect(adminAuthService.login('nonexistent@test.com', 'password'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error for inactive admin', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        is_active: false
      };

      Admin.findByEmail.mockResolvedValue(mockAdmin);

      await expect(adminAuthService.login('admin@test.com', 'password'))
        .rejects.toThrow('Account is deactivated');
    });

    it('should throw error for wrong password', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        is_active: true,
        verifyPassword: jest.fn().mockResolvedValue(false)
      };

      Admin.findByEmail.mockResolvedValue(mockAdmin);

      await expect(adminAuthService.login('admin@test.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        role: 'super_admin',
        is_active: true,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          role: 'super_admin'
        })
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const tokens = adminAuthService.generateTokens(mockAdmin);
      const newTokens = await adminAuthService.refreshAccessToken(tokens.refreshToken);

      expect(Admin.findById).toHaveBeenCalledWith(1);
      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(adminAuthService.refreshAccessToken('invalid-token'))
        .rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for inactive admin', async () => {
      const mockAdmin = {
        id: 1,
        is_active: false
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const tokens = adminAuthService.generateTokens({
        id: 1,
        email: 'admin@test.com',
        role: 'super_admin'
      });

      await expect(adminAuthService.refreshAccessToken(tokens.refreshToken))
        .rejects.toThrow('Admin not found or inactive');
    });
  });

  describe('getProfile', () => {
    it('should get admin profile', async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          first_name: 'Test',
          last_name: 'Admin'
        })
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const profile = await adminAuthService.getProfile(1);

      expect(Admin.findById).toHaveBeenCalledWith(1);
      expect(profile).toEqual({
        id: 1,
        email: 'admin@test.com',
        first_name: 'Test',
        last_name: 'Admin'
      });
    });

    it('should throw error for non-existent admin', async () => {
      Admin.findById.mockResolvedValue(null);

      await expect(adminAuthService.getProfile(999))
        .rejects.toThrow('Admin not found');
    });
  });

  describe('updateProfile', () => {
    it('should update admin profile', async () => {
      const mockAdmin = {
        id: 1,
        update: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'updated@test.com',
          first_name: 'Updated',
          last_name: 'Admin'
        })
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const updateData = { first_name: 'Updated', email: 'updated@test.com' };
      const result = await adminAuthService.updateProfile(1, updateData);

      expect(Admin.findById).toHaveBeenCalledWith(1);
      expect(mockAdmin.update).toHaveBeenCalledWith(updateData);
      expect(result.first_name).toBe('Updated');
    });
  });

  describe('changePassword', () => {
    it('should change admin password', async () => {
      const mockAdmin = {
        id: 1,
        verifyPassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue()
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const result = await adminAuthService.changePassword(1, 'oldpass', 'newpass');

      expect(mockAdmin.verifyPassword).toHaveBeenCalledWith('oldpass');
      expect(mockAdmin.update).toHaveBeenCalled();
      expect(result.message).toBe('Password changed successfully');
    });

    it('should throw error for wrong current password', async () => {
      const mockAdmin = {
        id: 1,
        verifyPassword: jest.fn().mockResolvedValue(false)
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      await expect(adminAuthService.changePassword(1, 'wrongpass', 'newpass'))
        .rejects.toThrow('Current password is incorrect');
    });
  });

  describe('Role checking methods', () => {
    const mockAdmin = {
      id: 1,
      role: 'content_manager',
      hasRole: jest.fn(),
      hasAnyRole: jest.fn(),
      getRoleLevel: jest.fn()
    };

    beforeEach(() => {
      Admin.findById.mockResolvedValue(mockAdmin);
    });

    describe('hasRole', () => {
      it('should check if admin has specific role', async () => {
        mockAdmin.hasRole.mockReturnValue(true);

        const result = await adminAuthService.hasRole(1, 'content_manager');

        expect(mockAdmin.hasRole).toHaveBeenCalledWith('content_manager');
        expect(result).toBe(true);
      });
    });

    describe('hasAnyRole', () => {
      it('should check if admin has any of the specified roles', async () => {
        mockAdmin.hasAnyRole.mockReturnValue(true);

        const result = await adminAuthService.hasAnyRole(1, ['editor', 'content_manager']);

        expect(mockAdmin.hasAnyRole).toHaveBeenCalledWith(['editor', 'content_manager']);
        expect(result).toBe(true);
      });
    });

    describe('getRoleLevel', () => {
      it('should get admin role level', async () => {
        mockAdmin.getRoleLevel.mockReturnValue(4);

        const result = await adminAuthService.getRoleLevel(1);

        expect(mockAdmin.getRoleLevel).toHaveBeenCalled();
        expect(result).toBe(4);
      });
    });
  });
});