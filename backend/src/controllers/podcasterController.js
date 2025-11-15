const Podcaster = require('../models/Podcaster');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/podcasters');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueSuffix = timestamp + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'podcaster-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Maximum 1 image file
  }
});

class PodcasterController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getApprovedPodcasters = this.getApprovedPodcasters.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
    this.findByUserIdWithFilters = this.findByUserIdWithFilters.bind(this);
    this.getUserCount = this.getUserCount.bind(this);
  }
  // Validation rules for user submissions
  createValidation = [
    body('podcast_name').trim().isLength({ min: 1 }).withMessage('Podcast name is required'),
    body('podcast_host').optional().trim().isLength({ min: 1 }).withMessage('Podcast host is required'),
    body('podcast_focus_industry').optional().trim(),
    body('podcast_target_audience').optional().trim(),
    body('podcast_region').optional().trim(),
    body('podcast_website').optional().isURL().withMessage('Valid podcast website URL is required'),
    body('podcast_ig').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('podcast_linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('podcast_facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('podcast_ig_username').optional().trim(),
    body('podcast_ig_followers').optional().isInt({ min: 0 }).withMessage('Instagram followers must be a non-negative integer'),
    body('podcast_ig_engagement_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Instagram engagement rate must be between 0 and 100'),
    body('podcast_ig_prominent_guests').optional().trim(),
    body('spotify_channel_name').optional().trim(),
    body('spotify_channel_url').optional().isURL().withMessage('Valid Spotify URL is required'),
    body('youtube_channel_name').optional().trim(),
    body('youtube_channel_url').optional().isURL().withMessage('Valid YouTube URL is required'),
    body('tiktok').optional().isURL().withMessage('Valid TikTok URL is required'),
    body('cta').optional().trim(),
    body('contact_us_to_be_on_podcast').optional().trim(),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be one of: male, female, other'),
    body('nationality').optional().trim().isLength({ min: 1 }).withMessage('Nationality is required'),
    body('recaptchaToken').isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
  ];

  // Validation rules for admin submissions (no reCAPTCHA required)
  adminCreateValidation = [
    body('podcast_name').trim().isLength({ min: 1 }).withMessage('Podcast name is required'),
    body('podcast_host').optional().trim(),
    body('podcast_focus_industry').optional().trim(),
    body('podcast_target_audience').optional().trim(),
    body('podcast_region').optional().trim(),
    body('podcast_website').optional().isURL().withMessage('Valid podcast website URL is required'),
    body('podcast_ig').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('podcast_linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('podcast_facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('podcast_ig_username').optional().trim(),
    body('podcast_ig_followers').optional().isInt({ min: 0 }).withMessage('Instagram followers must be a non-negative integer'),
    body('podcast_ig_engagement_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Instagram engagement rate must be between 0 and 100'),
    body('podcast_ig_prominent_guests').optional().trim(),
    body('spotify_channel_name').optional().trim(),
    body('spotify_channel_url').optional().isURL().withMessage('Valid Spotify URL is required'),
    body('youtube_channel_name').optional().trim(),
    body('youtube_channel_url').optional().isURL().withMessage('Valid YouTube URL is required'),
    body('tiktok').optional().isURL().withMessage('Valid TikTok URL is required'),
    body('cta').optional().trim(),
    body('contact_us_to_be_on_podcast').optional().trim(),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be one of: male, female, other'),
    body('nationality').optional().trim().isLength({ min: 1 }).withMessage('Nationality is required'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ];

  updateValidation = [
    body('podcast_name').optional().trim().isLength({ min: 1 }).withMessage('Podcast name is required'),
    body('podcast_host').optional().trim(),
    body('podcast_focus_industry').optional().trim(),
    body('podcast_target_audience').optional().trim(),
    body('podcast_region').optional().trim(),
    body('podcast_website').optional().isURL().withMessage('Valid podcast website URL is required'),
    body('podcast_ig').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('podcast_linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('podcast_facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('podcast_ig_username').optional().trim(),
    body('podcast_ig_followers').optional().isInt({ min: 0 }).withMessage('Instagram followers must be a non-negative integer'),
    body('podcast_ig_engagement_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Instagram engagement rate must be between 0 and 100'),
    body('podcast_ig_prominent_guests').optional().trim(),
    body('spotify_channel_name').optional().trim(),
    body('spotify_channel_url').optional().isURL().withMessage('Valid Spotify URL is required'),
    body('youtube_channel_name').optional().trim(),
    body('youtube_channel_url').optional().isURL().withMessage('Valid YouTube URL is required'),
    body('tiktok').optional().isURL().withMessage('Valid TikTok URL is required'),
    body('cta').optional().trim(),
    body('contact_us_to_be_on_podcast').optional().trim(),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be one of: male, female, other'),
    body('nationality').optional().trim().isLength({ min: 1 }).withMessage('Nationality is required'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ];

  // Create a new podcaster submission
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

      const podcasterData = { ...req.body };

      // Convert numeric fields from strings to numbers
      if (podcasterData.podcast_ig_followers && podcasterData.podcast_ig_followers !== '') {
        podcasterData.podcast_ig_followers = parseInt(podcasterData.podcast_ig_followers, 10);
      } else if (podcasterData.podcast_ig_followers === '') {
        delete podcasterData.podcast_ig_followers;
      }
      if (podcasterData.podcast_ig_engagement_rate && podcasterData.podcast_ig_engagement_rate !== '') {
        podcasterData.podcast_ig_engagement_rate = parseFloat(podcasterData.podcast_ig_engagement_rate);
      } else if (podcasterData.podcast_ig_engagement_rate === '') {
        delete podcasterData.podcast_ig_engagement_rate;
      }

      // Handle image upload
      if (req.file) {
        podcasterData.image = req.file.filename;
      }

      // Remove recaptchaToken from data before saving
      delete podcasterData.recaptchaToken;

      // Set submission details
      podcasterData.submitted_by = req.user?.userId;
      podcasterData.submitted_by_admin = req.admin?.adminId;
      podcasterData.status = req.user ? 'pending' : (podcasterData.status || 'pending');

      const podcaster = await Podcaster.create(podcasterData);
      res.status(201).json({
        message: req.user ? 'Podcaster profile submitted successfully and is pending review' : 'Podcaster profile created successfully',
        podcaster: podcaster.toJSON()
      });
    } catch (error) {
      console.error('Create podcaster error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all podcasters with filtering and pagination
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        podcast_name,
        podcast_host,
        podcast_focus_industry,
        podcast_region,
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

      if (podcast_name) {
        searchSql += ` AND p.podcast_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_name}%`);
        searchParamCount++;
      }

      if (podcast_host) {
        searchSql += ` AND p.podcast_host ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_host}%`);
        searchParamCount++;
      }

      if (podcast_focus_industry) {
        searchSql += ` AND p.podcast_focus_industry ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_focus_industry}%`);
        searchParamCount++;
      }

      if (podcast_region) {
        searchSql += ` AND p.podcast_region ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_region}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const podcasters = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        podcasters: podcasters.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get podcasters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved podcasters for public access
  async getApprovedPodcasters(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        podcast_name,
        podcast_host,
        podcast_focus_industry,
        podcast_region
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

      if (podcast_name) {
        searchSql += ` AND p.podcast_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_name}%`);
        searchParamCount++;
      }

      if (podcast_host) {
        searchSql += ` AND p.podcast_host ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_host}%`);
        searchParamCount++;
      }

      if (podcast_focus_industry) {
        searchSql += ` AND p.podcast_focus_industry ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_focus_industry}%`);
        searchParamCount++;
      }

      if (podcast_region) {
        searchSql += ` AND p.podcast_region ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_region}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const podcasters = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        podcasters: podcasters.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get approved podcasters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's own podcaster submissions
  async getMyPodcasters(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        podcast_name,
        date_from,
        date_to
      } = req.query;

      const filters = { submitted_by: req.user.userId };
      if (status) filters.status = status;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = 1;

      if (podcast_name) {
        searchSql += ` AND p.podcast_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${podcast_name}%`);
        searchParamCount++;
      }

      if (date_from) {
        searchSql += ` AND p.created_at >= $${searchParamCount}`;
        searchValues.push(date_from);
        searchParamCount++;
      }

      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setDate(endDate.getDate() + 1);
        searchSql += ` AND p.created_at < $${searchParamCount}`;
        searchValues.push(endDate.toISOString().split('T')[0]);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const podcasters = await this.findByUserIdWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getUserCount(req.user.userId, filters, searchSql, searchValues);

      res.json({
        podcasters: podcasters.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get my podcasters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get podcaster by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const podcaster = await Podcaster.findById(id);

      if (!podcaster) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        if (podcaster.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json({ podcaster: podcaster.toJSON() });
    } catch (error) {
      console.error('Get podcaster by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved podcaster by ID (public access)
  async getApprovedById(req, res) {
    try {
      const { id } = req.params;
      const podcaster = await Podcaster.findById(id);

      if (!podcaster) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      // Only allow access to approved and active podcasters
      if (podcaster.status !== 'approved' || !podcaster.is_active) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      res.json({ podcaster: podcaster.toJSON() });
    } catch (error) {
      console.error('Get approved podcaster by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update podcaster
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
      const podcaster = await Podcaster.findById(id);

      if (!podcaster) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        if (podcaster.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (podcaster.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot update approved or rejected submissions' });
        }
      }

      const updateData = { ...req.body };

      // Convert numeric fields from strings to numbers
      if (updateData.podcast_ig_followers && updateData.podcast_ig_followers !== '') {
        updateData.podcast_ig_followers = parseInt(updateData.podcast_ig_followers, 10);
      } else if (updateData.podcast_ig_followers === '') {
        delete updateData.podcast_ig_followers;
      }
      if (updateData.podcast_ig_engagement_rate && updateData.podcast_ig_engagement_rate !== '') {
        updateData.podcast_ig_engagement_rate = parseFloat(updateData.podcast_ig_engagement_rate);
      } else if (updateData.podcast_ig_engagement_rate === '') {
        delete updateData.podcast_ig_engagement_rate;
      }

      // Handle image upload
      if (req.file) {
        updateData.image = req.file.filename;
        // Optionally delete old image
        if (podcaster.image) {
          const oldImagePath = path.join(__dirname, '../../uploads/podcasters', podcaster.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const updatedPodcaster = await podcaster.update(updateData);
      res.json({
        message: 'Podcaster profile updated successfully',
        podcaster: updatedPodcaster.toJSON()
      });
    } catch (error) {
      console.error('Update podcaster error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete podcaster (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const podcaster = await Podcaster.findById(id);

      if (!podcaster) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        if (podcaster.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (podcaster.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot delete approved or rejected submissions' });
        }
      }

      await podcaster.update({ is_active: false });
      res.json({ message: 'Podcaster profile deleted successfully' });
    } catch (error) {
      console.error('Delete podcaster error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve podcaster
  async approvePodcaster(req, res) {
    try {
      const { id } = req.params;
      const admin_comments = req.body?.admin_comments;

      const podcaster = await Podcaster.findById(id);
      if (!podcaster) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      if (podcaster.status === 'approved') {
        return res.status(400).json({ error: 'Podcaster is already approved' });
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

      const updatedPodcaster = await podcaster.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: podcaster.submitted_by,
          type: 'podcaster_approved',
          title: 'Podcaster Profile Approved!',
          message: `Your podcaster profile for "${podcaster.podcast_name}" has been approved and is now live on our platform.`,
          related_id: podcaster.id
        });
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }

      // Send approval email notification
      try {
        await this.sendApprovalNotification(updatedPodcaster);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        try {
          await UserNotification.create({
            user_id: podcaster.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email confirmation for your approved podcaster profile. Please check your notifications for details.',
            related_id: podcaster.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Podcaster profile approved successfully',
        podcaster: updatedPodcaster.toJSON()
      });
    } catch (error) {
      console.error('Approve podcaster error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject podcaster
  async rejectPodcaster(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason, admin_comments } = req.body;

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const podcaster = await Podcaster.findById(id);
      if (!podcaster) {
        return res.status(404).json({ error: 'Podcaster not found' });
      }

      if (podcaster.status === 'rejected') {
        return res.status(400).json({ error: 'Podcaster is already rejected' });
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

      const updatedPodcaster = await podcaster.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: podcaster.submitted_by,
          type: 'podcaster_rejected',
          title: 'Podcaster Profile Review Update',
          message: `Your podcaster profile for "${podcaster.podcast_name}" has been reviewed. Please check your email for details.`,
          related_id: podcaster.id
        });
      } catch (notificationError) {
        console.error('Failed to create rejection notification:', notificationError);
      }

      // Send rejection email notification
      try {
        await this.sendRejectionNotification(updatedPodcaster);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        try {
          await UserNotification.create({
            user_id: podcaster.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email about your podcaster profile review. Please check your notifications for the rejection details.',
            related_id: podcaster.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Podcaster profile rejected successfully',
        podcaster: updatedPodcaster.toJSON()
      });
    } catch (error) {
      console.error('Reject podcaster error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk approve podcasters
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

      const approvedPodcasters = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const podcaster = await Podcaster.findById(ids[i]);

          if (!podcaster) {
            errors.push({ index: i, error: 'Podcaster not found' });
            continue;
          }

          if (podcaster.status === 'approved') {
            errors.push({ index: i, error: 'Podcaster is already approved' });
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

          const updatedPodcaster = await podcaster.update(updateData);
          approvedPodcasters.push(updatedPodcaster.toJSON());

          // Send notifications
          try {
            await UserNotification.create({
              user_id: podcaster.submitted_by,
              type: 'podcaster_approved',
              title: 'Podcaster Profile Approved!',
              message: `Your podcaster profile for "${podcaster.podcast_name}" has been approved.`,
              related_id: podcaster.id
            });
          } catch (notificationError) {
            console.error('Failed to create approval notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Approved ${approvedPodcasters.length} podcaster profiles successfully`,
        approved: approvedPodcasters.length,
        errors: errors.length,
        approvedPodcasters: approvedPodcasters,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk approve podcasters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk reject podcasters
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

      const rejectedPodcasters = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const podcaster = await Podcaster.findById(ids[i]);

          if (!podcaster) {
            errors.push({ index: i, error: 'Podcaster not found' });
            continue;
          }

          if (podcaster.status === 'rejected') {
            errors.push({ index: i, error: 'Podcaster is already rejected' });
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

          const updatedPodcaster = await podcaster.update(updateData);
          rejectedPodcasters.push(updatedPodcaster.toJSON());

          // Send notifications
          try {
            await UserNotification.create({
              user_id: podcaster.submitted_by,
              type: 'podcaster_rejected',
              title: 'Podcaster Profile Review Update',
              message: `Your podcaster profile for "${podcaster.podcast_name}" has been reviewed.`,
              related_id: podcaster.id
            });
          } catch (notificationError) {
            console.error('Failed to create rejection notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Rejected ${rejectedPodcasters.length} podcaster profiles successfully`,
        rejected: rejectedPodcasters.length,
        errors: errors.length,
        rejectedPodcasters: rejectedPodcasters,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk reject podcasters error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods for database queries
  async findAllWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE p.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND p.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `
      SELECT p.* FROM podcasters p
      ${whereClause} ${searchSql}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows.map(row => new Podcaster(row));
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE p.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND p.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM podcasters p ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  async findByUserIdWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE p.submitted_by = $1 AND p.is_active = true';
    const params = [filters.submitted_by];
    let paramCount = 2;

    Object.keys(filters).forEach(key => {
      if (key !== 'submitted_by' && filters[key] !== undefined) {
        whereClause += ` AND p.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `
      SELECT p.* FROM podcasters p
      ${whereClause} ${searchSql}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows.map(row => new Podcaster(row));
  }

  async getUserCount(userId, filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE p.submitted_by = $1 AND p.is_active = true';
    const params = [userId];
    let paramCount = 2;

    Object.keys(filters).forEach(key => {
      if (key !== 'submitted_by' && filters[key] !== undefined) {
        whereClause += ` AND p.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM podcasters p ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }


  // Send approval notification email
  sendApprovalNotification = async (podcaster) => {
    try {
      const user = await User.findById(podcaster.submitted_by);
      if (!user) {
        console.warn('User not found for podcaster approval notification');
        return;
      }

      const subject = 'Your Podcaster Profile Has Been Approved!';
      const htmlContent = this.generateApprovalEmailTemplate(podcaster, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }

  // Send rejection notification email
  sendRejectionNotification = async (podcaster) => {
    try {
      const user = await User.findById(podcaster.submitted_by);
      if (!user) {
        console.warn('User not found for podcaster rejection notification');
        return;
      }

      const subject = 'Podcaster Profile Submission Update';
      const htmlContent = this.generateRejectionEmailTemplate(podcaster, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      throw error;
    }
  }

  // Generate approval email template
  generateApprovalEmailTemplate(podcaster, user) {
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
            .status-image { text-align: center; margin: 20px 0; }
            .podcaster-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Podcaster Profile Approved!</h1>
            </div>
            <div class="content">
              <div class="status-image">
                <img src="https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=APPROVED" alt="Approved" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid #4CAF50;" />
              </div>
              <h2>Hello ${user.first_name}!</h2>
              <p>Great news! Your podcaster profile submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="podcaster-details">
                <h3>Podcaster Details:</h3>
                <p><strong>Podcast Name:</strong> ${podcaster.podcast_name}</p>
                <p><strong>Podcast Host:</strong> ${podcaster.podcast_host || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your podcaster profile is now live on our platform and available for potential collaborations.</p>
              <p>You can view your approved profiles in your dashboard.</p>

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
  generateRejectionEmailTemplate(podcaster, user) {
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
            .status-image { text-align: center; margin: 20px 0; }
            .podcaster-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .rejection-reason { background: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Podcaster Profile Review Update</h1>
            </div>
            <div class="content">
              <div class="status-image">
                <img src="https://via.placeholder.com/150x150/F44336/FFFFFF?text=REJECTED" alt="Rejected" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid #F44336;" />
              </div>
              <h2>Hello ${user.first_name},</h2>
              <p>Thank you for submitting your podcaster profile to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="podcaster-details">
                <h3>Podcaster Details:</h3>
                <p><strong>Podcast Name:</strong> ${podcaster.podcast_name}</p>
                <p><strong>Podcast Host:</strong> ${podcaster.podcast_host || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
              </div>

              ${podcaster.rejection_reason ? `
              <div class="rejection-reason">
                <h4>Reason for Rejection:</h4>
                <p>${podcaster.rejection_reason}</p>
              </div>
              ` : ''}

              <p>You can edit and resubmit your podcaster profile after addressing the issues mentioned above. We're here to help you improve your submission!</p>

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

module.exports = new PodcasterController();