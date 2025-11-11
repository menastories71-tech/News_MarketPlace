const Award = require('../models/Award');
const { body, validationResult } = require('express-validator');

class AwardController {
  // Validation rules for create/update
  createValidation = [
    body('award_name').trim().isLength({ min: 1 }).withMessage('Award name is required'),
    body('organiser').trim().isLength({ min: 1 }).withMessage('Organiser is required'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    body('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
  ];

  updateValidation = [
    body('award_name').optional().trim().isLength({ min: 1 }).withMessage('Award name is required'),
    body('organiser').optional().trim().isLength({ min: 1 }).withMessage('Organiser is required'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    body('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
  ];

  // Create a new award (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const award = await Award.create(req.body);
      res.status(201).json({
        message: 'Award created successfully',
        award: award.toJSON()
      });
    } catch (error) {
      console.error('Create award error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all awards with filtering and pagination (public)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        award_month,
        organiser,
        award_name,
        award_focus
      } = req.query;

      const filters = {};
      if (award_month) filters.award_month = award_month;
      if (organiser) filters.organiser = organiser;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (award_name) {
        searchSql += ` AND award_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${award_name}%`);
        searchParamCount++;
      }

      if (award_focus) {
        searchSql += ` AND award_focus ILIKE $${searchParamCount}`;
        searchValues.push(`%${award_focus}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const awards = await Award.findAll(filters, searchSql, searchValues, limit, offset);

      // Get total count for pagination
      const totalCount = await Award.getTotalCount(filters, searchSql, searchValues);

      res.json({
        awards: awards.map(award => award.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get awards error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get award by ID (public)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const award = await Award.findById(id);

      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      res.json({ award: award.toJSON() });
    } catch (error) {
      console.error('Get award by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update award (admin only)
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
      const award = await Award.findById(id);

      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      const updatedAward = await award.update(req.body);
      res.json({
        message: 'Award updated successfully',
        award: updatedAward.toJSON()
      });
    } catch (error) {
      console.error('Update award error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete award (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const award = await Award.findById(id);

      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      await award.delete();
      res.json({ message: 'Award deleted successfully' });
    } catch (error) {
      console.error('Delete award error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search awards (admin only)
  async search(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { q: searchTerm, ...filters } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const awards = await Award.search(searchTerm, filters, limit, offset);

      // Get total count for pagination
      const totalCount = await Award.getSearchTotalCount(searchTerm, filters);

      res.json({
        awards: awards.map(award => award.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Search awards error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AwardController();