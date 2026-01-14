const AwardSubmission = require('../models/AwardSubmission');
const Award = require('../models/Award');
const { body, validationResult } = require('express-validator');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const { rateLimiter } = require('../middleware/rateLimit');

class AwardSubmissionController {
  // Validation for user submission
  submitValidation = [
    body('award_id').isUUID().withMessage('Valid award ID is required'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('terms_agreed').equals('true').withMessage('Agreement to terms is required'),
    body('captcha_token').trim().isLength({ min: 1 }).withMessage('Captcha verification is required'),
    body('filling_for_other').optional().isBoolean(),
    body('other_person_details').if(body('filling_for_other').equals('true')).trim().isLength({ min: 1 }).withMessage('Other person details are required when filling for someone else'),
    body('dual_passport').optional().isBoolean(),
    body('passport_1').if(body('dual_passport').equals('true')).trim().isLength({ min: 1 }).withMessage('First passport nationality is required when dual passport'),
    body('other_residence').optional().isBoolean(),
    body('other_residence_name').if(body('other_residence').equals('true')).trim().isLength({ min: 1 }).withMessage('Other residence name is required when other residence'),
    body('linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('instagram').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
    body('personal_website').optional().isURL().withMessage('Valid personal website URL is required'),
    body('company_website').optional().isURL().withMessage('Valid company website URL is required'),
  ];

  // Create award submission (user with captcha and terms)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify award exists
      const award = await Award.findById(req.body.award_id);
      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      // Verify captcha
      const captchaScore = await verifyRecaptcha(req.body.captcha_token);
      if (captchaScore === null || captchaScore < 0.5) {
        return res.status(400).json({
          error: 'Captcha verification failed',
          message: 'Please complete the captcha verification'
        });
      }

      // Rate limiting check
      const userId = req.user?.userId;
      if (userId) {
        const rateLimitResult = await rateLimiter.checkLimit(userId, 'award_submission');
        if (!rateLimitResult.allowed) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: rateLimitResult.message,
            remainingMinutes: rateLimitResult.remainingTime
          });
        }
      }

      // Convert string boolean values back to actual booleans for database
      const submissionData = {
        ...req.body,
        captcha_validated: true,
        terms_agreed: req.body.terms_agreed === 'true',
        filling_for_other: req.body.filling_for_other === 'true',
        dual_passport: req.body.dual_passport === 'true',
        other_residence: req.body.other_residence === 'true',
        residence_uae: req.body.residence_uae === 'true'
      };

      delete submissionData.captcha_token; // Remove captcha token from data

      const submission = await AwardSubmission.create(submissionData);

      // Send confirmation email
      try {
        await emailService.sendCustomEmail(
          submission.email,
          'Award Submission Confirmation',
          AwardSubmissionController.generateSubmissionEmailTemplate(submission.name, award.award_name)
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      res.status(201).json({
        message: 'Award submission created successfully',
        submission: submission.toJSON()
      });
    } catch (error) {
      console.error('Create award submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all submissions with filtering and pagination (admin only)
  async getAll(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        page = 1,
        limit = 10,
        award_id,
        interested_receive_award,
        interested_sponsor_award,
        interested_speak_award,
        interested_exhibit_award,
        interested_attend_award,
        gender,
        company_industry,
        name,
        email,
        current_company
      } = req.query;

      const filters = {};
      if (award_id) filters.award_id = award_id;
      if (interested_receive_award !== undefined) filters.interested_receive_award = interested_receive_award === 'true';
      if (interested_sponsor_award !== undefined) filters.interested_sponsor_award = interested_sponsor_award === 'true';
      if (interested_speak_award !== undefined) filters.interested_speak_award = interested_speak_award === 'true';
      if (interested_exhibit_award !== undefined) filters.interested_exhibit_award = interested_exhibit_award === 'true';
      if (interested_attend_award !== undefined) filters.interested_attend_award = interested_attend_award === 'true';
      if (gender) filters.gender = gender;
      if (company_industry) filters.company_industry = company_industry;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND asub.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND asub.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (current_company) {
        searchSql += ` AND asub.current_company ILIKE $${searchParamCount}`;
        searchValues.push(`%${current_company}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const submissions = await AwardSubmission.findAll(filters, searchSql, searchValues, limit, offset);

      // Get total count for pagination
      const totalCount = await AwardSubmission.getTotalCount(filters, searchSql, searchValues);

      res.json({
        submissions: submissions.map(submission => submission.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get award submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search submissions (admin only)
  async search(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { q: searchTerm, ...filters } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const submissions = await AwardSubmission.search(searchTerm, filters, limit, offset);

      // Get total count for pagination
      const totalCount = await AwardSubmission.getSearchTotalCount(searchTerm, filters);

      res.json({
        submissions: submissions.map(submission => submission.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Search award submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download Submissions as CSV (admin only)
  async downloadCSV(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        award_id,
        interested_receive_award,
        interested_sponsor_award,
        interested_speak_award,
        interested_exhibit_award,
        interested_attend_award,
        gender,
        company_industry,
        name,
        email,
        current_company
      } = req.query;

      const filters = {};
      if (award_id) filters.award_id = award_id;
      if (interested_receive_award !== undefined) filters.interested_receive_award = interested_receive_award === 'true';
      if (interested_sponsor_award !== undefined) filters.interested_sponsor_award = interested_sponsor_award === 'true';
      if (interested_speak_award !== undefined) filters.interested_speak_award = interested_speak_award === 'true';
      if (interested_exhibit_award !== undefined) filters.interested_exhibit_award = interested_exhibit_award === 'true';
      if (interested_attend_award !== undefined) filters.interested_attend_award = interested_attend_award === 'true';
      if (gender) filters.gender = gender;
      if (company_industry) filters.company_industry = company_industry;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND asub.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND asub.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (current_company) {
        searchSql += ` AND asub.current_company ILIKE $${searchParamCount}`;
        searchValues.push(`%${current_company}%`);
        searchParamCount++;
      }

      // Get ALL matching records (pass null for limit/offset)
      const submissions = await AwardSubmission.findAll(filters, searchSql, searchValues, null, null);

      const headers = ['Name', 'Email', 'Award Name', 'Receive Award', 'Sponsor Award', 'Speak Award', 'Exhibit Award', 'Attend Award', 'Gender', 'Company', 'Position', 'Industry', 'Created At'];
      let csv = headers.join(',') + '\n';

      submissions.forEach(s => {
        const row = [
          `"${(s.name || '').replace(/"/g, '""')}"`,
          `"${(s.email || '').replace(/"/g, '""')}"`,
          `"${(s.award_name || '').replace(/"/g, '""')}"`,
          s.interested_receive_award ? 'Yes' : 'No',
          s.interested_sponsor_award ? 'Yes' : 'No',
          s.interested_speak_award ? 'Yes' : 'No',
          s.interested_exhibit_award ? 'Yes' : 'No',
          s.interested_attend_award ? 'Yes' : 'No',
          `"${(s.gender || '').replace(/"/g, '""')}"`,
          `"${(s.current_company || '').replace(/"/g, '""')}"`,
          `"${(s.position || '').replace(/"/g, '""')}"`,
          `"${(s.company_industry || '').replace(/"/g, '""')}"`,
          s.created_at ? new Date(s.created_at).toISOString() : ''
        ];
        csv += row.join(',') + '\n';
      });

      const filename = `award_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.status(200).send(csv);

    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download Submissions as CSV (admin only)
  async downloadCSV(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        award_id,
        interested_receive_award,
        interested_sponsor_award,
        interested_speak_award,
        interested_exhibit_award,
        interested_attend_award,
        gender,
        company_industry,
        name,
        email,
        current_company
      } = req.query;

      const filters = {};
      if (award_id) filters.award_id = award_id;
      if (interested_receive_award !== undefined) filters.interested_receive_award = interested_receive_award === 'true';
      if (interested_sponsor_award !== undefined) filters.interested_sponsor_award = interested_sponsor_award === 'true';
      if (interested_speak_award !== undefined) filters.interested_speak_award = interested_speak_award === 'true';
      if (interested_exhibit_award !== undefined) filters.interested_exhibit_award = interested_exhibit_award === 'true';
      if (interested_attend_award !== undefined) filters.interested_attend_award = interested_attend_award === 'true';
      if (gender) filters.gender = gender;
      if (company_industry) filters.company_industry = company_industry;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND asub.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (email) {
        searchSql += ` AND asub.email ILIKE $${searchParamCount}`;
        searchValues.push(`%${email}%`);
        searchParamCount++;
      }

      if (current_company) {
        searchSql += ` AND asub.current_company ILIKE $${searchParamCount}`;
        searchValues.push(`%${current_company}%`);
        searchParamCount++;
      }

      // Get ALL matching records (pass null for limit/offset)
      const submissions = await AwardSubmission.findAll(filters, searchSql, searchValues, null, null);

      const headers = ['Name', 'Email', 'Award Name', 'Receive Award', 'Sponsor Award', 'Speak Award', 'Exhibit Award', 'Attend Award', 'Gender', 'Company', 'Position', 'Industry', 'Created At'];
      let csv = headers.join(',') + '\n';

      submissions.forEach(s => {
        const row = [
          `"${(s.name || '').replace(/"/g, '""')}"`,
          `"${(s.email || '').replace(/"/g, '""')}"`,
          `"${(s.award_name || '').replace(/"/g, '""')}"`,
          s.interested_receive_award ? 'Yes' : 'No',
          s.interested_sponsor_award ? 'Yes' : 'No',
          s.interested_speak_award ? 'Yes' : 'No',
          s.interested_exhibit_award ? 'Yes' : 'No',
          s.interested_attend_award ? 'Yes' : 'No',
          `"${(s.gender || '').replace(/"/g, '""')}"`,
          `"${(s.current_company || '').replace(/"/g, '""')}"`,
          `"${(s.position || '').replace(/"/g, '""')}"`,
          `"${(s.company_industry || '').replace(/"/g, '""')}"`,
          s.created_at ? new Date(s.created_at).toISOString() : ''
        ];
        csv += row.join(',') + '\n';
      });

      const filename = `award_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.status(200).send(csv);

    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Email template generator
  static generateSubmissionEmailTemplate(name, awardName) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Award Submission Confirmation</h2>
              <p>Dear ${name},</p>
              <p>Thank you for submitting your interest for the "${awardName}" award. We have received your submission and will review it shortly.</p>
              <p>You will receive further updates regarding the award process.</p>
              <p>Best regards,<br>The News Marketplace Team</p>
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

module.exports = new AwardSubmissionController();