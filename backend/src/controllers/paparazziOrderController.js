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
    const { page = 1, limit = 10, status, search } = req.query;

    // Build filters
    const filters = {};
    if (status) filters.status = status;

    // Build search conditions
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    // Add status filter if provided
    if (status) {
      whereClause = `WHERE status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Add search filter if provided
    if (search && search.trim()) {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      const searchCondition = `(
        LOWER(paparazzi_name) LIKE $${paramIndex} OR 
        LOWER(customer_name) LIKE $${paramIndex + 1} OR 
        LOWER(customer_email) LIKE $${paramIndex + 2}
      )`;

      if (whereClause) {
        whereClause += ` AND ${searchCondition}`;
      } else {
        whereClause = `WHERE ${searchCondition}`;
      }

      queryParams.push(searchPattern, searchPattern, searchPattern);
      paramIndex += 3;
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build the main query
    const mainQuery = `
      SELECT * FROM paparazzi_orders 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Build the count query
    const countQuery = `
      SELECT COUNT(*) as total FROM paparazzi_orders 
      ${whereClause}
    `;

    queryParams.push(parseInt(limit), offset);

    // Execute both queries
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    const [ordersResult, countResult] = await Promise.all([
      pool.query(mainQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const orders = ordersResult.rows;
    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      paparazzi_id: order.paparazzi_id,
      paparazzi_name: order.paparazzi_name,
      price: order.price,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      customer_message: order.customer_message,
      status: order.status,
      admin_notes: order.admin_notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_date: order.created_at, // Alias for compatibility
      toJSON: function () {
        return {
          id: this.id,
          paparazzi_id: this.paparazzi_id,
          paparazzi_name: this.paparazzi_name,
          price: this.price,
          customer_name: this.customer_name,
          customer_email: this.customer_email,
          customer_phone: this.customer_phone,
          customer_message: this.customer_message,
          status: this.status,
          admin_notes: this.admin_notes,
          created_at: this.created_at,
          updated_at: this.updated_at,
          order_date: this.created_at
        };
      }
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching paparazzi orders:', error);
    res.status(500).json({
      success: false,
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

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    // First, find the order
    const findResult = await pool.query('SELECT * FROM paparazzi_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = findResult.rows[0];

    // Update order status to accepted
    const updateResult = await pool.query(
      'UPDATE paparazzi_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['accepted', id]
    );

    const updatedOrder = updateResult.rows[0];

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        updatedOrder.customer_email,
        'Call Booking Request Accepted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Your paparazzi call booking request has been accepted!</h2>
            <p>Dear ${updatedOrder.customer_name},</p>
            <p>Great news! Your call booking request for <strong>${updatedOrder.paparazzi_name}</strong> has been accepted.</p>
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
      success: true,
      message: 'Order accepted successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error accepting paparazzi order:', error);
    res.status(500).json({
      success: false,
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

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    // First, find the order
    const findResult = await pool.query('SELECT * FROM paparazzi_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = findResult.rows[0];

    // Update order status to rejected with admin notes
    const updateResult = await pool.query(
      'UPDATE paparazzi_orders SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['rejected', admin_notes, id]
    );

    const updatedOrder = updateResult.rows[0];

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        updatedOrder.customer_email,
        'Call Booking Request Update - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Call Booking Request Update</h2>
            <p>Dear ${updatedOrder.customer_name},</p>
            <p>We regret to inform you that your call booking request for <strong>${updatedOrder.paparazzi_name}</strong> could not be accepted at this time.</p>
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
      success: true,
      message: 'Order rejected successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error rejecting paparazzi order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order',
      error: error.message
    });
  }
};

// Complete paparazzi order (admin only)
const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    // First, find the order
    const findResult = await pool.query('SELECT * FROM paparazzi_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = findResult.rows[0];

    // Update order status to completed
    const updateResult = await pool.query(
      'UPDATE paparazzi_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['completed', id]
    );

    const updatedOrder = updateResult.rows[0];

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        updatedOrder.customer_email,
        'Call Booking Completed - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #9C27B0;">Call Booking Completed!</h2>
            <p>Dear ${updatedOrder.customer_name},</p>
            <p>Your call booking for <strong>${updatedOrder.paparazzi_name}</strong> has been completed successfully.</p>
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
      success: true,
      message: 'Order completed successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error completing paparazzi order:', error);
    res.status(500).json({
      success: false,
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

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    // First, find the order
    const findResult = await pool.query('SELECT * FROM paparazzi_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Build dynamic update query
    const allowedFields = ['status', 'admin_notes', 'price'];
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated_at field
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add id for WHERE clause
    values.push(id);

    const updateQuery = `
      UPDATE paparazzi_orders 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, values);
    const updatedOrder = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating paparazzi order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// Download CSV (admin only)
const downloadCSV = async (req, res) => {
  try {
    const { status, search } = req.query;
    const { Parser } = require('json2csv');

    // Build search conditions
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    // Add status filter if provided
    if (status) {
      whereClause = `WHERE status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Add search filter if provided
    if (search && search.trim()) {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      const searchCondition = `(
        LOWER(paparazzi_name) LIKE $${paramIndex} OR 
        LOWER(customer_name) LIKE $${paramIndex + 1} OR 
        LOWER(customer_email) LIKE $${paramIndex + 2}
      )`;

      if (whereClause) {
        whereClause += ` AND ${searchCondition}`;
      } else {
        whereClause = `WHERE ${searchCondition}`;
      }

      queryParams.push(searchPattern, searchPattern, searchPattern);
      paramIndex += 3;
    }

    // Build the query
    const query = `
      SELECT * FROM paparazzi_orders 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    // Execute query
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    const result = await pool.query(query, queryParams);
    const orders = result.rows;

    const fields = [
      { label: 'Order ID', value: 'id' },
      { label: 'Paparazzi Name', value: 'paparazzi_name' },
      { label: 'Customer Name', value: 'customer_name' },
      { label: 'Customer Email', value: 'customer_email' },
      { label: 'Customer Phone', value: 'customer_phone' },
      { label: 'Price', value: 'price' },
      { label: 'Status', value: 'status' },
      { label: 'Order Date', value: (row) => new Date(row.created_at).toLocaleDateString() },
      { label: 'Admin Notes', value: 'admin_notes' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(orders);

    res.header('Content-Type', 'text/csv');
    res.attachment('paparazzi_orders.csv');
    return res.send(csv);

  } catch (error) {
    console.error('Error downloading CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download CSV',
      error: error.message
    });
  }
};

module.exports = {
  downloadCSV,
  create,
  getAll,
  getById,
  acceptOrder,
  rejectOrder,
  completeOrder,
  update,
  downloadCSV
};
