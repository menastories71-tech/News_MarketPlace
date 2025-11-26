require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  try {
    console.log('Testing email service...');

    // Test OTP email
    const result = await emailService.sendOTP('test@example.com', '123456', 'login');
    console.log('Test completed:', result);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEmail();