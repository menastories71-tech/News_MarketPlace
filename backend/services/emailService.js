const nodemailer = require('nodemailer');

// Create transporter (configure based on your email service)
const createTransporter = () => {
  // For development, we'll use a console logger
  // In production, configure with actual SMTP settings
  return {
    sendMail: async (mailOptions) => {
      console.log('📧 Email would be sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html ? 'HTML content included' : 'No HTML content'
      });
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

// Send custom email
const sendCustomEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@newsmarketplace.com',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
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