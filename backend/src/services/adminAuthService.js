const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

class AdminAuthService {
  // Generate JWT tokens for admin
  generateTokens(admin) {
    const payload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'admin') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== 'admin') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Login admin
  async login(email, password) {
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      throw new Error('Invalid email or password');
    }

    if (!admin.is_active) {
      throw new Error('Account is deactivated');
    }

    const isValidPassword = await admin.verifyPassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await admin.updateLastLogin();

    const tokens = this.generateTokens(admin);

    return {
      admin: admin.toJSON(),
      tokens,
      message: 'Login successful'
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);

    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.is_active) {
      throw new Error('Admin not found or inactive');
    }

    const tokens = this.generateTokens(admin);
    return tokens;
  }

  // Get admin profile
  async getProfile(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin.toJSON();
  }

  // Update admin profile
  async updateProfile(adminId, updateData) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Remove sensitive fields from update
    const { password_hash, role, ...allowedUpdates } = updateData;

    await admin.update(allowedUpdates);
    return admin.toJSON();
  }

  // Change admin password
  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const isValidCurrentPassword = await admin.verifyPassword(currentPassword);
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(newPassword, 12);

    await admin.update({ password_hash });
    return { message: 'Password changed successfully' };
  }

  // Logout (client-side token removal)
  async logout(adminId) {
    // In a more advanced implementation, you might want to blacklist tokens
    return { message: 'Logged out successfully' };
  }

  // Check if admin has required role
  async hasRole(adminId, requiredRole) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return false;
    }

    return admin.hasRole(requiredRole);
  }

  // Check if admin has any of the required roles
  async hasAnyRole(adminId, requiredRoles) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return false;
    }

    return admin.hasAnyRole(requiredRoles);
  }

  // Get admin role level
  async getRoleLevel(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return 0;
    }

    return admin.getRoleLevel();
  }
}

module.exports = new AdminAuthService();