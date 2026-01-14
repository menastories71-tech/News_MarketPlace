const Reporter = require('../models/Reporter');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const { body, validationResult } = require('express-validator');

class ReporterController {
  constructor() {
    const multer = require('multer');
    this.storage = multer.memoryStorage();
    this.csvUpload = multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'));
        }
      }
    });

    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.bulkUpload = this.bulkUpload.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getMyReporters = this.getMyReporters.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.approveReporter = this.approveReporter.bind(this);
    this.rejectReporter = this.rejectReporter.bind(this);
    this.bulkApprove = this.bulkApprove.bind(this);
    this.bulkReject = this.bulkReject.bind(this);
    this.sendApprovalNotification = this.sendApprovalNotification.bind(this);
    this.sendRejectionNotification = this.sendRejectionNotification.bind(this);
  }

  // Validation rules
  createValidation = [
    body('function_department').isIn(['Commercial', 'Procurement', 'Publishing', 'Marketing', 'Accounts and Finance']).withMessage('Invalid function department'),
    body('position').isIn(['Journalist', 'Reporter', 'Contributor', 'Staff']).withMessage('Invalid position'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('terms_accepted').isBoolean().custom(val => val === true).withMessage('Terms must be accepted'),
    body('website_url').optional().isURL().withMessage('Valid website URL is required'),
    body('linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('instagram').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('minimum_expectation_usd').optional().isFloat({ min: 0 }).withMessage('Minimum expectation must be a positive number'),
    body('articles_per_month').optional().isInt({ min: 0 }).withMessage('Articles per month must be a non-negative integer'),
    body('whatsapp').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid WhatsApp number format'),
  ];

  updateValidation = [
    body('function_department').optional().isIn(['Commercial', 'Procurement', 'Publishing', 'Marketing', 'Accounts and Finance']).withMessage('Invalid function department'),
    body('position').optional().isIn(['Journalist', 'Reporter', 'Contributor', 'Staff']).withMessage('Invalid position'),
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('terms_accepted').optional().isBoolean().withMessage('Terms accepted must be boolean'),
    body('website_url').optional().isURL().withMessage('Valid website URL is required'),
    body('linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('instagram').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('minimum_expectation_usd').optional().isFloat({ min: 0 }).withMessage('Minimum expectation must be a positive number'),
    body('articles_per_month').optional().isInt({ min: 0 }).withMessage('Articles per month must be a non-negative integer'),
    body('whatsapp').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid WhatsApp number format'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Create a new reporter submission
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify reCAPTCHA for user submissions
      if (req.user && req.body.recaptchaToken) {
        const recaptchaScore = await verifyRecaptcha(req.body.recaptchaToken);
        if (recaptchaScore === null || recaptchaScore < 0.5) {
          return res.status(400).json({
            error: 'reCAPTCHA verification failed',
            message: 'Please complete the reCAPTCHA verification'
          });
        }
      }

      // Check if email already exists for a different user (for user submissions)
      const existingReporter = await Reporter.findByEmail(req.body.email);
      if (existingReporter && (!req.user || existingReporter.submitted_by !== req.user.userId)) {
        return res.status(400).json({
          error: 'Email already registered',
          message: 'A reporter with this email already exists'
        });
      }

      const reporterData = {
        ...req.body,
        submitted_by: req.user?.userId,
        submitted_by_admin: req.admin?.adminId,
        // User submissions are always pending status initially
        status: req.user ? 'pending' : (req.body.status || 'pending')
      };

      // Remove recaptchaToken from data before saving
      delete reporterData.recaptchaToken;

      const reporter = await Reporter.create(reporterData);
      res.status(201).json({
        message: req.user ? 'Reporter profile submitted successfully and is pending review' : 'Reporter profile created successfully',
        reporter: reporter.toJSON()
      });
    } catch (error) {
      console.error('Create reporter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all reporters with filtering and pagination
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        function_department,
        position,
        is_active,
        name,
        email,
        publication_name,
        publication_industry,
        publication_location,
        niche_industry,
        show_deleted = 'false'
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (function_department) filters.function_department = function_department;
      if (position) filters.position = position;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // For regular users, only show their own submissions
      if (req.user && !req.admin) {
        // This endpoint should not be accessible to regular users for listing all
        // They should use getMyReporters instead
        return res.status(403).json({ error: 'Access denied' });
      } else if (req.admin) {
        // For admins, show all by default
        if (show_deleted !== 'true') {
          filters.is_active = true;
        }
      }

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND r.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND r.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (publication_name) {
        searchSql += ` AND r.publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      if (publication_industry) {
        searchSql += ` AND r.publication_industry ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_industry}%`);
        searchParamCount++;
      }

      if (publication_location) {
        searchSql += ` AND r.publication_location ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_location}%`);
        searchParamCount++;
      }

      if (niche_industry) {
        searchSql += ` AND r.niche_industry ILIKE $${searchParamCount}`;
        searchValues.push(`%${niche_industry}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      let reporters;

      if (req.admin && show_deleted === 'true') {
        reporters = await Reporter.getDeleted(filters, searchSql, searchValues, limit, offset);
      } else {
        reporters = await Reporter.findAll(filters, searchSql, searchValues, limit, offset);
      }

      const total = await Reporter.getCount(filters, searchSql, searchValues);

      res.json({
        reporters: reporters.map(rep => rep.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get reporters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's own reporter submissions
  async getMyReporters(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        publication_name,
        date_from,
        date_to
      } = req.query;

      const filters = { submitted_by: req.user.userId };
      if (status) filters.status = status;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = 1;

      if (publication_name) {
        searchSql += ` AND r.publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      if (date_from) {
        searchSql += ` AND r.created_at >= $${searchParamCount}`;
        searchValues.push(date_from);
        searchParamCount++;
      }

      if (date_to) {
        // Add one day to include the end date
        const endDate = new Date(date_to);
        endDate.setDate(endDate.getDate() + 1);
        searchSql += ` AND r.created_at < $${searchParamCount}`;
        searchValues.push(endDate.toISOString().split('T')[0]);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const reporters = await Reporter.findByUserIdWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await Reporter.getUserCount(req.user.userId, filters, searchSql, searchValues);

      res.json({
        reporters: reporters.map(rep => rep.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get my reporters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get reporter by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const reporter = await Reporter.findById(id);

      if (!reporter) {
        return res.status(404).json({ error: 'Reporter not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        // Users can only view their own submissions
        if (reporter.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json({ reporter: reporter.toJSON() });
    } catch (error) {
      console.error('Get reporter by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update reporter
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const reporter = await Reporter.findById(id);

      if (!reporter) {
        return res.status(404).json({ error: 'Reporter not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        // Users can only update their own pending submissions
        if (reporter.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (reporter.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot update approved or rejected submissions' });
        }
      }

      const updatedReporter = await reporter.update(req.body);
      res.json({
        message: 'Reporter profile updated successfully',
        reporter: updatedReporter.toJSON()
      });
    } catch (error) {
      console.error('Update reporter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete reporter (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const reporter = await Reporter.findById(id);

      if (!reporter) {
        return res.status(404).json({ error: 'Reporter not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        // Users can only delete their own pending submissions
        if (reporter.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (reporter.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot delete approved or rejected submissions' });
        }
      }

      await reporter.delete();
      res.json({ message: 'Reporter profile deleted successfully' });
    } catch (error) {
      console.error('Delete reporter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve reporter
  async approveReporter(req, res) {
    try {
      const { id } = req.params;
      const admin_comments = req.body?.admin_comments;

      const reporter = await Reporter.findById(id);
      if (!reporter) {
        return res.status(404).json({ error: 'Reporter not found' });
      }

      if (reporter.status === 'approved') {
        return res.status(400).json({ error: 'Reporter is already approved' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const updateData = {
        status: 'approved',
        approved_at: new Date(),
        approved_by: adminId,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
        admin_comments: admin_comments || null
      };

      const updatedReporter = await reporter.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: reporter.submitted_by,
          type: 'reporter_approved',
          title: 'Reporter Profile Approved!',
          message: `Your reporter profile for "${reporter.name}" has been approved and is now live on our platform.`,
          related_id: reporter.id
        });
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }

      // Send approval email notification
      try {
        await this.sendApprovalNotification(updatedReporter);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Log email failure but don't fail the approval process
        try {
          await UserNotification.create({
            user_id: reporter.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email confirmation for your approved reporter profile. Please check your notifications for details.',
            related_id: reporter.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Reporter profile approved successfully',
        reporter: updatedReporter.toJSON()
      });
    } catch (error) {
      console.error('Approve reporter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject reporter
  async rejectReporter(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason, admin_comments } = req.body;

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const reporter = await Reporter.findById(id);
      if (!reporter) {
        return res.status(404).json({ error: 'Reporter not found' });
      }

      if (reporter.status === 'rejected') {
        return res.status(400).json({ error: 'Reporter is already rejected' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const updateData = {
        status: 'rejected',
        rejected_at: new Date(),
        rejected_by: adminId,
        rejection_reason: rejection_reason.trim(),
        approved_at: null,
        approved_by: null,
        admin_comments: admin_comments || null
      };

      const updatedReporter = await reporter.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: reporter.submitted_by,
          type: 'reporter_rejected',
          title: 'Reporter Profile Review Update',
          message: `Your reporter profile for "${reporter.name}" has been reviewed. Please check your email for details.`,
          related_id: reporter.id
        });
      } catch (notificationError) {
        console.error('Failed to create rejection notification:', notificationError);
      }

      // Send rejection email notification
      try {
        await this.sendRejectionNotification(updatedReporter);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Log email failure but don't fail the rejection process
        try {
          await UserNotification.create({
            user_id: reporter.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email about your reporter profile review. Please check your notifications for the rejection details.',
            related_id: reporter.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Reporter profile rejected successfully',
        reporter: updatedReporter.toJSON()
      });
    } catch (error) {
      console.error('Reject reporter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk approve reporters
  async bulkApprove(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      // Admin verification
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const approvedReporters = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const reporter = await Reporter.findById(ids[i]);

          if (!reporter) {
            errors.push({ index: i, error: 'Reporter not found' });
            continue;
          }

          if (reporter.status === 'approved') {
            errors.push({ index: i, error: 'Reporter is already approved' });
            continue;
          }

          const updateData = {
            status: 'approved',
            approved_at: new Date(),
            approved_by: adminId,
            rejected_at: null,
            rejected_by: null,
            rejection_reason: null
          };

          const updatedReporter = await reporter.update(updateData);
          approvedReporters.push(updatedReporter.toJSON());

          // Send notifications (simplified for bulk operations)
          try {
            await UserNotification.create({
              user_id: reporter.submitted_by,
              type: 'reporter_approved',
              title: 'Reporter Profile Approved!',
              message: `Your reporter profile for "${reporter.name}" has been approved.`,
              related_id: reporter.id
            });
          } catch (notificationError) {
            console.error('Failed to create approval notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Approved ${approvedReporters.length} reporter profiles successfully`,
        approved: approvedReporters.length,
        errors: errors.length,
        approvedReporters: approvedReporters,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk approve reporters error:', error);
      res.status(500).json({ error: `Bulk approve failed: ${error.message}` });
    }
  }

  // Bulk reject reporters
  async bulkReject(req, res) {
    try {
      const { ids, rejection_reason, admin_comments } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      // Admin verification
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const rejectedReporters = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const reporter = await Reporter.findById(ids[i]);

          if (!reporter) {
            errors.push({ index: i, error: 'Reporter not found' });
            continue;
          }

          if (reporter.status === 'rejected') {
            errors.push({ index: i, error: 'Reporter is already rejected' });
            continue;
          }

          const updateData = {
            status: 'rejected',
            rejected_at: new Date(),
            rejected_by: adminId,
            rejection_reason: rejection_reason.trim(),
            approved_at: null,
            approved_by: null,
            admin_comments: admin_comments || null
          };

          const updatedReporter = await reporter.update(updateData);
          rejectedReporters.push(updatedReporter.toJSON());

          // Send notifications (simplified for bulk operations)
          try {
            await UserNotification.create({
              user_id: reporter.submitted_by,
              type: 'reporter_rejected',
              title: 'Reporter Profile Review Update',
              message: `Your reporter profile for "${reporter.name}" has been reviewed.`,
              related_id: reporter.id
            });
          } catch (notificationError) {
            console.error('Failed to create rejection notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Rejected ${rejectedReporters.length} reporter profiles successfully`,
        rejected: rejectedReporters.length,
        errors: errors.length,
        rejectedReporters: rejectedReporters,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk reject reporters error:', error);
      res.status(500).json({ error: `Bulk reject failed: ${error.message}` });
    }
  }

  // Download CSV Template
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'Name', 'Email', 'Publication Name', 'Publication Location',
        'Function Department', 'Position', 'Website URL', 'LinkedIn',
        'Instagram', 'Facebook', 'WhatsApp', 'Minimum Expectation USD',
        'Articles Per Month'
      ];

      const csv = headers.join(',') + '\n' +
        'John Doe,john@example.com,Global News,New York,' +
        'Publishing,Journalist,https://example.com,https://linkedin.com/in/johndoe,' +
        'https://instagram.com/johndoe,https://facebook.com/johndoe,+1234567890,100,5';

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=reporter_template.csv');
      res.send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk Upload
  async bulkUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV file' });
      }

      const csvParser = require('csv-parser');
      const { Readable } = require('stream');

      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const createdReporters = [];
            const errors = [];
            const validDepartments = ['Commercial', 'Procurement', 'Publishing', 'Marketing', 'Accounts and Finance'];
            const validPositions = ['Journalist', 'Reporter', 'Contributor', 'Staff'];

            for (const [index, row] of results.entries()) {
              try {
                // Map CSV fields to Reporter model fields
                const name = row['Name'] || row['name'];
                const email = row['Email'] || row['email'];
                const function_department = row['Function Department'] || row['function_department'];
                const position = row['Position'] || row['position'];

                if (!name || !email) {
                  throw new Error('Name and Email are required');
                }

                if (function_department && !validDepartments.includes(function_department)) {
                  throw new Error(`Invalid function department. Must be one of: ${validDepartments.join(', ')}`);
                }

                if (position && !validPositions.includes(position)) {
                  throw new Error(`Invalid position. Must be one of: ${validPositions.join(', ')}`);
                }

                // Check if email exists
                const existingReporter = await Reporter.findByEmail(email);
                if (existingReporter) {
                  throw new Error(`Reporter with email ${email} already exists`);
                }

                const reporterData = {
                  name,
                  email,
                  publication_name: row['Publication Name'] || row['publication_name'] || '',
                  publication_location: row['Publication Location'] || row['publication_location'] || '',
                  function_department: function_department || 'Publishing',
                  position: position || 'Reporter',
                  website_url: row['Website URL'] || row['website_url'] || null,
                  linkedin: row['LinkedIn'] || row['linkedin'] || null,
                  instagram: row['Instagram'] || row['instagram'] || null,
                  facebook: row['Facebook'] || row['facebook'] || null,
                  whatsapp: row['WhatsApp'] || row['whatsapp'] || null,
                  minimum_expectation_usd: parseFloat(row['Minimum Expectation USD'] || row['minimum_expectation_usd'] || '0'),
                  articles_per_month: parseInt(row['Articles Per Month'] || row['articles_per_month'] || '0'),
                  terms_accepted: true,
                  submitted_by: req.user?.userId,
                  submitted_by_admin: req.admin?.adminId,
                  status: 'approved' // Bulk upload by admin is auto-approved
                };

                const newReporter = await Reporter.create(reporterData);
                createdReporters.push(newReporter);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdReporters.length} reporters created.`,
              count: createdReporters.length,
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (error) {
            console.error('Processing batch error:', error);
            res.status(500).json({ error: 'Error processing bulk upload' });
          }
        });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download CSV
  async downloadCSV(req, res) {
    try {
      const {
        status,
        function_department,
        position,
        is_active,
        name,
        email,
        publication_name,
        publication_location,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (function_department) filters.function_department = function_department;
      if (position) filters.position = position;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // Handle search functionality
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND r.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND r.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (publication_name) {
        searchSql += ` AND r.publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      if (publication_location) {
        searchSql += ` AND r.publication_location ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_location}%`);
        searchParamCount++;
      }

      // Use the findAll method without limit/offset to get all matching
      // Note: Assuming Reporter.findAll supports null limit to return all
      // If not, we pass a very large number
      const reporters = await Reporter.findAll(filters, searchSql, searchValues, 100000, 0);

      // In-memory sort
      reporters.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (valA === null) valA = '';
        if (valB === null) valB = '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder.toUpperCase() === 'ASC' ? -1 : 1;
        if (valA > valB) return sortOrder.toUpperCase() === 'ASC' ? 1 : -1;
        return 0;
      });

      const headers = [
        'ID', 'Name', 'Email', 'Publication Name', 'Publication Location',
        'Function Department', 'Position', 'Website', 'LinkedIn', 'Instagram',
        'Facebook', 'WhatsApp', 'Status', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      reporters.forEach(reporter => {
        const escape = (text) => {
          if (text === null || text === undefined) return '';
          const stringValue = String(text);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const row = [
          reporter.id,
          escape(reporter.name),
          escape(reporter.email),
          escape(reporter.publication_name),
          escape(reporter.publication_location),
          escape(reporter.function_department),
          escape(reporter.position),
          escape(reporter.website_url),
          escape(reporter.linkedin),
          escape(reporter.instagram),
          escape(reporter.facebook),
          escape(reporter.whatsapp),
          escape(reporter.status),
          reporter.created_at ? new Date(reporter.created_at).toISOString().split('T')[0] : ''
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporters_export_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send approval notification email
  sendApprovalNotification = async (reporter) => {
    try {
      const user = await User.findById(reporter.submitted_by);
      if (!user) {
        console.warn('User not found for reporter approval notification');
        return;
      }

      const subject = 'Your Reporter Profile Has Been Approved!';
      const htmlContent = this.generateApprovalEmailTemplate(reporter, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }

  // Send rejection notification email
  sendRejectionNotification = async (reporter) => {
    try {
      const user = await User.findById(reporter.submitted_by);
      if (!user) {
        console.warn('User not found for reporter rejection notification');
        return;
      }

      const subject = 'Reporter Profile Submission Update';
      const htmlContent = this.generateRejectionEmailTemplate(reporter, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      throw error;
    }
  }

  // Generate approval email template
  generateApprovalEmailTemplate(reporter, user) {
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
            .status-image { text-align: center; margin: 20px 0; }
            .reporter-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Reporter Profile Approved!</h1>
            </div>
            <div class="content">
              <div class="status-image">
                <img src="https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=APPROVED" alt="Approved" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid #4CAF50;" />
              </div>
              <h2>Hello ${user.first_name}!</h2>
              <p>Great news! Your reporter profile submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="reporter-details">
                <h3>Reporter Details:</h3>
                <p><strong>Name:</strong> ${reporter.name}</p>
                <p><strong>Position:</strong> ${reporter.position}</p>
                <p><strong>Function Department:</strong> ${reporter.function_department}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your reporter profile is now live on our platform and available for potential collaborations.</p>
              <p>You can view your approved profiles in your dashboard.</p>

              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate rejection email template
  generateRejectionEmailTemplate(reporter, user) {
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
            .status-image { text-align: center; margin: 20px 0; }
            .reporter-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .rejection-reason { background: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reporter Profile Review Update</h1>
            </div>
            <div class="content">
              <div class="status-image">
                <img src="https://via.placeholder.com/150x150/F44336/FFFFFF?text=REJECTED" alt="Rejected" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid #F44336;" />
              </div>
              <h2>Hello ${user.first_name},</h2>
              <p>Thank you for submitting your reporter profile to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="reporter-details">
                <h3>Reporter Details:</h3>
                <p><strong>Name:</strong> ${reporter.name}</p>
                <p><strong>Position:</strong> ${reporter.position}</p>
                <p><strong>Function Department:</strong> ${reporter.function_department}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
              </div>

              ${reporter.rejection_reason ? `
              <div class="rejection-reason">
                <h4>Reason for Rejection:</h4>
                <p>${reporter.rejection_reason}</p>
              </div>
              ` : ''}

              <p>You can edit and resubmit your reporter profile after addressing the issues mentioned above. We're here to help you improve your submission!</p>

              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
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

module.exports = new ReporterController();