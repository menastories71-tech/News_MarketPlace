const Theme = require('../models/Theme');
const BulkOperations = require('../utils/bulkOperations');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const { body, validationResult } = require('express-validator');

class ThemeController {
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
  }

  // Validation rules
  createValidation = [
    body('platform').trim().isLength({ min: 1 }).withMessage('Platform is required'),
    body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('page_name').trim().isLength({ min: 1 }).withMessage('Page name is required'),
    body('no_of_followers').isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('collaboration').trim().isLength({ min: 1 }).withMessage('Collaboration is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
    body('price_reel_without_tagging_collaboration').isFloat({ min: 0 }).withMessage('Price reel without tagging collaboration must be a positive number'),
    body('price_reel_with_tagging_collaboration').isFloat({ min: 0 }).withMessage('Price reel with tagging collaboration must be a positive number'),
    body('price_reel_with_tagging').isFloat({ min: 0 }).withMessage('Price reel with tagging must be a positive number'),
    body('video_minute_allowed').isInt({ min: 0 }).withMessage('Video minute allowed must be a non-negative integer'),
    body('pin_post_charges_week').isFloat({ min: 0 }).withMessage('Pin post charges week must be a positive number'),
    body('story_charges').isFloat({ min: 0 }).withMessage('Story charges must be a positive number'),
    body('story_with_reel_charges').isFloat({ min: 0 }).withMessage('Story with reel charges must be a positive number'),
    body('page_website').optional({ checkFalsy: true }).isURL().withMessage('Valid page website URL is required'),
  ];

  updateValidation = [
    body('platform').optional().trim().isLength({ min: 1 }).withMessage('Platform is required'),
    body('username').optional().trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('page_name').optional().trim().isLength({ min: 1 }).withMessage('Page name is required'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('collaboration').optional().trim().isLength({ min: 1 }).withMessage('Collaboration is required'),
    body('category').optional().trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('location').optional().trim().isLength({ min: 1 }).withMessage('Location is required'),
    body('price_reel_without_tagging_collaboration').optional().isFloat({ min: 0 }).withMessage('Price reel without tagging collaboration must be a positive number'),
    body('price_reel_with_tagging_collaboration').optional().isFloat({ min: 0 }).withMessage('Price reel with tagging collaboration must be a positive number'),
    body('price_reel_with_tagging').optional().isFloat({ min: 0 }).withMessage('Price reel with tagging must be a positive number'),
    body('video_minute_allowed').optional().isInt({ min: 0 }).withMessage('Video minute allowed must be a non-negative integer'),
    body('pin_post_charges_week').optional().isFloat({ min: 0 }).withMessage('Pin post charges week must be a positive number'),
    body('story_charges').optional().isFloat({ min: 0 }).withMessage('Story charges must be a positive number'),
    body('story_with_reel_charges').optional().isFloat({ min: 0 }).withMessage('Story with reel charges must be a positive number'),
    body('page_website').optional({ checkFalsy: true }).isURL().withMessage('Valid page website URL is required'),
    body('status').optional().isIn(['draft', 'pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];


  // Create a new theme
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

      const themeData = {
        ...req.body,
        submitted_by: req.user?.userId,
        submitted_by_admin: req.admin?.adminId,
        // User submissions are always draft status initially
        status: req.user ? 'draft' : (req.body.status || 'pending')
      };

      // Remove recaptchaToken from data before saving
      delete themeData.recaptchaToken;

      const theme = await Theme.create(themeData);
      res.status(201).json({
        message: req.user ? 'Theme submitted successfully and is pending review' : 'Theme created successfully',
        theme: theme.toJSON()
      });
    } catch (error) {
      console.error('Create theme error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all themes with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        platform,
        category,
        location,
        show_deleted = 'false'
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (platform) filters.platform = platform;
      if (category) filters.category = category;

      // For regular users, only show approved themes unless they are admins
      if (req.user && !req.admin) {
        filters.status = 'approved';
        filters.is_active = true;
      } else if (req.admin) {
        // For all admins (including super admin), show all active themes by default
        // Only filter out inactive ones if show_deleted is not explicitly set to true
        if (show_deleted !== 'true') {
          filters.is_active = true;
        }
      }

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (location) {
        searchSql += ` AND t.location ILIKE $${searchParamCount}`;
        searchValues.push(`%${location}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      let themes;

      if (req.admin && show_deleted === 'true') {
        // Show deleted themes for admins
        themes = await Theme.getDeleted(filters, searchSql, searchValues, limit, offset);
      } else {
        // Show active themes
        themes = await Theme.findAll(filters, searchSql, searchValues, limit, offset);
      }

      res.json({
        themes: themes.map(theme => theme.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: themes.length // This should be improved with a count query
        }
      });
    } catch (error) {
      console.error('Get themes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get theme by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const theme = await Theme.findById(id);

      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      res.json({ theme: theme.toJSON() });
    } catch (error) {
      console.error('Get theme by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update theme
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
      const theme = await Theme.findById(id);

      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      const updatedTheme = await theme.update(req.body);
      res.json({
        message: 'Theme updated successfully',
        theme: updatedTheme.toJSON()
      });
    } catch (error) {
      console.error('Update theme error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete theme (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const theme = await Theme.findById(id);

      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      await theme.delete();
      res.json({ message: 'Theme deleted successfully' });
    } catch (error) {
      console.error('Delete theme error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk create themes
  async bulkCreate(req, res) {
    try {
      const { themes } = req.body;

      if (!Array.isArray(themes) || themes.length === 0) {
        return res.status(400).json({ error: 'Themes array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required
        return res.status(403).json({
          error: 'Insufficient permissions for bulk operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      const createdThemes = [];
      const errors = [];

      for (let i = 0; i < themes.length; i++) {
        try {
          const themeData = {
            ...themes[i],
            submitted_by: req.user?.userId,
            submitted_by_admin: req.admin?.adminId,
            status: 'approved' // Admin bulk operations create approved themes
          };
          const theme = await Theme.create(themeData);
          createdThemes.push(theme.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Created ${createdThemes.length} themes successfully`,
        created: createdThemes,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk create themes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update themes
  async bulkUpdate(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required
        return res.status(403).json({
          error: 'Insufficient permissions for bulk operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      const updatedThemes = [];
      const errors = [];

      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, ...updateData } = updates[i];
          const theme = await Theme.findById(id);

          if (!theme) {
            errors.push({ index: i, error: 'Theme not found' });
            continue;
          }

          const updatedTheme = await theme.update(updateData);
          updatedThemes.push(updatedTheme.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Updated ${updatedThemes.length} themes successfully`,
        updated: updatedThemes,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk update themes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete themes
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum super_admin for bulk delete operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 5) { // super_admin level required for bulk delete
        return res.status(403).json({
          error: 'Insufficient permissions for bulk delete operations',
          required: 'Super Admin only',
          currentLevel: adminLevel
        });
      }

      const deletedCount = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const theme = await Theme.findById(ids[i]);

          if (!theme) {
            errors.push({ index: i, error: 'Theme not found' });
            continue;
          }

          await theme.delete();
          deletedCount.push(ids[i]);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deletedCount.length} themes successfully`,
        deleted: deletedCount,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk delete themes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update status
  async bulkUpdateStatus(req, res) {
    try {
      const { ids, status, reason } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const theme = await Theme.findById(ids[i]);
          if (!theme) {
            errors.push({ id: ids[i], error: 'Theme not found' });
            continue;
          }

          if (status === 'approved') {
            await theme.approve(adminId);

            // Send notification
            try {
              const controller = new ThemeController();
              await controller.sendApprovalNotification(theme);
            } catch (notifyError) {
              console.error(`Failed to send approval notification for theme ${theme.id}:`, notifyError);
            }
          } else if (status === 'rejected') {
            await theme.reject(adminId, reason || 'Bulk rejection');

            // Send notification
            try {
              const controller = new ThemeController();
              await controller.sendRejectionNotification(theme);
            } catch (notifyError) {
              console.error(`Failed to send rejection notification for theme ${theme.id}:`, notifyError);
            }
          } else {
            // Pending or generic status update
            await theme.update({ status });
          }

          results.push({ id: ids[i], status: 'success' });
        } catch (error) {
          errors.push({ id: ids[i], error: error.message });
        }
      }

      res.json({
        message: `Bulk status update completed. ${results.length} successful, ${errors.length} failed.`,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update theme status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const theme = await Theme.findById(id);

      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      const updatedTheme = await theme.update({ status });
      res.json({
        message: 'Theme status updated successfully',
        theme: updatedTheme.toJSON()
      });
    } catch (error) {
      console.error('Update theme status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve theme
  async approveTheme(req, res) {
    try {
      const { id } = req.params;
      const admin_comments = req.body?.admin_comments;

      const theme = await Theme.findById(id);
      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      if (theme.status === 'approved') {
        return res.status(400).json({ error: 'Theme is already approved' });
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

      const updatedTheme = await theme.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: theme.submitted_by,
          type: 'theme_approved',
          title: 'Theme Approved!',
          message: `Your theme "${theme.page_name}" has been approved and is now live on our platform.`,
          related_id: theme.id
        });
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }

      // Send approval email notification
      try {
        await this.sendApprovalNotification(updatedTheme);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Log email failure but don't fail the approval process
        try {
          await UserNotification.create({
            user_id: theme.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email confirmation for your approved theme. Please check your notifications for details.',
            related_id: theme.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Theme approved successfully',
        theme: updatedTheme.toJSON()
      });
    } catch (error) {
      console.error('Approve theme error:', error);
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
            const createdThemes = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                // Map CSV fields to Theme model fields
                // Support both exact header names and some variations
                const platform = row['Platform'] || row['platform'];
                const username = row['Username'] || row['username'];
                const page_name = row['Page Name'] || row['page_name'];

                if (!platform || !username || !page_name) {
                  throw new Error('Platform, Username, and Page Name are required');
                }

                const themeData = {
                  platform,
                  username,
                  page_name,
                  no_of_followers: parseInt(row['Followers'] || row['no_of_followers'] || '0'),
                  collaboration: row['Collaboration'] || row['collaboration'] || 'Paid',
                  category: row['Category'] || row['category'] || 'General',
                  location: row['Location'] || row['location'] || 'Global',
                  price_reel_without_tagging_collaboration: parseFloat(row['Price Reel w/o Tag'] || row['price_reel_without_tagging_collaboration'] || '0'),
                  price_reel_with_tagging_collaboration: parseFloat(row['Price Reel w/ Tag'] || row['price_reel_with_tagging_collaboration'] || '0'),
                  price_reel_with_tagging: parseFloat(row['Price Reel Tag'] || row['price_reel_with_tagging'] || '0'),
                  video_minute_allowed: parseInt(row['Video Min'] || row['video_minute_allowed'] || '0'),
                  pin_post_charges_week: parseFloat(row['Pin Post/Week'] || row['pin_post_charges_week'] || '0'),
                  story_charges: parseFloat(row['Story'] || row['story_charges'] || '0'),
                  story_with_reel_charges: parseFloat(row['Story w/ Reel'] || row['story_with_reel_charges'] || '0'),
                  page_website: row['Website'] || row['page_website'] || '',
                  submitted_by: req.user?.userId,
                  submitted_by_admin: req.admin?.adminId,
                  status: 'approved' // Bulk upload assumes approved unless specified otherwise
                };

                const newTheme = await Theme.create(themeData);
                createdThemes.push(newTheme);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdThemes.length} themes created.`,
              count: createdThemes.length,
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
      const { status, is_active, platform, category, location, search } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (platform) filters.platform = platform;
      if (category) filters.category = category;

      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (location) {
        searchSql += ` AND location ILIKE $${searchParamCount}`;
        searchValues.push(`%${location}%`);
        searchParamCount++;
      }

      if (search) {
        searchSql += ` AND (page_name ILIKE $${searchParamCount} OR username ILIKE $${searchParamCount} OR platform ILIKE $${searchParamCount})`;
        searchValues.push(`%${search}%`);
        searchParamCount++;
      }

      // Fetch all matching records (no limit)
      const themes = await Theme.findAll(filters, searchSql, searchValues, null, 0);

      const headers = [
        'ID', 'Platform', 'Username', 'Page Name', 'Followers', 'Collaboration', 'Category', 'Location',
        'Price Reel w/o Tag', 'Price Reel w/ Tag', 'Price Reel Tag', 'Video Min', 'Pin Post/Week',
        'Story', 'Story w/ Reel', 'Website', 'Status', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      themes.forEach(theme => {
        const escape = (text) => {
          if (text === null || text === undefined) return '';
          const stringValue = String(text);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const row = [
          theme.id,
          escape(theme.platform),
          escape(theme.username),
          escape(theme.page_name),
          theme.no_of_followers,
          escape(theme.collaboration),
          escape(theme.category),
          escape(theme.location),
          theme.price_reel_without_tagging_collaboration,
          theme.price_reel_with_tagging_collaboration,
          theme.price_reel_with_tagging,
          theme.video_minute_allowed,
          theme.pin_post_charges_week,
          theme.story_charges,
          theme.story_with_reel_charges,
          escape(theme.page_website),
          escape(theme.status),
          theme.created_at ? new Date(theme.created_at).toISOString().split('T')[0] : ''
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=themes_export.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download Template CSV
  downloadTemplate = async (req, res) => {
    try {
      const headers = [
        'Platform', 'Username', 'Page Name', 'Followers', 'Collaboration', 'Category', 'Location',
        'Price Reel w/o Tag', 'Price Reel w/ Tag', 'Price Reel Tag', 'Video Min', 'Pin Post/Week',
        'Story', 'Story w/ Reel', 'Website'
      ];

      const exampleRow = [
        'Instagram', 'example_user', 'Example Page', '10000', 'Paid', 'Fashion', 'USA',
        '100.00', '150.00', '120.00', '60', '50.00',
        '30.00', '80.00', 'https://example.com'
      ];

      let csv = headers.join(',') + '\n';
      csv += exampleRow.join(',') + '\n';

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=theme_upload_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download Template CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approval notification email (used by bulk actions)
  sendApprovalNotification = async (theme) => {
    try {
      // Get the user who submitted the theme
      const user = await User.findById(theme.submitted_by);
      if (!user) {
        console.warn('User not found for theme approval notification');
        return;
      }

      const subject = 'Your Theme Has Been Approved!';
      const htmlContent = this.generateApprovalEmailTemplate(theme, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }

  // Send rejection notification email
  sendRejectionNotification = async (theme) => {
    try {
      // Get the user who submitted the theme
      const user = await User.findById(theme.submitted_by);
      if (!user) {
        console.warn('User not found for theme rejection notification');
        return;
      }

      const subject = 'Theme Submission Update';
      const htmlContent = this.generateRejectionEmailTemplate(theme, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      throw error;
    }
  }

  // Generate approval email template
  generateApprovalEmailTemplate(theme, user) {
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
            .theme-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Theme Approved!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name}!</h2>
              <p>Great news! Your theme submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="theme-details">
                <h3>Theme Details:</h3>
                <p><strong>Page Name:</strong> ${theme.page_name}</p>
                <p><strong>Platform:</strong> ${theme.platform}</p>
                <p><strong>Username:</strong> ${theme.username}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your theme is now live on our platform and available for users to browse and purchase.</p>
              <p>You can view your approved themes in your dashboard.</p>

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
  generateRejectionEmailTemplate(theme, user) {
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
            .theme-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .rejection-reason { background: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Theme Review Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name},</h2>
              <p>Thank you for submitting your theme to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="theme-details">
                <h3>Theme Details:</h3>
                <p><strong>Page Name:</strong> ${theme.page_name}</p>
                <p><strong>Platform:</strong> ${theme.platform}</p>
                <p><strong>Username:</strong> ${theme.username}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
              </div>

              ${theme.rejection_reason ? `
              <div class="rejection-reason">
                <h4>Reason for Rejection:</h4>
                <p>${theme.rejection_reason}</p>
              </div>
              ` : ''}

              <p>You can edit and resubmit your theme after addressing the issues mentioned above. We're here to help you improve your submission!</p>

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

module.exports = new ThemeController();