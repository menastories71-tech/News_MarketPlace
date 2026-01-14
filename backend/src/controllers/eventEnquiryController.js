const EventEnquiry = require('../models/EventEnquiry');
const recaptchaService = require('../services/recaptchaService');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

class EventEnquiryController {
  // Validation rules for event enquiry submission
  submitValidation = [
    body('event_name').trim().isLength({ min: 1 }).withMessage('Event name is required'),
    body('contact_person_name').trim().isLength({ min: 1 }).withMessage('Contact person name is required'),
    body('contact_person_email').isEmail().normalizeEmail().withMessage('Valid contact person email is required'),
    body('terms_and_conditions').custom(value => value === true || value === 'true').withMessage('Terms must be accepted'),
    body('recaptchaToken').isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
  ];

  updateStatusValidation = [
    body('status').isIn(['new', 'viewed']).withMessage('Valid status required')
  ];

  // Submit event enquiry
  async submitEnquiry(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Temporarily skip reCAPTCHA verification for testing
      // const recaptchaScore = await recaptchaService.verifyRecaptcha(req.body.recaptchaToken);
      // if (recaptchaScore === null || recaptchaScore < 0.5) {
      //   return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      // }

      const enquiryData = req.body;

      // Convert boolean fields
      const booleanFields = ['market_company_name', 'provide_booth', 'terms_and_conditions'];
      booleanFields.forEach(field => {
        if (enquiryData[field] !== undefined) {
          enquiryData[field] = enquiryData[field] === 'true' || enquiryData[field] === true;
        }
      });

      // Remove captcha from data as it's not stored
      delete enquiryData.recaptchaToken;

      // Create enquiry in database
      const enquiry = await EventEnquiry.create(enquiryData);

      res.status(201).json({
        message: 'Event enquiry submitted successfully',
        enquiry: enquiry.toJSON()
      });
    } catch (error) {
      console.error('Event enquiry submission error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Download CSV
  async downloadCSV(req, res) {
    try {
      const sqlQuery = `SELECT * FROM event_enquiries ORDER BY created_at DESC`;
      const result = await query(sqlQuery);

      const headers = [
        'ID', 'Event Name', 'Event Type', 'City', 'Country', 'Event Date',
        'Website', 'Contact Person', 'Email', 'Phone', 'Company',
        'Booth Provided', 'Comments', 'Status', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      result.rows.forEach(row => {
        const escape = (text) => {
          if (text === null || text === undefined) return '';
          const stringValue = String(text);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const line = [
          row.id,
          escape(row.event_name),
          escape(row.event_type),
          escape(row.city),
          escape(row.country),
          escape(row.event_date),
          escape(row.website_url),
          escape(row.contact_person_name),
          escape(row.contact_person_email),
          escape(row.contact_person_phone),
          escape(row.market_company_name),
          escape(row.provide_booth ? 'Yes' : 'No'),
          escape(row.comments),
          escape(row.status),
          escape(new Date(row.created_at).toISOString().split('T')[0])
        ].join(',');

        csv += line + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=event_enquiries_export.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Failed to generate CSV' });
    }
  }

  // Get all enquiries (admin only)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = '';
      const params = [];
      let paramCount = 1;

      // Add status filter
      if (status && status !== 'all') {
        whereClause += ` WHERE status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      // Add search filter
      if (search) {
        const searchCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${searchCondition} (event_name ILIKE $${paramCount} OR contact_person_name ILIKE $${paramCount} OR contact_person_email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM event_enquiries${whereClause}`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get enquiries
      const sqlQuery = `
        SELECT * FROM event_enquiries${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      params.push(limit, offset);

      const result = await query(sqlQuery, params);
      const enquiries = result.rows.map(row => new EventEnquiry(row));

      res.json({
        enquiries: enquiries.map(e => e.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all event enquiries error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get enquiry by ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const enquiry = await EventEnquiry.findById(id);
      if (!enquiry) {
        return res.status(404).json({ error: 'Event enquiry not found' });
      }

      // Update status to viewed if it's new
      if (enquiry.status === 'new') {
        await enquiry.update({ status: 'viewed' });
      }

      res.json({ enquiry: enquiry.toJSON() });
    } catch (error) {
      console.error('Get event enquiry by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update enquiry status (admin only)
  async updateStatus(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Enquiry ID and status are required' });
      }

      const validStatuses = ['new', 'viewed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be new or viewed' });
      }

      const enquiry = await EventEnquiry.findById(id);
      if (!enquiry) {
        return res.status(404).json({ error: 'Event enquiry not found' });
      }

      // Update status
      await enquiry.update({ status });

      res.json({
        message: 'Event enquiry status updated successfully',
        enquiry: enquiry.toJSON()
      });
    } catch (error) {
      console.error('Update event enquiry status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new EventEnquiryController();