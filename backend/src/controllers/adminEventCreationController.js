const EventCreation = require('../models/EventCreation');
const { body, validationResult } = require('express-validator');

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
        event_name
      } = req.query;

      const filters = {};
      if (industry) filters.industry = industry;
      if (regional_focused) filters.regional_focused = regional_focused;
      if (event_country) filters.event_country = event_country;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (event_name) {
        searchSql += ` AND event_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${event_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const eventCreations = await EventCreation.findAll(limit, offset);

      // For simplicity, get total count by getting all and counting
      // In production, you'd want a separate count method
      const allEventCreations = await EventCreation.findAll();
      const totalCount = allEventCreations.length;

      res.json({
        eventCreations: eventCreations.map(ec => ec.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
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

      const eventCreation = await EventCreation.create(req.body);

      res.status(201).json({
        message: 'Event creation created successfully',
        eventCreation: eventCreation.toJSON()
      });
    } catch (error) {
      console.error('Create event creation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
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

      const updatedEventCreation = await eventCreation.update(req.body);
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