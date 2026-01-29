const Paparazzi = require('../models/Paparazzi');
const { triggerSEOUpdate } = require('../utils/seoUtility');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { body, validationResult } = require('express-validator');

class PaparazziController {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.exportCSV = this.exportCSV.bind(this);
    this.bulkUpload = this.bulkUpload.bind(this);
    this.bulkApprove = this.bulkApprove.bind(this);
    this.bulkReject = this.bulkReject.bind(this);
    this.bulkDelete = this.bulkDelete.bind(this);
  }


  // Validation rules
  createValidation = [
    body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('page_name').trim().isLength({ min: 1 }).withMessage('Page name is required'),
    body('followers_count').isInt({ min: 0 }).withMessage('Followers count must be a non-negative integer'),
    body('collaboration').optional().trim(),
    body('category').optional().trim(),
    body('location').optional().trim(),
    body('price_reel_no_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('video_minutes_allowed').optional().isInt({ min: 0 }).withMessage('Video minutes must be a non-negative integer'),
    body('pin_post_weekly_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_with_reel_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('page_website').optional({ checkFalsy: true }).isURL().withMessage('Valid website URL is required'),
    body('platform').optional().isIn(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook']).withMessage('Invalid platform'),
  ];

  updateValidation = [
    body('username').optional().trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('page_name').optional().trim().isLength({ min: 1 }).withMessage('Page name is required'),
    body('followers_count').optional().isInt({ min: 0 }).withMessage('Followers count must be a non-negative integer'),
    body('collaboration').optional().trim(),
    body('category').optional().trim(),
    body('location').optional().trim(),
    body('price_reel_no_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('video_minutes_allowed').optional().isInt({ min: 0 }).withMessage('Video minutes must be a non-negative integer'),
    body('pin_post_weekly_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_with_reel_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('page_website').optional({ checkFalsy: true }).isURL().withMessage('Valid website URL is required'),
    body('platform').optional().isIn(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook']).withMessage('Invalid platform'),
  ];

  // Create a new paparazzi submission
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Determine user_id based on route type
      let user_id;
      if (req.user) {
        // User route
        user_id = req.user.userId;
      } else if (req.admin) {
        // Admin route - for admin-created entries, use admin ID or require user_id in body
        user_id = req.body.user_id || req.admin.adminId;
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const paparazziData = { ...req.body, user_id, status: req.user ? 'pending' : 'approved' };
      const paparazzi = await Paparazzi.create(paparazziData);
      res.status(201).json({
        message: req.user ? 'Paparazzi submission created successfully' : 'Paparazzi created successfully',
        paparazzi: paparazzi.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Create paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all paparazzi entries with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        user_id,
        platform,
        category,
        location,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const where = {};
      if (status) where.status = status;
      if (user_id) where.user_id = user_id;
      if (platform) where.platform = platform;
      if (category) where.category = category;
      if (location) where.location = location;
      if (search) where.search = { val: search };

      const { count, rows } = await Paparazzi.findAndCountAll({
        where,
        limit: limitNum,
        offset,
        sortBy,
        sortOrder
      });

      res.json({
        paparazzi: rows.map(p => p.toJSON()),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get public paparazzi entries (for sitemap and public browsing)
  async getPublic(req, res) {
    try {
      const {
        page = 1,
        limit = 1000 // High limit for sitemap
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const { count, rows } = await Paparazzi.findAndCountAll({
        where: { status: 'approved' },
        limit: limitNum,
        offset,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });

      res.json({
        paparazzi: rows.map(p => p.toJSON()),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get public paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get paparazzi by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      // For user routes, check if approved or owned by user
      if (!req.admin && paparazzi.status !== 'approved' && paparazzi.user_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ paparazzi: paparazzi.toJSON() });
    } catch (error) {
      console.error('Get paparazzi by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update paparazzi
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
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      // For user routes, check ownership and status
      if (!req.admin) {
        if (paparazzi.user_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied: You can only update your own submissions' });
        }
        if (paparazzi.status !== 'pending') {
          return res.status(403).json({ error: 'You can only update pending submissions' });
        }
      }

      const updatedPaparazzi = await paparazzi.update(req.body);
      res.json({
        message: 'Paparazzi updated successfully',
        paparazzi: updatedPaparazzi.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Update paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete paparazzi
  async delete(req, res) {
    try {
      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      // For user routes, check ownership and status
      if (!req.admin) {
        if (paparazzi.user_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied: You can only delete your own submissions' });
        }
        if (paparazzi.status !== 'pending') {
          return res.status(403).json({ error: 'You can only delete pending submissions' });
        }
      }

      await paparazzi.delete();
      res.json({ message: 'Paparazzi deleted successfully' });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Delete paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve paparazzi
  async approve(req, res) {
    try {
      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      await paparazzi.approve(req.admin.adminId);

      // Send approval email (don't fail the operation if email fails)
      try {
        const user = await User.findById(paparazzi.user_id);
        if (user) {
          console.log(`Sending approval email to user: ${user.email} for paparazzi: ${paparazzi.page_name}`);
          const subject = 'Your Paparazzi Submission Has Been Approved';
          const htmlContent = PaparazziController.generateApprovalEmailTemplate(paparazzi);
          const result = await emailService.sendCustomEmail(user.email, subject, htmlContent);
          console.log('Approval email sent successfully:', result);
        } else {
          console.warn('User not found for paparazzi approval email');
        }
      } catch (emailError) {
        console.error('Failed to send approval email, but approval succeeded:', emailError);
      }

      res.json({
        message: 'Paparazzi approved successfully',
        paparazzi: paparazzi.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Approve paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject paparazzi
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      await paparazzi.reject(req.admin.adminId, reason);

      // Send rejection email (don't fail the operation if email fails)
      try {
        const user = await User.findById(paparazzi.user_id);
        if (user) {
          console.log(`Sending rejection email to user: ${user.email} for paparazzi: ${paparazzi.page_name}`);
          const subject = 'Your Paparazzi Submission Has Been Rejected';
          const htmlContent = PaparazziController.generateRejectionEmailTemplate(paparazzi, reason);
          const result = await emailService.sendCustomEmail(user.email, subject, htmlContent);
          console.log('Rejection email sent successfully:', result);
        } else {
          console.warn('User not found for paparazzi rejection email');
        }
      } catch (emailError) {
        console.error('Failed to send rejection email, but rejection succeeded:', emailError);
      }

      res.json({
        message: 'Paparazzi rejected successfully',
        paparazzi: paparazzi.toJSON()
      });
    } catch (error) {
      console.error('Reject paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate approval email template
  static generateApprovalEmailTemplate(paparazzi) {
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
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Congratulations!</h2>
              <p>Your paparazzi submission for <strong>${paparazzi.page_name}</strong> has been approved and is now live on our platform.</p>
              <p>You can now receive collaboration requests from our users.</p>
              <p>Thank you for being part of our community!</p>
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
  static generateRejectionEmailTemplate(paparazzi, reason) {
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
            .reason { background: #FFF3E0; padding: 15px; border-left: 4px solid #F44336; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Submission Update</h2>
              <p>Unfortunately, your paparazzi submission for <strong>${paparazzi.page_name}</strong> could not be approved at this time.</p>
              <div class="reason">
                <strong>Reason for rejection:</strong><br>
                ${reason}
              </div>
              <p>You can update your submission and resubmit it for review. Please ensure all information is accurate and complete.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  // Download CSV template for bulk upload
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'platform',
        'username',
        'page_name',
        'followers_count',
        'collaboration',
        'category',
        'location',
        'price_reel_no_tag_no_collab',
        'price_reel_with_tag_no_collab',
        'price_reel_with_tag',
        'video_minutes_allowed',
        'pin_post_weekly_charge',
        'story_charge',
        'story_with_reel_charge',
        'page_website',
        'status'
      ];

      const dummyData = [
        ['Instagram', 'johndoe_paparazzi', 'John Doe Paparazzi', '50000', 'Paid', 'Lifestyle', 'London', '100', '150', '200', '2', '50', '30', '70', 'https://johndoe.com', 'approved'],
        ['TikTok', 'janedoe_trending', 'Jane Trending', '120000', 'Barter', 'Entertainment', 'New York', '200', '250', '350', '3', '100', '80', '150', '', 'pending']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=paparazzi_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export CSV with filtering
  async exportCSV(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { Parser } = require('json2csv');
      const {
        status,
        platform,
        category,
        location
      } = req.query;

      let paparazzi = await Paparazzi.findAll();

      // Apply filters
      if (status) {
        paparazzi = paparazzi.filter(p => p.status === status);
      }
      if (platform) {
        paparazzi = paparazzi.filter(p => p.platform === platform);
      }
      if (category) {
        paparazzi = paparazzi.filter(p => p.category && p.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (location) {
        paparazzi = paparazzi.filter(p => p.location && p.location.toLowerCase().includes(location.toLowerCase()));
      }

      const fields = [
        'id', 'platform', 'username', 'page_name', 'followers_count', 'collaboration',
        'category', 'location', 'price_reel_no_tag_no_collab', 'price_reel_with_tag_no_collab',
        'price_reel_with_tag', 'video_minutes_allowed', 'pin_post_weekly_charge',
        'story_charge', 'story_with_reel_charge', 'page_website', 'status',
        'user_id', 'created_at', 'updated_at'
      ];

      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(paparazzi.map(p => p.toJSON()));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=paparazzi_export.csv');
      return res.send(csv);

    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload paparazzi from CSV
  async bulkUpload(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

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
            const createdRecords = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                const paparazziData = {
                  platform: row.platform || 'Instagram',
                  username: row.username || '',
                  page_name: row.page_name || '',
                  followers_count: row.followers_count ? parseInt(row.followers_count) : 0,
                  collaboration: row.collaboration || '',
                  category: row.category || '',
                  location: row.location || '',
                  price_reel_no_tag_no_collab: row.price_reel_no_tag_no_collab ? parseFloat(row.price_reel_no_tag_no_collab) : 0,
                  price_reel_with_tag_no_collab: row.price_reel_with_tag_no_collab ? parseFloat(row.price_reel_with_tag_no_collab) : 0,
                  price_reel_with_tag: row.price_reel_with_tag ? parseFloat(row.price_reel_with_tag) : 0,
                  video_minutes_allowed: row.video_minutes_allowed ? parseInt(row.video_minutes_allowed) : 0,
                  pin_post_weekly_charge: row.pin_post_weekly_charge ? parseFloat(row.pin_post_weekly_charge) : 0,
                  story_charge: row.story_charge ? parseFloat(row.story_charge) : 0,
                  story_with_reel_charge: row.story_with_reel_charge ? parseFloat(row.story_with_reel_charge) : 0,
                  page_website: row.page_website || '',
                  status: row.status || 'approved',
                  user_id: req.admin.adminId // System created
                };

                if (!paparazziData.username || !paparazziData.page_name) {
                  errors.push(`Row ${index + 1}: Username and Page Name are required.`);
                  continue;
                }

                const record = await Paparazzi.create(paparazziData);
                createdRecords.push(record);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdRecords.length} records created.`,
              count: createdRecords.length,
              errors: errors.length > 0 ? errors : undefined
            });

            // Trigger SEO and Sitemap update
            triggerSEOUpdate();
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
  // Bulk approve paparazzi submissions
  async bulkApprove(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of IDs' });
      }

      const results = {
        success: [],
        errors: []
      };

      for (const id of ids) {
        try {
          const paparazzi = await Paparazzi.findById(id);
          if (!paparazzi) {
            results.errors.push({ id, error: 'Paparazzi not found' });
            continue;
          }

          if (paparazzi.status === 'approved') {
            // Success but no action needed
            results.success.push({ id, message: 'Already approved' });
            continue;
          }

          await paparazzi.approve(req.admin.adminId);

          // Send approval email
          try {
            const user = await User.findById(paparazzi.user_id);
            if (user) {
              const htmlContent = PaparazziController.generateApprovalEmailTemplate(paparazzi);
              await emailService.sendCustomEmail(user.email, 'Your Paparazzi Submission Has Been Approved', htmlContent);
            }
          } catch (emailError) {
            console.error(`Failed to send approval email for ID ${id}:`, emailError);
          }

          results.success.push({ id, message: 'Approved successfully' });
        } catch (err) {
          results.errors.push({ id, error: err.message });
        }
      }

      res.json({
        message: `Bulk approval completed. ${results.success.length} succeeded, ${results.errors.length} failed.`,
        results
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk approve paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk reject paparazzi submissions
  async bulkReject(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { ids, reason } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of IDs' });
      }
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const results = {
        success: [],
        errors: []
      };

      for (const id of ids) {
        try {
          const paparazzi = await Paparazzi.findById(id);
          if (!paparazzi) {
            results.errors.push({ id, error: 'Paparazzi not found' });
            continue;
          }

          if (paparazzi.status === 'rejected') {
            results.success.push({ id, message: 'Already rejected' });
            continue;
          }

          await paparazzi.reject(req.admin.adminId, reason);

          // Send rejection email
          try {
            const user = await User.findById(paparazzi.user_id);
            if (user) {
              const htmlContent = PaparazziController.generateRejectionEmailTemplate(paparazzi, reason);
              await emailService.sendCustomEmail(user.email, 'Your Paparazzi Submission Has Been Rejected', htmlContent);
            }
          } catch (emailError) {
            console.error(`Failed to send rejection email for ID ${id}:`, emailError);
          }

          results.success.push({ id, message: 'Rejected successfully' });
        } catch (err) {
          results.errors.push({ id, error: err.message });
        }
      }

      res.json({
        message: `Bulk rejection completed. ${results.success.length} succeeded, ${results.errors.length} failed.`,
        results
      });
    } catch (error) {
      console.error('Bulk reject paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete paparazzi records
  async bulkDelete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of IDs' });
      }

      const results = {
        success: [],
        errors: []
      };

      for (const id of ids) {
        try {
          const paparazzi = await Paparazzi.findById(id);
          if (!paparazzi) {
            results.errors.push({ id, error: 'Paparazzi not found' });
            continue;
          }

          await paparazzi.delete();
          results.success.push({ id, message: 'Deleted successfully' });
        } catch (err) {
          results.errors.push({ id, error: err.message });
        }
      }

      res.json({
        message: `Bulk delete completed. ${results.success.length} succeeded, ${results.errors.length} failed.`,
        results
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk delete paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new PaparazziController();

