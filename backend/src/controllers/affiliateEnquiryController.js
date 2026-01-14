const AffiliateEnquiry = require('../models/AffiliateEnquiry');
const recaptchaService = require('../services/recaptchaService');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

class AffiliateEnquiryController {
  // Validation rules for affiliate enquiry submission
  submitValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('terms_accepted').custom(value => value === true || value === 'true').withMessage('Terms must be accepted'),
    body('recaptchaToken').isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
  ];

  updateStatusValidation = [
    body('status').isIn(['new', 'viewed']).withMessage('Valid status required')
  ];

  // Submit affiliate enquiry
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

      // Verify reCAPTCHA
      const recaptchaScore = await recaptchaService.verifyRecaptcha(req.body.recaptchaToken);
      if (recaptchaScore === null || recaptchaScore < 0.5) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }

      const enquiryData = req.body;

      // Convert boolean fields
      const booleanFields = ['terms_accepted'];
      booleanFields.forEach(field => {
        if (enquiryData[field] !== undefined) {
          enquiryData[field] = enquiryData[field] === 'true' || enquiryData[field] === true;
        }
      });

      // Set captcha verified
      enquiryData.captcha_verified = true;

      // Remove captcha token from data as it's not stored
      delete enquiryData.recaptchaToken;

      // Create enquiry in database (referral code will be generated automatically if not provided)
      const enquiry = await AffiliateEnquiry.create(enquiryData);

      res.status(201).json({
        message: 'Affiliate enquiry submitted successfully',
        enquiry: enquiry.toJSON()
      });
    } catch (error) {
      console.error('Affiliate enquiry submission error:', error);
      res.status(500).json({ error: error.message });
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
        date_from,
        date_to,
        sortBy = 'submitted_at',
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
        whereClause += `${searchCondition} (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Add date range filter
      if (date_from) {
        const dateCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${dateCondition} DATE(submitted_at) >= $${paramCount}`;
        params.push(date_from);
        paramCount++;
      }

      if (date_to) {
        const dateCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${dateCondition} DATE(submitted_at) <= $${paramCount}`;
        params.push(date_to);
        paramCount++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM affiliate_enquiries${whereClause}`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get enquiries
      const sqlQuery = `
        SELECT * FROM affiliate_enquiries${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      params.push(limit, offset);

      const result = await query(sqlQuery, params);
      const enquiries = result.rows.map(row => new AffiliateEnquiry(row));

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
      console.error('Get all affiliate enquiries error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get enquiry by ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const enquiry = await AffiliateEnquiry.findById(id);
      if (!enquiry) {
        return res.status(404).json({ error: 'Affiliate enquiry not found' });
      }

      // Update status to viewed if it's new
      if (enquiry.status === 'new') {
        await enquiry.update({ status: 'viewed' });
      }

      res.json({ enquiry: enquiry.toJSON() });
    } catch (error) {
      console.error('Get affiliate enquiry by ID error:', error);
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

      const enquiry = await AffiliateEnquiry.findById(id);
      if (!enquiry) {
        return res.status(404).json({ error: 'Affiliate enquiry not found' });
      }

      // Update status
      await enquiry.update({ status });

      res.json({
        message: 'Affiliate enquiry status updated successfully',
        enquiry: enquiry.toJSON()
      });
    } catch (error) {
      console.error('Update affiliate enquiry status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download enquiries as CSV (admin only)
  async downloadCSV(req, res) {
    try {
      const {
        status,
        search,
        date_from,
        date_to,
        referral_code,
        nationality,
        how_heard
      } = req.query;

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
        whereClause += `${searchCondition} (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Add date range filter
      if (date_from) {
        const dateCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${dateCondition} DATE(submitted_at) >= $${paramCount}`;
        params.push(date_from);
        paramCount++;
      }

      if (date_to) {
        const dateCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${dateCondition} DATE(submitted_at) <= $${paramCount}`;
        params.push(date_to);
        paramCount++;
      }

      // Add referral code filter
      if (referral_code) {
        const refCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${refCondition} referral_code ILIKE $${paramCount}`;
        params.push(`%${referral_code}%`);
        paramCount++;
      }

      // Add nationality filter
      if (nationality) {
        const natCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${natCondition} passport_nationality ILIKE $${paramCount}`;
        params.push(`%${nationality}%`);
        paramCount++;
      }

      // Add how_heard filter
      if (how_heard) {
        const howCondition = whereClause ? ' AND' : ' WHERE';
        whereClause += `${howCondition} how_did_you_hear ILIKE $${paramCount}`;
        params.push(`%${how_heard}%`);
        paramCount++;
      }

      // Get all matching enquiries (no pagination for export)
      const sqlQuery = `
        SELECT * FROM affiliate_enquiries${whereClause}
        ORDER BY submitted_at DESC
      `;

      const result = await query(sqlQuery, params);
      const enquiries = result.rows;

      // Generate CSV
      const headers = [
        'ID',
        'Name',
        'Gender',
        'Email',
        'WhatsApp',
        'LinkedIn',
        'Instagram',
        'Facebook',
        'Passport Nationality',
        'Current Residency',
        'How Did You Hear',
        'Message',
        'Referral Code',
        'Terms Accepted',
        'Status',
        'Submitted At',
        'Created At',
        'Updated At'
      ];

      let csv = headers.join(',') + '\n';

      enquiries.forEach(enquiry => {
        const row = [
          enquiry.id,
          `"${(enquiry.name || '').replace(/"/g, '""')}"`,
          `"${(enquiry.gender || '').replace(/"/g, '""')}"`,
          `"${(enquiry.email || '').replace(/"/g, '""')}"`,
          `"${(enquiry.whatsapp || '').replace(/"/g, '""')}"`,
          `"${(enquiry.linkedin || '').replace(/"/g, '""')}"`,
          `"${(enquiry.ig || '').replace(/"/g, '""')}"`,
          `"${(enquiry.facebook || '').replace(/"/g, '""')}"`,
          `"${(enquiry.passport_nationality || '').replace(/"/g, '""')}"`,
          `"${(enquiry.current_residency || '').replace(/"/g, '""')}"`,
          `"${(enquiry.how_did_you_hear || '').replace(/"/g, '""')}"`,
          `"${(enquiry.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${(enquiry.referral_code || '').replace(/"/g, '""')}"`,
          enquiry.terms_accepted ? 'Yes' : 'No',
          `"${(enquiry.status || '').replace(/"/g, '""')}"`,
          enquiry.submitted_at ? new Date(enquiry.submitted_at).toISOString() : '',
          enquiry.created_at ? new Date(enquiry.created_at).toISOString() : '',
          enquiry.updated_at ? new Date(enquiry.updated_at).toISOString() : ''
        ];
        csv += row.join(',') + '\n';
      });

      // Generate filename with date
      const dateNow = new Date().toISOString().split('T')[0];
      const filename = `affiliate_enquiries_${dateNow}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AffiliateEnquiryController();