const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const EventRegistration = require('../models/EventRegistration');
const EventDisclaimer = require('../models/EventDisclaimer');
const { body, validationResult } = require('express-validator');

class EventController {
  // Validation rules
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim(),
    body('country').optional().trim(),
    body('city').optional().trim(),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    body('month').optional().trim(),
    body('event_type').optional().isIn(['Government Summit', 'Power List', 'Membership', 'Leisure Events', 'Sports Events', 'Music Festival', 'Art Festival']).withMessage('Invalid event type'),
    body('is_free').optional().isBoolean().withMessage('is_free must be a boolean'),
    body('organizer').optional().trim(),
    body('venue').optional().trim(),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('registration_deadline').optional().isISO8601().withMessage('Valid registration deadline is required'),
    body('status').optional().isIn(['active', 'cancelled', 'completed']).withMessage('Invalid status'),
    body('custom_form_fields').optional().isObject().withMessage('Custom form fields must be an object'),
    body('disclaimer_text').optional().trim(),
    body('enable_sponsor').optional().isBoolean().withMessage('enable_sponsor must be a boolean'),
    body('enable_media_partner').optional().isBoolean().withMessage('enable_media_partner must be a boolean'),
    body('enable_speaker').optional().isBoolean().withMessage('enable_speaker must be a boolean'),
    body('enable_guest').optional().isBoolean().withMessage('enable_guest must be a boolean')
  ];

  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim(),
    body('country').optional().trim(),
    body('city').optional().trim(),
    body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    body('month').optional().trim(),
    body('event_type').optional().isIn(['Government Summit', 'Power List', 'Membership', 'Leisure Events', 'Sports Events', 'Music Festival', 'Art Festival']).withMessage('Invalid event type'),
    body('is_free').optional().isBoolean().withMessage('is_free must be a boolean'),
    body('organizer').optional().trim(),
    body('venue').optional().trim(),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('registration_deadline').optional().isISO8601().withMessage('Valid registration deadline is required'),
    body('status').optional().isIn(['active', 'cancelled', 'completed']).withMessage('Invalid status'),
    body('custom_form_fields').optional().isObject().withMessage('Custom form fields must be an object'),
    body('disclaimer_text').optional().trim(),
    body('enable_sponsor').optional().isBoolean().withMessage('enable_sponsor must be a boolean'),
    body('enable_media_partner').optional().isBoolean().withMessage('enable_media_partner must be a boolean'),
    body('enable_speaker').optional().isBoolean().withMessage('enable_speaker must be a boolean'),
    body('enable_guest').optional().isBoolean().withMessage('enable_guest must be a boolean')
  ];

  // Create a new event (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const eventData = {
        ...req.body,
        created_by: req.admin?.id || req.body.created_by
      };

      const event = await Event.create(eventData);

      res.status(201).json({
        message: 'Event created successfully',
        event: event.toJSON()
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all events (public with filters)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        country,
        city,
        month,
        event_type,
        is_free, // paid/free filter
        search
      } = req.query;

      const filters = {};

      if (country) filters.country = country;
      if (city) filters.city = city;
      if (month) filters.month = month;
      if (event_type) filters.event_type = event_type;
      if (is_free !== undefined) filters.is_free = is_free === 'true';

      let searchSql = '';
      const searchValues = [];
      let paramStart = Object.keys(filters).length + 1;

      if (search) {
        searchSql = ` AND (
          title ILIKE $${paramStart} OR
          description ILIKE $${paramStart} OR
          organizer ILIKE $${paramStart} OR
          venue ILIKE $${paramStart}
        )`;
        searchValues.push(`%${search}%`);
        paramStart++;
      }

      const offset = (page - 1) * limit;
      const events = await Event.findAll(filters, searchSql, searchValues, limit, offset);

      res.json({
        events: events.map(event => event.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get event by ID (public)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Get associated tickets and disclaimers
      const tickets = await Ticket.findByEventId(id, { status: 'active' });
      const disclaimers = await EventDisclaimer.findByEventId(id, true);

      res.json({
        event: event.toJSON(),
        tickets: tickets.map(ticket => ticket.toJSON()),
        disclaimers: disclaimers.map(disclaimer => disclaimer.toJSON())
      });
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update event (admin only)
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
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const updatedEvent = await event.update(req.body);
      res.json({
        message: 'Event updated successfully',
        event: updatedEvent.toJSON()
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete event (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      await event.delete();
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get event registrations (admin only)
  async getRegistrations(req, res) {
    try {
      const { id } = req.params;
      const { status, payment_status } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (payment_status) filters.payment_status = payment_status;

      const registrations = await EventRegistration.findByEventId(id, filters);

      res.json({
        registrations: registrations.map(reg => reg.toJSON())
      });
    } catch (error) {
      console.error('Get event registrations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new EventController();