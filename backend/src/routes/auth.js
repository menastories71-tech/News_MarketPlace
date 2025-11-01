const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyRefreshToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.registerValidation, authController.register);
router.post('/verify-registration', authController.otpValidation, authController.verifyRegistration);
router.post('/login', authController.loginValidation, authController.login);
router.post('/verify-login', authController.otpValidation, authController.verifyLogin);
router.post('/forgot-password', authController.forgotPasswordValidation, authController.forgotPassword);
router.post('/verify-forgot-password-otp', authController.verifyForgotPasswordOTPValidation, authController.verifyForgotPasswordOTP);
router.post('/reset-password-with-otp', authController.resetPasswordWithOTPValidation, authController.resetPasswordWithOTP);
router.post('/reset-password', authController.resetPasswordValidation, authController.resetPassword);

// Protected routes
router.post('/refresh-token', verifyRefreshToken, authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;