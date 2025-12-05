const RealEstate = require('../models/RealEstate');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const { s3Service } = require('../services/s3Service');
const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});


class RealEstateController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getApprovedRealEstates = this.getApprovedRealEstates.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
    this.findByUserIdWithFilters = this.findByUserIdWithFilters.bind(this);
    this.getUserCount = this.getUserCount.bind(this);
    this.getMyRealEstates = this.getMyRealEstates.bind(this);
  }

  // Validation rules for user submissions
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a non-negative number'),
    body('recaptchaToken').optional().isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
  ];

  // Validation rules for admin submissions (no reCAPTCHA required)
  adminCreateValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a non-negative number'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ];

  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a non-negative number'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ];

  // Create a new real estate submission
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

      const realEstateData = { ...req.body };

      // Convert numeric fields from strings to numbers
      if (realEstateData.price && realEstateData.price !== '') {
        realEstateData.price = parseFloat(realEstateData.price);
      } else if (realEstateData.price === '') {
        delete realEstateData.price;
      }
      if (realEstateData.bedrooms && realEstateData.bedrooms !== '') {
        realEstateData.bedrooms = parseInt(realEstateData.bedrooms, 10);
      } else if (realEstateData.bedrooms === '') {
        delete realEstateData.bedrooms;
      }
      if (realEstateData.bathrooms && realEstateData.bathrooms !== '') {
        realEstateData.bathrooms = parseInt(realEstateData.bathrooms, 10);
      } else if (realEstateData.bathrooms === '') {
        delete realEstateData.bathrooms;
      }
      if (realEstateData.area_sqft && realEstateData.area_sqft !== '') {
        realEstateData.area_sqft = parseFloat(realEstateData.area_sqft);
      } else if (realEstateData.area_sqft === '') {
        delete realEstateData.area_sqft;
      }

      // Handle image uploads to S3
      const images = [];
      if (req.files && req.files.images && req.files.images.length > 0) {
        for (const file of req.files.images) {
          const s3Key = s3Service.generateKey('real-estates', 'image', file.originalname);
          const contentType = s3Service.getContentType(file.originalname);

          try {
            const s3Url = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
            images.push(s3Url);
          } catch (uploadError) {
            console.error(`Failed to upload real estate image to S3:`, uploadError);
            throw new Error('Failed to upload image');
          }
        }
      }
      realEstateData.images = images;

      // Remove recaptchaToken from data before saving
      delete realEstateData.recaptchaToken;

      // Set submission details
      realEstateData.submitted_by = req.user?.userId;
      realEstateData.submitted_by_admin = req.admin?.adminId;
      realEstateData.status = req.user ? 'pending' : (realEstateData.status || 'approved');

      const realEstate = await RealEstate.create(realEstateData);
      res.status(201).json({
        message: req.user ? 'Real estate listing submitted successfully and is pending review' : 'Real estate listing created successfully',
        realEstate: realEstate.toJSON()
      });
    } catch (error) {
      console.error('Create real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all real estates with filtering and pagination
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        title,
        location,
        property_type,
        is_active = 'true'
      } = req.query;

      // For regular users, only show their own submissions
      if (req.user && !req.admin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Build filters
      const filters = {};
      if (status) filters.status = status;
      if (req.admin && is_active !== 'true') {
        filters.is_active = is_active === 'true';
      } else if (req.admin) {
        filters.is_active = true;
      }

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (title) {
        searchSql += ` AND r.title ILIKE $${searchParamCount}`;
        searchValues.push(`%${title}%`);
        searchParamCount++;
      }

      if (location) {
        searchSql += ` AND r.location ILIKE $${searchParamCount}`;
        searchValues.push(`%${location}%`);
        searchParamCount++;
      }

      if (property_type) {
        searchSql += ` AND r.property_type ILIKE $${searchParamCount}`;
        searchValues.push(`%${property_type}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const realEstates = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        realEstates: realEstates.map(r => r.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get real estates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved real estates for public access
  async getApprovedRealEstates(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        title,
        location,
        property_type
      } = req.query;

      // Build filters - only approved and active
      const filters = {
        status: 'approved',
        is_active: true
      };

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;
  
      if (title) {
        searchSql += ` AND r.title ILIKE $${searchParamCount}`;
        searchValues.push(`%${title}%`);
        searchParamCount++;
      }
  
      if (location) {
        searchSql += ` AND r.location ILIKE $${searchParamCount}`;
        searchValues.push(`%${location}%`);
        searchParamCount++;
      }
  
      if (property_type) {
        searchSql += ` AND r.property_type ILIKE $${searchParamCount}`;
        searchValues.push(`%${property_type}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const realEstates = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        realEstates: realEstates.map(r => r.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get approved real estates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's own real estate submissions
  async getMyRealEstates(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        title,
        date_from,
        date_to
      } = req.query;

      const filters = { submitted_by: req.user.userId };
      if (status) filters.status = status;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (title) {
        searchSql += ` AND r.title ILIKE $${searchParamCount}`;
        searchValues.push(`%${title}%`);
        searchParamCount++;
      }

      if (date_from) {
        searchSql += ` AND r.created_at >= $${searchParamCount}`;
        searchValues.push(date_from);
        searchParamCount++;
      }

      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setDate(endDate.getDate() + 1);
        searchSql += ` AND r.created_at < $${searchParamCount}`;
        searchValues.push(endDate.toISOString().split('T')[0]);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const realEstates = await this.findByUserIdWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getUserCount(req.user.userId, filters, searchSql, searchValues);

      res.json({
        realEstates: realEstates.map(r => r.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get my real estates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get real estate by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        if (realEstate.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json({ realEstate: realEstate.toJSON() });
    } catch (error) {
      console.error('Get real estate by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved real estate by ID (public access)
  async getApprovedById(req, res) {
    try {
      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      // Only allow access to approved and active real estates
      if (realEstate.status !== 'approved' || !realEstate.is_active) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      res.json({ realEstate: realEstate.toJSON() });
    } catch (error) {
      console.error('Get approved real estate by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update real estate
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
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        if (realEstate.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (realEstate.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot update approved or rejected submissions' });
        }
      }

      const updateData = { ...req.body };

      // Convert numeric fields from strings to numbers
      if (updateData.price && updateData.price !== '') {
        updateData.price = parseFloat(updateData.price);
      } else if (updateData.price === '') {
        delete updateData.price;
      }
      if (updateData.bedrooms && updateData.bedrooms !== '') {
        updateData.bedrooms = parseInt(updateData.bedrooms, 10);
      } else if (updateData.bedrooms === '') {
        delete updateData.bedrooms;
      }
      if (updateData.bathrooms && updateData.bathrooms !== '') {
        updateData.bathrooms = parseInt(updateData.bathrooms, 10);
      } else if (updateData.bathrooms === '') {
        delete updateData.bathrooms;
      }
      if (updateData.area_sqft && updateData.area_sqft !== '') {
        updateData.area_sqft = parseFloat(updateData.area_sqft);
      } else if (updateData.area_sqft === '') {
        delete updateData.area_sqft;
      }

      // Handle image uploads and deletions
      let currentImages = [...(realEstate.images || [])];

      // Handle image deletions
      if (req.body.imagesToDelete && Array.isArray(req.body.imagesToDelete)) {
        const imagesToDelete = req.body.imagesToDelete;
        console.log('Images to delete:', imagesToDelete);

        // Delete images from S3
        for (const imageUrl of imagesToDelete) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(imageUrl);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error(`Failed to delete image from S3:`, deleteError);
            // Continue with other deletions even if one fails
          }
        }

        currentImages = currentImages.filter(img => !imagesToDelete.includes(img));
        console.log('Current images after deletion:', currentImages);
      }

      // Handle new image uploads
      if (req.files && req.files.images && req.files.images.length > 0) {
        const newImages = [];
        for (const file of req.files.images) {
          const s3Key = s3Service.generateKey('real-estates', 'image', file.originalname);
          const contentType = s3Service.getContentType(file.originalname);

          try {
            const s3Url = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
            newImages.push(s3Url);
          } catch (uploadError) {
            console.error(`Failed to upload new real estate image to S3:`, uploadError);
            throw new Error('Failed to upload image');
          }
        }
        console.log('New uploaded images:', newImages);
        currentImages = [...currentImages, ...newImages];
        console.log('Combined images after upload:', currentImages);
      }

      updateData.images = currentImages;
      console.log('Final updateData.images:', updateData.images, 'Type:', typeof updateData.images, 'IsArray:', Array.isArray(updateData.images));

      const updatedRealEstate = await realEstate.update(updateData);
      res.json({
        message: 'Real estate listing updated successfully',
        realEstate: updatedRealEstate.toJSON()
      });
    } catch (error) {
      console.error('Update real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete real estate (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        if (realEstate.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (realEstate.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot delete approved or rejected submissions' });
        }
      }

      // Delete associated images from S3
      if (realEstate.images && Array.isArray(realEstate.images)) {
        for (const imageUrl of realEstate.images) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(imageUrl);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete real estate image from S3:', deleteError);
            // Continue with other deletions even if one fails
          }
        }
      }

      await realEstate.update({ is_active: false });
      res.json({ message: 'Real estate listing deleted successfully' });
    } catch (error) {
      console.error('Delete real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve real estate
  async approveRealEstate(req, res) {
    try {
      const { id } = req.params;
      const admin_comments = req.body?.admin_comments;

      const realEstate = await RealEstate.findById(id);
      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      if (realEstate.status === 'approved') {
        return res.status(400).json({ error: 'Real estate is already approved' });
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

      const updatedRealEstate = await realEstate.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: realEstate.submitted_by,
          type: 'real_estate_approved',
          title: 'Real Estate Listing Approved!',
          message: `Your real estate listing for "${realEstate.title}" has been approved and is now live on our platform.`,
          related_id: realEstate.id
        });
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }

      res.json({
        message: 'Real estate listing approved successfully',
        realEstate: updatedRealEstate.toJSON()
      });
    } catch (error) {
      console.error('Approve real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject real estate
  async rejectRealEstate(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason, admin_comments } = req.body;

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const realEstate = await RealEstate.findById(id);
      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate not found' });
      }

      if (realEstate.status === 'rejected') {
        return res.status(400).json({ error: 'Real estate is already rejected' });
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

      const updatedRealEstate = await realEstate.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: realEstate.submitted_by,
          type: 'real_estate_rejected',
          title: 'Real Estate Listing Review Update',
          message: `Your real estate listing for "${realEstate.title}" has been reviewed. Please check your email for details.`,
          related_id: realEstate.id
        });
      } catch (notificationError) {
        console.error('Failed to create rejection notification:', notificationError);
      }

      res.json({
        message: 'Real estate listing rejected successfully',
        realEstate: updatedRealEstate.toJSON()
      });
    } catch (error) {
      console.error('Reject real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk approve real estates
  async bulkApprove(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const approvedRealEstates = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const realEstate = await RealEstate.findById(ids[i]);

          if (!realEstate) {
            errors.push({ index: i, error: 'Real estate not found' });
            continue;
          }

          if (realEstate.status === 'approved') {
            errors.push({ index: i, error: 'Real estate is already approved' });
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

          const updatedRealEstate = await realEstate.update(updateData);
          approvedRealEstates.push(updatedRealEstate.toJSON());

          // Send notifications
          try {
            await UserNotification.create({
              user_id: realEstate.submitted_by,
              type: 'real_estate_approved',
              title: 'Real Estate Listing Approved!',
              message: `Your real estate listing for "${realEstate.title}" has been approved.`,
              related_id: realEstate.id
            });
          } catch (notificationError) {
            console.error('Failed to create approval notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Approved ${approvedRealEstates.length} real estate listing(s) successfully`,
        approved: approvedRealEstates.length,
        errors: errors.length,
        approvedRealEstates: approvedRealEstates,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk approve real estates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk reject real estates
  async bulkReject(req, res) {
    try {
      const { ids, rejection_reason, admin_comments } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const rejectedRealEstates = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const realEstate = await RealEstate.findById(ids[i]);

          if (!realEstate) {
            errors.push({ index: i, error: 'Real estate not found' });
            continue;
          }

          if (realEstate.status === 'rejected') {
            errors.push({ index: i, error: 'Real estate is already rejected' });
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

          const updatedRealEstate = await realEstate.update(updateData);
          rejectedRealEstates.push(updatedRealEstate.toJSON());

          // Send notifications
          try {
            await UserNotification.create({
              user_id: realEstate.submitted_by,
              type: 'real_estate_rejected',
              title: 'Real Estate Listing Review Update',
              message: `Your real estate listing for "${realEstate.title}" has been reviewed.`,
              related_id: realEstate.id
            });
          } catch (notificationError) {
            console.error('Failed to create rejection notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Rejected ${rejectedRealEstates.length} real estate listing(s) successfully`,
        rejected: rejectedRealEstates.length,
        errors: errors.length,
        rejectedRealEstates: rejectedRealEstates,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk reject real estates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods for database queries
  async findAllWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE r.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND r.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;
  
    const sql = `
      SELECT r.* FROM real_estates r
      ${whereClause} ${searchSql}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    // Ensure images field is properly parsed for raw SQL results
    return result.rows.map(row => new RealEstate(row));
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE r.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND r.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM real_estates r ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  async findByUserIdWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE r.submitted_by = $1 AND r.is_active = true';
    const params = [filters.submitted_by];
    let paramCount = 2;

    Object.keys(filters).forEach(key => {
      if (key !== 'submitted_by' && filters[key] !== undefined) {
        whereClause += ` AND r.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT r.* FROM real_estates r
      ${whereClause} ${searchSql}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    // Ensure images field is properly parsed for raw SQL results
    return result.rows.map(row => {
      if (row.images && typeof row.images === 'string') {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          console.error('Error parsing images in raw query result:', e);
          row.images = [];
        }
      }
      return new RealEstate(row);
    });
  }

  async getUserCount(userId, filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE r.submitted_by = $1 AND r.is_active = true';
    const params = [userId];
    let paramCount = 2;

    Object.keys(filters).forEach(key => {
      if (key !== 'submitted_by' && filters[key] !== undefined) {
        whereClause += ` AND r.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM real_estates r ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }
}

module.exports = new RealEstateController();
module.exports = new RealEstateController();