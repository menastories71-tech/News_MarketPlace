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
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files (registration, tax, bank, passport, contact)
  }
});

class WebsiteController {
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
    body('location_type').isIn(['Global', 'Specific']).withMessage('Valid location type is required'),
    body('custom_location').custom((value, { req }) => {
      if (req.body.location_type === 'Specific') {
        return value && value.trim().length > 0;
      }
      return true; // Optional for Global
    }).withMessage('Country name is required when location type is Specific'),
    body('website_owner_name').trim().isLength({ min: 1 }).withMessage('Owner name is required'),
    body('website_owner_nationality').trim().isLength({ min: 1 }).withMessage('Owner nationality is required'),
    body('website_owner_gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid owner gender is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid owner email is required'),
    body('number').isLength({ min: 1 }).withMessage('Owner number is required'),
    body('terms_accepted').custom(value => value === true || value === 'true').withMessage('Terms must be accepted'),
    body('recaptchaToken').isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
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
    body('reason').optional().isLength({ min: 1 }).withMessage('Reason must be provided if specified')
  ];

  bulkDeleteValidation = [
    body('ids').isArray({ min: 1 }).withMessage('At least one ID required')
  ];

  // Generate OTP
  generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Submit website
  async submitWebsite(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify reCAPTCHA
      const recaptchaScore = await recaptchaService.verifyRecaptcha(req.body.recaptchaToken);
      if (recaptchaScore === null || recaptchaScore < 0.5) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }

      const websiteData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Handle file uploads to S3
      const uploadedFileUrls = {};
      if (req.files) {
        for (const fieldName of Object.keys(req.files)) {
          if (req.files[fieldName] && req.files[fieldName][0]) {
            const file = req.files[fieldName][0];
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

      // Map field names to database fields
      const fieldMappings = {
        'media_name': 'media_name',
        'media_website_address': 'media_website_address',
        'news_media_type': 'news_media_type',
        'languages': 'languages',
        'categories': 'categories',
        'location_type': 'location_type',
        'custom_location': 'country_name',
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
        'number': 'owner_number',
        'whatsapp': 'owner_whatsapp',
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

      // Add user information
      mappedData.submitted_by = userId;
      mappedData.status = 'pending';
      mappedData.captcha_response = websiteData.recaptchaToken;

      // Create website in database
      const website = await Website.create(mappedData);

      res.status(201).json({
        message: 'Website submitted successfully',
        website: website.toJSON()
      });
    } catch (error) {
      console.error('Website submission error:', error);
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

  // Verify OTP
  async verifyOtp(req, res) {
    try {
      const { type, otp, email } = req.body;

      if (!type || !otp || !email) {
        return res.status(400).json({ error: 'Type, OTP, and email are required' });
      }

      if (type !== 'email') {
        return res.status(400).json({ error: 'Only email OTP verification is supported' });
      }

      // Verify OTP from temp storage
      const otpData = global.tempOtps?.[email];
      if (!otpData) {
        return res.status(400).json({ error: 'No OTP found for this email. Please request a new OTP.' });
      }

      if (otpData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid email OTP. Please check and try again.' });
      }

      if (Date.now() > otpData.expiry) {
        delete global.tempOtps[email];
        return res.status(400).json({ error: 'Expired email OTP. Please request a new OTP.' });
      }

      // Clean up temp OTPs
      if (global.tempOtps) {
        delete global.tempOtps[email];
      }

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
  async getAll(req, res) {
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
  async getById(req, res) {
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
  async updateStatus(req, res) {
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

      // Send notification email
      try {
        const subject = status === 'approved' ? 'Website Submission Approved' : 'Website Submission Rejected';
        const statusMessage = status === 'approved' ? 'approved' : 'rejected';
        const reasonText = reason ? `\n\nReason: ${reason}` : '';

        await emailService.sendCustomEmail(
          website.owner_email,
          subject,
          `<p>Dear ${website.owner_name},</p>
          <p>Your website submission has been ${statusMessage}.${reasonText}</p>
          <p>Media Name: ${website.media_name}</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you for using News Marketplace!</p>`
        );
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
  async delete(req, res) {
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
  async bulkUpdateStatus(req, res) {
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
              submitted_by_admin: adminId,
              updated_at: new Date()
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
  async bulkDelete(req, res) {
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
}

module.exports = new WebsiteController();