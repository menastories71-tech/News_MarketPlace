require('dotenv').config();
const emailService = require('./services/emailService');

async function testPowerlistNominationEmail() {
  try {
    console.log('Testing powerlist nomination email...');

    // Test user confirmation email
    const userEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976D2;">News Marketplace</h1>
        <h2>Nomination Submitted Successfully</h2>
        <p>Dear Test User,</p>
        <p>Thank you for submitting your nomination for Test Publication in the Test Powerlist powerlist.</p>
        <p>Your nomination has been received and will be reviewed by our team. We do not ensure or authorize to add this in publication.</p>
        <p>You will receive an email notification once your nomination has been processed.</p>
        <p>Best regards,<br>The News Marketplace Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">&copy; 2024 News Marketplace. All rights reserved.</p>
      </div>
    `;

    await emailService.sendCustomEmail(
      'test@example.com',
      'Nomination Submission Confirmation',
      userEmailTemplate
    );

    // Test admin notification email
    const adminEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF9800;">New Nomination Submission</h1>
        <h2>New Nomination Received</h2>
        <p><strong>Publication:</strong> Test Publication</p>
        <p><strong>Power List:</strong> Test Powerlist</p>
        <p><strong>Full Name:</strong> Test User</p>
        <p><strong>Email:</strong> test@example.com</p>
        <p><strong>Phone:</strong> 1234567890</p>
        <p><strong>Additional Message:</strong> Test message</p>
        <p>Please review this nomination in the admin panel.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">&copy; 2024 News Marketplace. All rights reserved.</p>
      </div>
    `;

    await emailService.sendCustomEmail(
      'menastories71@gmail.com',
      'New Powerlist Nomination Submission',
      adminEmailTemplate
    );

    console.log('Powerlist nomination emails sent successfully!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPowerlistNominationEmail();