const RealEstateOrder = require('../models/RealEstateOrder');
const RealEstateProfessional = require('../models/RealEstateProfessional');
const { verifyRecaptcha } = require('../services/recaptchaService');
const { sendCustomEmail } = require('../services/emailService');
const { body, validationResult } = require('express-validator');

class RealEstateOrderController {
  constructor() {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getOrdersByProfessional = this.getOrdersByProfessional.bind(this);
  }

  // Validation rules for order creation
  createValidation = [
    body('professional_id').isInt({ min: 1 }).withMessage('Valid professional ID is required'),
    body('customer_name').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
    body('customer_email').isEmail().withMessage('Valid email is required'),
    body('customer_whatsapp_number').trim().isLength({ min: 1 }).withMessage('WhatsApp number is required'),
    body('budget_range').isIn(['USD 15k-25k', 'USD 26k-50k', 'USD 51k-75k', 'USD 76k-100k', 'More than 100k']).withMessage('Valid budget range is required'),
    body('influencers_required').isIn(['1-10', '11-25', '26-50', '51-100', 'More than 100']).withMessage('Valid influencers range is required'),
    body('gender_required').isIn(['Male', 'Female', 'Both']).withMessage('Valid gender requirement is required'),
    body('languages_required').isArray({ min: 1 }).withMessage('At least one language is required'),
    body('min_followers').optional().isInt({ min: 0 }).withMessage('Minimum followers must be a non-negative integer'),
    body('message').optional().trim(),
    body('captcha_token').isLength({ min: 1 }).withMessage('CAPTCHA token is required'),
    body('terms_accepted').isBoolean().equals('true').withMessage('Terms and conditions must be accepted')
  ];

  // Create a new order
  async create(req, res) {
    console.log('🔄 Real Estate Order Creation - Start');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
      // Check validation errors
      const errors = validationResult(req);
      console.log('Validation errors:', errors.array());

      if (!errors.isEmpty()) {
        console.log('❌ Validation failed with errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('✅ Validation passed');

      // Verify reCAPTCHA
      console.log('🔍 Verifying reCAPTCHA token:', req.body.captcha_token ? 'Token present' : 'No token');
      const recaptchaScore = await verifyRecaptcha(req.body.captcha_token);
      console.log('reCAPTCHA score:', recaptchaScore);

      if (recaptchaScore === null || recaptchaScore < 0.5) {
        console.log('❌ reCAPTCHA verification failed');
        return res.status(400).json({
          error: 'reCAPTCHA verification failed',
          message: 'Please complete the reCAPTCHA verification'
        });
      }

      console.log('✅ reCAPTCHA verification passed');

      // Verify professional exists
      console.log('🔍 Checking professional ID:', req.body.professional_id);
      const professional = await RealEstateProfessional.findById(req.body.professional_id);
      console.log('Professional found:', !!professional);

      if (!professional) {
        console.log('❌ Professional not found');
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      console.log('✅ Professional verified');

      const orderData = {
        ...req.body,
        submitted_by: req.user?.userId
      };

      console.log('📝 Creating order with data:', JSON.stringify(orderData, null, 2));

      const order = await RealEstateOrder.create(orderData);
      console.log('✅ Order created successfully with ID:', order.id);

      // Send email notifications
      console.log('📧 Sending email notifications...');
      await this.sendOrderSubmissionEmails(order, professional);
      console.log('✅ Email notifications sent');

      console.log('🎉 Order creation completed successfully');

      res.status(201).json({
        message: 'Order submitted successfully',
        order: order.toJSON()
      });
    } catch (error) {
      console.error('❌ Create real estate order error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Get all orders (admin only)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        status,
        professional_id,
        customer_email
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (professional_id) filters.professional_id = parseInt(professional_id);
      if (customer_email) filters.customer_email = customer_email;

      const offset = (page - 1) * limit;
      const orders = await RealEstateOrder.findAll(filters, limit, offset);
      const total = await RealEstateOrder.getCount(filters);

      res.json({
        orders: orders.map(order => order.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all real estate orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get order by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await RealEstateOrder.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ order: order.toJSON() });
    } catch (error) {
      console.error('Get real estate order by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update order (admin only)
  async update(req, res) {
    try {
      const { id } = req.params;
      const order = await RealEstateOrder.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const updateData = { ...req.body };

      // Set admin fields based on status change
      if (updateData.status) {
        if (updateData.status === 'approved') {
          updateData.approved_by = req.admin?.adminId;
        } else if (updateData.status === 'rejected') {
          updateData.rejected_by = req.admin?.adminId;
        }
      }

      const oldStatus = order.status;
      await order.update(updateData);

      // Send email notification if status changed
      if (updateData.status && updateData.status !== oldStatus) {
        await this.sendOrderStatusUpdateEmail(order);
      }

      res.json({
        message: 'Order updated successfully',
        order: order.toJSON()
      });
    } catch (error) {
      console.error('Update real estate order error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete order (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const order = await RealEstateOrder.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      await order.delete();

      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Delete real estate order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get orders by professional ID
  async getOrdersByProfessional(req, res) {
    try {
      const { professionalId } = req.params;
      const { page = 1, limit = 12 } = req.query;

      const filters = { professional_id: parseInt(professionalId) };
      const offset = (page - 1) * limit;

      const orders = await RealEstateOrder.findAll(filters, limit, offset);
      const total = await RealEstateOrder.getCount(filters);

      res.json({
        orders: orders.map(order => order.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get orders by professional error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send email notifications when order is submitted
  async sendOrderSubmissionEmails(order, professional) {
    try {
      // Email to customer
      const customerSubject = 'Order Submitted Successfully - Real Estate Influencers';
      const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976D2;">Order Submitted Successfully!</h2>
          <p>Dear ${order.customer_name},</p>
          <p>Thank you for your order for real estate influencers. Your order has been successfully submitted and is currently under review.</p>

          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Professional:</strong> ${professional.first_name} ${professional.last_name}</p>
            <p><strong>Budget Range:</strong> ${order.budget_range}</p>
            <p><strong>Influencers Required:</strong> ${order.influencers_required}</p>
            <p><strong>Gender Required:</strong> ${order.gender_required}</p>
            <p><strong>Languages:</strong> ${order.languages_required?.join(', ') || 'Not specified'}</p>
            ${order.min_followers ? `<p><strong>Min Followers:</strong> ${order.min_followers}</p>` : ''}
          </div>

          <p>You will receive an email notification once your order is reviewed by our team.</p>
          <p>If you have any questions, please contact our support team.</p>

          <p>Best regards,<br>News Marketplace Team</p>
        </div>
      `;

      await sendCustomEmail(order.customer_email, customerSubject, customerHtml);

      // Email to admin team
      const adminSubject = 'New Real Estate Order Submitted';
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976D2;">New Order Submitted</h2>
          <p>A new real estate influencer order has been submitted and requires review.</p>

          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
            <p><strong>WhatsApp:</strong> ${order.customer_whatsapp_country_code} ${order.customer_whatsapp_number}</p>
            ${order.customer_calling_number ? `<p><strong>Calling:</strong> ${order.customer_calling_country_code} ${order.customer_calling_number}</p>` : ''}
            <p><strong>Professional:</strong> ${professional.first_name} ${professional.last_name}</p>
            <p><strong>Budget Range:</strong> ${order.budget_range}</p>
            <p><strong>Influencers Required:</strong> ${order.influencers_required}</p>
            <p><strong>Gender Required:</strong> ${order.gender_required}</p>
            <p><strong>Languages:</strong> ${order.languages_required?.join(', ') || 'Not specified'}</p>
            ${order.min_followers ? `<p><strong>Min Followers:</strong> ${order.min_followers}</p>` : ''}
            ${order.message ? `<p><strong>Message:</strong> ${order.message}</p>` : ''}
          </div>

          <p>Please review this order in the admin panel.</p>

          <p>Best regards,<br>News Marketplace System</p>
        </div>
      `;

      // Send to admin email (you may want to configure this to send to multiple admins)
      await sendCustomEmail(process.env.ADMIN_EMAIL || 'admin@newsmarketplace.com', adminSubject, adminHtml);

    } catch (error) {
      console.error('Error sending order submission emails:', error);
      // Don't throw error as the order was successfully created
    }
  }

  // Send email notification when order status is updated
  async sendOrderStatusUpdateEmail(order) {
    try {
      let subject, statusMessage, statusColor;

      switch (order.status) {
        case 'approved':
          subject = 'Order Approved - Real Estate Influencers';
          statusMessage = 'Congratulations! Your order has been approved.';
          statusColor = '#4CAF50';
          break;
        case 'rejected':
          subject = 'Order Update - Real Estate Influencers';
          statusMessage = 'We regret to inform you that your order has been rejected.';
          statusColor = '#F44336';
          break;
        case 'completed':
          subject = 'Order Completed - Real Estate Influencers';
          statusMessage = 'Your order has been successfully completed.';
          statusColor = '#2196F3';
          break;
        default:
          return; // Don't send email for other status changes
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColor};">${statusMessage}</h2>
          <p>Dear ${order.customer_name},</p>

          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${order.status.toUpperCase()}</span></p>
            <p><strong>Budget Range:</strong> ${order.budget_range}</p>
            <p><strong>Influencers Required:</strong> ${order.influencers_required}</p>
          </div>

          ${order.admin_comments ? `
            <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
              <strong>Admin Comments:</strong><br>
              ${order.admin_comments}
            </div>
          ` : ''}

          ${order.rejection_reason ? `
            <div style="background: #f8d7da; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545;">
              <strong>Reason for Rejection:</strong><br>
              ${order.rejection_reason}
            </div>
          ` : ''}

          <p>If you have any questions, please contact our support team.</p>

          <p>Best regards,<br>News Marketplace Team</p>
        </div>
      `;

      await sendCustomEmail(order.customer_email, subject, html);

    } catch (error) {
      console.error('Error sending order status update email:', error);
      // Don't throw error as the order status was successfully updated
    }
  }
}

module.exports = new RealEstateOrderController();