const db = require('../config/database');
const emailService = require('../services/emailService');

// Create a new radio order
const create = async (req, res) => {
  try {
    const {
      radioId,
      radioName,
      customerInfo,
      orderDate,
      status
    } = req.body;

    // Validate required fields
    if (!radioId || !radioName) {
      return res.status(400).json({
        success: false,
        message: 'Radio ID and name are required'
      });
    }

    if (!customerInfo?.email || !customerInfo?.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Customer email and full name are required'
      });
    }

    // Insert order into database
    const query = `
      INSERT INTO radio_orders (radio_id, radio_name, customer_info, status, order_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      radioId,
      radioName,
      JSON.stringify(customerInfo),
      status || 'pending',
      orderDate || new Date()
    ];

    const result = await db.query(query, values);
    const order = result.rows[0];

    // Send confirmation email to user
    try {
      await emailService.sendCustomEmail(
        customerInfo.email,
        'Radio Interview Booking Request Submitted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Thank you for your radio interview booking request!</h2>
            <p>Dear ${customerInfo.fullName},</p>
            <p>Your radio interview booking request for <strong>${radioName}</strong> has been successfully submitted.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Radio Station: ${radioName}</li>
              <li>Status: ${order.status}</li>
              <li>Order Date: ${new Date(order.order_date).toLocaleDateString()}</li>
            </ul>
            <p>Our team will review your request and contact you within 24-48 hours to schedule the interview and discuss the next steps.</p>
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
        'New Radio Interview Booking Request - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">New Radio Interview Booking Request</h2>
            <p>A new radio interview booking request has been submitted:</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Radio Station: ${radioName}</li>
              <li>Customer: ${customerInfo.fullName}</li>
              <li>Email: ${customerInfo.email}</li>
              <li>Phone: ${customerInfo.phone || 'Not provided'}</li>
              <li>Message: ${customerInfo.message || 'No message'}</li>
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
      message: 'Radio interview booking request submitted successfully',
      order
    });

  } catch (error) {
    console.error('Error creating radio order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create radio order',
      error: error.message
    });
  }
};

// Get all radio orders (admin only)
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 25, status } = req.query;

    let query = `
      SELECT * FROM radio_orders
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push((page - 1) * limit);

    const result = await db.query(query, values);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching radio orders:', error);
    res.status(500).json({
      message: 'Failed to fetch radio orders',
      error: error.message
    });
  }
};

// Update order status (admin only)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    // Get order details
    const orderQuery = `SELECT * FROM radio_orders WHERE id = $1`;
    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];
    const customerInfo = order.customer_info;

    // Update status
    const updateQuery = `
      UPDATE radio_orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const updateResult = await db.query(updateQuery, [status, id]);
    const updatedOrder = updateResult.rows[0];

    // Send email notification
    try {
      let subject, message;

      if (status === 'approved') {
        subject = 'Radio Interview Booking Request Approved - News Marketplace';
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Your radio interview booking request has been approved!</h2>
            <p>Dear ${customerInfo.fullName},</p>
            <p>Great news! Your radio interview booking request for <strong>${order.radio_name}</strong> has been approved.</p>
            <p>Our team will contact you shortly to schedule the interview and discuss the details.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>News Marketplace Team</p>
          </div>
        `;
      } else if (status === 'rejected') {
        subject = 'Radio Interview Booking Request Update - News Marketplace';
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Radio Interview Booking Request Update</h2>
            <p>Dear ${customerInfo.fullName},</p>
            <p>We regret to inform you that your radio interview booking request for <strong>${order.radio_name}</strong> could not be accepted at this time.</p>
            <p>If you have any questions or would like to discuss alternative options, please don't hesitate to contact us.</p>
            <p>Best regards,<br>News Marketplace Team</p>
          </div>
        `;
      }

      if (subject && message) {
        await emailService.sendCustomEmail(customerInfo.email, subject, message);
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
    }

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating radio order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Delete order (admin only)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = `DELETE FROM radio_orders WHERE id = $1 RETURNING *`;
    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting radio order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

module.exports = {
  create,
  getAll,
  updateStatus,
  deleteOrder
};