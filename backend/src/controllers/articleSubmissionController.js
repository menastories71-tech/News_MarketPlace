const ArticleSubmission = require('../models/ArticleSubmission');
const Publication = require('../models/Publication');
const PublicationManagement = require('../models/PublicationManagement');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../services/recaptchaService');
const { s3Service } = require('../services/s3Service');
const emailService = require('../services/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');

console.log('ArticleSubmissionController loaded - UPDATED VERSION');

// Helper function to delete image file from S3
const deleteImageFile = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const s3Key = s3Service.extractKeyFromUrl(imageUrl);
    if (s3Key) {
      await s3Service.deleteFile(s3Key);
      console.log(`Deleted image file from S3: ${s3Key}`);
    }
  } catch (error) {
    console.error('Failed to delete image from S3:', error);
  }
};

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images and documents
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = file.mimetype.startsWith('image/');
    const allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.mimetype);

    if (allowedImageTypes || allowedDocumentTypes) {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDF/Word documents are allowed'), false);
    }
  }
});

class ArticleSubmissionController {

  // Validation rules for create submission
  createValidation = [
    body('user_id').optional().isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('publication_id').isInt({ min: 1 }).withMessage('Valid publication ID is required'),
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    body('sub_title').optional().trim().isLength({ max: 255 }).withMessage('Subtitle must be less than 255 characters'),
    body('by_line').optional().trim().isLength({ max: 255 }).withMessage('By line must be less than 255 characters'),
    body('tentative_publish_date').optional().isISO8601().withMessage('Invalid date format'),
    body('article_text').trim().isLength({ min: 1 }).withMessage('Article text is required'),
    body('website_link').optional().isURL().withMessage('Invalid website URL format'),
    body('instagram_link').optional().isURL().withMessage('Invalid Instagram URL format'),
    body('facebook_link').optional().isURL().withMessage('Invalid Facebook URL format'),
    body('terms_agreed').equals('true').withMessage('Terms must be agreed to'),
    body('recaptcha_token').trim().isLength({ min: 1 }).withMessage('Captcha verification is required')
  ];

  // Validation rules for update submission (all fields optional)
  updateValidation = [
    body('user_id').optional().isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('publication_id').optional().isInt({ min: 1 }).withMessage('Valid publication ID is required'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be less than 255 characters'),
    body('sub_title').optional().trim().isLength({ max: 255 }).withMessage('Subtitle must be less than 255 characters'),
    body('by_line').optional().trim().isLength({ max: 255 }).withMessage('By line must be less than 255 characters'),
    body('tentative_publish_date').optional().isISO8601().withMessage('Invalid date format'),
    body('article_text').optional().trim().isLength({ min: 1 }).withMessage('Article text is required'),
    body('website_link').optional().isURL().withMessage('Invalid website URL format'),
    body('instagram_link').optional().isURL().withMessage('Invalid Instagram URL format'),
    body('facebook_link').optional().isURL().withMessage('Invalid Facebook URL format'),
    body('terms_agreed').optional().isBoolean().withMessage('Terms agreed must be boolean'),
    body('delete_image1').optional().isBoolean().withMessage('Delete image1 must be boolean'),
    body('delete_image2').optional().isBoolean().withMessage('Delete image2 must be boolean'),
    body('delete_document').optional().isBoolean().withMessage('Delete document must be boolean')
  ];

  // Create a new article submission (user or admin)
  async createSubmission(req, res) {
    try {
      console.log('=== Article Submission Debug Start ===');
      console.log('Request method:', req.method);
      console.log('Request path:', req.path);
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
      console.log('Request body keys:', Object.keys(req.body || {}));
      console.log('Request files keys:', Object.keys(req.files || {}));
      console.log('Starting article submission creation...');
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);

      // Check if validation middleware ran
      console.log('Checking validation results...');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors found:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }
      console.log('Validation passed');

      // For admin requests, user_id is optional; for user requests, required
      const userId = req.body.user_id || req.user?.userId || null;
      const {
        publication_id,
        title,
        sub_title,
        by_line,
        tentative_publish_date,
        article_text,
        website_link,
        instagram_link,
        facebook_link,
        terms_agreed,
        recaptcha_token
      } = req.body;

      console.log('Extracted data:', { 
        userId, 
        publication_id, 
        title: title ? title.substring(0, 50) + '...' : 'null',
        article_text_length: article_text ? article_text.length : 0
      });

      // Verify captcha
      console.log('Verifying captcha...');
      try {
        const captchaScore = await verifyRecaptcha(recaptcha_token);
        console.log('Captcha verification result:', captchaScore);
        if (captchaScore === null || captchaScore < 0.5) {
          console.log('Captcha verification failed');
          return res.status(400).json({
            error: 'Captcha verification failed',
            message: 'Please complete the captcha verification'
          });
        }
        console.log('Captcha verification passed');
      } catch (captchaError) {
        console.error('Captcha verification error:', captchaError);
        return res.status(400).json({
          error: 'Captcha verification failed',
          message: 'Captcha service error'
        });
      }

      console.log('Getting publication management for publication_id:', publication_id);

      // Get publication management to check word limit and image requirements
      try {
        const pubManagement = await PublicationManagement.findById(publication_id);
        console.log('Publication management query result:', pubManagement ? 'found' : 'not found');
        if (!pubManagement) {
          console.log('Publication management not found for ID:', publication_id);
          return res.status(404).json({ error: 'Publication not found' });
        }
        console.log('Found publication management:', pubManagement.publication_name);

        // Find the corresponding Publication record by name
        console.log('Looking for publication record with name:', pubManagement.publication_name);
        const publication = await Publication.findByPublicationName(pubManagement.publication_name);
        console.log('Publication record query result:', publication ? 'found' : 'not found');
        if (!publication) {
          console.log('Publication record not found for name:', pubManagement.publication_name);
          return res.status(404).json({ error: 'Publication record not found' });
        }
        console.log('Found publication:', publication.publication_name, 'ID:', publication.id);

        // Validate title: <= 12 words, no special characters
        console.log('Validating title...');
        const titleWords = title.trim().split(/\s+/);
        if (titleWords.length > 12) {
          console.log('Title validation failed: too many words');
          return res.status(400).json({ error: 'Title must be 12 words or less' });
        }
        const specialCharsRegex = /[^a-zA-Z0-9\s]/;
        if (specialCharsRegex.test(title)) {
          console.log('Title validation failed: special characters');
          return res.status(400).json({ error: 'Title cannot contain special characters' });
        }
        console.log('Title validation passed');

        // Validate article text word count <= publication word_limit
        console.log('Validating article text word count...');
        const articleWords = article_text.trim().split(/\s+/).length;
        console.log('Article word count:', articleWords, 'Limit:', pubManagement.word_limit);
        if (articleWords > pubManagement.word_limit) {
          console.log('Article word count validation failed');
          return res.status(400).json({
            error: `Article text exceeds word limit of ${pubManagement.word_limit} words`
          });
        }
        console.log('Article word count validation passed');

        // Determine required image count from publication management
        const requiredImageCount = pubManagement.needs_images ? parseInt(pubManagement.image_count) || 0 : 0;
        console.log('Required image count:', requiredImageCount);

        // Handle file uploads to S3
        let image1 = null;
        let image2 = null;
        let document = null;

        // Validate required images based on publication management
        console.log('Validating required images...');
        for (let i = 1; i <= requiredImageCount; i++) {
          if (!req.files || !req.files[`image${i}`] || !req.files[`image${i}`][0]) {
            console.log(`Image ${i} is missing but required`);
            return res.status(400).json({ error: `Image ${i} is required` });
          }
        }
        console.log('Required images validation passed');

        // Upload required images
        console.log('Uploading images to S3...');
        for (let i = 1; i <= requiredImageCount; i++) {
          if (req.files && req.files[`image${i}`] && req.files[`image${i}`][0]) {
            const file = req.files[`image${i}`][0];
            console.log(`Uploading image${i}:`, file.originalname, 'Size:', file.size);
            const s3Key = s3Service.generateKey('article-submissions', `image${i}`, file.originalname);
            const contentType = s3Service.getContentType(file.originalname);

            try {
              const imageUrl = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
              console.log(`Image${i} uploaded successfully:`, s3Key);
              if (i === 1) image1 = imageUrl;
              else if (i === 2) image2 = imageUrl;
              // TODO: Validate landscape orientation
            } catch (uploadError) {
              console.error(`Failed to upload image${i} to S3:`, uploadError);
              throw new Error(`Failed to upload image${i}`);
            }
          }
        }
        console.log('Image uploads completed');

        // Upload document if provided
        if (req.files && req.files.document && req.files.document[0]) {
          console.log('Uploading document...');
          const file = req.files.document[0];
          const s3Key = s3Service.generateKey('article-submissions', 'document', file.originalname);
          const contentType = s3Service.getContentType(file.originalname);

          try {
            document = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
            console.log('Document uploaded successfully:', s3Key);
          } catch (uploadError) {
            console.error('Failed to upload document to S3:', uploadError);
            throw new Error('Failed to upload document');
          }
        }

        console.log('Preparing submission data...');
        const submissionData = {
          user_id: userId,
          publication_id: publication.id, // Use the actual Publication ID, not PublicationManagement ID
          title,
          sub_title,
          by_line,
          tentative_publish_date,
          article_text,
          image1,
          image2,
          document,
          website_link,
          instagram_link,
          facebook_link,
          terms_agreed: terms_agreed === 'true'
        };

        console.log('Submission data prepared:', {
          ...submissionData,
          article_text: article_text ? `${article_text.length} chars` : 'null',
          image1: image1 ? 'uploaded' : 'null',
          image2: image2 ? 'uploaded' : 'null',
          document: document ? 'uploaded' : 'null'
        });

        console.log('Creating submission in database...');
        const submission = await ArticleSubmission.create(submissionData);
        console.log('Submission created successfully with ID:', submission.id);

        // Send confirmation emails
        try {
          await this.sendSubmissionConfirmationEmails(submission, publication, pubManagement);
        } catch (emailError) {
          console.error('Failed to send submission confirmation emails:', emailError);
          // Don't fail the request if email fails
        }

        res.status(201).json({
          message: 'Article submission created successfully',
          submission: submission.toJSON()
        });
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        console.error('Database error stack:', dbError.stack);
        throw dbError;
      }
    } catch (error) {
      console.error('=== Article Submission Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== End Error Details ===');
      
      // Send more detailed error in development
      const isDevelopment = process.env.NODE_ENV === 'development';
      res.status(500).json({ 
        error: 'Internal server error',
        ...(isDevelopment && {
          details: error.message,
          stack: error.stack
        })
      });
    }
  }

  // Get all submissions (admin only, paginated with filters)
  async getAllSubmissions(req, res) {
    try {
      console.log('getAllSubmissions called');
      const {
        page = 1,
        limit = 10,
        status,
        user_id,
        publication_id,
        search
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (user_id) filters.user_id = parseInt(user_id);
      if (publication_id) filters.publication_id = parseInt(publication_id);

      const offset = (page - 1) * limit;
      const submissions = await ArticleSubmission.findAll(filters, parseInt(limit), offset, search);
      console.log(`Found ${submissions.length} submissions`);

      // Build associations from joined data
      const submissionsWithAssociations = submissions.map(submission => {
        const json = submission.toJSON();
        console.log(`Submission ${submission.id}: publication_name = ${submission.publication_name}, publication_id = ${submission.publication_id}`);

        // Build user object
        let user = null;
        if (submission.user_first_name || submission.user_last_name || submission.user_email) {
          user = {
            first_name: submission.user_first_name,
            last_name: submission.user_last_name,
            email: submission.user_email
          };
        }

        // Build publication object
        let publication = null;
        if (submission.publication_name) {
          publication = {
            publication_name: submission.publication_name
          };
        }

        return {
          ...json,
          user,
          publication
        };
      });

      // Get total count for pagination
      const totalCount = await ArticleSubmission.getTotalCount(filters, search);
      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        submissions: submissionsWithAssociations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get all submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get submission by ID (admin only)
  async getSubmissionById(req, res) {
    try {
      const { id } = req.params;
      const submission = await ArticleSubmission.findById(parseInt(id));

      if (!submission) {
        return res.status(404).json({ error: 'Article submission not found' });
      }

      // Load associations
      const user = await submission.getUser();
      const publication = await submission.getPublication();

      res.json({
        submission: {
          ...submission.toJSON(),
          user: user ? user.toJSON() : null,
          publication: publication ? publication.toJSON() : null
        }
      });
    } catch (error) {
      console.error('Get submission by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update submission (admin only)
  async updateSubmission(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const submission = await ArticleSubmission.findById(parseInt(id));

      if (!submission) {
        return res.status(404).json({ error: 'Article submission not found' });
      }

      const updateData = { ...req.body };

      // Handle file uploads and deletions
      const { delete_image1, delete_image2, delete_document } = req.body;

      // Handle document
      if (req.files && req.files.document && req.files.document[0]) {
        // New document uploaded - delete old one if exists
        if (submission.document) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(submission.document);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete old document from S3:', deleteError);
            // Continue with the update even if old document deletion fails
          }
        }
        const file = req.files.document[0];
        const s3Key = s3Service.generateKey('article-submissions', 'document', file.originalname);
        const contentType = s3Service.getContentType(file.originalname);

        try {
          updateData.document = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
        } catch (uploadError) {
          console.error('Failed to upload new document to S3:', uploadError);
          throw new Error('Failed to upload document');
        }
      } else if (delete_document === 'true' || delete_document === true) {
        // Explicitly delete document
        if (submission.document) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(submission.document);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete document from S3:', deleteError);
            // Continue with the update even if deletion fails
          }
        }
        updateData.document = null;
      }

      // Handle image1
      if (req.files && req.files.image1 && req.files.image1[0]) {
        // New image uploaded - delete old one if exists
        if (submission.image1) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(submission.image1);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete old image1 from S3:', deleteError);
            // Continue with the update even if old image deletion fails
          }
        }
        const file = req.files.image1[0];
        const s3Key = s3Service.generateKey('article-submissions', 'image1', file.originalname);
        const contentType = s3Service.getContentType(file.originalname);

        try {
          updateData.image1 = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
        } catch (uploadError) {
          console.error('Failed to upload new image1 to S3:', uploadError);
          throw new Error('Failed to upload image1');
        }
      } else if (delete_image1 === 'true' || delete_image1 === true) {
        // Explicitly delete image1
        if (submission.image1) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(submission.image1);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete image1 from S3:', deleteError);
            // Continue with the update even if deletion fails
          }
        }
        updateData.image1 = null;
      }

      // Handle image2
      if (req.files && req.files.image2 && req.files.image2[0]) {
        // New image uploaded - delete old one if exists
        if (submission.image2) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(submission.image2);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete old image2 from S3:', deleteError);
            // Continue with the update even if old image deletion fails
          }
        }
        const file = req.files.image2[0];
        const s3Key = s3Service.generateKey('article-submissions', 'image2', file.originalname);
        const contentType = s3Service.getContentType(file.originalname);

        try {
          updateData.image2 = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
        } catch (uploadError) {
          console.error('Failed to upload new image2 to S3:', uploadError);
          throw new Error('Failed to upload image2');
        }
      } else if (delete_image2 === 'true' || delete_image2 === true) {
        // Explicitly delete image2
        if (submission.image2) {
          try {
            const s3Key = s3Service.extractKeyFromUrl(submission.image2);
            if (s3Key) {
              await s3Service.deleteFile(s3Key);
            }
          } catch (deleteError) {
            console.error('Failed to delete image2 from S3:', deleteError);
            // Continue with the update even if deletion fails
          }
        }
        updateData.image2 = null;
      }

      // Remove delete flags from update data
      delete updateData.delete_image1;
      delete updateData.delete_image2;
      delete updateData.delete_document;

      // Validate word count if article_text is being updated
      if (updateData.article_text) {
        const publication = await Publication.findById(submission.publication_id);
        if (publication) {
          const articleWords = updateData.article_text.trim().split(/\s+/).length;
          if (articleWords > publication.word_limit) {
            return res.status(400).json({
              error: `Article text exceeds word limit of ${publication.word_limit} words`
            });
          }
        }
      }

      // Validate title if being updated
      if (updateData.title) {
        const titleWords = updateData.title.trim().split(/\s+/);
        if (titleWords.length > 12) {
          return res.status(400).json({ error: 'Title must be 12 words or less' });
        }
        const specialCharsRegex = /[^a-zA-Z0-9\s]/;
        if (specialCharsRegex.test(updateData.title)) {
          return res.status(400).json({ error: 'Title cannot contain special characters' });
        }
      }

      const updatedSubmission = await submission.update(updateData);
      res.json({
        message: 'Article submission updated successfully',
        submission: updatedSubmission.toJSON()
      });
    } catch (error) {
      console.error('Update submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete submission (admin only)
  async deleteSubmission(req, res) {
    try {
      const { id } = req.params;
      const submission = await ArticleSubmission.findById(parseInt(id));

      if (!submission) {
        return res.status(404).json({ error: 'Article submission not found' });
      }

      // Delete associated files from S3
      if (submission.image1) {
        await deleteImageFile(submission.image1);
      }
      if (submission.image2) {
        await deleteImageFile(submission.image2);
      }
      if (submission.document) {
        await deleteImageFile(submission.document);
      }

      await submission.delete();
      res.json({ message: 'Article submission deleted successfully' });
    } catch (error) {
      console.error('Delete submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve submission (admin only)
  async approveSubmission(req, res) {
    try {
      const { id } = req.params;
      const submission = await ArticleSubmission.findById(parseInt(id));

      if (!submission) {
        return res.status(404).json({ error: 'Article submission not found' });
      }

      const approvedSubmission = await submission.approve();

      // Send approval notification email
      try {
        await this.sendApprovalNotificationEmail(approvedSubmission);
      } catch (emailError) {
        console.error('Failed to send approval notification email:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        message: 'Article submission approved successfully',
        submission: approvedSubmission.toJSON()
      });
    } catch (error) {
      console.error('Approve submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject submission (admin only)
  async rejectSubmission(req, res) {
    try {
      const { id } = req.params;
      const submission = await ArticleSubmission.findById(parseInt(id));

      if (!submission) {
        return res.status(404).json({ error: 'Article submission not found' });
      }

      const rejectedSubmission = await submission.reject();

      // Send rejection notification email
      try {
        await this.sendRejectionNotificationEmail(rejectedSubmission);
      } catch (emailError) {
        console.error('Failed to send rejection notification email:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        message: 'Article submission rejected successfully',
        submission: rejectedSubmission.toJSON()
      });
    } catch (error) {
      console.error('Reject submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all user's articles (manual submissions + AI articles)
  async getMyAllArticles(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 12 } = req.query;

      const offset = (page - 1) * parseInt(limit);
      const limitInt = parseInt(limit);

      // Get user's manual submissions
      const manualSql = `
        SELECT asub.*, p.publication_name, 'manual' as article_type
        FROM article_submissions asub
        LEFT JOIN publications p ON asub.publication_id = p.id
        WHERE asub.user_id = $1
        ORDER BY asub.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const manualValues = [userId, limitInt, offset];
      const manualResult = await query(manualSql, manualValues);

      // Get user's AI articles
      const aiSql = `
        SELECT aga.*, p.publication_name, 'ai' as article_type
        FROM ai_generated_articles aga
        LEFT JOIN publications p ON aga.publication_id = p.id
        WHERE aga.user_id = $1
        ORDER BY aga.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const aiValues = [userId, limitInt, offset];
      const aiResult = await query(aiSql, aiValues);

      // Combine and sort by created_at
      const allArticles = [...manualResult.rows, ...aiResult.rows]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limitInt);

      // Get total counts
      const manualCountSql = "SELECT COUNT(*) FROM article_submissions WHERE user_id = $1";
      const aiCountSql = "SELECT COUNT(*) FROM ai_generated_articles WHERE user_id = $1";
      const [manualCountResult, aiCountResult] = await Promise.all([
        query(manualCountSql, [userId]),
        query(aiCountSql, [userId])
      ]);
      const totalCount = parseInt(manualCountResult.rows[0].count) + parseInt(aiCountResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limitInt);

      // Format articles
      const formattedArticles = allArticles.map(row => {
        const isManual = row.article_type === 'manual';
        const article = isManual ? new ArticleSubmission(row) : { ...row };

        // Build publication object
        let publication = null;
        if (row.publication_name) {
          publication = { publication_name: row.publication_name };
        }

        if (isManual) {
          const json = article.toJSON();
          return {
            ...json,
            publication,
            article_type: 'manual'
          };
        } else {
          return {
            ...row,
            publication,
            article_type: 'ai'
          };
        }
      });

      res.json({
        articles: formattedArticles,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get my all articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get my submissions (user only)
  async getMySubmissions(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * parseInt(limit);
      const limitInt = parseInt(limit);

      // Get submissions with publication data
      const sql = `
        SELECT asub.*, p.publication_name
        FROM article_submissions asub
        LEFT JOIN publications p ON asub.publication_id = p.id
        WHERE asub.user_id = $1
        ORDER BY asub.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const values = [userId, limitInt, offset];
      const result = await query(sql, values);

      // Build submissions with publication_name
      const submissions = result.rows.map(row => {
        const submission = new ArticleSubmission(row);
        submission.publication_name = row.publication_name;
        return submission.toJSON();
      });

      // Get total count for pagination
      const countSql = "SELECT COUNT(*) FROM article_submissions WHERE user_id = $1";
      const countResult = await query(countSql, [userId]);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limitInt);

      res.json({
        submissions: submissions,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get my submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all approved articles (both manual and AI-generated)
  async getAllApprovedArticles(req, res) {
    try {
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * parseInt(limit);
      const limitInt = parseInt(limit);

      // Get manual approved articles
      const manualSql = `
        SELECT asub.*, p.publication_name, 'manual' as article_type
        FROM article_submissions asub
        LEFT JOIN publications p ON asub.publication_id = p.id
        WHERE asub.status = 'approved'
        ORDER BY asub.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const manualValues = [limitInt, offset];
      const manualResult = await query(manualSql, manualValues);

      // Get AI approved articles
      const aiSql = `
        SELECT aga.*, p.publication_name, 'ai' as article_type
        FROM ai_generated_articles aga
        LEFT JOIN publications p ON aga.publication_id = p.id
        WHERE aga.status = 'approved'
        ORDER BY aga.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const aiValues = [limitInt, offset];
      const aiResult = await query(aiSql, aiValues);

      // Combine and sort by created_at
      const allArticles = [...manualResult.rows, ...aiResult.rows]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limitInt);

      // Get total counts
      const manualCountSql = "SELECT COUNT(*) FROM article_submissions WHERE status = 'approved'";
      const aiCountSql = "SELECT COUNT(*) FROM ai_generated_articles WHERE status = 'approved'";
      const [manualCountResult, aiCountResult] = await Promise.all([
        query(manualCountSql),
        query(aiCountSql)
      ]);
      const totalCount = parseInt(manualCountResult.rows[0].count) + parseInt(aiCountResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limitInt);

      // Format articles
      const formattedArticles = allArticles.map(row => {
        const isManual = row.article_type === 'manual';
        const article = isManual ? new ArticleSubmission(row) : { ...row };

        // Build publication object
        let publication = null;
        if (row.publication_name) {
          publication = { publication_name: row.publication_name };
        }

        // For manual articles, add slug
        if (isManual) {
          const json = article.toJSON();
          return {
            ...json,
            publication,
            article_type: 'manual'
          };
        } else {
          // For AI articles
          return {
            ...row,
            publication,
            article_type: 'ai'
          };
        }
      });

      res.json({
        articles: formattedArticles,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get all approved articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved articles (public)
  async getApprovedArticles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * parseInt(limit);
      const limitInt = parseInt(limit);

      // Get submissions with publication data
      const sql = `
        SELECT asub.*, p.publication_name
        FROM article_submissions asub
        LEFT JOIN publications p ON asub.publication_id = p.id
        WHERE asub.status = 'approved'
        ORDER BY asub.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const values = [limitInt, offset];
      const result = await query(sql, values);

      // Get total count
      const countSql = "SELECT COUNT(*) FROM article_submissions WHERE status = 'approved'";
      const countResult = await query(countSql);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limitInt);

      // Build submissions with associations
      const submissionsWithAssociations = result.rows.map(row => {
        const submission = new ArticleSubmission(row);
        submission.publication_name = row.publication_name;

        const json = submission.toJSON();

        // Build publication object
        let publication = null;
        if (submission.publication_name) {
          publication = {
            publication_name: submission.publication_name
          };
        }

        return {
          ...json,
          publication
        };
      });

      res.json({
        articles: submissionsWithAssociations,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total: totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get approved articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved article by slug (public)
  async getApprovedArticleById(req, res) {
    try {
      const { slug } = req.params;
      const submission = await ArticleSubmission.findBySlug(slug);

      if (!submission || submission.status !== 'approved') {
        return res.status(404).json({ error: 'Approved article not found' });
      }

      // Load associations
      const user = await submission.getUser();
      const publication = await submission.getPublication();

      res.json({
        article: {
          ...submission.toJSON(),
          user: user ? user.toJSON() : null,
          publication: publication ? publication.toJSON() : null
        }
      });
    } catch (error) {
      console.error('Get approved article by slug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved AI article by ID (public)
  async getApprovedAiArticleById(req, res) {
    try {
      const { id } = req.params;
      console.log('Fetching AI article with ID:', id);

      // Get AI article with user and publication data
      const sql = `
        SELECT aga.*, u.first_name, u.last_name, u.email, p.publication_name
        FROM ai_generated_articles aga
        LEFT JOIN users u ON aga.user_id = u.id
        LEFT JOIN publications p ON aga.publication_id = p.id
        WHERE aga.id = $1 AND aga.status = 'approved'
      `;

      const result = await query(sql, [parseInt(id)]);
      console.log('Query result rows:', result.rows.length);

      if (result.rows.length === 0) {
        console.log('No approved AI article found with ID:', id);
        return res.status(404).json({ error: 'Approved AI article not found' });
      }

      const row = result.rows[0];
      console.log('Found AI article:', row.id, row.name, row.status);

      // Build user object
      let user = null;
      if (row.first_name || row.last_name || row.email) {
        user = {
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email
        };
      }

      // Build publication object
      let publication = null;
      if (row.publication_name) {
        publication = { publication_name: row.publication_name };
      }

      // Remove the joined fields from the main object
      const { first_name, last_name, email, publication_name, ...articleData } = row;

      res.json({
        article: {
          ...articleData,
          user,
          publication,
          article_type: 'ai'
        }
      });
    } catch (error) {
      console.error('Get approved AI article by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper method to get total count
  static async getTotalCount(filters = {}) {
    // This would need to be implemented in the model or use a separate query
    // For now, return approximate count
    return 100; // TODO: Implement proper count
  }

  // Helper method to get user submission count
  static async getUserSubmissionCount(userId) {
    // This would need to be implemented in the model
    // For now, return approximate count
    return 10; // TODO: Implement proper count
  }

  // Create a manual article (admin only)
  async createManualArticle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        user_id,
        publication_id,
        title,
        sub_title,
        by_line,
        tentative_publish_date,
        article_text,
        website_link,
        instagram_link,
        facebook_link
      } = req.body;

      // Get publication to check word limit
      const publication = await Publication.findById(publication_id);
      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      // Get publication management for image requirements
      const pubManagement = await PublicationManagement.findByPublicationName(publication.publication_name);
      const requiredImageCount = pubManagement && pubManagement.needs_images ? parseInt(pubManagement.image_count) || 0 : 0;

      // Validate title: <= 12 words, no special characters
      const titleWords = title.trim().split(/\s+/);
      if (titleWords.length > 12) {
        return res.status(400).json({ error: 'Title must be 12 words or less' });
      }
      const specialCharsRegex = /[^a-zA-Z0-9\s]/;
      if (specialCharsRegex.test(title)) {
        return res.status(400).json({ error: 'Title cannot contain special characters' });
      }

      // Validate article text word count <= publication word_limit
      const articleWords = article_text.trim().split(/\s+/).length;
      if (articleWords > publication.word_limit) {
        return res.status(400).json({
          error: `Article text exceeds word limit of ${publication.word_limit} words`
        });
      }

      // Handle file uploads to S3
      let image1 = null;
      let image2 = null;
      let document = null;

      // Validate required images based on publication management
      for (let i = 1; i <= requiredImageCount; i++) {
        if (!req.files || !req.files[`image${i}`] || !req.files[`image${i}`][0]) {
          return res.status(400).json({ error: `Image ${i} is required` });
        }
      }

      // Upload required images
      for (let i = 1; i <= requiredImageCount; i++) {
        if (req.files && req.files[`image${i}`] && req.files[`image${i}`][0]) {
          const file = req.files[`image${i}`][0];
          const s3Key = s3Service.generateKey('articles', `image${i}`, file.originalname);
          const contentType = s3Service.getContentType(file.originalname);

          try {
            const imageUrl = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
            if (i === 1) image1 = imageUrl;
            else if (i === 2) image2 = imageUrl;
            // TODO: Validate landscape orientation
          } catch (uploadError) {
            console.error(`Failed to upload image${i} to S3:`, uploadError);
            throw new Error(`Failed to upload image${i}`);
          }
        }
      }

      if (req.files && req.files.document && req.files.document[0]) {
        const file = req.files.document[0];
        const s3Key = s3Service.generateKey('articles', 'document', file.originalname);
        const contentType = s3Service.getContentType(file.originalname);

        try {
          document = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
        } catch (uploadError) {
          console.error('Failed to upload document to S3:', uploadError);
          throw new Error('Failed to upload document');
        }
      }

      const articleData = {
        user_id,
        publication_id,
        title,
        sub_title,
        by_line,
        tentative_publish_date,
        article_text,
        image1,
        image2,
        document,
        website_link,
        instagram_link,
        facebook_link,
        terms_agreed: true, // Manual articles are approved
        status: 'approved' // Directly approved
      };

      const article = await ArticleSubmission.create(articleData);

      res.status(201).json({
        message: 'Manual article created successfully',
        article: article.toJSON()
      });
    } catch (error) {
      console.error('Create manual article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper method to get approved count
  static async getApprovedCount() {
    const sql = "SELECT COUNT(*) FROM article_submissions WHERE status = 'approved'";
    const result = await query(sql);
    return parseInt(result.rows[0].count);
  }


  // Send submission confirmation emails
  async sendSubmissionConfirmationEmails(submission, publication, pubManagement) {
    try {
      // Get user information
      const user = await submission.getUser();
      if (!user) {
        console.warn('User not found for submission confirmation email');
        return;
      }

      const teamEmail = 'menastories71@gmail.com';

      // Email to user
      const userSubject = 'Article Submission Received - News Marketplace';
      const userHtmlContent = this.generateSubmissionConfirmationEmailTemplate(submission, publication, pubManagement, user);

      // Email to team
      const teamSubject = 'New Article Submission - News Marketplace';
      const teamHtmlContent = this.generateTeamNotificationEmailTemplate(submission, publication, pubManagement, user);

      // Send emails
      await Promise.all([
        emailService.sendCustomEmail(user.email, userSubject, userHtmlContent),
        emailService.sendCustomEmail(teamEmail, teamSubject, teamHtmlContent)
      ]);

      console.log('Submission confirmation emails sent successfully');
    } catch (error) {
      console.error('Error sending submission confirmation emails:', error);
      throw error;
    }
  }

  // Send approval notification email
  async sendApprovalNotificationEmail(submission) {
    try {
      const user = await submission.getUser();
      const publication = await submission.getPublication();

      if (!user) {
        console.warn('User not found for approval notification email');
        return;
      }

      const subject = 'Article Submission Approved! - News Marketplace';
      const htmlContent = this.generateApprovalEmailTemplate(submission, publication, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
      console.log('Approval notification email sent successfully');
    } catch (error) {
      console.error('Error sending approval notification email:', error);
      throw error;
    }
  }

  // Send rejection notification email
  async sendRejectionNotificationEmail(submission) {
    try {
      const user = await submission.getUser();
      const publication = await submission.getPublication();

      if (!user) {
        console.warn('User not found for rejection notification email');
        return;
      }

      const subject = 'Article Submission Update - News Marketplace';
      const htmlContent = this.generateRejectionEmailTemplate(submission, publication, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
      console.log('Rejection notification email sent successfully');
    } catch (error) {
      console.error('Error sending rejection notification email:', error);
      throw error;
    }
  }

  // Generate submission confirmation email template for user
  generateSubmissionConfirmationEmailTemplate(submission, publication, pubManagement, user) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Article Submission Received</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name || 'User'}!</h2>
              <p>Thank you for submitting your article to News Marketplace. Your submission has been received and is now under review.</p>

              <div class="submission-details">
                <h3>Submission Details:</h3>
                <p><strong>Title:</strong> ${submission.title}</p>
                <p><strong>Publication:</strong> ${publication ? publication.publication_name : 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Pending Review</span></p>
                <p><strong>Submitted on:</strong> ${new Date(submission.created_at).toLocaleDateString()}</p>
                ${submission.image1 ? '<p><strong>Images:</strong> Included</p>' : ''}
                ${submission.document ? '<p><strong>Document:</strong> Included</p>' : ''}
              </div>

              <p>You will receive an email notification once your submission has been reviewed. This process typically takes 2-3 business days.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate team notification email template
  generateTeamNotificationEmailTemplate(submission, publication, pubManagement, user) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .user-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 New Article Submission</h1>
            </div>
            <div class="content">
              <p>A new article submission has been received and requires review.</p>

              <div class="submission-details">
                <h3>Article Details:</h3>
                <p><strong>Title:</strong> ${submission.title}</p>
                <p><strong>Publication:</strong> ${publication ? publication.publication_name : 'N/A'}</p>
                <p><strong>Word Count:</strong> ${submission.article_text ? submission.article_text.split(/\s+/).length : 0}</p>
                <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Pending Review</span></p>
                <p><strong>Submitted on:</strong> ${new Date(submission.created_at).toLocaleDateString()}</p>
                ${submission.image1 ? '<p><strong>Images:</strong> Yes</p>' : '<p><strong>Images:</strong> No</p>'}
                ${submission.document ? '<p><strong>Document:</strong> Yes</p>' : '<p><strong>Document:</strong> No</p>'}
              </div>

              <div class="user-details">
                <h3>User Details:</h3>
                <p><strong>Name:</strong> ${user.first_name || 'N/A'} ${user.last_name || ''}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>User ID:</strong> ${user.id}</p>
              </div>

              <p>Please review this submission in the admin panel and take appropriate action.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate approval email template
  generateApprovalEmailTemplate(submission, publication, user) {
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
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Article Submission Approved!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name || 'User'}!</h2>
              <p>Great news! Your article submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="submission-details">
                <h3>Approved Article Details:</h3>
                <p><strong>Title:</strong> ${submission.title}</p>
                <p><strong>Publication:</strong> ${publication ? publication.publication_name : 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your article is now live on our platform and available for publication. You can view your approved articles in your dashboard.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
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
  generateRejectionEmailTemplate(submission, publication, user) {
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
            .submission-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Article Submission Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name || 'User'},</h2>
              <p>Thank you for submitting your article to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="submission-details">
                <h3>Submission Details:</h3>
                <p><strong>Title:</strong> ${submission.title}</p>
                <p><strong>Publication:</strong> ${publication ? publication.publication_name : 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
                <p><strong>Reviewed on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>You can edit and resubmit your article after addressing any issues. We're here to help you improve your submission!</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
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

module.exports = new ArticleSubmissionController();