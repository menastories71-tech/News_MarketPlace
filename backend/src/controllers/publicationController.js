const Publication = require('../models/Publication');
const { triggerSEOUpdate } = require('../utils/seoUtility');
const BulkOperations = require('../utils/bulkOperations');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const s3Service = require('../services/s3Service');
const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bulk-upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
    }
  }
});

class PublicationController {
  // Validation rules
  createValidation = [
    body('group_id').isInt().withMessage('Group ID must be an integer'),
    body('publication_sn').trim().isLength({ min: 1 }).withMessage('Publication SN is required'),
    body('publication_grade').trim().isLength({ min: 1, max: 10 }).withMessage('Publication grade must be between 1 and 10 characters'),
    body('publication_name').trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_website').isURL().withMessage('Valid publication website URL is required'),
    body('publication_price').isFloat({ min: 0 }).withMessage('Publication price must be a positive number'),
    body('agreement_tat').isInt({ min: 0 }).withMessage('Agreement TAT must be a non-negative integer'),
    body('practical_tat').isInt({ min: 0 }).withMessage('Practical TAT must be a non-negative integer'),
    body('publication_language').trim().isLength({ min: 1 }).withMessage('Publication language is required'),
    body('publication_region').trim().isLength({ min: 1 }).withMessage('Publication region is required'),
    body('publication_primary_industry').trim().isLength({ min: 1 }).withMessage('Primary industry is required'),
    body('website_news_index').isInt({ min: 0 }).withMessage('Website news index must be a non-negative integer'),
    body('da').isInt({ min: 0, max: 100 }).withMessage('DA must be between 0 and 100'),
    body('dr').isInt({ min: 0, max: 100 }).withMessage('DR must be between 0 and 100'),
    body('words_limit').isInt({ min: 0 }).withMessage('Words limit must be a non-negative integer'),
    body('number_of_images').isInt({ min: 0 }).withMessage('Number of images must be a non-negative integer'),
  ];

  updateValidation = [
    body('group_id').optional().isInt().withMessage('Group ID must be an integer'),
    body('publication_sn').optional().trim().isLength({ min: 1 }).withMessage('Publication SN is required'),
    body('publication_grade').optional().trim().isLength({ min: 1, max: 10 }).withMessage('Publication grade must be between 1 and 10 characters'),
    body('publication_name').optional().trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_website').optional().isURL().withMessage('Valid publication website URL is required'),
    body('publication_price').optional().isFloat({ min: 0 }).withMessage('Publication price must be a positive number'),
    body('agreement_tat').optional().isInt({ min: 0 }).withMessage('Agreement TAT must be a non-negative integer'),
    body('practical_tat').optional().isInt({ min: 0 }).withMessage('Practical TAT must be a non-negative integer'),
    body('publication_language').optional().trim().isLength({ min: 1 }).withMessage('Publication language is required'),
    body('publication_region').optional().trim().isLength({ min: 1 }).withMessage('Publication region is required'),
    body('publication_primary_industry').optional().trim().isLength({ min: 1 }).withMessage('Primary industry is required'),
    body('website_news_index').optional().isInt({ min: 0 }).withMessage('Website news index must be a non-negative integer'),
    body('da').optional().isInt({ min: 0, max: 100 }).withMessage('DA must be between 0 and 100'),
    body('dr').optional().isInt({ min: 0, max: 100 }).withMessage('DR must be between 0 and 100'),
    body('words_limit').optional().isInt({ min: 0 }).withMessage('Words limit must be a non-negative integer'),
    body('number_of_images').optional().isInt({ min: 0 }).withMessage('Number of images must be a non-negative integer'),
    body('status').optional().isIn(['draft', 'pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Create a new publication
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

      const publicationData = {
        ...req.body,
        submitted_by: req.user?.userId,
        submitted_by_admin: req.admin?.adminId,
        // User submissions are always draft status initially
        status: req.user ? 'draft' : (req.body.status || 'pending')
      };

      // Remove recaptchaToken from data before saving
      delete publicationData.recaptchaToken;

      const publication = await Publication.create(publicationData);
      res.status(201).json({
        message: req.user ? 'Publication submitted successfully and is pending review' : 'Publication created successfully',
        publication: publication.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Create publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all publications with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        live_on_platform,
        group_id,
        publication_name,
        group_name,
        region,
        show_deleted = 'false'
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (live_on_platform !== undefined) filters.live_on_platform = live_on_platform === 'true';
      if (group_id) filters.group_id = parseInt(group_id);

      // For regular users, only show approved publications unless they are admins
      if (req.user && !req.admin) {
        filters.status = 'approved';
        filters.is_active = true;
        filters.live_on_platform = true;
      } else if (req.admin) {
        // For all admins (including super admin), show all active publications by default
        // Only filter out inactive ones if show_deleted is not explicitly set to true
        if (show_deleted !== 'true') {
          filters.is_active = true;
        }
        // Super admins can see everything, other admins see active publications
      }

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (publication_name) {
        searchSql += ` AND p.publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      if (group_name) {
        searchSql += ` AND g.group_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${group_name}%`);
        searchParamCount++;
      }

      if (region) {
        searchSql += ` AND p.publication_region ILIKE $${searchParamCount}`;
        searchValues.push(`%${region}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      let publications;
      let totalCount;

      if (req.admin && show_deleted === 'true') {
        // Show deleted publications for admins
        publications = await Publication.getDeleted(filters, searchSql, searchValues, limit, offset);
        // Get total count for deleted publications
        totalCount = await Publication.getDeletedCount(filters, searchSql, searchValues);
      } else {
        // Show active publications
        publications = await Publication.findAll(filters, searchSql, searchValues, limit, offset);
        // Get total count for active publications
        totalCount = await Publication.getCount(filters, searchSql, searchValues);
      }

      res.json({
        publications: publications.map(pub => pub.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get public publications (for sitemap and public browsing)
  async getPublic(req, res) {
    try {
      const {
        page = 1,
        limit = 1000 // High limit for sitemap
      } = req.query;

      const filters = {
        status: 'approved',
        is_active: true,
        live_on_platform: true
      };

      const offset = (page - 1) * limit;
      const publications = await Publication.findAll(filters, '', [], limit, offset);
      const totalCount = await Publication.getCount(filters, '', []);

      res.json({
        publications: publications.map(pub => pub.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get public publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get publication by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const publication = await Publication.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      res.json({ publication: publication.toJSON() });
    } catch (error) {
      console.error('Get publication by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update publication
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
      const publication = await Publication.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      const updatedPublication = await publication.update(req.body);
      res.json({
        message: 'Publication updated successfully',
        publication: updatedPublication.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Update publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete publication (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const publication = await Publication.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      await publication.delete();
      res.json({ message: 'Publication deleted successfully' });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Delete publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Hard delete publication (permanent delete)
  async hardDelete(req, res) {
    try {
      const { id } = req.params;
      const publication = await Publication.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      // Check if publication is already soft deleted
      if (!publication.is_active) {
        return res.status(400).json({ error: 'Publication is already deleted' });
      }

      // Perform hard delete
      const { query } = require('../config/database');
      await query('DELETE FROM publications WHERE id = $1', [id]);

      res.json({ message: 'Publication permanently deleted successfully' });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Hard delete publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk create publications
  async bulkCreate(req, res) {
    try {
      const { publications } = req.body;

      if (!Array.isArray(publications) || publications.length === 0) {
        return res.status(400).json({ error: 'Publications array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required
        return res.status(403).json({
          error: 'Insufficient permissions for bulk operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      const createdPublications = [];
      const errors = [];

      for (let i = 0; i < publications.length; i++) {
        try {
          const publicationData = {
            ...publications[i],
            submitted_by: req.user?.userId,
            submitted_by_admin: req.admin?.adminId,
            status: 'approved' // Admin bulk operations create approved publications
          };
          const publication = await Publication.create(publicationData);
          createdPublications.push(publication.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Created ${createdPublications.length} publications successfully`,
        created: createdPublications,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk create publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update publications
  async bulkUpdate(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required
        return res.status(403).json({
          error: 'Insufficient permissions for bulk operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      const updatedPublications = [];
      const errors = [];

      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, ...updateData } = updates[i];
          const publication = await Publication.findById(id);

          if (!publication) {
            errors.push({ index: i, error: 'Publication not found' });
            continue;
          }

          const updatedPublication = await publication.update(updateData);
          updatedPublications.push(updatedPublication.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Updated ${updatedPublications.length} publications successfully`,
        updated: updatedPublications,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk update publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk approve publications
  async bulkApprove(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk approve operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required for bulk approve
        return res.status(403).json({
          error: 'Insufficient permissions for bulk approve operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const approvedPublications = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const publication = await Publication.findById(ids[i]);

          if (!publication) {
            errors.push({ index: i, error: 'Publication not found' });
            continue;
          }

          if (publication.status === 'approved') {
            errors.push({ index: i, error: 'Publication is already approved' });
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

          const updatedPublication = await publication.update(updateData);
          approvedPublications.push(updatedPublication.toJSON());

          // Create in-app notification
          try {
            await UserNotification.create({
              user_id: publication.submitted_by,
              type: 'publication_approved',
              title: 'Publication Approved!',
              message: `Your publication "${publication.publication_name}" has been approved and is now live on our platform.`,
              related_id: publication.id
            });
          } catch (notificationError) {
            console.error('Failed to create approval notification:', notificationError);
          }

          // Send approval email notification
          try {
            await sendApprovalNotification(updatedPublication);
          } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
            // Log email failure but don't fail the approval process
            try {
              await UserNotification.create({
                user_id: publication.submitted_by,
                type: 'system',
                title: 'Email Delivery Issue',
                message: 'We were unable to send you an email confirmation for your approved publication. Please check your notifications for details.',
                related_id: publication.id
              });
            } catch (notificationError) {
              console.error('Failed to create email failure notification:', notificationError);
            }
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Approved ${approvedPublications.length} publications successfully`,
        approved: approvedPublications.length,
        errors: errors.length,
        approvedPublications: approvedPublications,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk approve publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk reject publications
  async bulkReject(req, res) {
    try {
      const { ids, rejection_reason, admin_comments } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk reject operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required for bulk reject
        return res.status(403).json({
          error: 'Insufficient permissions for bulk reject operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const rejectedPublications = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const publication = await Publication.findById(ids[i]);

          if (!publication) {
            errors.push({ index: i, error: 'Publication not found' });
            continue;
          }

          if (publication.status === 'rejected') {
            errors.push({ index: i, error: 'Publication is already rejected' });
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

          const updatedPublication = await publication.update(updateData);
          rejectedPublications.push(updatedPublication.toJSON());

          // Create in-app notification
          try {
            await UserNotification.create({
              user_id: publication.submitted_by,
              type: 'publication_rejected',
              title: 'Publication Review Update',
              message: `Your publication "${publication.publication_name}" has been reviewed. Please check your email for details.`,
              related_id: publication.id
            });
          } catch (notificationError) {
            console.error('Failed to create rejection notification:', notificationError);
          }

          // Send rejection email notification
          try {
            await sendRejectionNotification(updatedPublication);
          } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
            // Log email failure but don't fail the rejection process
            try {
              await UserNotification.create({
                user_id: publication.submitted_by,
                type: 'system',
                title: 'Email Delivery Issue',
                message: 'We were unable to send you an email about your publication review. Please check your notifications for the rejection details.',
                related_id: publication.id
              });
            } catch (notificationError) {
              console.error('Failed to create email failure notification:', notificationError);
            }
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Rejected ${rejectedPublications.length} publications successfully`,
        rejected: rejectedPublications.length,
        errors: errors.length,
        rejectedPublications: rejectedPublications,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk reject publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete publications
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum super_admin for bulk delete operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 5) { // super_admin level required for bulk delete
        return res.status(403).json({
          error: 'Insufficient permissions for bulk delete operations',
          required: 'Super Admin only',
          currentLevel: adminLevel
        });
      }

      const deletedCount = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const publication = await Publication.findById(ids[i]);

          if (!publication) {
            errors.push({ index: i, error: 'Publication not found' });
            continue;
          }

          await publication.delete();
          deletedCount.push(ids[i]);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deletedCount.length} publications successfully`,
        deleted: deletedCount,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk delete publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update publication status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const publication = await Publication.findById(id);

      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      const updatedPublication = await publication.update({ status });
      res.json({
        message: 'Publication status updated successfully',
        publication: updatedPublication.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Update publication status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve publication
  async approvePublication(req, res) {
    try {
      const { id } = req.params;
      const admin_comments = req.body?.admin_comments;

      const publication = await Publication.findById(id);
      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      if (publication.status === 'approved') {
        return res.status(400).json({ error: 'Publication is already approved' });
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

      const updatedPublication = await publication.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: publication.submitted_by,
          type: 'publication_approved',
          title: 'Publication Approved!',
          message: `Your publication "${publication.publication_name}" has been approved and is now live on our platform.`,
          related_id: publication.id
        });
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }

      // Send approval email notification
      try {
        await sendApprovalNotification(updatedPublication);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Log email failure but don't fail the approval process
        try {
          await UserNotification.create({
            user_id: publication.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email confirmation for your approved publication. Please check your notifications for details.',
            related_id: publication.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Publication approved successfully',
        publication: updatedPublication.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Approve publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject publication
  async rejectPublication(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason, admin_comments } = req.body;

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const publication = await Publication.findById(id);
      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      if (publication.status === 'rejected') {
        return res.status(400).json({ error: 'Publication is already rejected' });
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

      const updatedPublication = await publication.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: publication.submitted_by,
          type: 'publication_rejected',
          title: 'Publication Review Update',
          message: `Your publication "${publication.publication_name}" has been reviewed. Please check your email for details.`,
          related_id: publication.id
        });
      } catch (notificationError) {
        console.error('Failed to create rejection notification:', notificationError);
      }

      // Send rejection email notification
      try {
        await this.sendRejectionNotification(updatedPublication);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Log email failure but don't fail the rejection process
        try {
          await UserNotification.create({
            user_id: publication.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email about your publication review. Please check your notifications for the rejection details.',
            related_id: publication.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Publication rejected successfully',
        publication: updatedPublication.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Reject publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload groups and publications from CSV/Excel file
  async bulkUpload(req, res) {
    // Admin verification for bulk operations
    if (!req.admin) {
      return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
    }

    // Check admin role level (minimum content_manager for bulk operations)
    const roleLevels = {
      'super_admin': 5,
      'content_manager': 4,
      'editor': 3,
      'registered_user': 2,
      'agency': 1,
      'other': 0
    };

    const adminLevel = roleLevels[req.admin.role] || 0;
    if (adminLevel < 4) { // content_manager level required
      return res.status(403).json({
        error: 'Insufficient permissions for bulk operations',
        required: 'Content Manager or higher',
        currentLevel: adminLevel
      });
    }

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'text/csv',
          'application/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
        }
      }
    });

    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const originalFilename = req.file.originalname;

        // Parse the file from buffer
        const rawData = await BulkOperations.parseFileFromBuffer(fileBuffer, mimetype);

        if (!rawData || rawData.length === 0) {
          return res.status(400).json({ error: 'File is empty or contains no valid data' });
        }

        // Extract and validate groups first
        const groupData = BulkOperations.transformGroupData(rawData);
        console.log('Group data extracted:', groupData.length, 'groups');
        console.log('First group sample:', groupData[0]);
        const validGroups = [];
        const groupValidationErrors = [];

        for (let i = 0; i < groupData.length; i++) {
          const group = groupData[i];
          const errors = BulkOperations.validateGroupData(group);
          console.log(`Group ${i} validation:`, errors);

          if (errors.length > 0) {
            groupValidationErrors.push({
              group_sn: group.group_sn,
              errors: errors
            });
          } else {
            validGroups.push({
              ...group,
              submitted_by: req.user?.userId,
              submitted_by_admin: req.admin?.adminId,
              status: 'approved' // Admin bulk uploads create approved groups
            });
          }
        }

        // Extract and validate publications
        const publicationData = BulkOperations.transformPublicationData(rawData);
        console.log('Publication data extracted:', publicationData.length, 'publications');
        console.log('First publication sample:', publicationData[0]);
        const validPublications = [];
        const publicationValidationErrors = [];

        for (let i = 0; i < publicationData.length; i++) {
          const publication = publicationData[i];
          const errors = BulkOperations.validatePublicationData(publication);
          console.log(`Publication ${i} validation:`, errors);

          if (errors.length > 0) {
            publicationValidationErrors.push({
              row: i + 1,
              publication_sn: publication.publication_sn,
              errors: errors
            });
          } else {
            validPublications.push({
              ...publication,
              submitted_by: req.user?.userId,
              submitted_by_admin: req.admin?.adminId,
              status: 'approved' // Admin bulk uploads create approved publications
            });
          }
        }

        // Clean up the uploaded file
        BulkOperations.cleanupFile(filePath);

        // If there are validation errors, return them
        if (groupValidationErrors.length > 0 || publicationValidationErrors.length > 0) {
          console.log('Validation errors found, returning 400');
          console.log('Group errors:', groupValidationErrors.length);
          console.log('Publication errors:', publicationValidationErrors.length);
          return res.status(400).json({
            error: 'Validation failed for some records',
            groupValidationErrors: groupValidationErrors,
            publicationValidationErrors: publicationValidationErrors,
            validGroups: validGroups.length,
            validPublications: validPublications.length,
            totalRecords: rawData.length
          });
        }

        // Create groups first
        const Group = require('../models/Group');
        const createdGroups = [];
        const groupCreationErrors = [];

        for (let i = 0; i < validGroups.length; i++) {
          try {
            const group = await Group.create(validGroups[i]);
            createdGroups.push(group.toJSON());
          } catch (error) {
            groupCreationErrors.push({
              group_sn: validGroups[i].group_sn,
              error: error.message
            });
          }
        }

        // Create a map of group_sn to group_id for publications
        // Use the original group_sn from the Excel file, not the modified one from the database
        const groupMap = new Map();
        createdGroups.forEach((group, index) => {
          // Map back to the original group_sn from validGroups array
          const originalGroupSn = validGroups[index].group_sn;
          groupMap.set(originalGroupSn, group.id);
        });
        console.log('Created group mapping:', groupMap);

        // Create or update publications with correct group_id
        const createdPublications = [];
        const updatedPublications = [];
        const publicationCreationErrors = [];
        console.log('Creating/updating publications with group mapping:', groupMap);

        const batchSize = 10;
        for (let i = 0; i < validPublications.length; i += batchSize) {
          const batch = validPublications.slice(i, i + batchSize);

          for (let j = 0; j < batch.length; j++) {
            try {
              const publication = batch[j];
              const groupId = groupMap.get(publication.group_sn);
              console.log(`Publication ${publication.publication_sn} looking for group SN: ${publication.group_sn}, found group ID: ${groupId}`);

              if (!groupId) {
                publicationCreationErrors.push({
                  index: i + j,
                  publication_sn: publication.publication_sn,
                  error: `Group with SN '${publication.group_sn}' not found`
                });
                continue;
              }

              // Remove group_sn and add group_id
              const { group_sn, ...publicationData } = publication;
              const publicationWithGroupId = { ...publicationData, group_id: groupId };
              console.log(`Processing publication:`, publicationWithGroupId);

              // Check if publication already exists
              const existingPublication = await Publication.findBySN(publication.publication_sn);

              if (existingPublication) {
                // Update existing publication and reactivate if soft deleted
                console.log(`Updating existing publication ${publication.publication_sn}`);
                const updatedPublication = await existingPublication.update({
                  ...publicationWithGroupId,
                  is_active: true // Reactivate if it was soft deleted
                });
                updatedPublications.push(updatedPublication.toJSON());
                console.log(`Publication updated successfully:`, updatedPublication.id);
              } else {
                // Create new publication
                console.log(`Creating new publication ${publication.publication_sn}`);
                const createdPublication = await Publication.create(publicationWithGroupId);
                createdPublications.push(createdPublication.toJSON());
                console.log(`Publication created successfully:`, createdPublication.id);
              }
            } catch (error) {
              console.error(`Error processing publication ${batch[j].publication_sn}:`, error);
              publicationCreationErrors.push({
                index: i + j,
                publication_sn: batch[j].publication_sn,
                error: error.message
              });
            }
          }
        }

        console.log(`Bulk upload completed. ${createdGroups.length} groups created, ${createdPublications.length} publications created, and ${updatedPublications.length} publications updated successfully.`);
        res.status(201).json({
          message: `Bulk upload completed. ${createdGroups.length} groups created, ${createdPublications.length} publications created, and ${updatedPublications.length} publications updated successfully.`,
          createdGroups: createdGroups.length,
          createdPublications: createdPublications.length,
          updatedPublications: updatedPublications.length,
          groupErrors: groupCreationErrors.length,
          publicationErrors: publicationCreationErrors.length,
          groupCreationErrors: groupCreationErrors,
          publicationCreationErrors: publicationCreationErrors,
          totalProcessed: validGroups.length + validPublications.length
        });

      } catch (error) {
        console.error('Bulk upload error:', error);

        res.status(500).json({
          error: 'Bulk upload failed',
          message: error.message
        });
      }
    });
  }


  // Export CSV
  async exportCSV(req, res) {
    try {
      const {
        publication_name,
        group_name,
        region,
        status,
        show_deleted
      } = req.query;

      const filters = {};
      if (status) filters.status = status;

      // Admin access check for export
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (show_deleted !== 'true') {
        filters.is_active = true;
      }

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (publication_name) {
        searchSql += ` AND p.publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      if (group_name) {
        searchSql += ` AND g.group_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${group_name}%`);
        searchParamCount++;
      }

      if (region) {
        searchSql += ` AND p.publication_region ILIKE $${searchParamCount}`;
        searchValues.push(`%${region}%`);
        searchParamCount++;
      }

      let publications;
      if (show_deleted === 'true') {
        publications = await Publication.getDeleted(filters, searchSql, searchValues, 100000, 0);
      } else {
        publications = await Publication.findAll(filters, searchSql, searchValues, 100000, 0);
      }

      // Define standard headers
      const headers = [
        'id',
        'publication_sn',
        'group_name',
        'publication_name',
        'publication_website',
        'publication_grade',
        'publication_price',
        'publication_categories',
        'publication_region',
        'publication_language',
        'agreement_tat',
        'practical_tat',
        'word_limit',
        'do_follow_link',
        'status',
        'is_active',
        'created_at',
        'updated_at'
      ];

      const csvRows = [headers.join(',')];

      publications.forEach(pub => {
        const p = pub.toJSON();
        const row = headers.map(header => {
          let val = p[header];

          // Handle specific fields
          if (header === 'group_name' && p.group) {
            val = p.group.group_name;
          }

          if (val === null || val === undefined) return '';
          if (typeof val === 'object') val = JSON.stringify(val);
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=publications_export_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvRows.join('\n'));

    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download CSV template
  async downloadCSVTemplate(req, res) {
    try {
      const { headers, sampleData } = BulkOperations.generateCSVTemplate();

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="publications_template.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error('Download CSV template error:', error);
      res.status(500).json({ error: 'Failed to generate CSV template' });
    }
  }

  // Download Excel template
  async downloadExcelTemplate(req, res) {
    try {
      const workbook = BulkOperations.generateExcelTemplate();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="publications_template.xlsx"');

      // Write workbook to response
      const buffer = require('xlsx').write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error('Download Excel template error:', error);
      res.status(500).json({ error: 'Failed to generate Excel template' });
    }
  }

  // Bulk edit common fields
  async bulkEdit(req, res) {
    try {
      const { ids, updates } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Publication IDs array is required' });
      }

      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Updates object is required' });
      }

      // Admin verification for bulk operations
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      // Check admin role level (minimum content_manager for bulk operations)
      const roleLevels = {
        'super_admin': 5,
        'content_manager': 4,
        'editor': 3,
        'registered_user': 2,
        'agency': 1,
        'other': 0
      };

      const adminLevel = roleLevels[req.admin.role] || 0;
      if (adminLevel < 4) { // content_manager level required
        return res.status(403).json({
          error: 'Insufficient permissions for bulk operations',
          required: 'Content Manager or higher',
          currentLevel: adminLevel
        });
      }

      // Validate allowed fields for bulk edit
      const allowedFields = ['publication_price', 'agreement_tat', 'practical_tat', 'tags_badges'];
      const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        return res.status(400).json({
          error: 'Invalid fields for bulk edit',
          allowedFields: allowedFields,
          invalidFields: invalidFields
        });
      }

      // Validate update values
      const validationErrors = [];
      if (updates.publication_price !== undefined && (isNaN(parseFloat(updates.publication_price)) || parseFloat(updates.publication_price) < 0)) {
        validationErrors.push('publication_price must be a positive number');
      }
      if (updates.agreement_tat !== undefined && (isNaN(parseInt(updates.agreement_tat)) || parseInt(updates.agreement_tat) < 0)) {
        validationErrors.push('agreement_tat must be a non-negative integer');
      }
      if (updates.practical_tat !== undefined && (isNaN(parseInt(updates.practical_tat)) || parseInt(updates.practical_tat) < 0)) {
        validationErrors.push('practical_tat must be a non-negative integer');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          validationErrors: validationErrors
        });
      }

      // Transform updates
      const transformedUpdates = { ...updates };
      if (updates.publication_price !== undefined) {
        transformedUpdates.publication_price = parseFloat(updates.publication_price);
      }
      if (updates.agreement_tat !== undefined) {
        transformedUpdates.agreement_tat = parseInt(updates.agreement_tat);
      }
      if (updates.practical_tat !== undefined) {
        transformedUpdates.practical_tat = parseInt(updates.practical_tat);
      }
      if (updates.words_limit !== undefined) {
        transformedUpdates.words_limit = parseInt(updates.words_limit);
      }

      const updatedPublications = [];
      const updateErrors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const publication = await Publication.findById(ids[i]);

          if (!publication) {
            updateErrors.push({
              id: ids[i],
              error: 'Publication not found'
            });
            continue;
          }

          const updatedPublication = await publication.update(transformedUpdates);
          updatedPublications.push(updatedPublication.toJSON());
        } catch (error) {
          updateErrors.push({
            id: ids[i],
            error: error.message
          });
        }
      }

      res.json({
        message: `Bulk edit completed. ${updatedPublications.length} publications updated successfully.`,
        updated: updatedPublications.length,
        errors: updateErrors.length,
        updateErrors: updateErrors,
        totalProcessed: ids.length
      });

    } catch (error) {
      console.error('Bulk edit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send approval notification email
  async sendApprovalNotification(publication) {
    try {
      // Get the user who submitted the publication
      const user = await User.findById(publication.submitted_by);
      if (!user) {
        console.warn('User not found for publication approval notification');
        return;
      }

      const subject = 'Your Publication Has Been Approved!';
      const htmlContent = this.generateApprovalEmailTemplate(publication, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }

  // Send rejection notification email
  async sendRejectionNotification(publication) {
    try {
      // Get the user who submitted the publication
      const user = await User.findById(publication.submitted_by);
      if (!user) {
        console.warn('User not found for publication rejection notification');
        return;
      }

      const subject = 'Publication Submission Update';
      const htmlContent = this.generateRejectionEmailTemplate(publication, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      throw error;
    }
  }

  // Generate approval email template
  generateApprovalEmailTemplate(publication, user) {
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
            .publication-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Publication Approved!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name}!</h2>
              <p>Great news! Your publication submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="publication-details">
                <h3>Publication Details:</h3>
                <p><strong>Name:</strong> ${publication.publication_name}</p>
                <p><strong>Website:</strong> ${publication.publication_website}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your publication is now live on our platform and available for users to browse and purchase.</p>
              <p>You can view your approved publications in your dashboard.</p>

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
  generateRejectionEmailTemplate(publication, user) {
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
            .publication-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .rejection-reason { background: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Publication Review Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name},</h2>
              <p>Thank you for submitting your publication to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="publication-details">
                <h3>Publication Details:</h3>
                <p><strong>Name:</strong> ${publication.publication_name}</p>
                <p><strong>Website:</strong> ${publication.publication_website}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
              </div>

              ${publication.rejection_reason ? `
              <div class="rejection-reason">
                <h4>Reason for Rejection:</h4>
                <p>${publication.rejection_reason}</p>
              </div>
              ` : ''}

              <p>You can edit and resubmit your publication after addressing the issues mentioned above. We're here to help you improve your submission!</p>

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

// Helper functions for email notifications
async function sendApprovalNotification(publication) {
  try {
    // Get the user who submitted the publication
    const user = await User.findById(publication.submitted_by);
    if (!user) {
      console.warn('User not found for publication approval notification');
      return;
    }

    const subject = 'Your Publication Has Been Approved!';
    const htmlContent = generateApprovalEmailTemplate(publication, user);

    await emailService.sendCustomEmail(user.email, subject, htmlContent);
  } catch (error) {
    console.error('Error sending approval notification:', error);
    throw error;
  }
}

async function sendRejectionNotification(publication) {
  try {
    // Get the user who submitted the publication
    const user = await User.findById(publication.submitted_by);
    if (!user) {
      console.warn('User not found for publication rejection notification');
      return;
    }

    const subject = 'Publication Submission Update';
    const htmlContent = generateRejectionEmailTemplate(publication, user);

    await emailService.sendCustomEmail(user.email, subject, htmlContent);
  } catch (error) {
    console.error('Error sending rejection notification:', error);
    throw error;
  }
}

function generateApprovalEmailTemplate(publication, user) {
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
          .publication-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Publication Approved!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>Great news! Your publication submission has been reviewed and <strong>approved</strong> by our team.</p>

            <div class="publication-details">
              <h3>Publication Details:</h3>
              <p><strong>Name:</strong> ${publication.publication_name}</p>
              <p><strong>Website:</strong> ${publication.publication_website}</p>
              <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
              <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>Your publication is now live on our platform and available for users to browse and purchase.</p>
            <p>You can view your approved publications in your dashboard.</p>

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

function generateRejectionEmailTemplate(publication, user) {
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
          .publication-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
          .rejection-reason { background: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
          .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Publication Review Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name},</h2>
            <p>Thank you for submitting your publication to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

            <div class="publication-details">
              <h3>Publication Details:</h3>
              <p><strong>Name:</strong> ${publication.publication_name}</p>
              <p><strong>Website:</strong> ${publication.publication_website}</p>
              <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
            </div>

            ${publication.rejection_reason ? `
            <div class="rejection-reason">
              <h4>Reason for Rejection:</h4>
              <p>${publication.rejection_reason}</p>
            </div>
            ` : ''}

            <p>You can edit and resubmit your publication after addressing the issues mentioned above. We're here to help you improve your submission!</p>

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

module.exports = new PublicationController();