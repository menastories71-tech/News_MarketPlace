const Career = require('../models/Career');
const { verifyRecaptcha } = require('../services/recaptchaService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const { body, validationResult } = require('express-validator');

class CareerController {
  // Validation rules
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('company').optional().trim(),
    body('location').optional().trim(),
    body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    body('type').optional().isIn(['full-time', 'part-time']).withMessage('Invalid job type'),
  ];

  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('company').optional().trim(),
    body('location').optional().trim(),
    body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    body('type').optional().isIn(['full-time', 'part-time']).withMessage('Invalid job type'),
    body('status').optional().isIn(['active', 'pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Create a new career submission
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify reCAPTCHA for user submissions
      if (req.user && req.body.recaptchaToken) {
        const recaptchaScore = await verifyRecaptcha(req.body.recaptchaToken);
        if (recaptchaScore === null || recaptchaScore < 0.5) {
          return res.status(400).json({
            error: 'reCAPTCHA verification failed',
            message: 'Please complete the reCAPTCHA verification'
          });
        }
      }

      const careerData = {
        ...req.body,
        submitted_by: req.user?.userId,
        submitted_by_admin: req.admin?.adminId,
        // User submissions are always pending status initially
        status: req.user ? 'pending' : (req.body.status || 'active')
      };

      // Remove recaptchaToken from data before saving
      delete careerData.recaptchaToken;

      const career = await Career.create(careerData);
      res.status(201).json({
        message: req.user ? 'Career submitted successfully and is pending review' : 'Career created successfully',
        career: career.toJSON()
      });
    } catch (error) {
      console.error('Create career error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all careers with filtering and pagination
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        is_active,
        title,
        company,
        location,
        show_deleted = 'false'
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // For regular users, only show active careers
      if (req.user && !req.admin) {
        filters.status = 'active';
        filters.is_active = true;
      } else if (req.admin) {
        // For admins, show all by default
        if (show_deleted !== 'true') {
          filters.is_active = true;
        }
      }

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (title) {
        searchSql += ` AND c.title ILIKE $${searchParamCount}`;
        searchValues.push(`%${title}%`);
        searchParamCount++;
      }

      if (company) {
        searchSql += ` AND c.company ILIKE $${searchParamCount}`;
        searchValues.push(`%${company}%`);
        searchParamCount++;
      }

      if (location) {
        searchSql += ` AND c.location ILIKE $${searchParamCount}`;
        searchValues.push(`%${location}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      let careers;

      if (req.admin && show_deleted === 'true') {
        careers = await Career.getDeleted(filters, searchSql, searchValues, limit, offset);
      } else {
        careers = await Career.findAll(filters, searchSql, searchValues, limit, offset);
      }

      const total = await Career.getCount(filters, searchSql, searchValues);

      res.json({
        careers: careers.map(career => career.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get careers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's own career submissions
  async getMyCareers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        title,
        date_from,
        date_to
      } = req.query;

      const filters = { submitted_by: req.user.userId };
      if (status) filters.status = status;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = 1;

      if (title) {
        searchSql += ` AND c.title ILIKE $${searchParamCount}`;
        searchValues.push(`%${title}%`);
        searchParamCount++;
      }

      if (date_from) {
        searchSql += ` AND c.created_at >= $${searchParamCount}`;
        searchValues.push(date_from);
        searchParamCount++;
      }

      if (date_to) {
        // Add one day to include the end date
        const endDate = new Date(date_to);
        endDate.setDate(endDate.getDate() + 1);
        searchSql += ` AND c.created_at < $${searchParamCount}`;
        searchValues.push(endDate.toISOString().split('T')[0]);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const careers = await Career.findByUserIdWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await Career.getUserCount(req.user.userId, filters, searchSql, searchValues);

      res.json({
        careers: careers.map(career => career.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get my careers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get career by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const career = await Career.findById(id);

      if (!career) {
        return res.status(404).json({ error: 'Career not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        // Users can only view active or approved careers, or their own submissions
        if ((career.status !== 'active' && career.status !== 'approved') && career.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json({ career: career.toJSON() });
    } catch (error) {
      console.error('Get career by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update career
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
      const career = await Career.findById(id);

      if (!career) {
        return res.status(404).json({ error: 'Career not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        // Users can only update their own pending submissions
        if (career.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (career.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot update approved or rejected submissions' });
        }
      }

      const updatedCareer = await career.update(req.body);
      res.json({
        message: 'Career updated successfully',
        career: updatedCareer.toJSON()
      });
    } catch (error) {
      console.error('Update career error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete career (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const career = await Career.findById(id);

      if (!career) {
        return res.status(404).json({ error: 'Career not found' });
      }

      // Check permissions
      if (req.user && !req.admin) {
        // Users can only delete their own pending submissions
        if (career.submitted_by !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (career.status !== 'pending') {
          return res.status(400).json({ error: 'Cannot delete approved or rejected submissions' });
        }
      }

      await career.delete();
      res.json({ message: 'Career deleted successfully' });
    } catch (error) {
      console.error('Delete career error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve career
  async approveCareer(req, res) {
    try {
      const { id } = req.params;
      const admin_comments = req.body?.admin_comments;

      const career = await Career.findById(id);
      if (!career) {
        return res.status(404).json({ error: 'Career not found' });
      }

      if (career.status === 'approved') {
        return res.status(400).json({ error: 'Career is already approved' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const updateData = {
        status: 'approved',
        approved_at: new Date(),
        approved_by: adminId,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
        admin_comments: admin_comments || null
      };

      const updatedCareer = await career.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: career.submitted_by,
          type: 'career_approved',
          title: 'Career Posting Approved!',
          message: `Your career posting for "${career.title}" has been approved and is now live on our platform.`,
          related_id: career.id
        });
      } catch (notificationError) {
        console.error('Failed to create approval notification:', notificationError);
      }

      // Send approval email notification
      try {
        await this.sendApprovalNotification(updatedCareer);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Log email failure but don't fail the approval process
        try {
          await UserNotification.create({
            user_id: career.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email confirmation for your approved career posting. Please check your notifications for details.',
            related_id: career.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Career posting approved successfully',
        career: updatedCareer.toJSON()
      });
    } catch (error) {
      console.error('Approve career error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject career
  async rejectCareer(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason, admin_comments } = req.body;

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const career = await Career.findById(id);
      if (!career) {
        return res.status(404).json({ error: 'Career not found' });
      }

      if (career.status === 'rejected') {
        return res.status(400).json({ error: 'Career is already rejected' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const updateData = {
        status: 'rejected',
        rejected_at: new Date(),
        rejected_by: adminId,
        rejection_reason: rejection_reason.trim(),
        approved_at: null,
        approved_by: null,
        admin_comments: admin_comments || null
      };

      const updatedCareer = await career.update(updateData);

      // Create in-app notification
      try {
        await UserNotification.create({
          user_id: career.submitted_by,
          type: 'career_rejected',
          title: 'Career Posting Review Update',
          message: `Your career posting for "${career.title}" has been reviewed. Please check your email for details.`,
          related_id: career.id
        });
      } catch (notificationError) {
        console.error('Failed to create rejection notification:', notificationError);
      }

      // Send rejection email notification
      try {
        await this.sendRejectionNotification(updatedCareer);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Log email failure but don't fail the rejection process
        try {
          await UserNotification.create({
            user_id: career.submitted_by,
            type: 'system',
            title: 'Email Delivery Issue',
            message: 'We were unable to send you an email about your career posting review. Please check your notifications for the rejection details.',
            related_id: career.id
          });
        } catch (notificationError) {
          console.error('Failed to create email failure notification:', notificationError);
        }
      }

      res.json({
        message: 'Career posting rejected successfully',
        career: updatedCareer.toJSON()
      });
    } catch (error) {
      console.error('Reject career error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk approve careers
  async bulkApprove(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      // Admin verification
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const approvedCareers = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const career = await Career.findById(ids[i]);

          if (!career) {
            errors.push({ index: i, error: 'Career not found' });
            continue;
          }

          if (career.status === 'approved') {
            errors.push({ index: i, error: 'Career is already approved' });
            continue;
          }

          const updateData = {
            status: 'approved',
            approved_at: new Date(),
            approved_by: adminId,
            rejected_at: null,
            rejected_by: null,
            rejection_reason: null
          };

          const updatedCareer = await career.update(updateData);
          approvedCareers.push(updatedCareer.toJSON());

          // Send notifications (simplified for bulk operations)
          try {
            await UserNotification.create({
              user_id: career.submitted_by,
              type: 'career_approved',
              title: 'Career Posting Approved!',
              message: `Your career posting for "${career.title}" has been approved.`,
              related_id: career.id
            });
          } catch (notificationError) {
            console.error('Failed to create approval notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Approved ${approvedCareers.length} career postings successfully`,
        approved: approvedCareers.length,
        errors: errors.length,
        approvedCareers: approvedCareers,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk approve careers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk reject careers
  async bulkReject(req, res) {
    try {
      const { ids, rejection_reason, admin_comments } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      // Admin verification
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin authentication required for bulk operations' });
      }

      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(403).json({ error: 'Admin authentication required' });
      }

      const rejectedCareers = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const career = await Career.findById(ids[i]);

          if (!career) {
            errors.push({ index: i, error: 'Career not found' });
            continue;
          }

          if (career.status === 'rejected') {
            errors.push({ index: i, error: 'Career is already rejected' });
            continue;
          }

          const updateData = {
            status: 'rejected',
            rejected_at: new Date(),
            rejected_by: adminId,
            rejection_reason: rejection_reason.trim(),
            approved_at: null,
            approved_by: null,
            admin_comments: admin_comments || null
          };

          const updatedCareer = await career.update(updateData);
          rejectedCareers.push(updatedCareer.toJSON());

          // Send notifications (simplified for bulk operations)
          try {
            await UserNotification.create({
              user_id: career.submitted_by,
              type: 'career_rejected',
              title: 'Career Posting Review Update',
              message: `Your career posting for "${career.title}" has been reviewed.`,
              related_id: career.id
            });
          } catch (notificationError) {
            console.error('Failed to create rejection notification:', notificationError);
          }
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Rejected ${rejectedCareers.length} career postings successfully`,
        rejected: rejectedCareers.length,
        errors: errors.length,
        rejectedCareers: rejectedCareers,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk reject careers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send approval notification email
  sendApprovalNotification = async (career) => {
    try {
      const user = await User.findById(career.submitted_by);
      if (!user) {
        console.warn('User not found for career approval notification');
        return;
      }

      const subject = 'Your Career Posting Has Been Approved!';
      const htmlContent = this.generateApprovalEmailTemplate(career, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }

  // Send rejection notification email
  sendRejectionNotification = async (career) => {
    try {
      const user = await User.findById(career.submitted_by);
      if (!user) {
        console.warn('User not found for career rejection notification');
        return;
      }

      const subject = 'Career Posting Submission Update';
      const htmlContent = this.generateRejectionEmailTemplate(career, user);

      await emailService.sendCustomEmail(user.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      throw error;
    }
  }

  // Generate approval email template
  generateApprovalEmailTemplate(career, user) {
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
            .status-image { text-align: center; margin: 20px 0; }
            .career-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Career Posting Approved!</h1>
            </div>
            <div class="content">
              <div class="status-image">
                <img src="https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=APPROVED" alt="Approved" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid #4CAF50;" />
              </div>
              <h2>Hello ${user.first_name}!</h2>
              <p>Great news! Your career posting submission has been reviewed and <strong>approved</strong> by our team.</p>

              <div class="career-details">
                <h3>Career Details:</h3>
                <p><strong>Title:</strong> ${career.title}</p>
                <p><strong>Company:</strong> ${career.company || 'Not specified'}</p>
                <p><strong>Location:</strong> ${career.location || 'Not specified'}</p>
                <p><strong>Type:</strong> ${career.type || 'Not specified'}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
                <p><strong>Approved on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your career posting is now live on our platform and available for job seekers.</p>
              <p>You can view your approved postings in your dashboard.</p>

              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate rejection email template
  generateRejectionEmailTemplate(career, user) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-image { text-align: center; margin: 20px 0; }
            .career-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F44336; }
            .rejection-reason { background: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Career Posting Review Update</h1>
            </div>
            <div class="content">
              <div class="status-image">
                <img src="https://via.placeholder.com/150x150/F44336/FFFFFF?text=REJECTED" alt="Rejected" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid #F44336;" />
              </div>
              <h2>Hello ${user.first_name},</h2>
              <p>Thank you for submitting your career posting to News Marketplace. After careful review, we regret to inform you that your submission has not been approved at this time.</p>

              <div class="career-details">
                <h3>Career Details:</h3>
                <p><strong>Title:</strong> ${career.title}</p>
                <p><strong>Company:</strong> ${career.company || 'Not specified'}</p>
                <p><strong>Location:</strong> ${career.location || 'Not specified'}</p>
                <p><strong>Type:</strong> ${career.type || 'Not specified'}</p>
                <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
              </div>

              ${career.rejection_reason ? `
              <div class="rejection-reason">
                <h4>Reason for Rejection:</h4>
                <p>${career.rejection_reason}</p>
              </div>
              ` : ''}

              <p>You can edit and resubmit your career posting after addressing the issues mentioned above. We're here to help you improve your submission!</p>

              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
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

module.exports = new CareerController();