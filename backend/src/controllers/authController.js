const authService = require('../services/authService');
const { body, validationResult } = require('express-validator');

class AuthController {
  // Validation rules
  registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  ];

  loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
  ];

  otpValidation = [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  ];

  forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail(),
  ];

  resetPasswordValidation = [
    body('token').exists().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ];

  verifyForgotPasswordOTPValidation = [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  ];

  resetPasswordWithOTPValidation = [
    body('token').exists().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ];

  // Register user
  async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, first_name, last_name } = req.body;

      const result = await authService.register({
        email,
        password,
        first_name,
        last_name
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Verify registration OTP
  async verifyRegistration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, otp } = req.body;

      const result = await authService.verifyRegistration(email, otp);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
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
      console.error('OTP verification error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, rememberMe } = req.body;

      const result = await authService.login(email, password, rememberMe);

      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Verify login OTP
  async verifyLogin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, otp, rememberMe } = req.body;

      const result = await authService.verifyLogin(email, otp, rememberMe);

      // Set refresh token in httpOnly cookie
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge
      });

      // Return access token in response
      const { refreshToken, ...tokensToSend } = result.tokens;

      res.json({
        ...result,
        tokens: tokensToSend
      });
    } catch (error) {
      console.error('Login OTP verification error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const tokens = await authService.refreshAccessToken(refreshToken);

      // Set new refresh token in cookie
      res.cookie('refreshToken', tokens.refreshToken, {
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
      console.error('Token refresh error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      res.json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Verify forgot password OTP
  async verifyForgotPasswordOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, otp } = req.body;

      const result = await authService.verifyForgotPasswordOTP(email, otp);

      res.json(result);
    } catch (error) {
      console.error('Verify forgot password OTP error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Reset password with OTP verification
  async resetPasswordWithOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { token, password } = req.body;

      const result = await authService.resetPasswordWithOTP(token, password);

      res.json(result);
    } catch (error) {
      console.error('Reset password with OTP error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Reset password (legacy method for backward compatibility)
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      res.json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      // If you have user ID from token, you could log the logout
      const userId = req.user?.userId;
      if (userId) {
        await authService.logout(userId);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      // User data should be available from auth middleware
      const user = req.user;
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();