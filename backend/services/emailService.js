require('dotenv').config();
const SibApiV3Sdk = require('@getbrevo/brevo');

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API key from environment variables
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  console.log('Brevo API key configured successfully');
} else {
  console.warn('BREVO_API_KEY not found in environment variables');
}

// Create transporter function for Brevo
const createTransporter = () => {
  return {
    sendMail: async (mailOptions) => {
      try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = mailOptions.subject;
        sendSmtpEmail.htmlContent = mailOptions.html;
        sendSmtpEmail.sender = {
          name: process.env.BREVO_FROM_NAME || 'News Marketplace',
          email: process.env.BREVO_FROM_EMAIL || 'noreply@newsmarketplace.com'
        };
        sendSmtpEmail.to = [{ email: mailOptions.to }];

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('📧 Email sent via Brevo:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          messageId: result.messageId
        });
        return { messageId: result.messageId };
      } catch (error) {
        console.error('❌ Error sending email via Brevo:', error.message);
        throw error;
      }
    }
  };
};

const transporter = createTransporter();

// Send custom email
const sendCustomEmail = async (to, subject, html) => {
  try {
    console.log('📧 Attempting to send email to:', to, 'Subject:', subject);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@newsmarketplace.com',
      to,
      subject,
      html
    };

    console.log('📧 Mail options:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from,
      htmlLength: mailOptions.html ? mailOptions.html.length : 0
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to, 'Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending email to:', to, 'Error:', error.message);
    if (error.response) {
      console.error('❌ Brevo response:', error.response.body);
    }
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to News Marketplace!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976D2;">Welcome to News Marketplace!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for joining News Marketplace. We're excited to have you as part of our community!</p>
      <p>Best regards,<br>News Marketplace Team</p>
    </div>
  `;

  return sendCustomEmail(to, subject, html);
};

// Send password reset email
const sendPasswordResetEmail = async (to, resetToken) => {
  const subject = 'Password Reset - News Marketplace';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976D2;">Password Reset Request</h2>
      <p>You requested a password reset for your News Marketplace account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #1976D2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br>News Marketplace Team</p>
    </div>
  `;

  return sendCustomEmail(to, subject, html);
};

module.exports = {
  sendCustomEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};