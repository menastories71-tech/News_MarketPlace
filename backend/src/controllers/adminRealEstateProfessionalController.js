const RealEstateProfessional = require('../models/RealEstateProfessional');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { s3Service } = require('../services/s3Service');

class AdminRealEstateProfessionalController {
  constructor() {
    // Configure multer for image uploads (using memory storage for S3)
    this.storage = multer.memoryStorage();

    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 1 // Maximum 1 file for professional image
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
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('ig_url').optional().isURL().withMessage('Instagram URL must be a valid URL'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('verified_tick').optional().isBoolean().withMessage('Verified tick must be a boolean'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    body('tiktok').optional().isURL().withMessage('TikTok URL must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook URL must be a valid URL'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be a valid URL'),
    body('real_estate_agency_owner').optional().isBoolean().withMessage('Real estate agency owner must be a boolean'),
    body('real_estate_agent').optional().isBoolean().withMessage('Real estate agent must be a boolean'),
    body('developer_employee').optional().isBoolean().withMessage('Developer employee must be a boolean'),
    body('gender').optional().trim(),
    body('nationality').optional().trim(),
    body('current_residence_city').optional().trim(),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Validation rules for update
  updateValidation = [
    body('first_name').optional().trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').optional().trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('ig_url').optional().isURL().withMessage('Instagram URL must be a valid URL'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('verified_tick').optional().isBoolean().withMessage('Verified tick must be a boolean'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    body('tiktok').optional().isURL().withMessage('TikTok URL must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook URL must be a valid URL'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be a valid URL'),
    body('real_estate_agency_owner').optional().isBoolean().withMessage('Real estate agency owner must be a boolean'),
    body('real_estate_agent').optional().isBoolean().withMessage('Real estate agent must be a boolean'),
    body('developer_employee').optional().isBoolean().withMessage('Developer employee must be a boolean'),
    body('gender').optional().trim(),
    body('nationality').optional().trim(),
    body('current_residence_city').optional().trim(),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Get all real estate professionals (admin management - includes all statuses)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        gender,
        nationality,
        current_residence_city
      } = req.query;

      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (status) whereClause.status = status;
        if (is_active !== undefined) whereClause.is_active = is_active === 'true';
        if (gender) whereClause.gender = gender;
        if (nationality) whereClause.nationality = nationality;
        if (current_residence_city) whereClause.current_residence_city = current_residence_city;
      }

      const limitNum = parseInt(limit);
      const offset = (page - 1) * limitNum;

      const { count, rows } = await RealEstateProfessional.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        professionals: rows.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get all real estate professionals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get real estate professional by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      res.json({ professional: professional.toJSON() });
    } catch (error) {
      console.error('Get real estate professional by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new real estate professional (admin only)
  async create(req, res) {
    console.log('AdminRealEstateProfessionalController.create - Starting');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminRealEstateProfessionalController.create - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminRealEstateProfessionalController.create - Form data already parsed by middleware');

      console.log('AdminRealEstateProfessionalController.create - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminRealEstateProfessionalController.create - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminRealEstateProfessionalController.create - Validation passed');
      const professionalData = { ...req.body };
      console.log('AdminRealEstateProfessionalController.create - Professional data prepared:', Object.keys(professionalData));

      // Handle image upload to S3
      if (req.file) {
        console.log('AdminRealEstateProfessionalController.create - Uploading image to S3');
        const s3Key = s3Service.generateKey('real-estate-professionals', 'image', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          professionalData.image = s3Url;
          console.log('AdminRealEstateProfessionalController.create - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminRealEstateProfessionalController.create - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      // Set submission details for admin creation
      professionalData.submitted_by_admin = req.admin.adminId;
      professionalData.status = professionalData.status || 'approved'; // Default to approved for admin creations
      console.log('AdminRealEstateProfessionalController.create - Final professional data:', {
        submitted_by_admin: professionalData.submitted_by_admin,
        status: professionalData.status,
        first_name: professionalData.first_name,
        last_name: professionalData.last_name
      });

      console.log('AdminRealEstateProfessionalController.create - Creating professional in database');
      const professional = await RealEstateProfessional.create(professionalData);
      console.log('AdminRealEstateProfessionalController.create - Professional created successfully:', professional.id);

      res.status(201).json({
        message: 'Real estate professional created successfully',
        professional: professional.toJSON()
      });
    } catch (error) {
      console.error('AdminRealEstateProfessionalController.create - Error:', error);
      console.error('AdminRealEstateProfessionalController.create - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update real estate professional (admin only)
  async update(req, res) {
    console.log('AdminRealEstateProfessionalController.update - Starting');
    console.log('Request params:', req.params);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminRealEstateProfessionalController.update - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminRealEstateProfessionalController.update - Form data already parsed by middleware');

      console.log('AdminRealEstateProfessionalController.update - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminRealEstateProfessionalController.update - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminRealEstateProfessionalController.update - Validation passed');
      const { id } = req.params;
      console.log('AdminRealEstateProfessionalController.update - Looking up professional with ID:', id);

      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        console.log('AdminRealEstateProfessionalController.update - Professional not found:', id);
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      console.log('AdminRealEstateProfessionalController.update - Professional found:', professional.id);
      const updateData = { ...req.body };
      console.log('AdminRealEstateProfessionalController.update - Update data prepared:', Object.keys(updateData));

      // Handle image upload to S3 for updates
      if (req.file) {
        console.log('AdminRealEstateProfessionalController.update - Uploading image to S3');
        const s3Key = s3Service.generateKey('real-estate-professionals', 'image', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          updateData.image = s3Url;
          console.log('AdminRealEstateProfessionalController.update - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminRealEstateProfessionalController.update - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      console.log('AdminRealEstateProfessionalController.update - Updating professional in database');
      const updatedProfessional = await professional.update(updateData);
      console.log('AdminRealEstateProfessionalController.update - Professional updated successfully:', updatedProfessional.id);

      res.json({
        message: 'Real estate professional updated successfully',
        professional: updatedProfessional.toJSON()
      });
    } catch (error) {
      console.error('AdminRealEstateProfessionalController.update - Error:', error);
      console.error('AdminRealEstateProfessionalController.update - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete real estate professional (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      await professional.delete();
      res.json({ message: 'Real estate professional deleted successfully' });
    } catch (error) {
      console.error('Delete real estate professional error:', error);
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
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT rp.* FROM real_estate_professionals rp
      ${whereClause} ${searchSql}
      ORDER BY rp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    // Ensure languages field is properly parsed for raw SQL results
    return result.rows.map(row => {
      if (row.languages && typeof row.languages === 'string') {
        try {
          row.languages = JSON.parse(row.languages);
        } catch (e) {
          console.error('Error parsing languages in raw query result:', e);
          row.languages = [];
        }
      }
      return new RealEstateProfessional(row);
    });
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM real_estate_professionals rp ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }
}

module.exports = AdminRealEstateProfessionalController;