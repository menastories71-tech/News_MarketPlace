const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('./emailService');

class AuthService {
  // Generate JWT tokens
  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
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
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Register user
  async register(userData) {
    const { email, password, first_name, last_name } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({ email, password, first_name, last_name });

    // Generate and send OTP
    const otp = this.generateOTP();
    await user.setOTP(otp);

    await emailService.sendOTP(email, otp, 'registration');

    return {
      user: user.toJSON(),
      message: 'Registration successful. Please check your email for OTP verification.'
    };
  }

  // Verify registration OTP
  async verifyRegistration(email, otp) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidOTP = await user.verifyOTP(otp);
    if (!isValidOTP) {
      throw new Error('Invalid or expired OTP');
    }

    const tokens = this.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens,
      message: 'Email verified successfully'
    };
  }

  // Login user
  async login(email, password, rememberMe = false) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // For login, we can allow unverified users but may want to prompt for verification
    // Generate OTP for login verification
    const otp = this.generateOTP();
    await user.setOTP(otp);

    await emailService.sendOTP(email, otp, 'login');

    return {
      user: user.toJSON(),
      message: 'OTP sent to your email for verification',
      requiresOTP: true
    };
  }

  // Verify login OTP
  async verifyLogin(email, otp, rememberMe = false) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidOTP = await user.verifyOTP(otp);
    if (!isValidOTP) {
      throw new Error('Invalid or expired OTP');
    }

    // Update last login
    await user.updateLastLogin();

    const tokens = this.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens,
      message: 'Login successful'
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    const tokens = this.generateTokens(user);
    return tokens;
  }

  // Forgot password
  async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account with this email exists, an OTP has been sent.' };
    }

    // Generate and send OTP
    const otp = this.generateOTP();
    await user.setOTP(otp);

    await emailService.sendOTP(email, otp, 'password_reset');

    return { message: 'If an account with this email exists, an OTP has been sent.' };
  }

  // Verify forgot password OTP
  async verifyForgotPasswordOTP(email, otp) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidOTP = await user.verifyOTP(otp);
    if (!isValidOTP) {
      throw new Error('Invalid or expired OTP');
    }

    // Generate a temporary token for password reset (valid for 10 minutes)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset_otp' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return {
      resetToken,
      message: 'OTP verified successfully. You can now reset your password.'
    };
  }

  // Reset password with OTP verification
  async resetPasswordWithOTP(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'password_reset_otp') {
        throw new Error('Invalid reset token');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(newPassword, 12);

      await user.update({ password_hash });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  // Reset password (legacy method for backward compatibility with email links)
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's the old password_reset token type
      if (decoded.type === 'password_reset') {
        const user = await User.findById(decoded.userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Hash new password
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(newPassword, 12);

        await user.update({ password_hash });

        return { message: 'Password reset successfully' };
      } else if (decoded.type === 'password_reset_otp') {
        // Handle OTP-based reset
        return this.resetPasswordWithOTP(token, newPassword);
      } else {
        throw new Error('Invalid reset token type');
      }
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  // Logout (client-side token removal, but we can blacklist if needed)
  async logout(userId) {
    // In a more advanced implementation, you might want to blacklist tokens
    // For now, just return success
    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();