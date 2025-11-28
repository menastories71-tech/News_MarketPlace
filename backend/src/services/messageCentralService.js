const axios = require('axios');

class MessageCentralService {
  constructor() {
    this.baseUrl = process.env.MESSAGECENTRAL_BASE_URL || 'https://cpaas.messagecentral.com';
    this.customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
    this.authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;
  }

  /**
   * Send OTP to a mobile number
   * @param {string} mobileNumber - 10-digit mobile number
   * @param {string} flowType - 'SMS' or 'WHATSAPP'
   * @param {string} countryCode - Default '91' for India
   */
  async sendOTP(mobileNumber, flowType = 'SMS', countryCode = '91') {
    try {
      // Check if credentials are configured
      if (!this.customerId || !this.authToken) {
        console.error('❌ MessageCentral credentials not configured:');
        console.error('   Customer ID:', this.customerId ? '✅ SET' : '❌ MISSING');
        console.error('   Auth Token:', this.authToken ? '✅ SET' : '❌ MISSING');
        console.error('   Base URL:', this.baseUrl);
        throw new Error('MessageCentral credentials not configured');
      }

      const url = `${this.baseUrl}/verification/v3/send`;

      const params = {
        countryCode,
        customerId: this.customerId,
        flowType: flowType.toUpperCase(),
        mobileNumber
      };

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
   * @param {string} mobileNumber - 10-digit mobile number
   * @param {string} verificationId - Verification ID from sendOTP response
   * @param {string} code - OTP code entered by user
   * @param {string} countryCode - Default '91' for India
   */
  async validateOTP(mobileNumber, verificationId, code, countryCode = '91') {
    try {
      // Check if credentials are configured
      if (!this.customerId || !this.authToken) {
        console.error('❌ MessageCentral credentials not configured for validation');
        throw new Error('MessageCentral credentials not configured');
      }

      const url = `${this.baseUrl}/verification/v3/validateOtp`;

      const params = {
        countryCode,
        mobileNumber,
        verificationId,
        customerId: this.customerId,
        code
      };

      console.log(`🔍 Validating OTP for ${mobileNumber}`);
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