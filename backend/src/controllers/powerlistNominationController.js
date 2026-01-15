const PowerlistNomination = require('../models/PowerlistNomination');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const { rateLimiter } = require('../middleware/rateLimit');
const { s3Service } = require('../services/s3Service');
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
    body('is_active').optional().custom((value) => {
      if (value === undefined || value === 'true' || value === 'false' || value === true || value === false) {
        return true;
      }
      throw new Error('is_active must be true or false');
    }),
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
            console.log('Using S3 for image upload');
            const s3Key = s3Service.generateKey('powerlist-nominations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);

            // S3 service handles its own image optimization, so pass raw buffer
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded to S3:', imageUrl);
          } else {
            // Fallback to local storage with local optimization
            console.log('S3 not configured, using local storage with optimization');
            imageUrl = await this.uploadImageLocally(req.file);
          }

          nominationData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      const nomination = await PowerlistNomination.create(nominationData);

      res.status(201).json({
        message: 'Powerlist nomination created successfully',
        nomination: nomination.toJSON()
      });
    } catch (error) {
      console.error('Create powerlist nomination error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Local image upload helper
  async uploadImageLocally(file) {
    try {
      // Check file size before processing
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image file is too large. Maximum size is 10MB.');
      }

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
        .resize(800, 600, { withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: 70, progressive: true })
        .toBuffer();

      // Check optimized size
      if (optimizedBuffer.length > 2 * 1024 * 1024) {
        // If still too large, compress more aggressively
        const extraCompressedBuffer = await sharp(file.buffer)
          .resize(600, 400, { withoutEnlargement: true, fit: 'inside' })
          .jpeg({ quality: 60, progressive: true })
          .toBuffer();

        if (extraCompressedBuffer.length <= 2 * 1024 * 1024) {
          await fs.promises.writeFile(filepath, extraCompressedBuffer);
        } else {
          throw new Error('Unable to compress image to acceptable size. Please use a smaller image.');
        }
      } else {
        // Save file
        await fs.promises.writeFile(filepath, optimizedBuffer);
      }

      // Return local URL
      const localUrl = `/uploads/powerlist-nominations/${filename}`;
      console.log('Successfully saved image locally:', localUrl);

      return localUrl;
    } catch (error) {
      console.error('Local image upload error:', error);
      throw new Error(`Failed to save image locally: ${error.message}`);
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
        power_list_name,
        tentative_month
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (industry) filters.industry = industry;
      if (location_region) filters.location_region = location_region;
      if (company_or_individual) filters.company_or_individual = company_or_individual;
      if (tentative_month) filters.tentative_month = tentative_month;

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
            console.log('Using S3 for image upload (update)');
            const s3Key = s3Service.generateKey('powerlist-nominations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);

            // S3 service handles its own image optimization
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
            // Fallback to local storage with local optimization
            console.log('S3 not configured, using local storage (update)');
            imageUrl = await this.uploadImageLocally(req.file);
          }

          updateData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          throw new Error(`Image upload failed: ${errorMessage}`);
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

  // Get public approved powerlist nominations
  async getPublic(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        industry,
        company_or_individual,
        location_region,
        publication_name,
        power_list_name,
        tentative_month
      } = req.query;

      const filters = {
        status: 'approved',
        is_active: true
      };

      if (industry) filters.industry = industry;
      if (company_or_individual) filters.company_or_individual = company_or_individual;
      if (location_region) filters.location_region = location_region;
      if (tentative_month) filters.tentative_month = tentative_month;

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
      console.error('Get public powerlist nominations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get public approved powerlist nomination by ID
  async getPublicById(req, res) {
    try {
      const { id } = req.params;

      const nomination = await PowerlistNomination.findById(id);

      if (!nomination) {
        return res.status(404).json({ error: 'Powerlist nomination not found' });
      }

      // Check if nomination is approved and active
      if (nomination.status !== 'approved' || !nomination.is_active) {
        return res.status(404).json({ error: 'Powerlist nomination not found' });
      }

      res.json({ nomination: nomination.toJSON() });
    } catch (error) {
      console.error('Get public powerlist nomination by ID error:', error);
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

  // Download CSV template for bulk upload
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'publication_name',
        'website_url',
        'power_list_name',
        'industry',
        'company_or_individual',
        'tentative_month',
        'location_region',
        'last_power_list_url',
        'status'
      ];

      const dummyData = [
        ['Tech Weekly', 'https://techweekly.com', 'Top 100 Tech Leaders', 'Technology', 'Individual', 'March', 'UAE', 'https://techweekly.com/powerlist-2024', 'pending'],
        ['Business Today', 'https://businesstoday.com', 'Most Influential CEOs', 'Finance', 'Individual', 'June', 'USA', 'https://businesstoday.com/ceos-2024', 'pending'],
        ['Healthcare Magazine', 'https://healthcaremag.com', 'Healthcare Innovators', 'Healthcare', 'Company', 'September', 'UK', '', 'pending']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=powerlist_nominations_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export CSV with filtering and sorting
  async exportCSV(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { Parser } = require('json2csv');
      const {
        status,
        industry,
        location_region,
        company_or_individual,
        publication_name,
        power_list_name,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
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

      // Fetch all matching records (no limit)
      const nominations = await PowerlistNomination.findAll(filters, searchSql, searchValues, 100000, 0);

      const fields = [
        'id',
        'publication_name',
        'website_url',
        'power_list_name',
        'industry',
        'company_or_individual',
        'tentative_month',
        'location_region',
        'last_power_list_url',
        'status',
        'is_active',
        'created_at',
        'updated_at'
      ];

      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(nominations.map(n => n.toJSON()));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=powerlist_nominations_export.csv');
      return res.send(csv);

    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload powerlist nominations from CSV
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
                // Basic mapping and cleaning
                const nominationData = {
                  publication_name: row.publication_name || '',
                  website_url: row.website_url || '',
                  power_list_name: row.power_list_name || '',
                  industry: row.industry || '',
                  company_or_individual: row.company_or_individual || '',
                  tentative_month: row.tentative_month || '',
                  location_region: row.location_region || '',
                  last_power_list_url: row.last_power_list_url || '',
                  status: row.status || 'pending',
                  is_active: true
                };

                if (!nominationData.publication_name || !nominationData.power_list_name || !nominationData.industry || !nominationData.company_or_individual) {
                  errors.push(`Row ${index + 1}: Publication name, power list name, industry, and company/individual are required.`);
                  continue;
                }

                const record = await PowerlistNomination.create(nominationData);
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