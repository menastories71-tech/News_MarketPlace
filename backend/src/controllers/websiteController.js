const Website = require('../models/Website');
const User = require('../models/User');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const recaptchaService = require('../services/recaptchaService');
const { s3Service } = require('../services/s3Service');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { query } = require('../config/database');

// In-memory storage for pending website registrations
const pendingWebsites = new Map();

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
    fileSize: 10 * 1024 * 1024, // 10MB limit per file (before compression)
    files: 5 // Maximum 5 files (registration, tax, bank, passport, contact)
  }
});

class WebsiteController {
  // Compress file if it's too large
  compressFile = async (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB final limit
    const mimeType = file.mimetype.toLowerCase();

    // Only compress if file is larger than 8MB (leave some buffer)
    if (file.size <= 8 * 1024 * 1024) {
      return file;
    }

    try {
      if (mimeType.includes('image/') && mimeType !== 'image/gif') {
        // Compress images using sharp
        const compressedBuffer = await sharp(file.buffer)
          .jpeg({ quality: 80, progressive: true })
          .png({ quality: 80, compressionLevel: 8 })
          .webp({ quality: 80 })
          .toBuffer();

        // Check if compression helped
        if (compressedBuffer.length < file.size && compressedBuffer.length <= maxSize) {
          console.log(`Compressed ${file.originalname} from ${file.size} to ${compressedBuffer.length} bytes`);
          return {
            ...file,
            buffer: compressedBuffer,
            size: compressedBuffer.length
          };
        }
      }

      // If compression didn't help or file is not compressible, check if it's still too large
      if (file.size > maxSize) {
        throw new Error(`File ${file.originalname} is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB) even after compression. Maximum allowed size is 10MB.`);
      }

      return file;
    } catch (error) {
      console.error('Error compressing file:', error);
      // If compression fails, check if original file is within limits
      if (file.size > maxSize) {
        throw new Error(`File ${file.originalname} is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 10MB.`);
      }
      return file;
    }
  }

  // Validation rules for website submission
  submitValidation = [
    body('media_name').trim().isLength({ min: 1 }).withMessage('Media name is required'),
    body('media_website_address').isURL().withMessage('Valid media website address is required'),
    body('news_media_type').isIn(['Blog', 'Local news', 'News agency', 'News media', 'Just a website', 'Social media']).withMessage('Valid news media type is required'),
    body('languages').custom(value => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.length > 0;
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value) && value.length > 0;
    }).withMessage('At least one language is required'),
    body('categories').custom(value => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.length > 0;
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value) && value.length > 0;
    }).withMessage('At least one category is required'),
    body('location_type').isIn(['Global', 'Regional']).withMessage('Valid location type is required'),
    // Simplified location validation - we'll handle it in the controller
    body('selected_continent').optional(),
    body('selected_country').optional(),
    body('selected_state').optional(),
    body('website_owner_name').trim().isLength({ min: 1 }).withMessage('Owner name is required'),
    body('website_owner_nationality').trim().isLength({ min: 1 }).withMessage('Owner nationality is required'),
    body('website_owner_gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid owner gender is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid owner email is required'),
    body('callingNumber').isLength({ min: 1 }).withMessage('Phone number is required'),
    body('callingCountry').isLength({ min: 1 }).withMessage('Country code is required'),
    body('terms_accepted').custom(value => value === true || value === 'true').withMessage('Terms must be accepted'),
    body('recaptchaToken').optional().isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
  ];

  otpValidation = [
    body('submissionId').isLength({ min: 1 }).withMessage('Submission ID is required'),
    body('emailOtp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Email OTP must be 6 digits')
  ];

  updateStatusValidation = [
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Valid status required'),
    body('reason').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('Reason must be at least 1 character if provided')
  ];

  bulkUpdateStatusValidation = [
    body('ids').isArray({ min: 1 }).withMessage('At least one ID required'),
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Valid status required'),
    body('reason').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('Reason must be provided if specified')
  ];

  // Download CSV
  downloadCSV = async (req, res) => {
    try {
      const { status, search } = req.query;

      let whereClause = 'WHERE w.is_active = true';
      const params = [];
      let paramCount = 1;

      // Add status filter
      if (status && status !== 'all') {
        whereClause += ` AND w.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      // Add search filter
      if (search) {
        whereClause += ` AND (w.media_name ILIKE $${paramCount} OR w.owner_name ILIKE $${paramCount} OR w.owner_email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Get websites with user details
      const sqlQuery = `
        SELECT
          w.*,
          u.first_name,
          u.last_name,
          u.email as user_email
        FROM websites w
        LEFT JOIN users u ON w.submitted_by = u.id
        ${whereClause}
        ORDER BY w.created_at DESC
      `;

      const result = await query(sqlQuery, params);
      const websites = result.rows;

      const headers = [
        'ID', 'Media Name', 'Website Address', 'Type', 'Location Type', 'Continent', 'Country', 'State',
        'Owner Name', 'Owner Email', 'Owner Phone', 'Status', 'Submitted By', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      websites.forEach(website => {
        const escape = (text) => {
          if (text === null || text === undefined) return '';
          const stringValue = String(text);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const submittedBy = website.user_email ? `${website.first_name} ${website.last_name} (${website.user_email})` : 'N/A';
        const locationStr = website.location_type === 'Global' ? 'Global' :
          (website.location_type === 'Regional' ? `Regional` : website.country_name || 'N/A');

        // Parse JSON fields if they are strings (postgres might return them as objects automatically if jsonb, but let's be safe)
        // Actually, query returns objects for JSON/JSONB columns usually.
        // But for Arrays in text columns?
        // In the model they are parsed. Here we perform raw query.

        const continent = Array.isArray(website.selected_continent) ? website.selected_continent.join(';') : (website.selected_continent || '');
        const country = Array.isArray(website.selected_country) ? website.selected_country.join(';') : (website.selected_country || '');
        const state = Array.isArray(website.selected_state) ? website.selected_state.join(';') : (website.selected_state || '');

        const row = [
          website.id,
          escape(website.media_name),
          escape(website.media_website_address),
          escape(website.news_media_type),
          escape(website.location_type),
          escape(continent),
          escape(country),
          escape(state),
          escape(website.owner_name),
          escape(website.owner_email),
          escape(website.owner_number),
          escape(website.status),
          escape(submittedBy),
          website.created_at ? new Date(website.created_at).toISOString().split('T')[0] : ''
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=websites_export.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  bulkDeleteValidation = [
    body('ids').isArray({ min: 1 }).withMessage('At least one ID required')
  ];

  // Generate OTP
  generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Submit website
  submitWebsite = async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify reCAPTCHA (optional for now)
      if (req.body.recaptchaToken) {
        const recaptchaScore = await recaptchaService.verifyRecaptcha(req.body.recaptchaToken);
        if (recaptchaScore === null || recaptchaScore < 0.5) {
          console.warn('reCAPTCHA verification failed, but proceeding with submission');
          // Don't fail the request, just log the warning
        }
      } else {
        console.warn('No reCAPTCHA token provided, proceeding with submission');
      }

      const websiteData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Handle file uploads to S3 with compression
      const uploadedFileUrls = {};
      if (req.files) {
        for (const fieldName of Object.keys(req.files)) {
          if (req.files[fieldName] && req.files[fieldName][0]) {
            let file = req.files[fieldName][0];

            // Compress file if it's too large
            try {
              file = await this.compressFile(file);
            } catch (compressionError) {
              console.error(`File compression failed for ${fieldName}:`, compressionError);
              throw compressionError; // Re-throw to stop submission
            }

            const s3Key = s3Service.generateKey('websites', fieldName, file.originalname);
            const contentType = s3Service.getContentType(file.originalname);

            try {
              const s3Url = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
              uploadedFileUrls[fieldName] = s3Url;
            } catch (uploadError) {
              console.error(`Failed to upload ${fieldName} to S3:`, uploadError);
              throw new Error(`Failed to upload ${fieldName}`);
            }
          }
        }
      }

      // Map file fields to database fields
      const fileMappings = {
        'website_registration_document': 'registration_document',
        'tax_document': 'tax_document',
        'bank_details': 'bank_details_document',
        'owner_passport': 'passport_document',
        'general_contact_details': 'contact_details_document'
      };

      Object.keys(fileMappings).forEach(formField => {
        if (uploadedFileUrls[formField]) {
          websiteData[fileMappings[formField]] = uploadedFileUrls[formField];
        }
      });

      // Process array fields
      if (typeof websiteData.languages === 'string') {
        try {
          websiteData.languages = JSON.parse(websiteData.languages);
        } catch (e) {
          websiteData.languages = [websiteData.languages];
        }
      }

      if (typeof websiteData.categories === 'string') {
        try {
          websiteData.categories = JSON.parse(websiteData.categories);
        } catch (e) {
          websiteData.categories = [websiteData.categories];
        }
      }

      // Process location fields - handle based on location_type
      if (websiteData.location_type === 'Global') {
        // For Global, set location fields to null or empty arrays
        websiteData.selected_continent = [];
        websiteData.selected_country = [];
        websiteData.selected_state = [];
      } else if (websiteData.location_type === 'Regional') {
        // For Regional, process the arrays
        if (typeof websiteData.selected_continent === 'string') {
          try {
            websiteData.selected_continent = JSON.parse(websiteData.selected_continent);
          } catch (e) {
            websiteData.selected_continent = websiteData.selected_continent ? [websiteData.selected_continent] : [];
          }
        }

        if (typeof websiteData.selected_country === 'string') {
          try {
            websiteData.selected_country = JSON.parse(websiteData.selected_country);
          } catch (e) {
            websiteData.selected_country = websiteData.selected_country ? [websiteData.selected_country] : [];
          }
        }

        if (typeof websiteData.selected_state === 'string') {
          try {
            websiteData.selected_state = JSON.parse(websiteData.selected_state);
          } catch (e) {
            websiteData.selected_state = websiteData.selected_state ? [websiteData.selected_state] : [];
          }
        }

        // Ensure arrays are not null/undefined for Regional type
        websiteData.selected_continent = websiteData.selected_continent || [];
        websiteData.selected_country = websiteData.selected_country || [];
        websiteData.selected_state = websiteData.selected_state || [];

        // Validate that at least continent and country are selected for Regional
        if (websiteData.selected_continent.length === 0) {
          return res.status(400).json({
            error: 'Validation failed',
            details: [{ path: 'selected_continent', msg: 'At least one continent must be selected for Regional location type' }]
          });
        }

        if (websiteData.selected_country.length === 0) {
          return res.status(400).json({
            error: 'Validation failed',
            details: [{ path: 'selected_country', msg: 'At least one country must be selected for Regional location type' }]
          });
        }
      }

      console.log('Processed location data:', {
        location_type: websiteData.location_type,
        selected_continent: websiteData.selected_continent,
        selected_country: websiteData.selected_country,
        selected_state: websiteData.selected_state
      });

      // Convert boolean fields
      const booleanFields = [
        'social_media_embedded_allowed', 'social_media_url_in_article_allowed', 'external_website_link_allowed',
        'back_date_allowed', 'do_follow_link', 'disclaimer', 'listicle_allowed',
        'name_of_the_company_allowed_in_title', 'name_of_the_individual_allowed_in_title', 'sub_heading_sub_title_allowed', 'by_line_author_name_allowed',
        'will_article_be_placed_permanently', 'will_the_article_can_be_deleted_after_publishing_on_our_request', 'will_the_article_can_be_modified_after_publishing_on_our_request', 'terms_accepted'
      ];

      booleanFields.forEach(field => {
        if (websiteData[field] !== undefined) {
          websiteData[field] = websiteData[field] === 'true' || websiteData[field] === true;
        }
      });

      // Convert numeric fields
      const numericFields = ['no_of_images_allowed_in_article', 'words_limit', 'da', 'dr', 'pa', 'price'];
      numericFields.forEach(field => {
        if (websiteData[field] !== undefined && websiteData[field] !== '') {
          const num = parseFloat(websiteData[field]);
          websiteData[field] = isNaN(num) ? null : num;
        }
      });

      // Format phone numbers with country codes
      const formatPhoneNumber = (country, number) => {
        if (!country || !number) return '';
        try {
          // Import country phone data from the separate file
          const countryPhoneData = require('../data/countryPhoneData');
          const countryData = countryPhoneData[country];
          const trimmedNumber = number.toString().trim();
          return countryData ? `${countryData.code}${trimmedNumber}` : trimmedNumber;
        } catch (error) {
          console.error('Error formatting phone number:', error);
          return number; // Return original number if formatting fails
        }
      };

      // Map field names to database fields
      const fieldMappings = {
        'media_name': 'media_name',
        'media_website_address': 'media_website_address',
        'news_media_type': 'news_media_type',
        'languages': 'languages',
        'categories': 'categories',
        'location_type': 'location_type',
        'selected_continent': 'selected_continent',
        'selected_country': 'selected_country',
        'selected_state': 'selected_state',
        'instagram': 'ig',
        'facebook': 'facebook',
        'linkedin': 'linkedin',
        'tiktok': 'tiktok',
        'youtube': 'youtube',
        'snapchat': 'snapchat',
        'twitter': 'twitter',
        'social_media_embedded_allowed': 'social_media_embedded_allowed',
        'social_media_url_in_article_allowed': 'social_media_url_allowed',
        'external_website_link_allowed': 'external_website_link_allowed',
        'no_of_images_allowed_in_article': 'images_allowed',
        'words_limit': 'words_limit',
        'back_date_allowed': 'back_date_allowed',
        'da': 'da_score',
        'dr': 'dr_score',
        'pa': 'pa_score',
        'do_follow_link': 'do_follow_links',
        'disclaimer': 'disclaimer_required',
        'listicle_allowed': 'listicle_allowed',
        'turnaround_time': 'turnaround_time',
        'price': 'price',
        'name_of_the_company_allowed_in_title': 'company_name_in_title',
        'name_of_the_individual_allowed_in_title': 'individual_name_in_title',
        'sub_heading_sub_title_allowed': 'sub_heading_allowed',
        'by_line_author_name_allowed': 'by_line_allowed',
        'will_article_be_placed_permanently': 'permanent_placement',
        'will_the_article_can_be_deleted_after_publishing_on_our_request': 'deletion_allowed',
        'will_the_article_can_be_modified_after_publishing_on_our_request': 'modification_allowed',
        'website_owner_name': 'owner_name',
        'website_owner_nationality': 'owner_nationality',
        'website_owner_gender': 'owner_gender',
        'email': 'owner_email',
        'telegram': 'owner_telegram',
        'terms_accepted': 'terms_accepted',
        'how_did_you_hear': 'how_did_you_hear',
        'any_to_say': 'comments'
      };

      const mappedData = {};
      Object.keys(fieldMappings).forEach(formField => {
        if (websiteData[formField] !== undefined) {
          mappedData[fieldMappings[formField]] = websiteData[formField];
        }
      });

      // Handle phone number formatting - ensure both fields are present before formatting
      if (websiteData.callingNumber && websiteData.callingCountry) {
        mappedData.owner_number = formatPhoneNumber(websiteData.callingCountry, websiteData.callingNumber);
        console.log(`Formatted owner number: ${mappedData.owner_number}`);
      }
      if (websiteData.whatsappNumber && websiteData.whatsappCountry) {
        mappedData.owner_whatsapp = formatPhoneNumber(websiteData.whatsappCountry, websiteData.whatsappNumber);
        console.log(`Formatted WhatsApp number: ${mappedData.owner_whatsapp}`);
      }

      // Add user information
      mappedData.submitted_by = userId;
      mappedData.status = 'pending';
      mappedData.captcha_response = websiteData.recaptchaToken;

      // Create website in database
      const website = await Website.create(mappedData);

      // Send confirmation emails
      try {
        await this.sendWebsiteSubmissionConfirmationEmails(website, req);
      } catch (emailError) {
        console.error('Failed to send website submission confirmation emails:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        message: 'Website submitted successfully',
        website: website.toJSON()
      });
    } catch (error) {
      console.error('=== Website Submission Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== End Error Details ===');

      // Send more detailed error in development
      const isDevelopment = process.env.NODE_ENV === 'development';
      res.status(500).json({
        error: 'Internal server error',
        ...(isDevelopment && {
          details: error.message,
          stack: error.stack
        })
      });
    }
  }

  // Send individual OTP (only email OTP supported)
  sendOtp = async (req, res) => {
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

      // Store OTP in database instead of memory
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      const otpInsertQuery = `
        INSERT INTO otp_verifications (email, otp_code, expiry_time, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (email)
        DO UPDATE SET
          otp_code = EXCLUDED.otp_code,
          expiry_time = EXCLUDED.expiry_time,
          created_at = NOW()
      `;
      await query(otpInsertQuery, [email, otp, expiryTime]);

      res.json({ message: `${type} OTP sent successfully`, otp: otp });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  // Verify OTP
  verifyOtp = async (req, res) => {
    try {
      const { type, otp, email } = req.body;

      if (!type || !otp || !email) {
        return res.status(400).json({ error: 'Type, OTP, and email are required' });
      }

      if (type !== 'email') {
        return res.status(400).json({ error: 'Only email OTP verification is supported' });
      }

      // Verify OTP from database
      const otpSelectQuery = `
        SELECT otp_code, expiry_time
        FROM otp_verifications
        WHERE email = $1 AND expiry_time > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const otpResult = await query(otpSelectQuery, [email]);

      if (otpResult.rows.length === 0) {
        return res.status(400).json({ error: 'No OTP found for this email. Please request a new OTP.' });
      }

      const otpData = otpResult.rows[0];

      if (otpData.otp_code !== otp) {
        return res.status(400).json({ error: 'Invalid email OTP. Please check and try again.' });
      }

      // Clean up used OTP
      const otpDeleteQuery = `DELETE FROM otp_verifications WHERE email = $1`;
      await query(otpDeleteQuery, [email]);

      res.json({
        message: `${type} verified successfully`,
        fullyVerified: true
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all websites (admin only)
  getAll = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE w.is_active = true';
      const params = [];
      let paramCount = 1;

      // Add status filter
      if (status && status !== 'all') {
        whereClause += ` AND w.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      // Add search filter
      if (search) {
        whereClause += ` AND (w.media_name ILIKE $${paramCount} OR w.owner_name ILIKE $${paramCount} OR w.owner_email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM websites w
        LEFT JOIN users u ON w.submitted_by = u.id
        ${whereClause}
      `;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get websites with user details
      const sqlQuery = `
        SELECT
          w.*,
          u.first_name,
          u.last_name,
          u.email as user_email
        FROM websites w
        LEFT JOIN users u ON w.submitted_by = u.id
        ${whereClause}
        ORDER BY w.${sortBy} ${sortOrder}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      params.push(limit, offset);

      const result = await query(sqlQuery, params);
      const websites = result.rows.map(row => ({
        ...row,
        user: {
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.user_email
        }
      }));

      res.json({
        websites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all websites error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get website by ID
  getById = async (req, res) => {
    try {
      const { id } = req.params;

      const sqlQuery = `
        SELECT
          w.*,
          u.first_name,
          u.last_name,
          u.email as user_email
        FROM websites w
        LEFT JOIN users u ON w.submitted_by = u.id
        WHERE w.id = $1 AND w.is_active = true
      `;

      const result = await query(sqlQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Website not found' });
      }

      const website = result.rows[0];
      const websiteWithUser = {
        ...website,
        user: {
          first_name: website.first_name,
          last_name: website.last_name,
          email: website.user_email
        }
      };

      res.json({ website: websiteWithUser });
    } catch (error) {
      console.error('Get website by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update website status (admin only)
  updateStatus = async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { status, reason } = req.body;
      const adminId = req.admin?.adminId;

      if (!id || !status) {
        return res.status(400).json({ error: 'Website ID and status are required' });
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' });
      }

      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({ error: 'Website not found' });
      }

      // Update status
      await website.update({
        status,
        submitted_by_admin: adminId
      });

      // Send approval/rejection notification email
      try {
        if (status === 'approved') {
          await this.sendWebsiteApprovalNotificationEmail(website, req);
        } else if (status === 'rejected') {
          await this.sendWebsiteRejectionNotificationEmail(website, reason, req);
        }
      } catch (emailError) {
        console.error('Status notification email failed:', emailError);
      }

      res.json({
        message: 'Website status updated successfully',
        website: website.toJSON()
      });
    } catch (error) {
      console.error('Update website status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete website (soft delete)
  delete = async (req, res) => {
    try {
      const { id } = req.params;

      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({ error: 'Website not found' });
      }

      // Delete associated files from S3
      const fileFields = [
        'registration_document',
        'tax_document',
        'bank_details_document',
        'passport_document',
        'contact_details_document'
      ];

      for (const field of fileFields) {
        if (website[field]) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(website[field]);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error(`Failed to delete ${field} from S3:`, deleteError);
            // Continue with other deletions even if one fails
          }
        }
      }

      await website.update({ is_active: false });

      res.json({ message: 'Website deleted successfully' });
    } catch (error) {
      console.error('Delete website error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update status (admin only)
  bulkUpdateStatus = async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { ids, status, reason } = req.body;
      const adminId = req.admin?.adminId;

      if (!Array.isArray(ids) || ids.length === 0 || !status) {
        return res.status(400).json({ error: 'Website IDs array and status are required' });
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' });
      }

      const updatePromises = ids.map(async (id) => {
        try {
          const website = await Website.findById(id);
          if (website) {
            await website.update({
              status,
              submitted_by_admin: adminId
            });
            return { id, success: true };
          }
          return { id, success: false, error: 'Website not found' };
        } catch (error) {
          return { id, success: false, error: error.message };
        }
      });

      const results = await Promise.all(updatePromises);

      // Send bulk notification emails
      const successfulIds = results.filter(r => r.success).map(r => r.id);
      if (successfulIds.length > 0) {
        try {
          const websites = await query(
            `SELECT owner_email, owner_name, media_name FROM websites WHERE id = ANY($1)`,
            [successfulIds]
          );

          const subject = status === 'approved' ? 'Website Submission Approved' : 'Website Submission Rejected';
          const statusMessage = status === 'approved' ? 'approved' : 'rejected';
          const reasonText = reason ? `\n\nReason: ${reason}` : '';

          for (const website of websites.rows) {
            await emailService.sendCustomEmail(
              website.owner_email,
              subject,
              `<p>Dear ${website.owner_name},</p>
              <p>Your website submission has been ${statusMessage}.${reasonText}</p>
              <p>Media Name: ${website.media_name}</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>Thank you for using News Marketplace!</p>`
            );
          }
        } catch (emailError) {
          console.error('Bulk status notification emails failed:', emailError);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      res.json({
        message: `Bulk status update completed. ${successCount} successful, ${failureCount} failed.`,
        results
      });
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete websites (admin only)
  bulkDelete = async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Website IDs array is required' });
      }

      const updatePromises = ids.map(async (id) => {
        try {
          const website = await Website.findById(id);
          if (website) {
            // Delete associated files from S3
            const fileFields = [
              'registration_document',
              'tax_document',
              'bank_details_document',
              'passport_document',
              'contact_details_document'
            ];

            for (const field of fileFields) {
              if (website[field]) {
                try {
                  const s3Key = s3Service.extractKeyFromUrl(website[field]);
                  if (s3Key) {
                    await s3Service.deleteFile(s3Key);
                  }
                } catch (deleteError) {
                  console.error(`Failed to delete ${field} from S3 for website ${id}:`, deleteError);
                  // Continue with other deletions even if one fails
                }
              }
            }

            await website.update({ is_active: false });
            return { id, success: true };
          }
          return { id, success: false, error: 'Website not found' };
        } catch (error) {
          return { id, success: false, error: error.message };
        }
      });

      const results = await Promise.all(updatePromises);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      res.json({
        message: `Bulk delete completed. ${successCount} successful, ${failureCount} failed.`,
        results
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send website submission confirmation emails
  sendWebsiteSubmissionConfirmationEmails = async (website, req) => {
    try {
      // Get user information
      const user = await website.getUser();
      let userEmail = user?.email;

      const teamEmail = 'menastories71@gmail.com';

      // Email to team (always send)
      const teamSubject = 'New Website Submission - News Marketplace';
      const teamHtmlContent = this.generateTeamWebsiteNotificationEmailTemplate(website, user);

      await emailService.sendCustomEmail(teamEmail, teamSubject, teamHtmlContent);

      // Email to user (only if user exists)
      if (userEmail) {
        const userSubject = 'Website Submission Received - News Marketplace';
        const userHtmlContent = this.generateWebsiteSubmissionConfirmationEmailTemplate(website, user);

        await emailService.sendCustomEmail(userEmail, userSubject, userHtmlContent);
        console.log('Website submission confirmation emails sent successfully');
      } else {
        console.warn('No user email found for website submission confirmation email - team notification sent only');
      }
    } catch (error) {
      console.error('Error sending website submission confirmation emails:', error);
      throw error;
    }
  }

  // Send website approval notification email
  sendWebsiteApprovalNotificationEmail = async (website, req) => {
    try {
      let userEmail = website.owner_email;

      if (!userEmail) {
        console.warn('No user email found for website approval notification email');
        return;
      }

      const subject = 'Website Submission Approved! - News Marketplace';
      const htmlContent = this.generateWebsiteApprovalEmailTemplate(website);

      await emailService.sendCustomEmail(userEmail, subject, htmlContent);
      console.log('Website approval notification email sent successfully');
    } catch (error) {
      console.error('Error sending website approval notification email:', error);
      throw error;
    }
  }

  // Send website rejection notification email
  sendWebsiteRejectionNotificationEmail = async (website, reason, req) => {
    try {
      let userEmail = website.owner_email;

      if (!userEmail) {
        console.warn('No user email found for website rejection notification email');
        return;
      }

      const subject = 'Website Submission Update - News Marketplace';
      const htmlContent = this.generateWebsiteRejectionEmailTemplate(website, reason);

      await emailService.sendCustomEmail(userEmail, subject, htmlContent);
      console.log('Website rejection notification email sent successfully');
    } catch (error) {
      console.error('Error sending website rejection notification email:', error);
      throw error;
    }
  }

  // Generate website submission confirmation email template for user
  generateWebsiteSubmissionConfirmationEmailTemplate(website, user) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌐 Website Submission Received</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name || 'User'}!</h2>
              <p>Thank you for submitting your website to News Marketplace. Your submission has been received and is now under review.</p>

              <div class="submission-details">
                <h3>Submission Details:</h3>
                <p><strong>Media Name:</strong> ${website.media_name}</p>
                <p><strong>Website Address:</strong> ${website.media_website_address}</p>
                <p><strong>Media Type:</strong> ${website.news_media_type}</p>
                <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Pending Review</span></p>
                <p><strong>Submitted on:</strong> ${new Date(website.created_at).toLocaleDateString()}</p>
                ${website.registration_document ? '<p><strong>Documents:</strong> Included</p>' : ''}
              </div>

              <p>You will receive an email notification once your submission has been reviewed. This process typically takes 2-3 business days.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate team website notification email template
  generateTeamWebsiteNotificationEmailTemplate(website, user) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .user-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 New Website Submission</h1>
            </div>
            <div class="content">
              <p>A new website submission has been received and requires review.</p>

              <div class="submission-details">
                <h3>Website Details:</h3>
                <p><strong>Media Name:</strong> ${website.media_name}</p>
                <p><strong>Website Address:</strong> ${website.media_website_address}</p>
                <p><strong>Media Type:</strong> ${website.news_media_type}</p>
                <p><strong>Location Type:</strong> ${website.location_type}</p>
                <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Pending Review</span></p>
                <p><strong>Submitted on:</strong> ${new Date(website.created_at).toLocaleDateString()}</p>
                ${website.registration_document ? '<p><strong>Documents:</strong> Yes</p>' : '<p><strong>Documents:</strong> No</p>'}
              </div>

              <div class="user-details">
                <h3>Owner Details:</h3>
                <p><strong>Name:</strong> ${website.owner_name}</p>
                <p><strong>Email:</strong> ${website.owner_email}</p>
                <p><strong>Phone:</strong> ${website.owner_number || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> ${website.owner_whatsapp || 'N/A'}</p>
                ${user ? `<p><strong>User Account:</strong> ${user.first_name} ${user.last_name} (${user.email})</p>` : ''}
              </div>

              <p>Please review this submission in the admin panel and take appropriate action.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate website approval email template
  generateWebsiteApprovalEmailTemplate(website) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Website Submission Approved!</h1>
            </div>
            <div class="content">
              <h2>Hello ${website.owner_name}!</h2>
              <p>Great news! Your website submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="submission-details">
                <h3>Approved Website Details:</h3>
                <p><strong>Media Name:</strong> ${website.media_name}</p>
                <p><strong>Website Address:</strong> ${website.media_website_address}</p>
                <p><strong>Media Type:</strong> ${website.news_media_type}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your website is now live on our platform and available for publication. You can view your approved websites in your dashboard.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate website rejection email template
  generateWebsiteRejectionEmailTemplate(website, reason) {
    const reasonText = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Website Submission Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${website.owner_name},</h2>
              <p>Thank you for submitting your website to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="submission-details">
                <h3>Submission Details:</h3>
                <p><strong>Media Name:</strong> ${website.media_name}</p>
                <p><strong>Website Address:</strong> ${website.media_website_address}</p>
                <p><strong>Media Type:</strong> ${website.news_media_type}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
                <p><strong>Reviewed on:</strong> ${new Date().toLocaleDateString()}</p>
                ${reasonText}
              </div>

              <p>You can edit and resubmit your website after addressing any issues. We're here to help you improve your submission!</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
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

module.exports = new WebsiteController();