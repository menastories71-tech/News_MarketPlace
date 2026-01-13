const RealEstate = require('../models/RealEstate');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { s3Service } = require('../services/s3Service');

class AdminRealEstateController {
  // Configure multer for file uploads (using memory storage for S3)
  constructor() {
    this.storage = multer.memoryStorage();

    this.fileFilter = (req, file, cb) => {
      // Allow common image types
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP images are allowed.'));
      }
    };

    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per image
        files: 10 // Maximum 10 images
      }
    });

  }


  // Validation rules for create
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
  ];

  // Validation rules for update
  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
  ];

  // Get all real estate records
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        location,
        property_type,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (status) whereClause.status = status;
        if (location) whereClause.location = location;
        if (property_type) whereClause.property_type = property_type;
      }

      const limitNum = parseInt(limit);
      const offset = (page - 1) * limitNum;

      const { count, rows } = await RealEstate.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        realEstates: rows.map(re => re.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get real estate records error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get real estate record by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate record not found' });
      }

      res.json({ realEstate: realEstate.toJSON() });
    } catch (error) {
      console.error('Get real estate by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new real estate record (admin only)
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

      const realEstateData = req.body;

      // Handle image files upload to S3
      if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (const imageFile of req.files) {
          try {
            // Basic file size check (skip compression for now)
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (imageFile.size > maxSize) {
              throw new Error(`Image ${imageFile.originalname} is too large (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
            }

            const s3Key = s3Service.generateKey('real-estate', 'image', imageFile.originalname);
            const contentType = s3Service.getContentType(imageFile.originalname);

            try {
              const s3Url = await s3Service.uploadFile(imageFile.buffer, s3Key, contentType, imageFile.originalname);
              imageUrls.push(s3Url);
            } catch (uploadError) {
              console.error('Failed to upload image to S3:', uploadError);
              throw new Error('Failed to upload image');
            }
          } catch (fileError) {
            console.error('File processing error:', fileError);
            return res.status(400).json({ error: fileError.message });
          }
        }
        realEstateData.images = imageUrls;
      }

      const realEstate = await RealEstate.create(realEstateData);

      res.status(201).json({
        message: 'Real estate record created successfully',
        realEstate: realEstate.toJSON()
      });
    } catch (error) {
      console.error('Create real estate error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update real estate record (admin only)
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
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate record not found' });
      }

      const updateData = req.body;

      // Handle image files upload to S3 for updates
      if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (const imageFile of req.files) {
          try {
            // Basic file size check (skip compression for now)
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (imageFile.size > maxSize) {
              throw new Error(`Image ${imageFile.originalname} is too large (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
            }

            const s3Key = s3Service.generateKey('real-estate', 'image', imageFile.originalname);
            const contentType = s3Service.getContentType(imageFile.originalname);

            try {
              const s3Url = await s3Service.uploadFile(imageFile.buffer, s3Key, contentType, imageFile.originalname);
              imageUrls.push(s3Url);
            } catch (uploadError) {
              console.error('Failed to upload image to S3:', uploadError);
              throw new Error('Failed to upload image');
            }
          } catch (fileError) {
            console.error('File processing error:', fileError);
            return res.status(400).json({ error: fileError.message });
          }
        }
        updateData.images = imageUrls;
      }

      const updatedRealEstate = await realEstate.update(updateData);
      res.json({
        message: 'Real estate record updated successfully',
        realEstate: updatedRealEstate.toJSON()
      });
    } catch (error) {
      console.error('Update real estate error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete real estate record (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate record not found' });
      }

      await realEstate.delete();
      res.json({ message: 'Real estate record deleted successfully' });
    } catch (error) {
      console.error('Delete real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AdminRealEstateController;