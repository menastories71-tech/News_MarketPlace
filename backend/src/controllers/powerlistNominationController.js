const PowerlistNomination = require('../models/PowerlistNomination');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const { rateLimiter } = require('../middleware/rateLimit');
const s3Service = require('../services/s3Service');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class PowerlistNominationController {
  // Validation rules for create
  createValidation = [
    body('publication_name').trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('website_url').optional().isURL().withMessage('Valid website URL is required'),
    body('power_list_name').trim().isLength({ min: 1 }).withMessage('Power list name is required'),
    body('industry').trim().isLength({ min: 1 }).withMessage('Industry is required'),
    body('company_or_individual').trim().isLength({ min: 1 }).withMessage('Company or individual is required'),
    body('tentative_month').optional().trim(),
    body('location_region').optional().trim(),
    body('last_power_list_url').optional().isURL().withMessage('Valid last power list URL is required'),
    body('image').optional().trim(),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Validation rules for update
  updateValidation = [
    body('publication_name').optional().trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('website_url').optional().isURL().withMessage('Valid website URL is required'),
    body('power_list_name').optional().trim().isLength({ min: 1 }).withMessage('Power list name is required'),
    body('industry').optional().trim().isLength({ min: 1 }).withMessage('Industry is required'),
    body('company_or_individual').optional().trim().isLength({ min: 1 }).withMessage('Company or individual is required'),
    body('tentative_month').optional().trim(),
    body('location_region').optional().trim(),
    body('last_power_list_url').optional().isURL().withMessage('Valid last power list URL is required'),
    body('image').optional().trim(),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  ];

  // Validation for user submission
  submitValidation = [
    body('publication_name').trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('power_list_name').trim().isLength({ min: 1 }).withMessage('Power list name is required'),
    body('industry').trim().isLength({ min: 1 }).withMessage('Industry is required'),
    body('company_or_individual').trim().isLength({ min: 1 }).withMessage('Company or individual is required'),
    body('captcha_token').trim().isLength({ min: 1 }).withMessage('Captcha verification is required'),
    body('website_url').optional().isURL().withMessage('Valid website URL is required'),
    body('tentative_month').optional().trim(),
    body('location_region').optional().trim(),
    body('last_power_list_url').optional().isURL().withMessage('Valid last power list URL is required'),
    body('image').optional().trim(),
  ];

  // Create a new powerlist nomination (admin only)
  async create(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const nominationData = {
        ...req.body,
        status: req.body.status || 'pending'
      };

      // Handle image upload
      if (req.file) {
        try {
          let imageUrl;
          
          // Try S3 first if configured
          if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            const s3Key = s3Service.generateKey('powerlist-nominations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);
            
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded to S3:', imageUrl);
          } else {
            // Fallback to local storage
            console.log('S3 not configured, using local storage');
            imageUrl = await this.uploadImageLocally(req.file);
          }
          
          nominationData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      const nomination = await PowerlistNomination.create(nominationData);

      res.status(201).json({
        message: 'Powerlist nomination created successfully',
        nomination: nomination.toJSON()
      });
    } catch (error) {
      console.error('Create powerlist nomination error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Local image upload helper
  async uploadImageLocally(file) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads/powerlist-nominations');
      await fs.promises.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const filename = `image-${timestamp}-${randomSuffix}${extension}`;
      const filepath = path.join(uploadsDir, filename);

      // Optimize image before saving
      const optimizedBuffer = await sharp(file.buffer)
        .resize(800, 600, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Save file
      await fs.promises.writeFile(filepath, optimizedBuffer);

      // Return local URL
      const localUrl = `/uploads/powerlist-nominations/${filename}`;
      console.log('Successfully saved image locally:', localUrl);
      
      return localUrl;
    } catch (error) {
      console.error('Local image upload error:', error);
      throw new Error('Failed to save image locally');
    }
  }

  // Submit powerlist nomination (user with captcha)
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
        const rateLimitResult = await rateLimiter.checkLimit(userId, 'powerlist_nomination_submit');
        if (!rateLimitResult.allowed) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: rateLimitResult.message,
            remainingMinutes: rateLimitResult.remainingTime
          });
        }
      }

      const nominationData = {
        ...req.body,
        submitted_by: userId,
        status: 'pending'
      };

      delete nominationData.captcha_token; // Remove captcha token from data

      const nomination = await PowerlistNomination.create(nominationData);

      // Send confirmation email
      try {
        await emailService.sendCustomEmail(
          req.user.email, // Send to the user who submitted
          'Powerlist Nomination Submission Confirmation',
          this.constructor.generateNominationSubmissionEmailTemplate(nomination.publication_name, nomination.power_list_name)
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      res.status(201).json({
        message: 'Powerlist nomination submitted successfully',
        nomination: nomination.toJSON()
      });
    } catch (error) {
      console.error('Submit powerlist nomination error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all powerlist nominations with filtering and pagination (admin only)
  async getAll(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        industry,
        location_region,
        company_or_individual,
        publication_name,
        power_list_name
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (industry) filters.industry = industry;
      if (location_region) filters.location_region = location_region;
      if (company_or_individual) filters.company_or_individual = company_or_individual;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (publication_name) {
        searchSql += ` AND publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      if (power_list_name) {
        searchSql += ` AND power_list_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${power_list_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const nominations = await PowerlistNomination.findAll(filters, searchSql, searchValues, limit, offset);

      // Get total count for pagination
      const totalCount = await PowerlistNomination.getTotalCount(filters, searchSql, searchValues);

      res.json({
        nominations: nominations.map(nomination => nomination.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get powerlist nominations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get powerlist nomination by ID (admin only)
  async getById(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const nomination = await PowerlistNomination.findById(id);

      if (!nomination) {
        return res.status(404).json({ error: 'Powerlist nomination not found' });
      }

      res.json({ nomination: nomination.toJSON() });
    } catch (error) {
      console.error('Get powerlist nomination by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update powerlist nomination (admin only)
  async update(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const nomination = await PowerlistNomination.findById(id);

      if (!nomination) {
        return res.status(404).json({ error: 'Powerlist nomination not found' });
      }

      const updateData = { ...req.body };

      // Handle image upload
      if (req.file) {
        try {
          let imageUrl;
          
          // Try S3 first if configured
          if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            const s3Key = s3Service.generateKey('powerlist-nominations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);
            
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded to S3:', imageUrl);

            // Delete old image from S3 if it exists
            if (nomination.image) {
              try {
                const oldS3Key = s3Service.extractKeyFromUrl(nomination.image);
                if (oldS3Key) {
                  await s3Service.deleteFile(oldS3Key);
                }
              } catch (deleteError) {
                console.error('Failed to delete old powerlist nomination image from S3:', deleteError);
                // Continue with the update even if old image deletion fails
              }
            }
          } else {
            // Fallback to local storage
            console.log('S3 not configured, using local storage');
            imageUrl = await this.uploadImageLocally(req.file);
          }
          
          updateData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      const updatedNomination = await nomination.update(updateData);
      res.json({
        message: 'Powerlist nomination updated successfully',
        nomination: updatedNomination.toJSON()
      });
    } catch (error) {
      console.error('Update powerlist nomination error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete powerlist nomination (soft delete, admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const nomination = await PowerlistNomination.findById(id);

      if (!nomination) {
        return res.status(404).json({ error: 'Powerlist nomination not found' });
      }

      await nomination.delete();
      res.json({ message: 'Powerlist nomination deleted successfully' });
    } catch (error) {
      console.error('Delete powerlist nomination error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search powerlist nominations (admin only)
  async search(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { q: searchTerm, ...filters } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const nominations = await PowerlistNomination.search(searchTerm, filters, limit, offset);

      // Get total count for pagination
      const totalCount = await PowerlistNomination.getSearchTotalCount(searchTerm, filters);

      res.json({
        nominations: nominations.map(nomination => nomination.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Search powerlist nominations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update powerlist nomination status (admin only)
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

      const nomination = await PowerlistNomination.findById(id);

      if (!nomination) {
        return res.status(404).json({ error: 'Powerlist nomination not found' });
      }

      const updatedNomination = await nomination.update({ status });

      res.json({
        message: 'Powerlist nomination status updated successfully',
        nomination: updatedNomination.toJSON()
      });
    } catch (error) {
      console.error('Update powerlist nomination status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Email template generators
  static generateNominationSubmissionEmailTemplate(publicationName, powerListName) {
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
              <h2>Powerlist Nomination Submitted</h2>
              <p>Thank you for nominating <strong>${publicationName}</strong> for the <strong>${powerListName}</strong> powerlist.</p>
              <p>Your nomination has been received and will be reviewed by our team shortly.</p>
              <p>You will receive an email notification once your nomination has been processed.</p>
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

module.exports = new PowerlistNominationController();