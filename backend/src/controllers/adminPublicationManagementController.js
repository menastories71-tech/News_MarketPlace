const PublicationManagement = require('../models/PublicationManagement');
const { body, validationResult } = require('express-validator');

class AdminPublicationManagementController {
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
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
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
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
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
      // Allow non-admin GET requests for frontend publication selection
      const {
        page = 1,
        limit = 10,
        region,
        publication_name,
        language
      } = req.query;

      const filters = {};
      if (region) filters.region = region;
      if (language) filters.language = language;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (publication_name) {
        searchSql += ` AND publication_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${publication_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const publications = await PublicationManagement.findAll(limit, offset);

      // For simplicity, get total count by getting all and counting
      // In production, you'd want a separate count method
      const allPublications = await PublicationManagement.findAll();
      const totalCount = allPublications.length;

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

module.exports = new AdminPublicationManagementController();