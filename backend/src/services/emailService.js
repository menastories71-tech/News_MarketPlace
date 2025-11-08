const SibApiV3Sdk = require('@getbrevo/brevo');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.fromEmail = process.env.BREVO_FROM_EMAIL;
    this.fromName = process.env.BREVO_FROM_NAME;

    if (this.apiKey) {
      try {
        // Initialize the API instance directly without ApiClient.instance
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        
        // Set API key directly on the instance
        this.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, this.apiKey);
        
        console.log('Brevo API initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Brevo API client:', error.message);
        this.apiInstance = null;
      }
    } else {
      console.warn('Brevo API key not configured');
      this.apiInstance = null;
    }
  }

  // Send OTP email
  async sendOTP(email, otp, type = 'verification') {
    if (!this.apiInstance) {
      console.warn('Brevo API not initialized. Using development mode.');
      console.log(`DEVELOPMENT MODE - Email OTP for ${email}: ${otp}`);
      return true;
    }

    const subject = type === 'registration'
      ? 'Verify Your News Marketplace Account'
      : type === 'password_reset'
      ? 'Password Reset Verification Code'
      : type === 'contact_form'
      ? 'Contact Form OTP Verification'
      : 'Login Verification Code';

    const htmlContent = this.generateOTPTemplate(otp, type);

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { 
        name: this.fromName || 'News Marketplace', 
        email: this.fromEmail || 'madhavarora132005@gmail.com'
      };
      sendSmtpEmail.to = [{ email: email }];
      sendSmtpEmail.replyTo = { 
        email: this.fromEmail || 'madhavarora132005@gmail.com', 
        name: this.fromName || 'News Marketplace'
      };

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('OTP email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`DEVELOPMENT MODE - Email OTP for ${email}: ${otp}`);
        return true;
      }
      
      throw new Error('Failed to send OTP email');
    }
  }

  // Send password reset email
  async sendPasswordReset(email, resetToken) {
    if (!this.apiInstance) {
      console.warn('Brevo API not initialized. Using development mode.');
      return true;
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const htmlContent = this.generatePasswordResetTemplate(resetUrl);

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = 'Reset Your News Marketplace Password';
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { 
        name: this.fromName || 'News Marketplace', 
        email: this.fromEmail || 'madhavarora132005@gmail.com'
      };
      sendSmtpEmail.to = [{ email: email }];
      sendSmtpEmail.replyTo = { 
        email: this.fromEmail || 'madhavarora132005@gmail.com', 
        name: this.fromName || 'News Marketplace'
      };

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Password reset email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`DEVELOPMENT MODE - Password reset email for ${email}`);
        return true;
      }
      
      throw new Error('Failed to send password reset email');
    }
  }

  // Send welcome email
  async sendWelcome(email, firstName) {
    if (!this.apiInstance) {
      console.warn('Brevo API not initialized. Using development mode.');
      return true;
    }

    const htmlContent = this.generateWelcomeTemplate(firstName);

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = 'Welcome to News Marketplace!';
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { 
        name: this.fromName || 'News Marketplace', 
        email: this.fromEmail || 'madhavarora132005@gmail.com'
      };
      sendSmtpEmail.to = [{ email: email }];
      sendSmtpEmail.replyTo = { 
        email: this.fromEmail || 'madhavarora132005@gmail.com', 
        name: this.fromName || 'News Marketplace'
      };

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Welcome email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`DEVELOPMENT MODE - Welcome email for ${email}`);
        return true;
      }
      
      throw new Error('Failed to send welcome email');
    }
  }

  // Generate OTP email template
  generateOTPTemplate(otp, type) {
    const action = type === 'registration'
      ? 'complete your registration'
      : type === 'password_reset'
      ? 'reset your password'
      : type === 'contact_form'
      ? 'verify your contact form submission'
      : 'log in to your account';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #1976D2; text-align: center; margin: 20px 0; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Use the following code to ${action}:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate password reset email template
  generatePasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested a password reset for your News Marketplace account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>This link will expire in 30 minutes.</p>
              <p>If you didn't request this reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate welcome email template
  generateWelcomeTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to News Marketplace!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Thank you for joining News Marketplace. Your account has been successfully verified.</p>
              <p>You can now:</p>
              <ul>
                <li>Browse and purchase premium articles</li>
                <li>Create and publish your own content</li>
                <li>Access exclusive news and insights</li>
                <li>Connect with other writers and readers</li>
              </ul>
              <p>Get started by exploring our latest articles and publications.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new EmailService();