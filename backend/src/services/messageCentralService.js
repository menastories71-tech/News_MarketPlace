const axios = require('axios');

class MessageCentralService {
  constructor() {
    this.baseUrl = process.env.MESSAGECENTRAL_BASE_URL || 'https://cpaas.messagecentral.com';
    this.customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
    this.authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;
    this.encryptedPassword = process.env.MESSAGECENTRAL_ENCRYPTED_PASSWORD;
  }

  /**
   * Generate authentication token
   * @param {string} email - Email address (optional)
   * @param {string} country - Country code (optional)
   * @param {string} scope - Token scope, default 'NEW'
   */
  async generateToken(email = null, country = '91', scope = 'NEW') {
    try {
      if (!this.customerId || !this.encryptedPassword) {
        console.error('❌ MessageCentral credentials not configured for token generation');
        console.error('   Customer ID:', this.customerId ? '✅ SET' : '❌ MISSING');
        console.error('   Encrypted Password:', this.encryptedPassword ? '✅ SET' : '❌ MISSING');
        throw new Error('MessageCentral credentials not configured');
      }

      const url = `${this.baseUrl}/auth/v1/authentication/token`;

      const params = {
        customerId: this.customerId,
        key: this.encryptedPassword,
        scope,
        country
      };

      if (email) {
        params.email = email;
      }

      console.log('🔑 Generating MessageCentral auth token');
      console.log('👤 Customer ID:', this.customerId);

      const response = await axios.post(url, null, {
        params,
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ Token generation success');
      return {
        success: true,
        data: response.data,
        status: response.status
      };

    } catch (error) {
      console.error('❌ Token generation error details:');
      console.error('   Status:', error.response?.status);
      console.error('   Response Data:', error.response?.data);
      console.error('   Error Message:', error.message);

      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Send OTP to a mobile number
   * @param {string} mobileNumber - 10-digit mobile number
   * @param {string} flowType - 'SMS' or 'WHATSAPP'
   * @param {string} countryCode - Default '91' for India
   * @param {number} otpLength - OTP length (4-8, default 4)
   * @param {string} customMessage - Custom message template (optional)
   */
  async sendOTP(mobileNumber, flowType = 'SMS', countryCode = '91', otpLength = 4, customMessage = null) {
    try {
      // Check if credentials are configured
      if (!this.authToken) {
        console.error('❌ MessageCentral auth token not configured');
        console.error('   Auth Token:', this.authToken ? '✅ SET' : '❌ MISSING');
        console.error('   Base URL:', this.baseUrl);
        throw new Error('MessageCentral auth token not configured');
      }

      const url = `${this.baseUrl}/verification/v3/send`;

      const params = {
        countryCode,
        flowType: flowType.toUpperCase(),
        mobileNumber,
        otpLength
      };

      // Add custom message if provided
      if (customMessage) {
        params.message = customMessage;
      }

      console.log(`📱 Sending ${flowType} OTP to ${mobileNumber}`);
      console.log('🔗 MessageCentral URL:', url);
      console.log('👤 Customer ID:', this.customerId);
      console.log('🔐 Auth token present:', !!this.authToken);
      console.log('📊 Request params:', params);

      const response = await axios.post(url, null, {
        params,
        headers: {
          'authToken': this.authToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('✅ MessageCentral sendOTP success:', response.data);
      return {
        success: true,
        data: response.data,
        status: response.status
      };

    } catch (error) {
      console.error('❌ MessageCentral sendOTP error details:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Response Data:', error.response?.data);
      console.error('   Request URL:', error.config?.url);
      console.error('   Error Message:', error.message);

      if (error.response?.status === 401) {
        console.error('🚫 Authentication failed - check auth token validity and completeness');
        console.error('💡 Token should be a complete JWT starting with "eyJ..."');
      } else if (error.response?.status === 400) {
        console.error('⚠️ Bad request - check parameters and phone number format');
        // Handle specific Message Central error codes
        if (error.response?.data?.responseCode === 506) {
          console.error('📱 Request already exists - cannot send multiple OTPs to same number quickly');
          console.error('💡 Wait for current OTP to expire or use a different flow type');
        } else if (error.response?.data?.responseCode === 400) {
          console.error('📞 Invalid phone number or parameters');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🌐 Connection refused - check network connectivity');
      }

      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Validate OTP
   * @param {string} verificationId - Verification ID from sendOTP response
   * @param {string} code - OTP code entered by user
   * @param {string} flowType - 'SMS' or 'WHATSAPP' (default 'SMS')
   * @param {string} langid - Language ID (default 'en' for English)
   */
  async validateOTP(verificationId, code, flowType = 'SMS', langid = 'en') {
    try {
      // Check if credentials are configured
      if (!this.authToken) {
        console.error('❌ MessageCentral auth token not configured for validation');
        throw new Error('MessageCentral auth token not configured');
      }

      const url = `${this.baseUrl}/verification/v3/validateOtp`;

      const params = {
        verificationId,
        code,
        flowType: flowType.toUpperCase(),
        langid
      };

      console.log(`🔍 Validating OTP for verificationId: ${verificationId}`);
      console.log('🔗 Validation URL:', url);
      console.log('📊 Validation params:', { ...params, code: '***' }); // Hide OTP in logs

      const response = await axios.get(url, {
        params,
        headers: {
          'authToken': this.authToken
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('✅ MessageCentral validateOTP success:', response.data);
      return {
        success: true,
        data: response.data,
        status: response.status
      };

    } catch (error) {
      console.error('❌ MessageCentral validateOTP error details:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Response Data:', error.response?.data);
      console.error('   Request URL:', error.config?.url);
      console.error('   Error Message:', error.message);

      if (error.response?.status === 401) {
        console.error('🚫 Authentication failed - check auth token');
      } else if (error.response?.status === 400) {
        console.error('⚠️ Bad request - check verification ID and OTP code');
      }

      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Check service health
   */
  async healthCheck() {
    try {
      // Simple health check by making a test request
      const testResponse = await this.sendOTP('9999999999', 'SMS'); // Invalid number for health check

      // If we get any response (even error), service is up
      return {
        status: 'healthy',
        message: 'Message Central service is responding'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Message Central service is not responding',
        error: error.message
      };
    }
  }

  /**
   * Validate phone number format
   * @param {string} mobileNumber
   */
  validatePhoneNumber(mobileNumber) {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number validation
    return phoneRegex.test(mobileNumber);
  }

  /**
   * Validate OTP code format
   * @param {string} code
   */
  validateOTPCode(code) {
    const otpRegex = /^\d{4,6}$/; // 4-6 digit OTP
    return otpRegex.test(code);
  }
}

module.exports = new MessageCentralService();