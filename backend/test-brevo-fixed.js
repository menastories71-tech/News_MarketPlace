const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();

console.log('Testing Brevo implementation...');

async function testBrevoAPI() {
  try {
    // Initialize API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Set API key
    if (process.env.BREVO_API_KEY) {
      apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
      console.log('API key set successfully');
      
      // Test sending an email
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = "Test Email from News Marketplace";
      sendSmtpEmail.htmlContent = "<p>This is a test email to verify Brevo integration.</p>";
      sendSmtpEmail.sender = { 
        name: 'News Marketplace Test', 
        email: process.env.BREVO_FROM_EMAIL || 'madhavarora132005@gmail.com'
      };
      sendSmtpEmail.to = [{ email: 'madhavarora132005@gmail.com' }];

      console.log('Attempting to send test email...');
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Test email sent successfully:', result.messageId);
      
    } else {
      console.log('No API key found, but initialization successful');
    }
    
  } catch (error) {
    console.error('Error testing Brevo API:', error.message);
    if (error.response && error.response.body) {
      console.error('Response body:', error.response.body);
    }
  }
}

testBrevoAPI();
