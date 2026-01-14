const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const twilio = require('twilio');
const crypto = require('crypto');
const pool = require('../config/database');
const { verifyRecaptcha } = require('../services/recaptchaService');

// Twilio configuration
const twilioClient = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email OTP
async function sendEmailOTP(email, otp) {
  try {
    // Use the email service
    const emailService = require('../services/emailService');
    await emailService.sendOTP(email, otp, 'contact_form');
    return true;
  } catch (error) {
    console.error('Email service failed:', error);

    // Fallback: Development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`DEVELOPMENT MODE - Email OTP for ${email}: ${otp}`);
      return true;
    }

    throw new Error('Failed to send email OTP. Please try again.');
  }
}

// Send WhatsApp OTP
async function sendWhatsAppOTP(phoneNumber, otp) {
  // Format phone number (ensure it starts with +)
  let formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  try {
    // Use Twilio template for WhatsApp message with the new template ID
    const message = await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      contentVariables: JSON.stringify({
        "1": otp
      }),
      to: `whatsapp:${formattedNumber}`
    });

    console.log(`WhatsApp OTP sent successfully to ${formattedNumber}:`, message.sid);
    return true;
  } catch (error) {
    console.error('WhatsApp sending failed:', error);

    // Fallback: Try sending without template if template fails
    try {
      const fallbackMessage = await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedNumber}`,
        body: `Your OTP for News Marketplace contact form verification is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.`
      });

      console.log(`WhatsApp OTP sent via fallback to ${formattedNumber}:`, fallbackMessage.sid);
      return true;
    } catch (fallbackError) {
      console.error('WhatsApp fallback also failed:', fallbackError);

      // Final fallback: Log OTP for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`DEVELOPMENT MODE - WhatsApp OTP for ${phoneNumber}: ${otp}`);
        return true;
      }

      throw new Error('Failed to send WhatsApp OTP. Please try again.');
    }
  }
}

// Send OTP endpoint
router.post('/send-otp', [
  body('type').isIn(['email', 'whatsapp']).withMessage('Invalid type'),
  body('value').notEmpty().withMessage('Value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, value } = req.body;
    const otp = generateOTP();
    const key = `${type}:${value}`;
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(key, { otp, expiresAt });

    // Send OTP based on type
    if (type === 'email') {
      await sendEmailOTP(value, otp);
      console.log(`OTP sent to email ${value}: ${otp}`); // Log for development
    } else if (type === 'whatsapp') {
      await sendWhatsAppOTP(value, otp);
      console.log(`OTP sent to WhatsApp ${value}: ${otp}`); // Log for development
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', [
  body('type').isIn(['email', 'whatsapp']).withMessage('Invalid type'),
  body('value').notEmpty().withMessage('Value is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, value, otp } = req.body;
    const key = `${type}:${value}`;
    const storedData = otpStore.get(key);

    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified successfully
    otpStore.delete(key);
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Submit contact form
router.post('/submit', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('number').isMobilePhone().withMessage('Invalid phone number'),
  body('email').isEmail().withMessage('Invalid email'),
  body('whatsapp').isMobilePhone().withMessage('Invalid WhatsApp number'),
  body('query').notEmpty().withMessage('Query type is required'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters'),
  body('termsAccepted').isBoolean().equals('true').withMessage('Terms must be accepted')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, gender, number, email, whatsapp, query,
      companyName, companyWebsite, companySocialMedia,
      individualLinkedin, individualInstagram, howDidYouHear, message, recaptchaToken
    } = req.body;

    // Verify reCAPTCHA if token is provided
    if (recaptchaToken) {
      const recaptchaScore = await verifyRecaptcha(recaptchaToken, process.env.RECAPTCHA_SECRET_KEY);

      if (recaptchaScore === null || recaptchaScore < 0.5) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
    }

    // Insert into database
    const queryText = `
      INSERT INTO contacts (
        name, gender, number, email, whatsapp, query_type,
        company_name, company_website, company_social_media,
        individual_linkedin, individual_instagram, how_did_you_hear,
        message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id
    `;

    const values = [
      name, gender, number, email, whatsapp, query,
      companyName || null, companyWebsite || null, companySocialMedia || null,
      individualLinkedin || null, individualInstagram || null, howDidYouHear || null, message
    ];

    const result = await pool.query(queryText, values);

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contactId: result.rows[0].id
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Download CSV endpoint (admin only)
router.get('/download-csv', async (req, res) => {
  try {
    const queryText = `
      SELECT * FROM contacts
      ORDER BY created_at DESC
    `;

    const result = await pool.query(queryText);

    // Define headers matching the schema and frontend view
    const headers = [
      'ID', 'Name', 'Email', 'Number', 'WhatsApp', 'Gender',
      'Query Type', 'Message', 'Company Name', 'Company Website',
      'Status', 'Priority', 'Created At'
    ];

    // Create CSV string
    let csv = headers.join(',') + '\n';

    result.rows.forEach(row => {
      // Helper to escape CSV fields
      const escape = (text) => {
        if (text === null || text === undefined) return '';
        const stringValue = String(text);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const line = [
        row.id,
        escape(row.name),
        escape(row.email),
        escape(row.number),
        escape(row.whatsapp),
        escape(row.gender),
        escape(row.query_type),
        escape(row.message),
        escape(row.company_name),
        escape(row.company_website),
        escape(row.status),
        escape(row.priority),
        escape(new Date(row.created_at).toISOString().split('T')[0])
      ].join(',');

      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts_export.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Download CSV error:', error);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

// Get all contacts (admin only)
router.get('/', async (req, res) => {
  try {
    const queryText = `
      SELECT * FROM contacts
      ORDER BY created_at DESC
    `;

    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contact by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'SELECT * FROM contacts WHERE id = $1';

    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

module.exports = router;