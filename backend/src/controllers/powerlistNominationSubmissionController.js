const PowerlistNominationSubmission = require('../models/PowerlistNominationSubmission');
const PowerlistNomination = require('../models/PowerlistNomination');
const { body, validationResult } = require('express-validator');
const emailService = require('../../services/emailService');

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
        console.log('📧 Sending nomination confirmation emails...');
        
        // Email to user
        await emailService.sendCustomEmail(
          submission.email,
          'Nomination Submission Confirmation - News Marketplace',
          PowerlistNominationSubmissionController.generateSubmissionConfirmationEmailTemplate(
            submission.full_name,
            nomination.publication_name,
            nomination.power_list_name
          )
        );

        // Email to admin
        await emailService.sendCustomEmail(
          process.env.ADMIN_EMAIL || 'menastories71@gmail.com',
          'New Powerlist Nomination Submission - News Marketplace',
          PowerlistNominationSubmissionController.generateAdminNotificationEmailTemplate(
            submission,
            nomination
          )
        );
        
        console.log('✅ Nomination confirmation emails sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send nomination emails:', emailError);
        // Don't fail the submission if email fails, but log it
      }

      res.status(201).json({
        message: 'Nomination submitted successfully! You will receive email confirmations shortly.',
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

      // Send emails if status changed
      if (updateData.status && updateData.status !== oldStatus) {
        try {
          console.log(`📧 Sending status update emails for status change: ${oldStatus} -> ${updateData.status}`);
          
          const nomination = await PowerlistNomination.findById(submission.powerlist_nomination_id);

          // Email to user
          await emailService.sendCustomEmail(
            submission.email,
            `Nomination ${updateData.status.charAt(0).toUpperCase() + updateData.status.slice(1)} - News Marketplace`,
            PowerlistNominationSubmissionController.generateStatusUpdateEmailTemplate(
              submission.full_name,
              nomination.publication_name,
              nomination.power_list_name,
              updateData.status
            )
          );

          // Email to admin
          await emailService.sendCustomEmail(
            process.env.ADMIN_EMAIL || 'menastories71@gmail.com',
            `Nomination Status Updated - ${updateData.status.charAt(0).toUpperCase() + updateData.status.slice(1)}`,
            PowerlistNominationSubmissionController.generateAdminStatusUpdateEmailTemplate(
              submission,
              nomination,
              updateData.status
            )
          );
          
          console.log('✅ Status update emails sent successfully');
        } catch (emailError) {
          console.error('❌ Failed to send status update emails:', emailError);
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

      // Send emails if status changed
      if (status !== oldStatus) {
        try {
          console.log(`📧 Sending status update emails for status change: ${oldStatus} -> ${status}`);
          
          const nomination = await PowerlistNomination.findById(submission.powerlist_nomination_id);

          // Email to user
          await emailService.sendCustomEmail(
            submission.email,
            `Nomination ${status.charAt(0).toUpperCase() + status.slice(1)} - News Marketplace`,
            PowerlistNominationSubmissionController.generateStatusUpdateEmailTemplate(
              submission.full_name,
              nomination.publication_name,
              nomination.power_list_name,
              status
            )
          );

          // Email to admin
          await emailService.sendCustomEmail(
            process.env.ADMIN_EMAIL || 'menastories71@gmail.com',
            `Nomination Status Updated - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            PowerlistNominationSubmissionController.generateAdminStatusUpdateEmailTemplate(
              submission,
              nomination,
              status
            )
          );
          
          console.log('✅ Status update emails sent successfully');
        } catch (emailError) {
          console.error('❌ Failed to send status update emails:', emailError);
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">News Marketplace</h1>
          <p style="color: #E3F2FD; margin: 8px 0 0 0; font-size: 16px;">Nomination Submitted Successfully</p>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #1976D2; margin: 0 0 20px 0; font-size: 24px;">Thank You, ${fullName}!</h2>
          <p style="color: #212121; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your nomination has been successfully submitted for <strong style="color: #1976D2;">${publicationName}</strong> 
            in the <strong style="color: #00796B;">${powerListName}</strong> powerlist.
          </p>
          
          <div style="background: #FFEBEE; border-left: 4px solid #F44336; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #F44336; font-weight: 600; margin: 0; font-size: 14px;">
              <strong>Important Disclaimer:</strong> We do not guarantee or authorize inclusion in the publication. 
              All nominations are subject to review and editorial discretion.
            </p>
          </div>
          
          <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
            <ul style="color: #757575; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Our team will review your nomination</li>
              <li>You'll receive email updates on the status</li>
              <li>The review process may take 3-5 business days</li>
            </ul>
          </div>
          
          <p style="color: #757575; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            You will receive email notifications as your nomination progresses through our review process.
          </p>
          
          <p style="color: #212121; font-size: 16px; margin: 30px 0 0 0;">
            Best regards,<br>
            <strong style="color: #1976D2;">The News Marketplace Team</strong>
          </p>
        </div>
        <div style="background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 12px; color: #BDBDBD; margin: 0;">
            &copy; 2024 News Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  static generateAdminNotificationEmailTemplate(submission, nomination) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">New Nomination Alert</h1>
          <p style="color: #FFF3E0; margin: 8px 0 0 0; font-size: 16px;">Action Required</p>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #FF9800; margin: 0 0 20px 0; font-size: 24px;">New Powerlist Nomination Received</h2>
          
          <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">Nomination Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Publication:</td>
                <td style="padding: 8px 0; color: #212121;"><strong>${nomination.publication_name}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Power List:</td>
                <td style="padding: 8px 0; color: #212121;"><strong>${nomination.power_list_name}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Full Name:</td>
                <td style="padding: 8px 0; color: #212121;">${submission.full_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #212121;">${submission.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0; color: #212121;">${submission.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background: #FFF3E0; color: #FF9800; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    PENDING REVIEW
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          ${submission.additional_message ? `
          <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976D2; margin: 0 0 10px 0;">Additional Message:</h4>
            <p style="color: #212121; margin: 0; font-style: italic;">"${submission.additional_message}"</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #757575; margin-bottom: 15px;">Please review this nomination in the admin panel.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/powerlist-orders" 
               style="background: #1976D2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Review in Admin Panel
            </a>
          </div>
        </div>
        <div style="background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 12px; color: #BDBDBD; margin: 0;">
            &copy; 2024 News Marketplace Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  static generateAdminStatusUpdateEmailTemplate(submission, nomination, status) {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Nomination Status Updated</h1>
          <p style="color: #FFF3E0; margin: 8px 0 0 0; font-size: 16px;">Status Change Notification</p>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #FF9800; margin: 0 0 20px 0; font-size: 24px;">Nomination ${statusText}</h2>
          
          <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">Nomination Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Publication:</td>
                <td style="padding: 8px 0; color: #212121;"><strong>${nomination.publication_name}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Power List:</td>
                <td style="padding: 8px 0; color: #212121;"><strong>${nomination.power_list_name}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Full Name:</td>
                <td style="padding: 8px 0; color: #212121;">${submission.full_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #212121;">${submission.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E0E0E0;">
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0; color: #212121;">${submission.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #757575; font-weight: 600;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background: #FFF3E0; color: #FF9800; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${statusText}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          ${submission.additional_message ? `
          <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976D2; margin: 0 0 10px 0;">Additional Message:</h4>
            <p style="color: #212121; margin: 0; font-style: italic;">"${submission.additional_message}"</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #757575; margin-bottom: 15px;">The status of this nomination has been updated.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/powerlist-orders" 
               style="background: #1976D2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Nomination in Admin Panel
            </a>
          </div>
        </div>
        <div style="background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 12px; color: #BDBDBD; margin: 0;">
            &copy; 2024 News Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  static generateStatusUpdateEmailTemplate(fullName, publicationName, powerListName, status) {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const statusColor = status === 'approved' ? '#4CAF50' : status === 'rejected' ? '#F44336' : '#FF9800';
    const statusBg = status === 'approved' ? '#E8F5E8' : status === 'rejected' ? '#FFEBEE' : '#FFF3E0';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}DD 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Nomination ${statusText}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Status Update</p>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #212121; margin: 0 0 20px 0; font-size: 24px;">Dear ${fullName},</h2>
          
          <div style="background: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="color: ${statusColor}; font-weight: 600; margin: 0 0 10px 0; font-size: 18px;">
              Your nomination has been ${statusText.toLowerCase()}
            </p>
            <p style="color: #212121; margin: 0; font-size: 16px;">
              Publication: <strong>${publicationName}</strong><br>
              Power List: <strong>${powerListName}</strong>
            </p>
          </div>
          
          ${status === 'approved' ? `
          <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 18px;">🎉 Congratulations!</h3>
            <p style="color: #212121; margin: 0; line-height: 1.6;">
              Your nomination has been accepted! Our team will be in touch with you shortly regarding the next steps 
              in the process. Thank you for your interest in our powerlist.
            </p>
          </div>
          ` : status === 'rejected' ? `
          <div style="background: #FFEBEE; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #F44336; margin: 0 0 15px 0; font-size: 18px;">Nomination Status</h3>
            <p style="color: #212121; margin: 0; line-height: 1.6;">
              We regret to inform you that your nomination was not selected for this powerlist. 
              This decision was made after careful consideration by our editorial team. 
              We encourage you to apply for future opportunities.
            </p>
          </div>
          ` : `
          <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #FF9800; margin: 0 0 15px 0; font-size: 18px;">Under Review</h3>
            <p style="color: #212121; margin: 0; line-height: 1.6;">
              Your nomination is still being reviewed by our team. We will update you once a decision has been made.
            </p>
          </div>
          `}
          
          <p style="color: #212121; font-size: 16px; margin: 30px 0 0 0;">
            Best regards,<br>
            <strong style="color: #1976D2;">The News Marketplace Team</strong>
          </p>
        </div>
        <div style="background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 12px; color: #BDBDBD; margin: 0;">
            &copy; 2024 News Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = new PowerlistNominationSubmissionController();