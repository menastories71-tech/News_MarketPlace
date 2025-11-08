const fetch = require('node-fetch');

/**
 * Verify reCAPTCHA token using Google's standard reCAPTCHA v3 API
 * Since your site key is not an Enterprise key, we'll use the standard API
 * but still use the Enterprise frontend script for the user experience
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} secretKey - The secret key for verification (from .env)
 * @returns {Promise<number|null>} - Returns score (0.0 to 1.0) or null if invalid
 */
async function verifyRecaptcha(token, secretKey = process.env.RECAPTCHA_SECRET_KEY) {
  if (!token) {
    console.log('No reCAPTCHA token provided');
    return null;
  }

  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured');
    return 0.5; // Allow in development mode
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (data.success) {
      // For reCAPTCHA v2, we don't get a score, just success/failure
      // Return a high score for successful verification
      return data.score || 0.9;
    } else {
      console.log('reCAPTCHA verification failed:', data['error-codes']);
      return 0;
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return null;
  }
}

module.exports = {
  verifyRecaptcha
};