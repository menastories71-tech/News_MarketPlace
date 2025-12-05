require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testRadioEmails() {
  try {
    console.log('Testing radio order email functionality...');

    // Test user status update email
    console.log('Testing user status update email...');
    const userResult = await emailService.sendCustomEmail(
      'test@example.com',
      'Radio Interview Booking Approved - News Marketplace',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #4CAF50DD 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Radio Interview Booking Approved</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Status Update</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #212121; margin: 0 0 20px 0; font-size: 24px;">Dear Test User,</h2>

            <div style="background: #E8F5E8; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #4CAF50; font-weight: 600; margin: 0 0 10px 0; font-size: 18px;">
                Your radio interview booking request has been approved
              </p>
              <p style="color: #212121; margin: 0; font-size: 16px;">
                Radio Station: <strong>Test Radio</strong>
              </p>
            </div>

            <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 18px;">🎉 Congratulations!</h3>
              <p style="color: #212121; margin: 0; line-height: 1.6;">
                Your radio interview booking request has been accepted! Our team will be in touch with you shortly
                to schedule the interview and discuss the details. Thank you for your interest in our radio programs.
              </p>
            </div>

            <p style="color: #212121; font-size: 16px; margin: 30px 0 0 0;">
              Best regards,<br>
              <strong style="color: #1976D2;">The News Marketplace Team</strong>
            </p>
          </div>
          <div style="background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
            <p style="font-size: 12px; color: #BDBDBD; margin: 0;">
              &copy; 2024 News Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      `
    );
    console.log('User email result:', userResult);

    // Test admin status update email
    console.log('Testing admin status update email...');
    const adminResult = await emailService.sendCustomEmail(
      process.env.ADMIN_EMAIL || 'admin@newsmarketplace.com',
      'Radio Order Status Updated - Approved',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Radio Booking Status Updated</h1>
            <p style="color: #FFF3E0; margin: 8px 0 0 0; font-size: 16px;">Status Change Notification</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #FF9800; margin: 0 0 20px 0; font-size: 24px;">Radio Interview Booking Approved</h2>

            <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #E0E0E0;">
                  <td style="padding: 8px 0; color: #757575; font-weight: 600;">Radio Station:</td>
                  <td style="padding: 8px 0; color: #212121;"><strong>Test Radio</strong></td>
                </tr>
                <tr style="border-bottom: 1px solid #E0E0E0;">
                  <td style="padding: 8px 0; color: #757575; font-weight: 600;">Order ID:</td>
                  <td style="padding: 8px 0; color: #212121;">123</td>
                </tr>
                <tr style="border-bottom: 1px solid #E0E0E0;">
                  <td style="padding: 8px 0; color: #757575; font-weight: 600;">Full Name:</td>
                  <td style="padding: 8px 0; color: #212121;">Test User</td>
                </tr>
                <tr style="border-bottom: 1px solid #E0E0E0;">
                  <td style="padding: 8px 0; color: #757575; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #212121;">test@example.com</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #757575; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: #FFF3E0; color: #FF9800; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      Approved
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #757575; margin-bottom: 15px;">The status of this radio booking has been updated.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/radio-orders"
                 style="background: #1976D2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
          </div>
          <div style="background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
            <p style="font-size: 12px; color: #BDBDBD; margin: 0;">
              &copy; 2024 News Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      `
    );
    console.log('Admin email result:', adminResult);

    console.log('✅ Radio email test completed successfully');

  } catch (error) {
    console.error('❌ Radio email test failed:', error.message);
  }
}

testRadioEmails();