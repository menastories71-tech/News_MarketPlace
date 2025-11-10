const Publication = require('../models/Publication');
const BulkOperations = require('../utils/bulkOperations');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
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
    body('publication_grade').trim().isLength({ min: 1 }).withMessage('Publication grade is required'),
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
    body('publication_grade').optional().trim().isLength({ min: 1 }).withMessage('Publication grade is required'),
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
        region
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
      const publications = await Publication.findAll(filters, searchSql, searchValues, limit, offset);

      res.json({
        publications: publications.map(pub => pub.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: publications.length // This should be improved with a count query
        }
      });
    } catch (error) {
      console.error('Get publications error:', error);
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
    } catch (error) {
      console.error('Delete publication error:', error);
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
    } catch (error) {
      console.error('Bulk update publications error:', error);
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
    } catch (error) {
      console.error('Update publication status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve publication
  async approvePublication(req, res) {
    try {
      const { id } = req.params;
      const { admin_comments } = req.body;

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
        await this.sendApprovalNotification(updatedPublication);
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
    } catch (error) {
      console.error('Reject publication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload publications from CSV/Excel file
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
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, '../../uploads'));
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'bulk-upload-' + uniqueSuffix + path.extname(file.originalname));
        }
      }),
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

      const filePath = req.file.path;
      const mimetype = req.file.mimetype;

      // Parse the file
      const rawData = await BulkOperations.parseFile(filePath, mimetype);

      if (!rawData || rawData.length === 0) {
        BulkOperations.cleanupFile(filePath);
        return res.status(400).json({ error: 'File is empty or contains no valid data' });
      }

      // Validate and transform data
      const validationErrors = [];
      const validPublications = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const errors = BulkOperations.validatePublicationData(row);

        if (errors.length > 0) {
          validationErrors.push({
            row: i + 1,
            errors: errors
          });
        } else {
          try {
            const transformedData = BulkOperations.transformPublicationData([row])[0];
            validPublications.push({
              ...transformedData,
              submitted_by: req.user?.userId,
              submitted_by_admin: req.admin?.adminId,
              status: 'approved' // Admin bulk uploads create approved publications
            });
          } catch (transformError) {
            validationErrors.push({
              row: i + 1,
              errors: [`Data transformation error: ${transformError.message}`]
            });
          }
        }
      }

      // Clean up the uploaded file
      BulkOperations.cleanupFile(filePath);

      // If there are validation errors, return them
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed for some records',
          validationErrors: validationErrors,
          validRecords: validPublications.length,
          totalRecords: rawData.length
        });
      }

      // Create publications in batches to avoid overwhelming the database
      const createdPublications = [];
      const creationErrors = [];

      const batchSize = 10;
      for (let i = 0; i < validPublications.length; i += batchSize) {
        const batch = validPublications.slice(i, i + batchSize);

        for (let j = 0; j < batch.length; j++) {
          try {
            const publication = await Publication.create(batch[j]);
            createdPublications.push(publication.toJSON());
          } catch (error) {
            creationErrors.push({
              index: i + j,
              error: error.message
            });
          }
        }
      }

      res.status(201).json({
        message: `Bulk upload completed. ${createdPublications.length} publications created successfully.`,
        created: createdPublications.length,
        errors: creationErrors.length,
        creationErrors: creationErrors,
        totalProcessed: validPublications.length
      });

      } catch (error) {
        console.error('Bulk upload error:', error);

        // Clean up file if it exists
        if (req.file && req.file.path) {
          BulkOperations.cleanupFile(req.file.path);
        }

        res.status(500).json({
          error: 'Bulk upload failed',
          message: error.message
        });
      }
    });
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

module.exports = new PublicationController();