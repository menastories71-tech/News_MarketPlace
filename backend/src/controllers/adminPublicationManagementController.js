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

    // Multer for CSV bulk upload
    this.csvUpload = multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'));
        }
      }
    });

  }


  // Validation rules for create
  createValidation = [
    body('region').trim().isLength({ min: 1 }).withMessage('Region is required'),
    body('publication_name').trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_url').optional({ checkFalsy: true }).isURL().withMessage('Valid publication URL is required'),
    body('da').optional({ checkFalsy: true }).isInt({ min: 0, max: 100 }).withMessage('DA must be between 0 and 100'),
    body('article_reference_link').optional({ checkFalsy: true }).isURL().withMessage('Valid article reference link is required'),
    body('committed_tat').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Committed TAT must be a non-negative integer'),
    body('language').optional({ checkFalsy: true }).trim(),
    body('publication_primary_focus').optional({ checkFalsy: true }).trim(),
    body('practical_tat').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Practical TAT must be a non-negative integer'),
    body('price_usd').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price USD must be a positive number'),
    body('do_follow').optional({ checkFalsy: true }).isBoolean().withMessage('Do follow must be a boolean'),
    body('dr').optional({ checkFalsy: true }).isInt({ min: 0, max: 100 }).withMessage('DR must be between 0 and 100'),
    body('word_limit').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('needs_images').optional({ checkFalsy: true }).isBoolean().withMessage('Needs images must be a boolean'),
    body('image_count').optional({ checkFalsy: true }).isInt({ min: 0, max: 2 }).withMessage('Image count must be 0, 1 or 2'),
    // Image validation removed since it's now a file upload
    body('rating_type').optional({ checkFalsy: true }).isIn(['Customer Choice', 'Best Seller', 'Editor\'s Pick', 'Trending', 'Featured']).withMessage('Invalid rating type'),
    body('instagram').optional({ checkFalsy: true }).isURL().withMessage('Instagram must be a valid URL'),
    body('facebook').optional({ checkFalsy: true }).isURL().withMessage('Facebook must be a valid URL'),
    body('twitter').optional({ checkFalsy: true }).isURL().withMessage('Twitter must be a valid URL'),
    body('linkedin').optional({ checkFalsy: true }).isURL().withMessage('LinkedIn must be a valid URL'),
    body('remarks').optional({ checkFalsy: true }).trim(),
  ];

  // Validation rules for update
  updateValidation = [
    body('region').optional().trim().isLength({ min: 1 }).withMessage('Region is required'),
    body('publication_name').optional().trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_url').optional({ checkFalsy: true }).isURL().withMessage('Valid publication URL is required'),
    body('da').optional({ checkFalsy: true }).isInt({ min: 0, max: 100 }).withMessage('DA must be between 0 and 100'),
    body('article_reference_link').optional({ checkFalsy: true }).isURL().withMessage('Valid article reference link is required'),
    body('committed_tat').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Committed TAT must be a non-negative integer'),
    body('language').optional({ checkFalsy: true }).trim(),
    body('publication_primary_focus').optional({ checkFalsy: true }).trim(),
    body('practical_tat').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Practical TAT must be a non-negative integer'),
    body('price_usd').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price USD must be a positive number'),
    body('do_follow').optional({ checkFalsy: true }).isBoolean().withMessage('Do follow must be a boolean'),
    body('dr').optional({ checkFalsy: true }).isInt({ min: 0, max: 100 }).withMessage('DR must be between 0 and 100'),
    body('word_limit').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('needs_images').optional({ checkFalsy: true }).isBoolean().withMessage('Needs images must be a boolean'),
    body('image_count').optional({ checkFalsy: true }).isInt({ min: 0, max: 2 }).withMessage('Image count must be 0, 1 or 2'),
    // Image validation removed since it's now a file upload
    body('rating_type').optional({ checkFalsy: true }).isIn(['Customer Choice', 'Best Seller', 'Editor\'s Pick', 'Trending', 'Featured']).withMessage('Invalid rating type'),
    body('instagram').optional({ checkFalsy: true }).isURL().withMessage('Instagram must be a valid URL'),
    body('facebook').optional({ checkFalsy: true }).isURL().withMessage('Facebook must be a valid URL'),
    body('twitter').optional({ checkFalsy: true }).isURL().withMessage('Twitter must be a valid URL'),
    body('linkedin').optional({ checkFalsy: true }).isURL().withMessage('LinkedIn must be a valid URL'),
    body('remarks').optional({ checkFalsy: true }).trim(),
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
        publication_primary_focus,
        search,
        price_min,
        price_max,
        da_min,
        da_max,
        dr_min,
        dr_max,
        tat_min,
        tat_max,
        do_follow,
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
        if (publication_primary_focus) whereClause.publication_primary_focus = publication_primary_focus;
      }

      // Range filters
      if (price_min !== undefined) whereClause.price_min = parseFloat(price_min);
      if (price_max !== undefined) whereClause.price_max = parseFloat(price_max);
      if (da_min !== undefined) whereClause.da_min = parseInt(da_min);
      if (da_max !== undefined) whereClause.da_max = parseInt(da_max);
      if (dr_min !== undefined) whereClause.dr_min = parseInt(dr_min);
      if (dr_max !== undefined) whereClause.dr_max = parseInt(dr_max);
      if (tat_min !== undefined) whereClause.tat_min = parseInt(tat_min);
      if (tat_max !== undefined) whereClause.tat_max = parseInt(tat_max);

      // Boolean filters
      if (do_follow !== undefined) {
        whereClause.do_follow = do_follow === 'true' || do_follow === true;
      }

      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      const offset = (pageNum - 1) * limitNum;

      const { count, rows } = await PublicationManagement.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        publications: rows.map(pub => pub.toJSON()),
        pagination: {
          page: pageNum,
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

  // Download CSV template for bulk upload
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'region',
        'publication_name',
        'publication_url',
        'da',
        'article_reference_link',
        'committed_tat',
        'language',
        'publication_primary_focus',
        'practical_tat',
        'price_usd',
        'do_follow',
        'dr',
        'word_limit',
        'needs_images',
        'image_count',
        'rating_type',
        'instagram',
        'facebook',
        'twitter',
        'linkedin',
        'remarks'
      ];

      const dummyData = [
        ['USA', 'Tech News', 'https://technews.com', '70', 'https://technews.com/ref1', '5', 'English', 'Technology', '7', '150.00', 'true', '65', '800', 'false', '0', 'Featured', 'https://instagram.com/tech', 'https://facebook.com/tech', 'https://twitter.com/tech', 'https://linkedin.com/tech', 'Great tech site'],
        ['UK', 'Daily News', 'https://dailynews.co.uk', '80', 'https://dailynews.co.uk/ref1', '3', 'English', 'General', '5', '200.00', 'true', '75', '1000', 'true', '1', 'Best Seller', 'https://instagram.com/daily', 'https://facebook.com/daily', 'https://twitter.com/daily', 'https://linkedin.com/daily', 'High authority news'],
        ['France', 'Le Monde', 'https://lemonde.fr', '85', 'https://lemonde.fr/ref1', '10', 'French', 'News', '14', '500.00', 'true', '80', '1200', 'true', '2', 'Editor\'s Pick', '', '', '', '', 'Top French publication'],
        ['Germany', 'Tech Zeit', 'https://techzeit.de', '65', 'https://techzeit.de/ref1', '7', 'German', 'Technology', '10', '120.00', 'false', '60', '700', 'false', '0', 'Trending', 'https://instagram.com/zeit', '', '', '', 'German market focus'],
        ['India', 'Times of Tech', 'https://timesoftech.in', '75', 'https://timesoftech.in/ref1', '4', 'English', 'Technology', '6', '180.00', 'true', '70', '900', 'true', '1', 'Customer Choice', 'https://instagram.com/tot', 'https://facebook.com/tot', 'https://twitter.com/tot', 'https://linkedin.com/tot', 'Indian tech market']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=publication_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload publications from CSV
  async bulkUpload(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV file' });
      }

      const csvParser = require('csv-parser');
      const { Readable } = require('stream');

      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const createdRecords = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                // Basic mapping and cleaning
                const publicationData = {
                  region: row.region || '',
                  publication_name: row.publication_name || '',
                  publication_url: row.publication_url || '',
                  da: parseInt(row.da) || 0,
                  article_reference_link: row.article_reference_link || '',
                  committed_tat: parseInt(row.committed_tat) || 0,
                  language: row.language || '',
                  publication_primary_focus: row.publication_primary_focus || '',
                  practical_tat: parseInt(row.practical_tat) || 0,
                  price_usd: parseFloat(row.price_usd) || 0,
                  do_follow: row.do_follow === 'true' || row.do_follow === '1',
                  dr: parseInt(row.dr) || 0,
                  remarks: row.remarks || '',
                  word_limit: parseInt(row.word_limit) || 0,
                  needs_images: row.needs_images === 'true' || row.needs_images === '1',
                  image_count: parseInt(row.image_count) || 0,
                  rating_type: row.rating_type || '',
                  instagram: row.instagram || '',
                  facebook: row.facebook || '',
                  twitter: row.twitter || '',
                  linkedin: row.linkedin || ''
                };

                if (!publicationData.publication_name || !publicationData.region) {
                  errors.push(`Row ${index + 1}: Publication name and region are required.`);
                  continue;
                }

                const record = await PublicationManagement.create(publicationData);
                createdRecords.push(record);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdRecords.length} records created.`,
              count: createdRecords.length,
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (error) {
            console.error('Processing batch error:', error);
            res.status(500).json({ error: 'Error processing bulk upload' });
          }
        });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export CSV
  async exportCSV(req, res) {
    try {
      const { Parser } = require('json2csv');
      const {
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

      // Fetch all matching records (no limit)
      const { rows } = await PublicationManagement.findAndCountAll({
        where: whereClause,
        limit: null,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      const fields = [
        'id',
        'region',
        'publication_name',
        'publication_url',
        'da',
        'article_reference_link',
        'committed_tat',
        'language',
        'publication_primary_focus',
        'practical_tat',
        'price_usd',
        'do_follow',
        'dr',
        'word_limit',
        'needs_images',
        'image_count',
        'image',
        'rating_type',
        'instagram',
        'facebook',
        'twitter',
        'linkedin',
        'remarks',
        'created_at'
      ];

      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(rows.map(r => r.toJSON()));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=publications_export.csv');
      return res.send(csv);

    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AdminPublicationManagementController;