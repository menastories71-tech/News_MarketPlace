const PressPack = require('../models/PressPack');
const Publication = require('../models/Publication');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { s3Service } = require('../services/s3Service');

class AdminPressPackController {
  constructor() {
    // Configure multer for image uploads (using memory storage for S3)
    this.storage = multer.memoryStorage();

    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 1 // Maximum 1 file for press pack image
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });

    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
  }

  // Validation rules for create
  createValidation = [
    body().custom((body) => {
      const hasName = body.press_release_name || body.name || body.distribution_package;
      if (!hasName) {
        throw new Error('Name is required (press_release_name, name, or distribution_package)');
      }
      return true;
    }),
    body('press_release_name').optional().trim().isLength({ min: 1 }).withMessage('Press release name must be at least 1 character'),
    body('distribution_package').optional().trim().isLength({ min: 1 }).withMessage('Distribution package must be at least 1 character'),
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name must be at least 1 character'),
    body('region').optional().trim(),
    body('niche').optional().trim(),
    body('industry').optional().trim(),
    body('description').optional().trim(),
    body('news').optional().trim(),
    body('content_writing_assistance').optional().isBoolean().withMessage('Content writing assistance must be a boolean'),
    body('indexed').optional().isBoolean().withMessage('Indexed must be a boolean'),
    body('disclaimer').optional().trim(),
    body('distribution_media_websites').optional().isInt({ min: 0 }).withMessage('Distribution media websites must be a non-negative integer'),
    body('distribution_to_no_of_media_websites').optional().isInt({ min: 0 }).withMessage('Distribution to no of media websites must be a non-negative integer'),
    body('guaranteed_media_placements').optional().isInt({ min: 0 }).withMessage('Guaranteed media placements must be a non-negative integer'),
    body('guaranteed_no_of_media_placements').optional().isInt({ min: 0 }).withMessage('Guaranteed no of media placements must be a non-negative integer'),
    body('end_client_media_details').optional().trim(),
    body('end_client_media_details_in_press_release').optional().trim(),
    body('middlemen_contact_details').optional().trim(),
    body('middlemen_or_pr_agency_contact_details_in_press_release').optional().trim(),
    body('google_search_optimised_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google search optimised status must be Not Guaranteed or Guaranteed'),
    body('google_news_index_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google news index status must be Not Guaranteed or Guaranteed'),
    body('images_allowed').optional().isInt({ min: 0 }).withMessage('Images allowed must be a non-negative integer'),
    body('no_of_images_allowed').optional().isInt({ min: 0 }).withMessage('No of images allowed must be a non-negative integer'),
    body('word_limit').optional().isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('words_limit').optional().isInt({ min: 0 }).withMessage('Words limit must be a non-negative integer'),
    body('package_options').optional().isArray().withMessage('Package options must be an array'),
    body('press_release_package_options').optional().isArray().withMessage('Press release package options must be an array'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('turnaround_time').optional().trim(),
    body('turnaround_time_in_days').optional().trim(),
    body('customer_info_needed').optional().trim(),
    body('information_and_documents_needed_from_customers').optional().trim(),
    body('language').optional().trim(),
    body('link').optional().isURL().withMessage('Link must be a valid URL'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Validation rules for update
  updateValidation = [
    body('press_release_name').optional().trim().isLength({ min: 1 }).withMessage('Press release name must be at least 1 character'),
    body('distribution_package').optional().trim().isLength({ min: 1 }).withMessage('Distribution package must be at least 1 character'),
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name must be at least 1 character'),
    body('region').optional().trim(),
    body('niche').optional().trim(),
    body('industry').optional().trim(),
    body('description').optional().trim(),
    body('news').optional().trim(),
    body('content_writing_assistance').optional().isBoolean().withMessage('Content writing assistance must be a boolean'),
    body('indexed').optional().isBoolean().withMessage('Indexed must be a boolean'),
    body('disclaimer').optional().trim(),
    body('distribution_media_websites').optional().isInt({ min: 0 }).withMessage('Distribution media websites must be a non-negative integer'),
    body('distribution_to_no_of_media_websites').optional().isInt({ min: 0 }).withMessage('Distribution to no of media websites must be a non-negative integer'),
    body('guaranteed_media_placements').optional().isInt({ min: 0 }).withMessage('Guaranteed media placements must be a non-negative integer'),
    body('guaranteed_no_of_media_placements').optional().isInt({ min: 0 }).withMessage('Guaranteed no of media placements must be a non-negative integer'),
    body('end_client_media_details').optional().trim(),
    body('end_client_media_details_in_press_release').optional().trim(),
    body('middlemen_contact_details').optional().trim(),
    body('middlemen_or_pr_agency_contact_details_in_press_release').optional().trim(),
    body('google_search_optimised_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google search optimised status must be Not Guaranteed or Guaranteed'),
    body('google_news_index_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google news index status must be Not Guaranteed or Guaranteed'),
    body('images_allowed').optional().isInt({ min: 0 }).withMessage('Images allowed must be a non-negative integer'),
    body('no_of_images_allowed').optional().isInt({ min: 0 }).withMessage('No of images allowed must be a non-negative integer'),
    body('word_limit').optional().isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('words_limit').optional().isInt({ min: 0 }).withMessage('Words limit must be a non-negative integer'),
    body('package_options').optional().isArray().withMessage('Package options must be an array'),
    body('press_release_package_options').optional().isArray().withMessage('Press release package options must be an array'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('turnaround_time').optional().trim(),
    body('turnaround_time_in_days').optional().trim(),
    body('customer_info_needed').optional().trim(),
    body('information_and_documents_needed_from_customers').optional().trim(),
    body('language').optional().trim(),
    body('link').optional().isURL().withMessage('Link must be a valid URL'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Get all press packs (admin management)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        region,
        industry,
        indexed,
        language,
        is_active,
        distribution_package,
        news
      } = req.query;

      // Build filters
      const filters = {};
      if (indexed !== undefined) filters.indexed = indexed === 'true';
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (region) {
        searchSql += ` AND pp.region ILIKE $${searchParamCount}`;
        searchValues.push(`%${region}%`);
        searchParamCount++;
      }

      if (industry) {
        searchSql += ` AND pp.industry ILIKE $${searchParamCount}`;
        searchValues.push(`%${industry}%`);
        searchParamCount++;
      }

      if (language) {
        searchSql += ` AND pp.language ILIKE $${searchParamCount}`;
        searchValues.push(`%${language}%`);
        searchParamCount++;
      }

      if (distribution_package) {
        searchSql += ` AND pp.distribution_package ILIKE $${searchParamCount}`;
        searchValues.push(`%${distribution_package}%`);
        searchParamCount++;
      }

      if (news) {
        searchSql += ` AND pp.news ILIKE $${searchParamCount}`;
        searchValues.push(`%${news}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const pressPacks = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        pressPacks: pressPacks.map(pp => pp.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all press packs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get press pack by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      res.json({ pressPack: pressPack.toJSON() });
    } catch (error) {
      console.error('Get press pack by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new press pack (admin only)
  async create(req, res) {
    console.log('AdminPressPackController.create - Starting');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminPressPackController.create - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminPressPackController.create - Form data already parsed by middleware');

      console.log('AdminPressPackController.create - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminPressPackController.create - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminPressPackController.create - Validation passed');
      const pressPackData = { ...req.body };

      // Map frontend field names to backend field names
      if (pressPackData.press_release_name) pressPackData.name = pressPackData.press_release_name;
      if (pressPackData.distribution_to_no_of_media_websites) pressPackData.distribution_media_websites = pressPackData.distribution_to_no_of_media_websites;
      if (pressPackData.guaranteed_no_of_media_placements) pressPackData.guaranteed_media_placements = pressPackData.guaranteed_no_of_media_placements;
      if (pressPackData.end_client_media_details_in_press_release) pressPackData.end_client_media_details = pressPackData.end_client_media_details_in_press_release;
      if (pressPackData.middlemen_or_pr_agency_contact_details_in_press_release) pressPackData.middlemen_contact_details = pressPackData.middlemen_or_pr_agency_contact_details_in_press_release;
      if (pressPackData.google_search_optimised_status) pressPackData.google_search_optimised_status = pressPackData.google_search_optimised_status;
      if (pressPackData.google_news_index_status) pressPackData.google_news_index_status = pressPackData.google_news_index_status;
      if (pressPackData.no_of_images_allowed) pressPackData.images_allowed = pressPackData.no_of_images_allowed;
      if (pressPackData.word_limit) pressPackData.word_limit = pressPackData.word_limit;
      if (pressPackData.press_release_package_options) pressPackData.package_options = pressPackData.press_release_package_options;
      if (pressPackData.turnaround_time_in_days) pressPackData.turnaround_time = pressPackData.turnaround_time_in_days;
      if (pressPackData.information_and_documents_needed_from_customers) pressPackData.customer_info_needed = pressPackData.information_and_documents_needed_from_customers;
      if (pressPackData.description) pressPackData.description = pressPackData.description;
      if (pressPackData.content_writing_assistance) pressPackData.content_writing_assistance = pressPackData.content_writing_assistance === 'true' || pressPackData.content_writing_assistance === true;

      console.log('AdminPressPackController.create - Press pack data prepared:', Object.keys(pressPackData));

      // Handle image upload to S3
      if (req.file) {
        console.log('AdminPressPackController.create - Uploading image to S3');
        const s3Key = s3Service.generateKey('press-packs', 'image_logo', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          pressPackData.image_logo = s3Url;
          console.log('AdminPressPackController.create - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminPressPackController.create - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      console.log('AdminPressPackController.create - Creating press pack in database');
      const pressPack = await PressPack.create(pressPackData);
      console.log('AdminPressPackController.create - Press pack created successfully:', pressPack.id);

      res.status(201).json({
        message: 'Press pack created successfully',
        pressPack: pressPack.toJSON()
      });
    } catch (error) {
      console.error('AdminPressPackController.create - Error:', error);
      console.error('AdminPressPackController.create - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update press pack (admin only)
  async update(req, res) {
    console.log('AdminPressPackController.update - Starting');
    console.log('Request params:', req.params);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminPressPackController.update - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminPressPackController.update - Form data already parsed by middleware');

      console.log('AdminPressPackController.update - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminPressPackController.update - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminPressPackController.update - Validation passed');
      const { id } = req.params;
      console.log('AdminPressPackController.update - Looking up press pack with ID:', id);

      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        console.log('AdminPressPackController.update - Press pack not found:', id);
        return res.status(404).json({ error: 'Press pack not found' });
      }

      console.log('AdminPressPackController.update - Press pack found:', pressPack.id);
      const updateData = { ...req.body };

      // Map frontend field names to backend field names
      if (updateData.press_release_name) updateData.name = updateData.press_release_name;
      if (updateData.distribution_to_no_of_media_websites) updateData.distribution_media_websites = updateData.distribution_to_no_of_media_websites;
      if (updateData.guaranteed_no_of_media_placements) updateData.guaranteed_media_placements = updateData.guaranteed_no_of_media_placements;
      if (updateData.end_client_media_details_in_press_release) updateData.end_client_media_details = updateData.end_client_media_details_in_press_release;
      if (updateData.middlemen_or_pr_agency_contact_details_in_press_release) updateData.middlemen_contact_details = updateData.middlemen_or_pr_agency_contact_details_in_press_release;
      if (updateData.google_search_optimised_status) updateData.google_search_optimised_status = updateData.google_search_optimised_status;
      if (updateData.google_news_index_status) updateData.google_news_index_status = updateData.google_news_index_status;
      if (updateData.no_of_images_allowed) updateData.images_allowed = updateData.no_of_images_allowed;
      if (updateData.word_limit) updateData.word_limit = updateData.word_limit;
      if (updateData.press_release_package_options) updateData.package_options = updateData.press_release_package_options;
      if (updateData.turnaround_time_in_days) updateData.turnaround_time = updateData.turnaround_time_in_days;
      if (updateData.information_and_documents_needed_from_customers) updateData.customer_info_needed = updateData.information_and_documents_needed_from_customers;
      if (updateData.description) updateData.description = updateData.description;
      if (updateData.content_writing_assistance !== undefined) updateData.content_writing_assistance = updateData.content_writing_assistance === 'true' || updateData.content_writing_assistance === true;

      console.log('AdminPressPackController.update - Update data prepared:', Object.keys(updateData));

      // Handle image upload to S3 for updates
      if (req.file) {
        console.log('AdminPressPackController.update - Uploading image to S3');
        const s3Key = s3Service.generateKey('press-packs', 'image_logo', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          updateData.image_logo = s3Url;
          console.log('AdminPressPackController.update - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminPressPackController.update - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      console.log('AdminPressPackController.update - Updating press pack in database');
      const updatedPressPack = await pressPack.update(updateData);
      console.log('AdminPressPackController.update - Press pack updated successfully:', updatedPressPack.id);

      res.json({
        message: 'Press pack updated successfully',
        pressPack: updatedPressPack.toJSON()
      });
    } catch (error) {
      console.error('AdminPressPackController.update - Error:', error);
      console.error('AdminPressPackController.update - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete press pack (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      await pressPack.delete();
      res.json({ message: 'Press pack deleted successfully' });
    } catch (error) {
      console.error('Delete press pack error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods for database queries
  async findAllWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND pp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT pp.* FROM press_packs pp
      ${whereClause} ${searchSql}
      ORDER BY pp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows.map(row => new PressPack(row));
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND pp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM press_packs pp ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }
}

module.exports = AdminPressPackController;