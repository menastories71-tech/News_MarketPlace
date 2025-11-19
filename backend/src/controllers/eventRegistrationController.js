const EventRegistration = require('../models/EventRegistration');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { body, validationResult } = require('express-validator');

class EventRegistrationController {
  // Validation rules
  createValidation = [
    body('event_id').isInt({ min: 1 }).withMessage('Valid event ID is required'),
    body('user_id').optional().isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('ticket_id').optional().isInt({ min: 1 }).withMessage('Valid ticket ID is required'),
    body('registration_data').optional().isObject().withMessage('Registration data must be an object'),
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'attended']).withMessage('Invalid status'),
    body('payment_status').optional().isIn(['unpaid', 'paid', 'refunded']).withMessage('Invalid payment status'),
    body('payment_amount').optional().isFloat({ min: 0 }).withMessage('Payment amount must be a non-negative number')
  ];

  updateValidation = [
    body('registration_data').optional().isObject().withMessage('Registration data must be an object'),
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'attended']).withMessage('Invalid status'),
    body('payment_status').optional().isIn(['unpaid', 'paid', 'refunded']).withMessage('Invalid payment status'),
    body('payment_amount').optional().isFloat({ min: 0 }).withMessage('Payment amount must be a non-negative number')
  ];

  // Register for an event (authenticated users and admins)
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Check if user or admin is authenticated
      if ((!req.user || !req.user.userId) && (!req.admin || !req.admin.adminId)) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to register for events'
        });
      }

      const { event_id, ticket_id, registration_data } = req.body;

      // Check if event exists and is active
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.status !== 'active') {
        return res.status(400).json({ error: 'Event is not available for registration' });
      }

      // Check if ticket exists and is available
      let ticket = null;
      if (ticket_id) {
        ticket = await Ticket.findById(ticket_id);
        if (!ticket || ticket.event_id !== event_id || ticket.status !== 'active') {
          return res.status(400).json({ error: 'Invalid ticket' });
        }
      }

      // Determine the registrant ID (user or admin)
      let registrantId = null;
      let registrantType = 'user';

      if (req.user && req.user.userId) {
        registrantId = req.user.userId;
        registrantType = 'user';
      } else if (req.admin && req.admin.adminId) {
        // For admins, we need to check if they have a corresponding user record
        // If not, we might need to create one or handle differently
        // For now, let's try to find if admin has a user record
        const adminUser = await User.findAll({ email: req.admin.email });
        if (adminUser.length > 0) {
          registrantId = adminUser[0].id;
        } else {
          // Create a user record for the admin
          const adminAsUser = await User.create({
            email: req.admin.email,
            password: 'admin_placeholder', // This will be hashed
            first_name: req.admin.firstName || 'Admin',
            last_name: req.admin.lastName || 'User',
            is_verified: true,
            role: 'admin'
          });
          registrantId = adminAsUser.id;
        }
        registrantType = 'admin';
      }

      // Check if user/admin is already registered for this event
      const existingRegistration = await EventRegistration.findAll({
        event_id: event_id,
        user_id: registrantId
      });

      if (existingRegistration.length > 0) {
        return res.status(400).json({
          error: 'Already registered',
          message: 'You are already registered for this event'
        });
      }

      const registrationData = {
        event_id,
        user_id: registrantId,
        ticket_id,
        registration_data: registration_data || {},
        payment_amount: ticket ? ticket.price : 0
      };

      const registration = await EventRegistration.create(registrationData);

      res.status(201).json({
        message: 'Registration successful',
        registration: registration.toJSON()
      });
    } catch (error) {
      console.error('Register for event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get registration by ID (user/admin)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const registration = await EventRegistration.findById(id);

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      // Check if user owns this registration or is admin
      if (registration.user_id && registration.user_id !== req.user?.userId && !req.admin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ registration: registration.toJSON() });
    } catch (error) {
      console.error('Get registration by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's registrations (authenticated users)
  async getUserRegistrations(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const { status, payment_status } = req.query;
      const filters = { user_id: userId };
      if (status) filters.status = status;
      if (payment_status) filters.payment_status = payment_status;

      const registrations = await EventRegistration.findAll(filters);

      res.json({
        registrations: registrations.map(reg => reg.toJSON())
      });
    } catch (error) {
      console.error('Get user registrations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update registration (user/admin)
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
      const registration = await EventRegistration.findById(id);

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      // Check permissions
      if (registration.user_id && registration.user_id !== req.user?.userId && !req.admin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if status is being changed to confirmed
      const isStatusConfirmed = req.body.status === 'confirmed' && registration.status !== 'confirmed';

      const updatedRegistration = await registration.update(req.body);

      // Send confirmation email if status changed to confirmed
      if (isStatusConfirmed && registration.user_id) {
        try {
          const user = await User.findById(registration.user_id);
          const event = await Event.findById(registration.event_id);

          if (user && event) {
            const subject = `Registration Confirmed: ${event.title}`;
            const htmlContent = this.generateConfirmationEmailTemplate(user, event, registration);
            await emailService.sendCustomEmail(user.email, subject, htmlContent);
            console.log(`Confirmation email sent to ${user.email} for event ${event.title}`);
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the registration update if email fails
        }
      }

      res.json({
        message: 'Registration updated successfully',
        registration: updatedRegistration.toJSON()
      });
    } catch (error) {
      console.error('Update registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Cancel registration (user/admin)
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const registration = await EventRegistration.findById(id);

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      // Check permissions
      if (registration.user_id && registration.user_id !== req.user?.userId && !req.admin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedRegistration = await registration.update({ status: 'cancelled' });
      res.json({
        message: 'Registration cancelled successfully',
        registration: updatedRegistration.toJSON()
      });
    } catch (error) {
      console.error('Cancel registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete registration (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const registration = await EventRegistration.findById(id);

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      await registration.delete();
      res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
      console.error('Delete registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate confirmation email template
  generateConfirmationEmailTemplate = (user, event, registration) => {
    const eventDate = event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD';
    const eventTime = event.start_date ? new Date(event.start_date).toLocaleTimeString() : 'TBD';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976D2; }
            .button { display: inline-block; background: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.first_name || 'Valued Guest'}!</h2>
              <p>Great news! Your registration for <strong>${event.title}</strong> has been confirmed.</p>

              <div class="event-details">
                <h3>Event Details:</h3>
                <p><strong>Event:</strong> ${event.title}</p>
                <p><strong>Date:</strong> ${eventDate}</p>
                <p><strong>Time:</strong> ${eventTime}</p>
                ${event.venue ? `<p><strong>Venue:</strong> ${event.venue}</p>` : ''}
                ${event.city ? `<p><strong>Location:</strong> ${event.city}${event.country ? ', ' + event.country : ''}</p>` : ''}
                ${registration.ticket_id ? `<p><strong>Ticket:</strong> ${registration.ticket_name || 'Standard Ticket'}</p>` : ''}
              </div>

              <p>Please save this email for your records. We'll send you additional updates and reminders as the event approaches.</p>

              <p>If you have any questions, feel free to contact us.</p>

              <p>We look forward to seeing you at the event!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new EventRegistrationController();