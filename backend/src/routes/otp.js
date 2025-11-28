const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

// Apply rate limiting to OTP routes
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 OTP requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for OTP validation
const validateRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 validation attempts per windowMs
  message: {
    success: false,
    message: 'Too many validation attempts, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/otp/send
 * @desc Send OTP to mobile number
 * @access Public
 * @body { mobileNumber: string, flowType?: 'SMS'|'WHATSAPP', countryCode?: string }
 */
router.post('/send', otpRateLimit, async (req, res) => {
  await otpController.sendOTP(req, res);
});

/**
 * @route POST /api/otp/validate
 * @desc Validate OTP code
 * @access Public
 * @body { mobileNumber: string, verificationId: string, code: string, countryCode?: string }
 */
router.post('/validate', validateRateLimit, async (req, res) => {
  await otpController.validateOTP(req, res);
});

/**
 * @route GET /api/otp/health
 * @desc Check OTP service health
 * @access Public
 */
router.get('/health', async (req, res) => {
  await otpController.healthCheck(req, res);
});

/**
 * @route GET /api/otp/info
 * @desc Get OTP service information
 * @access Public
 */
router.get('/info', async (req, res) => {
  await otpController.getServiceInfo(req, res);
});

/**
 * @route GET /api/otp/page
 * @desc Check OTP test page availability
 * @access Public
 */
router.get('/page', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'OTP test page is available',
      data: {
        pageUrl: '/otp',
        description: 'Message Central OTP testing page',
        endpoints: {
          sendOTP: 'POST /api/otp/send',
          validateOTP: 'POST /api/otp/validate',
          health: 'GET /api/otp/health',
          info: 'GET /api/otp/info'
        },
        features: [
          'SMS OTP sending',
          'WhatsApp OTP sending',
          'OTP validation',
          'Rate limiting',
          'Input validation'
        ]
      }
    });
  } catch (error) {
    console.error('OTP page check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check OTP page',
      error: error.message
    });
  }
});

module.exports = router;