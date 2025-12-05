const Agency = require('../models/Agency');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const { s3Service } = require('../services/s3Service');
const { verifyRecaptcha } = require('../services/recaptchaService');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Removed pending agencies storage as agencies are created immediately

// Configure multer for file uploads (using memory storage for S3)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allow common document and image types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

class AgencyController {
  // Validation rules for agency registration
  registerValidation = [
    body('agency_name').trim().isLength({ min: 1 }).withMessage('Agency name is required'),
    body('agency_country').trim().isLength({ min: 1 }).withMessage('Agency country is required'),
    body('agency_city').trim().isLength({ min: 1 }).withMessage('Agency city is required'),
    body('agency_email').isEmail().normalizeEmail().withMessage('Valid agency email is required'),
    body('agency_owner_name').trim().isLength({ min: 1 }).withMessage('Agency owner name is required'),
    body('agency_owner_email').isEmail().normalizeEmail().withMessage('Valid owner email is required'),
    body('agency_founded_year').isInt({ min: 1950, max: 2026 }).withMessage('Valid founded year between 1950-2026 is required'),
    body('agency_website').optional().isURL().withMessage('Valid website URL is required'),
    body('agency_ig').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('agency_linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('agency_facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('recaptchaToken').optional().isLength({ min: 1 }).withMessage('reCAPTCHA token is required'),
  ];

  otpValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('emailOtp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Email OTP must be 6 digits'),
    body('phoneOtp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Phone OTP must be 6 digits'),
    body('whatsappOtp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('WhatsApp OTP must be 6 digits'),
  ];

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Upload single file to S3
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { fieldName } = req.body;
      if (!fieldName) {
        return res.status(400).json({ error: 'Field name is required' });
      }

      console.log(`Uploading file for field: ${fieldName}, size: ${req.file.size}`);

      const s3Key = s3Service.generateKey('agencies', fieldName, req.file.originalname);
      const contentType = s3Service.getContentType(req.file.originalname);

      const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);

      console.log(`Successfully uploaded ${fieldName} to S3: ${s3Url}`);

      res.json({
        success: true,
        url: s3Url,
        fieldName: fieldName
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  // Register agency
  async registerAgency(req, res) {
    try {
      console.log('Agency registration request received');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          message: 'Please check your input and try again.'
        });
      }

      console.log('Validation passed');

      // Verify reCAPTCHA
      // Temporarily disabled for testing
      // const recaptchaScore = await verifyRecaptcha(req.body.recaptchaToken, process.env.RECAPTCHA_SECRET_KEY);
      // if (recaptchaScore === null || recaptchaScore < 0.5) {
      //   return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      // }

      const agencyData = req.body;
      console.log('Processing agency data');

      // Parse numeric fields
      if (agencyData.agency_founded_year) {
        agencyData.agency_founded_year = parseInt(agencyData.agency_founded_year, 10);
        console.log('Parsed founded year:', agencyData.agency_founded_year);
      }

      console.log('Files should already be uploaded to S3');

      // Map file URL fields to database fields (URLs are already provided in request body)
      const fileMappings = {
        'company_incorporation_trade_license': 'agency_document_incorporation_trade_license',
        'tax_registration_document': 'agency_document_tax_registration',
        'agency_bank_details': 'agency_bank_details',
        'agency_owner_passport': 'agency_owner_passport',
        'agency_owner_photo': 'agency_owner_photo'
      };

      Object.keys(fileMappings).forEach(formField => {
        if (agencyData[formField]) {
          agencyData[fileMappings[formField]] = agencyData[formField];
          delete agencyData[formField];
        }
      });

      // Map form fields to database fields
      const fieldMappings = {
        'how_did_you_hear': 'how_did_you_hear_about_us'
      };

      Object.keys(fieldMappings).forEach(formField => {
        if (agencyData[formField]) {
          agencyData[fieldMappings[formField]] = agencyData[formField];
          delete agencyData[formField];
        }
      });

      // Remove recaptchaToken from data as it's not stored
      delete agencyData.recaptchaToken;

      // Check if agency with this email already exists
      console.log('Checking for existing agency with email:', agencyData.agency_email);
      const existingAgency = await Agency.findAll().then(agencies =>
        agencies.find(agency => agency.agency_email === agencyData.agency_email)
      );
      if (existingAgency) {
        console.log('Agency with this email already exists');
        return res.status(400).json({
          error: 'Agency with this email already exists',
          message: 'An agency with this email address is already registered.'
        });
      }

      console.log('Creating agency in database');
      // Create agency in database
      const agency = await Agency.create(agencyData);
      console.log('Agency created successfully with ID:', agency.id);

      res.status(201).json({
        message: 'Agency registered successfully',
        agency: agency.toJSON()
      });
    } catch (error) {
      console.error('Agency registration error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message || 'An unexpected error occurred during registration.'
      });
    }
  }

  // Verify individual OTP
  async verifyOtp(req, res) {
    try {
      const { type, otp, email, phone, whatsapp } = req.body;

      if (!type || !otp) {
        return res.status(400).json({ error: 'Type and OTP are required' });
      }

      // Get the contact info based on type
      const contactInfo = type === 'email' ? email : (type === 'phone' ? phone : whatsapp);

      if (!contactInfo) {
        return res.status(400).json({ error: `${type} contact information is required for verification` });
      }

      // Verify the specific OTP from temp storage
      console.log(`Verifying ${type} OTP for ${contactInfo}`);
      console.log('Stored OTPs keys:', Object.keys(global.tempOtps || {}));
      const otpData = global.tempOtps?.[contactInfo];
      console.log('OTP data found:', !!otpData);
      console.log('Received OTP:', otp);
      console.log('Stored OTP:', otpData?.otp);
      console.log('OTP expired?', Date.now() > (otpData?.expiry || 0));

      if (!otpData) {
        console.log('No OTP data found for contact:', contactInfo);
        return res.status(400).json({ error: `No OTP found for ${type}. Please request a new OTP.` });
      }

      if (otpData.otp !== otp) {
        console.log('OTP mismatch:', otpData.otp, '!==', otp);
        return res.status(400).json({ error: `Invalid ${type} OTP. Please check and try again.` });
      }

      if (Date.now() > otpData.expiry) {
        console.log('OTP expired');
        // Clean up expired OTP
        delete global.tempOtps[contactInfo];
        return res.status(400).json({ error: `Expired ${type} OTP. Please request a new OTP.` });
      }

      // Clean up temp OTPs
      delete global.tempOtps[contactInfo];

      // Return success for OTP verification
      res.json({
        message: `${type} verified successfully`,
        fullyVerified: true
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Send individual OTP (only email OTP supported)
  async sendOtp(req, res) {
    try {
      const { type, email } = req.body;
      
      if (type !== 'email') {
        return res.status(400).json({ error: 'Only email OTP is supported' });
      }
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generated ${type} OTP: ${otp}`);

      await otpService.sendEmailOtp(email, otp);
      // Store OTP temporarily
      if (!global.tempOtps) global.tempOtps = {};
      global.tempOtps[email] = { otp, expiry: Date.now() + 10 * 60 * 1000 };

      res.json({ message: `${type} OTP sent successfully`, otp: otp });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  // Resend OTP
  async resendOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Regenerate OTP
      const emailOtp = this.generateOTP();
      console.log(`Regenerated email OTP: ${emailOtp}`);

      // Send OTP
      await otpService.sendEmailOtp(email, emailOtp);

      // Store OTP temporarily
      if (!global.tempOtps) global.tempOtps = {};
      global.tempOtps[email] = { otp: emailOtp, expiry: Date.now() + 10 * 60 * 1000 };

      res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all agencies with filtering and pagination (admin only)
  async getAllAgencies(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        agency_name
      } = req.query;

      const filters = {};
      if (status) filters.status = status;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (agency_name) {
        searchSql += ` AND agency_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${agency_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const agencies = await Agency.findAll(filters, searchSql, searchValues, limit, offset);

      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM agencies WHERE 1=1';
      const countValues = [];
      let countParamCount = 1;

      if (filters.status) {
        countSql += ` AND status = $${countParamCount}`;
        countValues.push(filters.status);
        countParamCount++;
      }

      if (agency_name) {
        countSql += ` AND agency_name ILIKE $${countParamCount}`;
        countValues.push(`%${agency_name}%`);
        countParamCount++;
      }

      const countResult = await require('../config/database').query(countSql, countValues);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        agencies: agencies.map(agency => agency.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total
        }
      });
    } catch (error) {
      console.error('Get all agencies error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update agency status (admin only)
  async updateAgencyStatus(req, res) {
    try {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Agency ID and status are required' });
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' });
      }

      const agency = await Agency.findById(id);
      if (!agency) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      await agency.update({ status });

      // Send email notification
      try {
        let subject, htmlContent;
        if (status === 'approved') {
          subject = 'Agency Registration Approved';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Agency Registration Approved</h2>
              <p>Dear ${agency.agency_owner_name},</p>
              <p>Congratulations! Your agency "${agency.agency_name}" has been approved.</p>
              <p>You can now access all agency features on our platform.</p>
              <p>Best regards,<br>News Marketplace Team</p>
            </div>
          `;
        } else if (status === 'rejected') {
          subject = 'Agency Registration Update';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Agency Registration Update</h2>
              <p>Dear ${agency.agency_owner_name},</p>
              <p>We regret to inform you that your agency "${agency.agency_name}" registration has been rejected.</p>
              <p>Please contact our support team for more information.</p>
              <p>Best regards,<br>News Marketplace Team</p>
            </div>
          `;
        }

        if (subject && htmlContent) {
          await emailService.sendCustomEmail(agency.agency_email, subject, htmlContent);
        }
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        message: 'Agency status updated successfully',
        agency: agency.toJSON()
      });
    } catch (error) {
      console.error('Update agency status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AgencyController();