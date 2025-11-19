const Ticket = require('../models/Ticket');
const { body, validationResult } = require('express-validator');

class TicketController {
  // Validation rules
  createValidation = [
    body('event_id').isInt({ min: 1 }).withMessage('Valid event ID is required'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('quantity_available').optional().isInt({ min: 0 }).withMessage('Quantity available must be a non-negative integer'),
    body('max_per_user').optional().isInt({ min: 1 }).withMessage('Max per user must be a positive integer'),
    body('sale_start_date').optional().isISO8601().withMessage('Valid sale start date is required'),
    body('sale_end_date').optional().isISO8601().withMessage('Valid sale end date is required'),
    body('status').optional().isIn(['active', 'sold_out', 'cancelled']).withMessage('Invalid status')
  ];

  updateValidation = [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('quantity_available').optional().isInt({ min: 0 }).withMessage('Quantity available must be a non-negative integer'),
    body('max_per_user').optional().isInt({ min: 1 }).withMessage('Max per user must be a positive integer'),
    body('sale_start_date').optional().isISO8601().withMessage('Valid sale start date is required'),
    body('sale_end_date').optional().isISO8601().withMessage('Valid sale end date is required'),
    body('status').optional().isIn(['active', 'sold_out', 'cancelled']).withMessage('Invalid status')
  ];

  // Create a new ticket (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const ticketData = req.body;
      const ticket = await Ticket.create(ticketData);

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket: ticket.toJSON()
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get tickets for an event (public)
  async getByEvent(req, res) {
    try {
      const { eventId } = req.params;
      const tickets = await Ticket.findByEventId(eventId, { status: 'active' });

      res.json({
        tickets: tickets.map(ticket => ticket.toJSON())
      });
    } catch (error) {
      console.error('Get tickets by event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all tickets (admin only)
  async getAll(req, res) {
    try {
      const tickets = await Ticket.findAll();

      res.json(tickets.map(ticket => ticket.toJSON()));
    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get ticket by ID (admin only)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json({ ticket: ticket.toJSON() });
    } catch (error) {
      console.error('Get ticket by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update ticket (admin only)
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
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const updatedTicket = await ticket.update(req.body);
      res.json({
        message: 'Ticket updated successfully',
        ticket: updatedTicket.toJSON()
      });
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete ticket (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      await ticket.delete();
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TicketController();