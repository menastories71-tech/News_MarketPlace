const EventDisclaimer = require('../models/EventDisclaimer');
const { body, validationResult } = require('express-validator');

class EventDisclaimerController {
  // Validation rules
  createValidation = [
    body('event_id').isInt({ min: 1 }).withMessage('Valid event ID is required'),
    body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
  ];

  updateValidation = [
    body('message').optional().trim().isLength({ min: 1 }).withMessage('Message is required'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
  ];

  // Create a new disclaimer (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const disclaimerData = req.body;
      const disclaimer = await EventDisclaimer.create(disclaimerData);

      res.status(201).json({
        message: 'Disclaimer created successfully',
        disclaimer: disclaimer.toJSON()
      });
    } catch (error) {
      console.error('Create disclaimer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get disclaimers for an event (public)
  async getByEvent(req, res) {
    try {
      const { eventId } = req.params;
      const disclaimers = await EventDisclaimer.findByEventId(eventId, true); // Only active disclaimers

      res.json({
        disclaimers: disclaimers.map(disclaimer => disclaimer.toJSON())
      });
    } catch (error) {
      console.error('Get disclaimers by event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all active disclaimers (public)
  async getActive(req, res) {
    try {
      const disclaimers = await EventDisclaimer.findAllActive();

      res.json({
        disclaimers: disclaimers.map(disclaimer => disclaimer.toJSON())
      });
    } catch (error) {
      console.error('Get active disclaimers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all disclaimers (admin only)
  async getAll(req, res) {
    try {
      const disclaimers = await EventDisclaimer.findAll();

      res.json({
        disclaimers: disclaimers.map(disclaimer => disclaimer.toJSON())
      });
    } catch (error) {
      console.error('Get all disclaimers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get disclaimer by ID (admin only)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const disclaimer = await EventDisclaimer.findById(id);

      if (!disclaimer) {
        return res.status(404).json({ error: 'Disclaimer not found' });
      }

      res.json({ disclaimer: disclaimer.toJSON() });
    } catch (error) {
      console.error('Get disclaimer by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update disclaimer (admin only)
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
      const disclaimer = await EventDisclaimer.findById(id);

      if (!disclaimer) {
        return res.status(404).json({ error: 'Disclaimer not found' });
      }

      const updatedDisclaimer = await disclaimer.update(req.body);
      res.json({
        message: 'Disclaimer updated successfully',
        disclaimer: updatedDisclaimer.toJSON()
      });
    } catch (error) {
      console.error('Update disclaimer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete disclaimer (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const disclaimer = await EventDisclaimer.findById(id);

      if (!disclaimer) {
        return res.status(404).json({ error: 'Disclaimer not found' });
      }

      await disclaimer.delete();
      res.json({ message: 'Disclaimer deleted successfully' });
    } catch (error) {
      console.error('Delete disclaimer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new EventDisclaimerController();