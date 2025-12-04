const PowerlistNominationSubmission = require('../models/PowerlistNominationSubmission');
const PowerlistNomination = require('../models/PowerlistNomination');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

class PowerlistNominationSubmissionController {
  // Validation rules for create
  createValidation = [
    body('powerlist_nomination_id').isInt().withMessage('Powerlist nomination ID is required'),
    body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('additional_message').optional().trim(),
  ];

  // Validation rules for update
  updateValidation = [
    body('full_name').optional().trim().isLength({ min: 1 }).withMessage('Full name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('additional_message').optional().trim(),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Create a new submission (public)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify the powerlist nomination exists and is approved
      const nomination = await PowerlistNomination.findById(req.body.powerlist_nomination_id);
      if (!nomination || nomination.status !== 'approved' || !nomination.is_active) {
        return res.status(404).json({ error: 'Powerlist nomination not found or not available' });
      }

      const submissionData = {
        ...req.body,
        status: 'pending'
      };

      const submission = await PowerlistNominationSubmission.create(submissionData);

      // Send emails
      try {
        // Email to user
        await emailService.sendCustomEmail(
          submission.email,
          'Nomination Submission Confirmation',
          this.constructor.generateSubmissionConfirmationEmailTemplate(
            submission.full_name,
            nomination.publication_name,
            nomination.power_list_name
          )
        );

        // Email to admin
        await emailService.sendCustomEmail(
          'menastories71@gmail.com',
          'New Powerlist Nomination Submission',
          this.constructor.generateAdminNotificationEmailTemplate(
            submission,
            nomination
          )
        );
      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
      }

      res.status(201).json({
        message: 'Nomination submitted successfully',
        submission: submission.toJSON()
      });
    } catch (error) {
      console.error('Create nomination submission error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Get all submissions (admin only)
  async getAll(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        page = 1,
        limit = 10,
        status,
        powerlist_nomination_id,
        email
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (powerlist_nomination_id) filters.powerlist_nomination_id = powerlist_nomination_id;
      if (email) filters.email = email;

      const offset = (page - 1) * limit;
      const submissions = await PowerlistNominationSubmission.findAll(filters, limit, offset);

      // Get total count for pagination
      const totalCount = await PowerlistNominationSubmission.getTotalCount(filters);

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
      console.error('Get nomination submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get submission by ID (admin only)
  async getById(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const submission = await PowerlistNominationSubmission.findById(id);

      if (!submission) {
        return res.status(404).json({ error: 'Nomination submission not found' });
      }

      res.json({ submission: submission.toJSON() });
    } catch (error) {
      console.error('Get nomination submission by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update submission (admin only)
  async update(req, res) {
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
      const submission = await PowerlistNominationSubmission.findById(id);

      if (!submission) {
        return res.status(404).json({ error: 'Nomination submission not found' });
      }

      const oldStatus = submission.status;
      const updateData = { ...req.body };

      const updatedSubmission = await submission.update(updateData);

      // Send email if status changed
      if (updateData.status && updateData.status !== oldStatus) {
        try {
          const nomination = await PowerlistNomination.findById(submission.powerlist_nomination_id);
          await emailService.sendCustomEmail(
            submission.email,
            `Nomination ${updateData.status.charAt(0).toUpperCase() + updateData.status.slice(1)}`,
            this.constructor.generateStatusUpdateEmailTemplate(
              submission.full_name,
              nomination.publication_name,
              nomination.power_list_name,
              updateData.status
            )
          );
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }

      res.json({
        message: 'Nomination submission updated successfully',
        submission: updatedSubmission.toJSON()
      });
    } catch (error) {
      console.error('Update nomination submission error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete submission (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const submission = await PowerlistNominationSubmission.findById(id);

      if (!submission) {
        return res.status(404).json({ error: 'Nomination submission not found' });
      }

      await submission.delete();
      res.json({ message: 'Nomination submission deleted successfully' });
    } catch (error) {
      console.error('Delete nomination submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update submission status (admin only)
  async updateStatus(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const submission = await PowerlistNominationSubmission.findById(id);

      if (!submission) {
        return res.status(404).json({ error: 'Nomination submission not found' });
      }

      const oldStatus = submission.status;
      const updatedSubmission = await submission.update({ status });

      // Send email if status changed
      if (status !== oldStatus) {
        try {
          const nomination = await PowerlistNomination.findById(submission.powerlist_nomination_id);
          await emailService.sendCustomEmail(
            submission.email,
            `Nomination ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            this.constructor.generateStatusUpdateEmailTemplate(
              submission.full_name,
              nomination.publication_name,
              nomination.power_list_name,
              status
            )
          );
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }

      res.json({
        message: 'Nomination submission status updated successfully',
        submission: updatedSubmission.toJSON()
      });
    } catch (error) {
      console.error('Update nomination submission status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Email template generators
  static generateSubmissionConfirmationEmailTemplate(fullName, publicationName, powerListName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976D2;">News Marketplace</h1>
        <h2>Nomination Submitted Successfully</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for submitting your nomination for <strong>${publicationName}</strong> in the <strong>${powerListName}</strong> powerlist.</p>
        <p>Your nomination has been received and will be reviewed by our team. We do not ensure or authorize to add this in publication.</p>
        <p>You will receive an email notification once your nomination has been processed.</p>
        <p>Best regards,<br>The News Marketplace Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">&copy; 2024 News Marketplace. All rights reserved.</p>
      </div>
    `;
  }

  static generateAdminNotificationEmailTemplate(submission, nomination) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF9800;">New Nomination Submission</h1>
        <h2>New Nomination Received</h2>
        <p><strong>Publication:</strong> ${nomination.publication_name}</p>
        <p><strong>Power List:</strong> ${nomination.power_list_name}</p>
        <p><strong>Full Name:</strong> ${submission.full_name}</p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
        <p><strong>Additional Message:</strong> ${submission.additional_message || 'None'}</p>
        <p>Please review this nomination in the admin panel.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">&copy; 2024 News Marketplace. All rights reserved.</p>
      </div>
    `;
  }

  static generateStatusUpdateEmailTemplate(fullName, publicationName, powerListName, status) {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Nomination ${statusText}</h1>
        <h2>Nomination Update</h2>
        <p>Dear ${fullName},</p>
        <p>Your nomination for <strong>${publicationName}</strong> in the <strong>${powerListName}</strong> powerlist has been <strong>${statusText.toLowerCase()}</strong>.</p>
        ${status === 'approved' ? '<p>Congratulations! Your nomination has been accepted.</p>' : status === 'rejected' ? '<p>We regret to inform you that your nomination has been rejected.</p>' : '<p>Your nomination is still under review.</p>'}
        <p>Best regards,<br>The News Marketplace Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">&copy; 2024 News Marketplace. All rights reserved.</p>
      </div>
    `;
  }
}

module.exports = new PowerlistNominationSubmissionController();