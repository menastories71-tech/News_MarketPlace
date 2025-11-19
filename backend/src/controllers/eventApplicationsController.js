const EventSponsor = require('../models/EventSponsor');
const EventMediaPartner = require('../models/EventMediaPartner');
const EventSpeaker = require('../models/EventSpeaker');
const EventGuest = require('../models/EventGuest');
const Event = require('../models/Event');
const emailService = require('../services/emailService');
const { body, validationResult } = require('express-validator');

class EventApplicationsController {
  // Validation rules for sponsor applications
  sponsorValidation = [
    body('event_id').isInt().withMessage('Valid event ID is required'),
    body('company_name').trim().isLength({ min: 1 }).withMessage('Company name is required'),
    body('contact_person').trim().isLength({ min: 1 }).withMessage('Contact person is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('website').optional().isURL().withMessage('Valid website URL is required'),
    body('sponsorship_level').optional().trim(),
    body('sponsorship_amount').optional().isFloat({ min: 0 }).withMessage('Sponsorship amount must be a positive number'),
    body('description').optional().trim()
  ];

  // Validation rules for media partner applications
  mediaPartnerValidation = [
    body('event_id').isInt().withMessage('Valid event ID is required'),
    body('organization_name').trim().isLength({ min: 1 }).withMessage('Organization name is required'),
    body('contact_person').trim().isLength({ min: 1 }).withMessage('Contact person is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('website').optional().isURL().withMessage('Valid website URL is required'),
    body('media_type').optional().trim(),
    body('audience_size').optional().trim(),
    body('coverage_areas').optional().trim(),
    body('partnership_type').optional().trim(),
    body('description').optional().trim()
  ];

  // Validation rules for speaker applications
  speakerValidation = [
    body('event_id').isInt().withMessage('Valid event ID is required'),
    body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('organization').optional().trim(),
    body('position').optional().trim(),
    body('bio').optional().trim(),
    body('expertise').optional().trim(),
    body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
    body('presentation_type').optional().trim(),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('special_requirements').optional().trim(),
    body('linkedin_profile').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('website').optional().isURL().withMessage('Valid website URL is required')
  ];

  // Validation rules for guest applications
  guestValidation = [
    body('event_id').isInt().withMessage('Valid event ID is required'),
    body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('organization').optional().trim(),
    body('position').optional().trim(),
    body('guest_type').optional().trim(),
    body('reason_for_attendance').optional().trim(),
    body('special_dietary_requirements').optional().trim(),
    body('accessibility_needs').optional().trim(),
    body('accompanying_guests').optional().isInt({ min: 0 }).withMessage('Accompanying guests must be a non-negative integer'),
    body('linkedin_profile').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('website').optional().isURL().withMessage('Valid website URL is required')
  ];

  // Sponsor Applications
  async createSponsor(req, res) {
    try {
      const sponsorData = {
        ...req.body,
        user_id: req.user?.userId || req.body.user_id
      };

      const sponsor = await EventSponsor.create(sponsorData);

      res.status(201).json({
        message: 'Sponsor application submitted successfully',
        application: sponsor.toJSON()
      });
    } catch (error) {
      console.error('Create sponsor application error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSponsorsByEvent(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const sponsors = await EventSponsor.findByEventId(id, filters);

      res.json({
        sponsors: sponsors.map(sponsor => sponsor.toJSON())
      });
    } catch (error) {
      console.error('Get sponsors by event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSponsorStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const sponsor = await EventSponsor.findById(id);
      if (!sponsor) {
        return res.status(404).json({ error: 'Sponsor application not found' });
      }

      const updateData = {
        status,
        reviewed_by: req.admin?.id,
        reviewed_at: new Date()
      };

      if (notes) updateData.notes = notes;

      const updatedSponsor = await sponsor.update(updateData);

      // Send email notification if status changed to approved or rejected
      if (status === 'approved' || status === 'rejected') {
        try {
          await this.sendApplicationStatusEmail(sponsor, 'sponsor', status, notes);
        } catch (emailError) {
          console.error('Error sending sponsor application status email:', emailError);
          // Don't fail the status update if email fails
        }
      }

      res.json({
        message: 'Sponsor application updated successfully',
        application: updatedSponsor.toJSON()
      });
    } catch (error) {
      console.error('Update sponsor status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Media Partner Applications
  async createMediaPartner(req, res) {
    try {
      const mediaPartnerData = {
        ...req.body,
        user_id: req.user?.userId || req.body.user_id
      };

      const mediaPartner = await EventMediaPartner.create(mediaPartnerData);

      res.status(201).json({
        message: 'Media partner application submitted successfully',
        application: mediaPartner.toJSON()
      });
    } catch (error) {
      console.error('Create media partner application error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMediaPartnersByEvent(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const mediaPartners = await EventMediaPartner.findByEventId(id, filters);

      res.json({
        media_partners: mediaPartners.map(mp => mp.toJSON())
      });
    } catch (error) {
      console.error('Get media partners by event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateMediaPartnerStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const mediaPartner = await EventMediaPartner.findById(id);
      if (!mediaPartner) {
        return res.status(404).json({ error: 'Media partner application not found' });
      }

      const updateData = {
        status,
        reviewed_by: req.admin?.id,
        reviewed_at: new Date()
      };

      if (notes) updateData.notes = notes;

      const updatedMediaPartner = await mediaPartner.update(updateData);

      // Send email notification if status changed to approved or rejected
      if (status === 'approved' || status === 'rejected') {
        try {
          await this.sendApplicationStatusEmail(mediaPartner, 'media_partner', status, notes);
        } catch (emailError) {
          console.error('Error sending media partner application status email:', emailError);
          // Don't fail the status update if email fails
        }
      }

      res.json({
        message: 'Media partner application updated successfully',
        application: updatedMediaPartner.toJSON()
      });
    } catch (error) {
      console.error('Update media partner status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Speaker Applications
  async createSpeaker(req, res) {
    try {
      const speakerData = {
        ...req.body,
        user_id: req.user?.userId || req.body.user_id
      };

      const speaker = await EventSpeaker.create(speakerData);

      res.status(201).json({
        message: 'Speaker application submitted successfully',
        application: speaker.toJSON()
      });
    } catch (error) {
      console.error('Create speaker application error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSpeakersByEvent(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const speakers = await EventSpeaker.findByEventId(id, filters);

      res.json({
        speakers: speakers.map(speaker => speaker.toJSON())
      });
    } catch (error) {
      console.error('Get speakers by event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSpeakerStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const speaker = await EventSpeaker.findById(id);
      if (!speaker) {
        return res.status(404).json({ error: 'Speaker application not found' });
      }

      const updateData = {
        status,
        reviewed_by: req.admin?.id,
        reviewed_at: new Date()
      };

      if (notes) updateData.notes = notes;

      const updatedSpeaker = await speaker.update(updateData);

      // Send email notification if status changed to approved or rejected
      if (status === 'approved' || status === 'rejected') {
        try {
          await this.sendApplicationStatusEmail(speaker, 'speaker', status, notes);
        } catch (emailError) {
          console.error('Error sending speaker application status email:', emailError);
          // Don't fail the status update if email fails
        }
      }

      res.json({
        message: 'Speaker application updated successfully',
        application: updatedSpeaker.toJSON()
      });
    } catch (error) {
      console.error('Update speaker status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Guest Applications
  async createGuest(req, res) {
    try {
      const guestData = {
        ...req.body,
        user_id: req.user?.userId || req.body.user_id
      };

      const guest = await EventGuest.create(guestData);

      res.status(201).json({
        message: 'Guest application submitted successfully',
        application: guest.toJSON()
      });
    } catch (error) {
      console.error('Create guest application error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getGuestsByEvent(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const guests = await EventGuest.findByEventId(id, filters);

      res.json({
        guests: guests.map(guest => guest.toJSON())
      });
    } catch (error) {
      console.error('Get guests by event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateGuestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const guest = await EventGuest.findById(id);
      if (!guest) {
        return res.status(404).json({ error: 'Guest application not found' });
      }

      const updateData = {
        status,
        reviewed_by: req.admin?.id,
        reviewed_at: new Date()
      };

      if (notes) updateData.notes = notes;

      const updatedGuest = await guest.update(updateData);

      // Send email notification if status changed to approved or rejected
      if (status === 'approved' || status === 'rejected') {
        try {
          await this.sendApplicationStatusEmail(guest, 'guest', status, notes);
        } catch (emailError) {
          console.error('Error sending guest application status email:', emailError);
          // Don't fail the status update if email fails
        }
      }

      res.json({
        message: 'Guest application updated successfully',
        application: updatedGuest.toJSON()
      });
    } catch (error) {
      console.error('Update guest status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Email notification methods
  async sendApplicationStatusEmail(application, type, status, notes) {
    try {
      const event = await Event.findById(application.event_id);
      if (!event) {
        console.error('Event not found for application status email');
        return;
      }

      const subject = status === 'approved'
        ? `Your ${this.getApplicationTypeName(type)} Application Has Been Approved`
        : `Update on Your ${this.getApplicationTypeName(type)} Application`;

      const htmlContent = this.generateApplicationStatusEmailTemplate(application, event, type, status, notes);

      await emailService.sendCustomEmail(application.email, subject, htmlContent);
      console.log(`${type} application status email sent to ${application.email} for ${status} status`);
    } catch (error) {
      console.error('Error sending application status email:', error);
      throw error;
    }
  }

  getApplicationTypeName(type) {
    const typeNames = {
      'sponsor': 'Event Sponsorship',
      'media_partner': 'Media Partnership',
      'speaker': 'Speaker',
      'guest': 'Guest'
    };
    return typeNames[type] || type;
  }

  generateApplicationStatusEmailTemplate(application, event, type, status, notes) {
    const eventDate = event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD';
    const eventTime = event.start_date ? new Date(event.start_date).toLocaleTimeString() : 'TBD';

    const statusColor = status === 'approved' ? '#4CAF50' : '#F44336';
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';

    let applicationDetails = '';
    if (type === 'sponsor') {
      applicationDetails = `
        <p><strong>Company:</strong> ${application.company_name}</p>
        <p><strong>Contact Person:</strong> ${application.contact_person}</p>
        <p><strong>Sponsorship Level:</strong> ${application.sponsorship_level || 'Not specified'}</p>
        ${application.sponsorship_amount ? `<p><strong>Sponsorship Amount:</strong> $${application.sponsorship_amount}</p>` : ''}
      `;
    } else if (type === 'media_partner') {
      applicationDetails = `
        <p><strong>Organization:</strong> ${application.organization_name}</p>
        <p><strong>Contact Person:</strong> ${application.contact_person}</p>
        <p><strong>Media Type:</strong> ${application.media_type || 'Not specified'}</p>
        <p><strong>Audience Size:</strong> ${application.audience_size || 'Not specified'}</p>
      `;
    } else if (type === 'speaker') {
      applicationDetails = `
        <p><strong>Name:</strong> ${application.full_name}</p>
        <p><strong>Organization:</strong> ${application.organization || 'Not specified'}</p>
        <p><strong>Position:</strong> ${application.position || 'Not specified'}</p>
        <p><strong>Topic:</strong> ${application.topic}</p>
      `;
    } else if (type === 'guest') {
      applicationDetails = `
        <p><strong>Name:</strong> ${application.full_name}</p>
        <p><strong>Organization:</strong> ${application.organization || 'Not specified'}</p>
        <p><strong>Position:</strong> ${application.position || 'Not specified'}</p>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
            .application-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>We have reviewed your ${this.getApplicationTypeName(type).toLowerCase()} application for the event <strong>${event.title}</strong>.</p>

              <div class="status-badge">${statusText}</div>

              <div class="event-details">
                <h3>Event Details:</h3>
                <p><strong>Event:</strong> ${event.title}</p>
                <p><strong>Date:</strong> ${eventDate}</p>
                <p><strong>Time:</strong> ${eventTime}</p>
                ${event.venue ? `<p><strong>Venue:</strong> ${event.venue}</p>` : ''}
                ${event.city ? `<p><strong>Location:</strong> ${event.city}${event.country ? ', ' + event.country : ''}</p>` : ''}
              </div>

              <div class="application-details">
                <h3>Your Application:</h3>
                ${applicationDetails}
                ${application.description ? `<p><strong>Description:</strong> ${application.description}</p>` : ''}
              </div>

              ${notes ? `<div class="application-details">
                <h3>Review Notes:</h3>
                <p>${notes}</p>
              </div>` : ''}

              ${status === 'approved' ?
                `<p><strong>Congratulations!</strong> Your application has been approved. We look forward to seeing you at the event.</p>
                 <p>Please keep this email for your records. We'll send you additional information closer to the event date.</p>` :
                `<p>Unfortunately, your application has not been approved at this time. ${notes ? 'Please review the notes above for more details.' : ''}</p>
                 <p>You can apply for future events or contact us if you have any questions.</p>`
              }

              <p>If you have any questions, please don't hesitate to contact us.</p>
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

module.exports = new EventApplicationsController();