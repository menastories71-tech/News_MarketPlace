const PaparazziCreation = require('../models/PaparazziCreation');
const { body, validationResult } = require('express-validator');

class AdminPaparazziCreationsController {
  // Validation rules for create
  createValidation = [
    body('instagram_page_name').trim().isLength({ min: 1 }).withMessage('Instagram page name is required'),
    body('no_of_followers').isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('region_focused').optional().trim(),
    body('category').isIn(['Entertainment and Movies', 'Lifestyle', 'Local Guide']).withMessage('Category must be one of: Entertainment and Movies, Lifestyle, Local Guide'),
    body('instagram_url').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('profile_dp_logo').optional().trim(),
  ];

  // Validation rules for update
  updateValidation = [
    body('instagram_page_name').optional().trim().isLength({ min: 1 }).withMessage('Instagram page name is required'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('region_focused').optional().trim(),
    body('category').optional().isIn(['Entertainment and Movies', 'Lifestyle', 'Local Guide']).withMessage('Category must be one of: Entertainment and Movies, Lifestyle, Local Guide'),
    body('instagram_url').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('profile_dp_logo').optional().trim(),
  ];

  // Get all paparazzi creations
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        region_focused,
        instagram_page_name
      } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (region_focused) filters.region_focused = region_focused;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (instagram_page_name) {
        searchSql += ` AND instagram_page_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${instagram_page_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const paparazziCreations = await PaparazziCreation.findAll(limit, offset);

      // For simplicity, get total count by getting all and counting
      // In production, you'd want a separate count method
      const allPaparazziCreations = await PaparazziCreation.findAll();
      const totalCount = allPaparazziCreations.length;

      res.json({
        paparazziCreations: paparazziCreations.map(pc => pc.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get paparazzi creations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get paparazzi creation by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const paparazziCreation = await PaparazziCreation.findById(id);

      if (!paparazziCreation) {
        return res.status(404).json({ error: 'Paparazzi creation not found' });
      }

      res.json({ paparazziCreation: paparazziCreation.toJSON() });
    } catch (error) {
      console.error('Get paparazzi creation by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new paparazzi creation (admin only)
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

      const paparazziCreation = await PaparazziCreation.create(req.body);

      res.status(201).json({
        message: 'Paparazzi creation created successfully',
        paparazziCreation: paparazziCreation.toJSON()
      });
    } catch (error) {
      console.error('Create paparazzi creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update paparazzi creation (admin only)
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
      const paparazziCreation = await PaparazziCreation.findById(id);

      if (!paparazziCreation) {
        return res.status(404).json({ error: 'Paparazzi creation not found' });
      }

      const updatedPaparazziCreation = await paparazziCreation.update(req.body);
      res.json({
        message: 'Paparazzi creation updated successfully',
        paparazziCreation: updatedPaparazziCreation.toJSON()
      });
    } catch (error) {
      console.error('Update paparazzi creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete paparazzi creation (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const paparazziCreation = await PaparazziCreation.findById(id);

      if (!paparazziCreation) {
        return res.status(404).json({ error: 'Paparazzi creation not found' });
      }

      await paparazziCreation.delete();
      res.json({ message: 'Paparazzi creation deleted successfully' });
    } catch (error) {
      console.error('Delete paparazzi creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AdminPaparazziCreationsController();