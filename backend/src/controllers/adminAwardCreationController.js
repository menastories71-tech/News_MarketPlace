const AwardCreation = require('../models/AwardCreation');
const { body, validationResult } = require('express-validator');

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

      const awardCreation = await AwardCreation.create(req.body);

      res.status(201).json({
        message: 'Award creation created successfully',
        awardCreation: awardCreation.toJSON()
      });
    } catch (error) {
      console.error('Create award creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
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

      const updatedAwardCreation = await awardCreation.update(req.body);
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