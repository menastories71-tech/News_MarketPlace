const AwardCreation = require('../models/AwardCreation');
const { body, validationResult } = require('express-validator');
const { s3Service } = require('../services/s3Service');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class AdminAwardCreationController {
  // Validation rules for create
  createValidation = [
    body('award_name').trim().isLength({ min: 1 }).withMessage('Award name is required'),
    body('award_organiser_name').trim().isLength({ min: 1 }).withMessage('Award organiser name is required'),
    body('url').optional().isURL().withMessage('Valid URL is required'),
    body('tentative_month').optional().trim(),
    body('industry').optional().trim(),
    body('regional_focused').optional().trim(),
    body('award_country').optional().trim(),
    body('award_city').optional().trim(),
    body('company_focused_individual_focused').optional().trim(),
    body('image').optional().trim(),
  ];

  // Validation rules for update
  updateValidation = [
    body('award_name').optional().trim().isLength({ min: 1 }).withMessage('Award name is required'),
    body('award_organiser_name').optional().trim().isLength({ min: 1 }).withMessage('Award organiser name is required'),
    body('url').optional().isURL().withMessage('Valid URL is required'),
    body('tentative_month').optional().trim(),
    body('industry').optional().trim(),
    body('regional_focused').optional().trim(),
    body('award_country').optional().trim(),
    body('award_city').optional().trim(),
    body('company_focused_individual_focused').optional().trim(),
    body('image').optional().trim(),
  ];

  // Get all award creations
  async getAllAwardCreations(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        industry,
        regional_focused,
        award_country,
        award_name
      } = req.query;

      const whereClause = {};
      if (industry) whereClause.industry = industry;
      if (regional_focused) whereClause.regional_focused = regional_focused;
      if (award_country) whereClause.award_country = award_country;
      if (award_name) whereClause.award_name = { [require('sequelize').Op.iLike]: `%${award_name}%` };

      const offset = (page - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      const { count, rows } = await AwardCreation.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        awardCreations: rows.map(ac => ac.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get award creations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get award creation by ID
  async getAwardCreationById(req, res) {
    try {
      const { id } = req.params;
      const awardCreation = await AwardCreation.findByPk(id);

      if (!awardCreation) {
        return res.status(404).json({ error: 'Award creation not found' });
      }

      res.json({ awardCreation: awardCreation.toJSON() });
    } catch (error) {
      console.error('Get award creation by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new award creation (admin only)
  async createAwardCreation(req, res) {
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

      const awardCreationData = { ...req.body };

      // Handle image upload
      if (req.file) {
        try {
          let imageUrl;

          // Try S3 first if configured
          if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            console.log('Using S3 for award creation image upload');
            const s3Key = s3Service.generateKey('award-creations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);

            // S3 service handles its own image optimization, so pass raw buffer
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded award creation image to S3:', imageUrl);
          } else {
            // Fallback to local storage with local optimization
            console.log('S3 not configured, using local storage for award creation image');
            imageUrl = await this.uploadImageLocally(req.file);
          }

          awardCreationData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload award creation image:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      const awardCreation = await AwardCreation.create(awardCreationData);

      res.status(201).json({
        message: 'Award creation created successfully',
        awardCreation: awardCreation.toJSON()
      });
    } catch (error) {
      console.error('Create award creation error:', error);
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
      const uploadsDir = path.join(__dirname, '../../uploads/award-creations');
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
      const localUrl = `/uploads/award-creations/${filename}`;
      console.log('Successfully saved award creation image locally:', localUrl);

      return localUrl;
    } catch (error) {
      console.error('Local award creation image upload error:', error);
      throw new Error(`Failed to save image locally: ${error.message}`);
    }
  }

  // Update award creation (admin only)
  async updateAwardCreation(req, res) {
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
      const awardCreation = await AwardCreation.findByPk(id);

      if (!awardCreation) {
        return res.status(404).json({ error: 'Award creation not found' });
      }

      const updateData = { ...req.body };

      // Handle image upload
      if (req.file) {
        try {
          let imageUrl;

          // Try S3 first if configured
          if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            console.log('Using S3 for award creation image upload (update)');
            const s3Key = s3Service.generateKey('award-creations', 'image', req.file.originalname);
            const contentType = s3Service.getContentType(req.file.originalname);

            // S3 service handles its own image optimization
            imageUrl = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
            console.log('Successfully uploaded award creation image to S3:', imageUrl);

            // Delete old image from S3 if it exists
            if (awardCreation.image) {
              try {
                const oldS3Key = s3Service.extractKeyFromUrl(awardCreation.image);
                if (oldS3Key) {
                  await s3Service.deleteFile(oldS3Key);
                }
              } catch (deleteError) {
                console.error('Failed to delete old award creation image from S3:', deleteError);
                // Continue with the update even if old image deletion fails
              }
            }
          } else {
            // Fallback to local storage with local optimization
            console.log('S3 not configured, using local storage for award creation image (update)');
            imageUrl = await this.uploadImageLocally(req.file);
          }

          updateData.image = imageUrl;
        } catch (uploadError) {
          console.error('Failed to upload award creation image:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      const updatedAwardCreation = await awardCreation.update(updateData);
      res.json({
        message: 'Award creation updated successfully',
        awardCreation: updatedAwardCreation.toJSON()
      });
    } catch (error) {
      console.error('Update award creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete award creation (admin only)
  async deleteAwardCreation(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const awardCreation = await AwardCreation.findByPk(id);

      if (!awardCreation) {
        return res.status(404).json({ error: 'Award creation not found' });
      }

      await awardCreation.destroy();
      res.json({ message: 'Award creation deleted successfully' });
    } catch (error) {
      console.error('Delete award creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AdminAwardCreationController();