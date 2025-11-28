const messageCentralService = require('../services/messageCentralService');

class OTPController {
  /**
   * Send OTP to mobile number
   */
  async sendOTP(req, res) {
    try {
      const { mobileNumber, flowType = 'SMS', countryCode = '91' } = req.body;

      // Validate input
      if (!mobileNumber) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number is required'
        });
      }

      // Validate phone number format
      if (!messageCentralService.validatePhoneNumber(mobileNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number format. Must be 10 digits starting with 6-9'
        });
      }

      // Validate flow type
      if (!['SMS', 'WHATSAPP'].includes(flowType.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid flow type. Must be SMS or WHATSAPP'
        });
      }

      console.log(`Sending ${flowType} OTP to ${countryCode}${mobileNumber}`);

      // Send OTP via Message Central
      const result = await messageCentralService.sendOTP(mobileNumber, flowType, countryCode);

      if (result.success) {
        console.log('OTP sent successfully:', result.data);

        res.status(200).json({
          success: true,
          message: 'OTP sent successfully',
          data: result.data
        });
      } else {
        console.error('Failed to send OTP:', result.error);

        // Handle Message Central specific errors with user-friendly messages
        let errorMessage = 'Failed to send OTP';
        let statusCode = result.status || 500;

        if (result.error && typeof result.error === 'object') {
          if (result.error.responseCode === 506) {
            errorMessage = 'OTP already sent to this number recently. Please wait 60 seconds before requesting a new OTP.';
            statusCode = 429; // Too Many Requests
          } else if (result.error.responseCode === 400) {
            errorMessage = 'Invalid phone number or request parameters.';
            statusCode = 400;
          } else if (result.error.responseCode === 401) {
            errorMessage = 'Authentication failed. Please contact administrator.';
            statusCode = 500;
          }
        }

        res.status(statusCode).json({
          success: false,
          message: errorMessage,
          error: result.error
        });
      }

    } catch (error) {
      console.error('Send OTP controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Validate OTP
   */
  async validateOTP(req, res) {
    try {
      const { mobileNumber, verificationId, code, countryCode = '91' } = req.body;

      // Validate input
      if (!mobileNumber || !verificationId || !code) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number, verification ID, and OTP code are required'
        });
      }

      // Validate phone number format
      if (!messageCentralService.validatePhoneNumber(mobileNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number format'
        });
      }

      // Validate OTP code format
      if (!messageCentralService.validateOTPCode(code)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP code format. Must be 4-6 digits'
        });
      }

      console.log(`Validating OTP for ${countryCode}${mobileNumber}, verificationId: ${verificationId}`);

      // Validate OTP via Message Central
      const result = await messageCentralService.validateOTP(mobileNumber, verificationId, code, countryCode);

      if (result.success) {
        console.log('OTP validation response:', result.data);

        // Handle Message Central validation response codes
        const responseData = result.data;

        if (responseData.responseCode === 200 || responseData.responseCode === 703) {
          // 200 = SUCCESS, 703 = VERIFICATION_COMPLETED
          res.status(200).json({
            success: true,
            message: 'OTP validated successfully',
            data: responseData
          });
        } else if (responseData.responseCode === 702) {
          // 702 = WRONG_OTP_PROVIDED
          res.status(400).json({
            success: false,
            message: 'Invalid OTP code. Please check and try again.',
            error: 'INVALID_OTP'
          });
        } else if (responseData.responseCode === 704) {
          // 704 = OTP_EXPIRED
          res.status(400).json({
            success: false,
            message: 'OTP has expired. Please request a new OTP.',
            error: 'OTP_EXPIRED'
          });
        } else if (responseData.responseCode === 705) {
          // 705 = MAX_ATTEMPTS_REACHED
          res.status(429).json({
            success: false,
            message: 'Maximum validation attempts reached. Please request a new OTP.',
            error: 'MAX_ATTEMPTS_EXCEEDED'
          });
        } else {
          // Unknown response code
          res.status(400).json({
            success: false,
            message: 'OTP validation failed. Please try again.',
            error: responseData.message || 'VALIDATION_FAILED'
          });
        }
      } else {
        console.error('Failed to validate OTP:', result.error);

        res.status(result.status || 500).json({
          success: false,
          message: 'Failed to validate OTP',
          error: result.error
        });
      }

    } catch (error) {
      console.error('Validate OTP controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Check OTP service health
   */
  async healthCheck(req, res) {
    try {
      const health = await messageCentralService.healthCheck();

      res.status(200).json({
        success: true,
        message: 'OTP service health check completed',
        data: health
      });

    } catch (error) {
      console.error('OTP health check error:', error);

      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }

  /**
   * Get OTP service information
   */
  async getServiceInfo(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'OTP service information',
        data: {
          provider: 'Message Central',
          baseUrl: 'https://cpaas.messagecentral.com',
          customerId: messageCentralService.customerId,
          supportedCountries: ['91'], // India
          supportedFlows: ['SMS', 'WHATSAPP'],
          otpLength: '4-6 digits',
          phoneNumberFormat: '10 digits (Indian mobile numbers)'
        }
      });

    } catch (error) {
      console.error('Get service info error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to get service information',
        error: error.message
      });
    }
  }
}

module.exports = new OTPController();