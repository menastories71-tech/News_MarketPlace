const EventCreation = require('../models/EventCreation');
const { body, validationResult } = require('express-validator');
const { s3Service } = require('../services/s3Service');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class AdminEventCreationController {
  // Validation rules for create
  createValidation = [
    body('event_name').trim().isLength({ min: 1 }).withMessage('Event name is required'),
    body('event_organiser_name').trim().isLength({ min: 1 }).withMessage('Event organiser name is required'),
    body('url').optional().isURL().withMessage('Valid URL is required'),
    body('tentative_month').optional().trim(),
    body('industry').optional().trim(),
    body('regional_focused').optional().trim(),
    body('event_country').optional().trim(),
    body('event_city').optional().trim(),
    body('company_focused_individual_focused').optional().trim(),
    body('image').optional().trim(),
  ];

  // Validation rules for update
  updateValidation = [
    body('event_name').optional().trim().isLength({ min: 1 }).withMessage('Event name is required'),
    body('event_organiser_name').optional().trim().isLength({ min: 1 }).withMessage('Event organiser name is required'),
    body('url').optional().isURL().withMessage('Valid URL is required'),
    body('tentative_month').optional().trim(),
    body('industry').optional().trim(),
    body('regional_focused').optional().trim(),
    body('event_country').optional().trim(),
    body('event_city').optional().trim(),
    body('company_focused_individual_focused').optional().trim(),
    body('image').optional().trim(),
  ];

  // Get all event creations
  async getAllEventCreations(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        industry,
        regional_focused,
        event_country,
        event_name,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (industry) whereClause.industry = industry;
        if (regional_focused) whereClause.regional_focused = regional_focused;
        if (event_country) whereClause.event_country = event_country;
        if (event_name) whereClause.event_name = event_name;
      }

      const limitNum = parseInt(limit);
      const offset = (page - 1) * limitNum;

      const { count, rows } = await EventCreation.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        eventCreations: rows.map(ec => ec.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get event creations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get event creation by ID
  async getEventCreationById(req, res) {
    try {
      const { id } = req.params;
      const eventCreation = await EventCreation.findById(id);

      if (!eventCreation) {
        return res.status(404).json({ error: 'Event creation not found' });
      }

      res.json({ eventCreation: eventCreation.toJSON() });
    } catch (error) {
      console.error('Get event creation by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new event creation (admin only)
  async createEventCreation(req, res) {
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

      const eventCreationData = { ...req.body };

      // Handle image upload
      if (req.file) {
        try {
          let imageUrl;

          // Try S3 first if configured
          if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            console.log('Using S3 for event creation image upload');
            const s3Key = s3Service.generateKey('event-creations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);

            // S3 service handles its own image optimization, so pass raw buffer
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded event creation image to S3:', imageUrl);
          } else {
            // Fallback to local storage with local optimization
            console.log('S3 not configured, using local storage for event creation image');
            imageUrl = await this.uploadImageLocally(req.file);
          }

          eventCreationData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload event creation image:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      const eventCreation = await EventCreation.create(eventCreationData);

      res.status(201).json({
        message: 'Event creation created successfully',
        eventCreation: eventCreation.toJSON()
      });
    } catch (error) {
      console.error('Create event creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Local image upload helper
  async uploadImageLocally(file) {
    try {
      // Check file size before processing
      if (file.size > 500 * 1024) {
        throw new Error('Image file is too large. Maximum size is 500KB.');
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads/event-creations');
      await fs.promises.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const filename = `image-${timestamp}-${randomSuffix}${extension}`;
      const filepath = path.join(uploadsDir, filename);

      // Optimize image before saving
      const optimizedBuffer = await sharp(file.buffer)
        .resize(400, 300, { withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: 70, progressive: true })
        .toBuffer();

      // Check optimized size
      if (optimizedBuffer.length > 500 * 1024) {
        // If still too large, compress more aggressively
        const extraCompressedBuffer = await sharp(file.buffer)
          .resize(300, 200, { withoutEnlargement: true, fit: 'inside' })
          .jpeg({ quality: 60, progressive: true })
          .toBuffer();

        if (extraCompressedBuffer.length <= 500 * 1024) {
          await fs.promises.writeFile(filepath, extraCompressedBuffer);
        } else {
          throw new Error('Unable to compress image to acceptable size. Please use a smaller image.');
        }
      } else {
        // Save file
        await fs.promises.writeFile(filepath, optimizedBuffer);
      }

      // Return local URL
      const localUrl = `/uploads/event-creations/${filename}`;
      console.log('Successfully saved event creation image locally:', localUrl);

      return localUrl;
    } catch (error) {
      console.error('Local event creation image upload error:', error);
      throw new Error(`Failed to save image locally: ${error.message}`);
    }
  }

  // Update event creation (admin only)
  async updateEventCreation(req, res) {
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
      const eventCreation = await EventCreation.findById(id);

      if (!eventCreation) {
        return res.status(404).json({ error: 'Event creation not found' });
      }

      const updateData = { ...req.body };

      // Handle image upload
      if (req.file) {
        try {
          let imageUrl;

          // Try S3 first if configured
          if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            console.log('Using S3 for event creation image upload (update)');
            const s3Key = s3Service.generateKey('event-creations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);

            // S3 service handles its own image optimization
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded event creation image to S3:', imageUrl);

            // Delete old image from S3 if it exists
            if (eventCreation.image) {
              try {
                const oldS3Key = s3Service.extractKeyFromUrl(eventCreation.image);
                if (oldS3Key) {
                  await s3Service.deleteFile(oldS3Key);
                }
              } catch (deleteError) {
                console.error('Failed to delete old event creation image from S3:', deleteError);
                // Continue with the update even if old image deletion fails
              }
            }
          } else {
            // Fallback to local storage with local optimization
            console.log('S3 not configured, using local storage for event creation image (update)');
            imageUrl = await this.uploadImageLocally(req.file);
          }

          updateData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload event creation image:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      const updatedEventCreation = await eventCreation.update(updateData);
      res.json({
        message: 'Event creation updated successfully',
        eventCreation: updatedEventCreation.toJSON()
      });
    } catch (error) {
      console.error('Update event creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete event creation (admin only)
  async deleteEventCreation(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const eventCreation = await EventCreation.findById(id);

      if (!eventCreation) {
        return res.status(404).json({ error: 'Event creation not found' });
      }

      await eventCreation.delete();
      res.json({ message: 'Event creation deleted successfully' });
    } catch (error) {
      console.error('Delete event creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AdminEventCreationController();