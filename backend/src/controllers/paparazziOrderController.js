const PaparazziOrder = require('../models/PaparazziOrder');
const emailService = require('../services/emailService');

// Create a new paparazzi order
const create = async (req, res) => {
  try {
    const {
      paparazziId,
      paparazziName,
      price,
      customerInfo,
      orderDate,
      status
    } = req.body;

    // Validate required fields
    if (!paparazziId || !paparazziName) {
      return res.status(400).json({
        success: false,
        message: 'Paparazzi ID and name are required'
      });
    }

    if (!customerInfo?.email || !customerInfo?.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Customer email and full name are required'
      });
    }

    // Create order data
    const orderData = {
      paparazzi_id: paparazziId,
      paparazzi_name: paparazziName,
      price: price || 0,
      customer_name: customerInfo.fullName,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone || null,
      customer_message: customerInfo.message || null,
      status: status || 'pending'
    };

    const order = await PaparazziOrder.create(orderData);

    // Send confirmation email to user
    try {
      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Request Submitted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Thank you for your call booking request!</h2>
            <p>Dear ${order.customer_name},</p>
            <p>Your call booking request for <strong>${paparazziName}</strong> has been successfully submitted.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Paparazzi: ${paparazziName}</li>
              <li>Price: $${order.price}</li>
              <li>Status: ${order.status}</li>
              <li>Order Date: ${new Date(order.order_date).toLocaleDateString()}</li>
            </ul>
            <p>Our team will review your request and contact you within 24-48 hours to schedule a call and discuss the details.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>News Marketplace Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Error sending user confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendCustomEmail(
        process.env.ADMIN_EMAIL || 'admin@newsmarketplace.com',
        'New Paparazzi Call Booking Request - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">New Paparazzi Call Booking Request</h2>
            <p>A new paparazzi call booking request has been submitted:</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Paparazzi: ${paparazziName}</li>
              <li>Price: $${order.price}</li>
              <li>Customer: ${order.customer_name}</li>
              <li>Email: ${order.customer_email}</li>
              <li>Phone: ${order.customer_phone || 'Not provided'}</li>
              <li>Message: ${order.customer_message || 'No message'}</li>
              <li>Status: ${order.status}</li>
              <li>Order Date: ${new Date(order.order_date).toLocaleDateString()}</li>
            </ul>
            <p>Please review this request in the admin panel.</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Call booking request submitted successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error creating paparazzi order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all paparazzi orders (admin only)
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const offset = (page - 1) * limit;
    const result = await PaparazziOrder.findAll(filters, limit, offset);
    const total = await PaparazziOrder.getCount(filters);
    const pages = Math.ceil(total / limit);

    res.json({
      orders: result.rows.map(order => order.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching paparazzi orders:', error);
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get paparazzi order by ID (admin only)
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PaparazziOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: order.toJSON() });

  } catch (error) {
    console.error('Error fetching paparazzi order:', error);
    res.status(500).json({
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Accept paparazzi order (admin only)
const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PaparazziOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.accept();

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Request Accepted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Your paparazzi call booking request has been accepted!</h2>
            <p>Dear ${order.customer_name},</p>
            <p>Great news! Your call booking request for <strong>${order.paparazzi_name}</strong> has been accepted.</p>
            <p>Our team will contact you shortly to schedule a call and discuss the paparazzi details.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>News Marketplace Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Error sending acceptance email:', emailError);
    }

    res.json({
      message: 'Order accepted successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error accepting paparazzi order:', error);
    res.status(500).json({
      message: 'Failed to accept order',
      error: error.message
    });
  }
};

// Reject paparazzi order (admin only)
const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const order = await PaparazziOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.reject(admin_notes);

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Request Update - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Call Booking Request Update</h2>
            <p>Dear ${order.customer_name},</p>
            <p>We regret to inform you that your call booking request for <strong>${order.paparazzi_name}</strong> could not be accepted at this time.</p>
            ${admin_notes ? `<p><strong>Reason:</strong> ${admin_notes}</p>` : ''}
            <p>If you have any questions or would like to discuss alternative options, please don't hesitate to contact us.</p>
            <p>Best regards,<br>News Marketplace Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    res.json({
      message: 'Order rejected successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error rejecting paparazzi order:', error);
    res.status(500).json({
      message: 'Failed to reject order',
      error: error.message
    });
  }
};

// Complete paparazzi order (admin only)
const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PaparazziOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.complete();

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Completed - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #9C27B0;">Call Booking Completed!</h2>
            <p>Dear ${order.customer_name},</p>
            <p>Your call booking for <strong>${order.paparazzi_name}</strong> has been completed successfully.</p>
            <p>Thank you for choosing News Marketplace. We hope the call was productive and met your expectations.</p>
            <p>If you need any further assistance, please don't hesitate to contact us.</p>
            <p>Best regards,<br>News Marketplace Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Error sending completion email:', emailError);
    }

    res.json({
      message: 'Order completed successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error completing paparazzi order:', error);
    res.status(500).json({
      message: 'Failed to complete order',
      error: error.message
    });
  }
};

// Update paparazzi order (admin only)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await PaparazziOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update(updateData);

    res.json({
      message: 'Order updated successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error updating paparazzi order:', error);
    res.status(500).json({
      message: 'Failed to update order',
      error: error.message
    });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  acceptOrder,
  rejectOrder,
  completeOrder,
  update
};