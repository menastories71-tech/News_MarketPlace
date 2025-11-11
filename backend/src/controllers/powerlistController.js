const Powerlist = require('../models/Powerlist');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const { rateLimiter } = require('../middleware/rateLimit');

class PowerlistController {
  // Validation rules for admin create/update
  createValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('agree_terms').isBoolean().withMessage('Agreement to terms is required'),
    body('filling_on_behalf').optional().isBoolean(),
    body('behalf_name').if(body('filling_on_behalf').equals('true')).trim().isLength({ min: 1 }).withMessage('Behalf name is required when filling on behalf'),
    body('behalf_email').if(body('filling_on_behalf').equals('true')).isEmail().withMessage('Valid behalf email is required when filling on behalf'),
    body('behalf_contact_number').if(body('filling_on_behalf').equals('true')).trim().isLength({ min: 1 }).withMessage('Behalf contact number is required when filling on behalf'),
    body('dual_passport').optional().isBoolean(),
    body('passport_nationality_one').if(body('dual_passport').equals('true')).trim().isLength({ min: 1 }).withMessage('First passport nationality is required when dual passport'),
    body('uae_permanent_residence').optional().isBoolean(),
    body('other_permanent_residency').optional().isBoolean(),
    body('other_residency_mention').if(body('other_permanent_residency').equals('true')).trim().isLength({ min: 1 }).withMessage('Other residency mention is required when other permanent residency'),
    body('linkedin_url').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('instagram_url').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('facebook_url').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('personal_website').optional().isURL().withMessage('Valid personal website URL is required'),
    body('company_website').optional().isURL().withMessage('Valid company website URL is required'),
  ];

  updateValidation = [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('agree_terms').optional().isBoolean().withMessage('Agreement to terms is required'),
    body('filling_on_behalf').optional().isBoolean(),
    body('behalf_name').if(body('filling_on_behalf').equals('true')).trim().isLength({ min: 1 }).withMessage('Behalf name is required when filling on behalf'),
    body('behalf_email').if(body('filling_on_behalf').equals('true')).isEmail().withMessage('Valid behalf email is required when filling on behalf'),
    body('behalf_contact_number').if(body('filling_on_behalf').equals('true')).trim().isLength({ min: 1 }).withMessage('Behalf contact number is required when filling on behalf'),
    body('dual_passport').optional().isBoolean(),
    body('passport_nationality_one').if(body('dual_passport').equals('true')).trim().isLength({ min: 1 }).withMessage('First passport nationality is required when dual passport'),
    body('uae_permanent_residence').optional().isBoolean(),
    body('other_permanent_residency').optional().isBoolean(),
    body('other_residency_mention').if(body('other_permanent_residency').equals('true')).trim().isLength({ min: 1 }).withMessage('Other residency mention is required when other permanent residency'),
    body('linkedin_url').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('instagram_url').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('facebook_url').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('personal_website').optional().isURL().withMessage('Valid personal website URL is required'),
    body('company_website').optional().isURL().withMessage('Valid company website URL is required'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Validation for user submission
  submitValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('agree_terms').equals('true').withMessage('Agreement to terms is required'),
    body('captcha_token').trim().isLength({ min: 1 }).withMessage('Captcha verification is required'),
    body('filling_on_behalf').optional().isBoolean(),
    body('behalf_name').if(body('filling_on_behalf').equals('true')).trim().isLength({ min: 1 }).withMessage('Behalf name is required when filling on behalf'),
    body('behalf_email').if(body('filling_on_behalf').equals('true')).isEmail().withMessage('Valid behalf email is required when filling on behalf'),
    body('behalf_contact_number').if(body('filling_on_behalf').equals('true')).trim().isLength({ min: 1 }).withMessage('Behalf contact number is required when filling on behalf'),
    body('dual_passport').optional().isBoolean(),
    body('passport_nationality_one').if(body('dual_passport').equals('true')).trim().isLength({ min: 1 }).withMessage('First passport nationality is required when dual passport'),
    body('uae_permanent_residence').optional().isBoolean(),
    body('other_permanent_residency').optional().isBoolean(),
    body('other_residency_mention').if(body('other_permanent_residency').equals('true')).trim().isLength({ min: 1 }).withMessage('Other residency mention is required when other permanent residency'),
    body('linkedin_url').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('instagram_url').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('facebook_url').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('personal_website').optional().isURL().withMessage('Valid personal website URL is required'),
    body('company_website').optional().isURL().withMessage('Valid company website URL is required'),
  ];

  // Create a new powerlist entry (admin)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const powerlistData = {
        ...req.body,
        submitted_by: req.user?.userId,
        status: req.body.status || 'pending'
      };

      const powerlist = await Powerlist.create(powerlistData);

      // Send notification email
      try {
        await emailService.sendCustomEmail(
          powerlist.email,
          'Powerlist Submission Received',
          this.constructor.generateSubmissionEmailTemplate(powerlist.name)
        );
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      res.status(201).json({
        message: 'Powerlist entry created successfully',
        powerlist: powerlist.toJSON()
      });
    } catch (error) {
      console.error('Create powerlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Submit powerlist entry (user with captcha)
  async submit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify captcha
      const captchaScore = await verifyRecaptcha(req.body.captcha_token);
      if (captchaScore === null || captchaScore < 0.5) {
        return res.status(400).json({
          error: 'Captcha verification failed',
          message: 'Please complete the captcha verification'
        });
      }

      // Rate limiting check
      const userId = req.user?.userId;
      if (userId) {
        const rateLimitResult = await rateLimiter.checkLimit(userId, 'powerlist_submit');
        if (!rateLimitResult.allowed) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: rateLimitResult.message,
            remainingMinutes: rateLimitResult.remainingTime
          });
        }
      }

      const powerlistData = {
        ...req.body,
        submitted_by: userId,
        captcha_verified: true,
        status: 'pending'
      };

      delete powerlistData.captcha_token; // Remove captcha token from data

      const powerlist = await Powerlist.create(powerlistData);

      // Send confirmation email
      try {
        await emailService.sendCustomEmail(
          powerlist.email,
          'Powerlist Submission Confirmation',
          this.constructor.generateSubmissionEmailTemplate(powerlist.name)
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      res.status(201).json({
        message: 'Powerlist submitted successfully',
        powerlist: powerlist.toJSON()
      });
    } catch (error) {
      console.error('Submit powerlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all powerlists with filtering and pagination
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        submitted_by,
        gender,
        company_industry,
        name,
        email,
        current_company
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (submitted_by) filters.submitted_by = submitted_by;
      if (gender) filters.gender = gender;
      if (company_industry) filters.company_industry = company_industry;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND p.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND p.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (current_company) {
        searchSql += ` AND p.current_company ILIKE $${searchParamCount}`;
        searchValues.push(`%${current_company}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const powerlists = await Powerlist.findAll(filters, searchSql, searchValues, limit, offset);

      // For admin routes, return all powerlists. For regular user routes, filter appropriately
      let filteredPowerlists = powerlists;
      if (!req.admin) {
        // Users can only see their own submissions
        filteredPowerlists = powerlists.filter(p => p.submitted_by === req.user?.userId);
      }

      // Get total count for pagination
      const totalCount = await Powerlist.getTotalCount(filters, searchSql, searchValues);

      res.json({
        powerlists: filteredPowerlists.map(powerlist => powerlist.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get powerlists error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get public approved powerlists
  async getPublic(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        name,
        email,
        current_company,
        company_industry,
        gender,
        region
      } = req.query;

      const filters = {
        status: 'approved',
        is_active: true
      };

      if (gender) filters.gender = gender;
      if (company_industry) filters.company_industry = company_industry;
      if (region) filters.region = region;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND p.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND p.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (current_company) {
        searchSql += ` AND p.current_company ILIKE $${searchParamCount}`;
        searchValues.push(`%${current_company}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const powerlists = await Powerlist.findAll(filters, searchSql, searchValues, limit, offset);

      // Get total count for pagination
      const totalCount = await Powerlist.getTotalCount(filters, searchSql, searchValues);

      res.json({
        powerlists: powerlists.map(powerlist => powerlist.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get public powerlists error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get public approved powerlist by ID
  async getPublicById(req, res) {
    try {
      const { id } = req.params;
      const powerlist = await Powerlist.findById(id);

      if (!powerlist) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      // Only return approved and active powerlists
      if (powerlist.status !== 'approved' || !powerlist.is_active) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      res.json({ powerlist: powerlist.toJSON() });
    } catch (error) {
      console.error('Get public powerlist by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get powerlist by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const powerlist = await Powerlist.findById(id);

      if (!powerlist) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      // Check permissions
      if (!req.admin && powerlist.submitted_by !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ powerlist: powerlist.toJSON() });
    } catch (error) {
      console.error('Get powerlist by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update powerlist
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
      const powerlist = await Powerlist.findById(id);

      if (!powerlist) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      // Check permissions
      if (!req.admin && powerlist.submitted_by !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedPowerlist = await powerlist.update(req.body);
      res.json({
        message: 'Powerlist updated successfully',
        powerlist: updatedPowerlist.toJSON()
      });
    } catch (error) {
      console.error('Update powerlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete powerlist (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const powerlist = await Powerlist.findById(id);

      if (!powerlist) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      // Check permissions
      if (!req.admin && powerlist.submitted_by !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await powerlist.delete();
      res.json({ message: 'Powerlist deleted successfully' });
    } catch (error) {
      console.error('Delete powerlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search powerlists (admin only)
  async search(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { q: searchTerm, ...filters } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const powerlists = await Powerlist.search(searchTerm, filters, limit, offset);

      // Get total count for pagination
      const totalCount = await Powerlist.getSearchTotalCount(searchTerm, filters);

      res.json({
        powerlists: powerlists.map(powerlist => powerlist.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Search powerlists error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update powerlist status (admin only)
  async updateStatus(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const powerlist = await Powerlist.findById(id);

      if (!powerlist) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      const updatedPowerlist = await powerlist.update({ status });

      // Send status update email
      try {
        await emailService.sendCustomEmail(
          powerlist.email,
          `Powerlist Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          this.constructor.generateStatusUpdateEmailTemplate(powerlist.name, status)
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }

      res.json({
        message: 'Powerlist status updated successfully',
        powerlist: updatedPowerlist.toJSON()
      });
    } catch (error) {
      console.error('Update powerlist status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get publications for a powerlist entry
  async getPublications(req, res) {
    try {
      const { id } = req.params;
      const powerlist = await Powerlist.findById(id);

      if (!powerlist) {
        return res.status(404).json({ error: 'Powerlist entry not found' });
      }

      // Check permissions
      if (!req.admin && powerlist.submitted_by !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const publications = await powerlist.getPublications();
      res.json({
        powerlist: powerlist.toJSON(),
        publications: publications.map(pub => pub.toJSON())
      });
    } catch (error) {
      console.error('Get powerlist publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Email template generators
  static generateSubmissionEmailTemplate(name) {
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
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Powerlist Submission Received</h2>
              <p>Dear ${name},</p>
              <p>Thank you for submitting your application to join our Powerlist. We have received your submission and will review it shortly.</p>
              <p>You will receive an email notification once your application has been processed.</p>
              <p>Best regards,<br>The News Marketplace Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateStatusUpdateEmailTemplate(name, status) {
    const statusMessage = {
      approved: 'Congratulations! Your application has been approved.',
      rejected: 'We regret to inform you that your application has been rejected.',
      pending: 'Your application is still under review.'
    };

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
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Powerlist Application Update</h2>
              <p>Dear ${name},</p>
              <p>${statusMessage[status]}</p>
              <p>Best regards,<br>The News Marketplace Team</p>
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

module.exports = new PowerlistController();