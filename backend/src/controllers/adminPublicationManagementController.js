const PublicationManagement = require('../models/PublicationManagement');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { s3Service } = require('../services/s3Service');

class AdminPublicationManagementController {
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
        fileSize: 5 * 1024 * 1024, // 5MB limit for publication images
        files: 1 // Only one image file
      }
    });

  }


  // Validation rules for create
  createValidation = [
    body('region').trim().isLength({ min: 1 }).withMessage('Region is required'),
    body('publication_name').trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_url').optional().isURL().withMessage('Valid publication URL is required'),
    body('da').optional().isInt({ min: 0, max: 100 }).withMessage('DA must be between 0 and 100'),
    body('article_reference_link').optional().isURL().withMessage('Valid article reference link is required'),
    body('committed_tat').optional().isInt({ min: 0 }).withMessage('Committed TAT must be a non-negative integer'),
    body('language').optional().trim(),
    body('publication_primary_focus').optional().trim(),
    body('practical_tat').optional().isInt({ min: 0 }).withMessage('Practical TAT must be a non-negative integer'),
    body('price_usd').optional().isFloat({ min: 0 }).withMessage('Price USD must be a positive number'),
    body('do_follow').optional().isBoolean().withMessage('Do follow must be a boolean'),
    body('dr').optional().isInt({ min: 0, max: 100 }).withMessage('DR must be between 0 and 100'),
    body('word_limit').optional().isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('needs_images').optional().isBoolean().withMessage('Needs images must be a boolean'),
    body('image_count').optional().isInt({ min: 0, max: 2 }).withMessage('Image count must be 0, 1 or 2'),
    // Image validation removed since it's now a file upload
    body('rating_type').optional().isIn(['Customer Choice', 'Best Seller', 'Editor\'s Pick', 'Trending', 'Featured']).withMessage('Invalid rating type'),
    body('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook must be a valid URL'),
    body('twitter').optional().isURL().withMessage('Twitter must be a valid URL'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    body('remarks').optional().trim(),
  ];

  // Validation rules for update
  updateValidation = [
    body('region').optional().trim().isLength({ min: 1 }).withMessage('Region is required'),
    body('publication_name').optional().trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_url').optional().isURL().withMessage('Valid publication URL is required'),
    body('da').optional().isInt({ min: 0, max: 100 }).withMessage('DA must be between 0 and 100'),
    body('article_reference_link').optional().isURL().withMessage('Valid article reference link is required'),
    body('committed_tat').optional().isInt({ min: 0 }).withMessage('Committed TAT must be a non-negative integer'),
    body('language').optional().trim(),
    body('publication_primary_focus').optional().trim(),
    body('practical_tat').optional().isInt({ min: 0 }).withMessage('Practical TAT must be a non-negative integer'),
    body('price_usd').optional().isFloat({ min: 0 }).withMessage('Price USD must be a positive number'),
    body('do_follow').optional().isBoolean().withMessage('Do follow must be a boolean'),
    body('dr').optional().isInt({ min: 0, max: 100 }).withMessage('DR must be between 0 and 100'),
    body('word_limit').optional().isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('needs_images').optional().isBoolean().withMessage('Needs images must be a boolean'),
    body('image_count').optional().isInt({ min: 0, max: 2 }).withMessage('Image count must be 0, 1 or 2'),
    // Image validation removed since it's now a file upload
    body('rating_type').optional().isIn(['Customer Choice', 'Best Seller', 'Editor\'s Pick', 'Trending', 'Featured']).withMessage('Invalid rating type'),
    body('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook must be a valid URL'),
    body('twitter').optional().isURL().withMessage('Twitter must be a valid URL'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    body('remarks').optional().trim(),
  ];

  // Get all publication management records
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        region,
        language,
        publication_name,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (region) whereClause.region = region;
        if (language) whereClause.language = language;
        if (publication_name) whereClause.publication_name = publication_name;
      }

      const limitNum = parseInt(limit);
      const offset = (page - 1) * limitNum;

      const { count, rows } = await PublicationManagement.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        publications: rows.map(pub => pub.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get publication management records error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get publication management record by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const publication = await PublicationManagement.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication management record not found' });
      }

      res.json({ publication: publication.toJSON() });
    } catch (error) {
      console.error('Get publication management by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new publication management record (admin only)
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

      const publicationData = req.body;

      // Handle image file upload to S3
      if (req.file) {
        try {
          const imageFile = req.file;

          // Basic file size check (skip compression for now)
          const maxSize = 5 * 1024 * 1024; // 5MB limit
          if (imageFile.size > maxSize) {
            throw new Error(`Image ${imageFile.originalname} is too large (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
          }

          const s3Key = s3Service.generateKey('publications', 'image', imageFile.originalname);
          const contentType = s3Service.getContentType(imageFile.originalname);

          try {
            const s3Url = await s3Service.uploadFile(imageFile.buffer, s3Key, contentType, imageFile.originalname);
            publicationData.image = s3Url;
          } catch (uploadError) {
            console.error('Failed to upload image to S3:', uploadError);
            throw new Error('Failed to upload image');
          }
        } catch (fileError) {
          console.error('File processing error:', fileError);
          return res.status(400).json({ error: fileError.message });
        }
      }

      const publication = await PublicationManagement.create(publicationData);

      res.status(201).json({
        message: 'Publication management record created successfully',
        publication: publication.toJSON()
      });
    } catch (error) {
      console.error('Create publication management error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update publication management record (admin only)
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
      const publication = await PublicationManagement.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication management record not found' });
      }

      const updateData = req.body;

      // Handle image file upload to S3 for updates
      if (req.file) {
        try {
          const imageFile = req.file;

          // Basic file size check (skip compression for now)
          const maxSize = 5 * 1024 * 1024; // 5MB limit
          if (imageFile.size > maxSize) {
            throw new Error(`Image ${imageFile.originalname} is too large (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
          }

          const s3Key = s3Service.generateKey('publications', 'image', imageFile.originalname);
          const contentType = s3Service.getContentType(imageFile.originalname);

          try {
            const s3Url = await s3Service.uploadFile(imageFile.buffer, s3Key, contentType, imageFile.originalname);
            updateData.image = s3Url;
          } catch (uploadError) {
            console.error('Failed to upload image to S3:', uploadError);
            throw new Error('Failed to upload image');
          }
        } catch (fileError) {
          console.error('File processing error:', fileError);
          return res.status(400).json({ error: fileError.message });
        }
      }

      const updatedPublication = await publication.update(updateData);
      res.json({
        message: 'Publication management record updated successfully',
        publication: updatedPublication.toJSON()
      });
    } catch (error) {
      console.error('Update publication management error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete publication management record (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const publication = await PublicationManagement.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication management record not found' });
      }

      await publication.delete();
      res.json({ message: 'Publication management record deleted successfully' });
    } catch (error) {
      console.error('Delete publication management error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AdminPublicationManagementController;