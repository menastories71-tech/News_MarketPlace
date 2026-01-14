const Order = require('../models/Order');
const emailService = require('../services/emailService');

// Create a new order
const create = async (req, res) => {
  try {
    const {
      publicationId,
      publicationName,
      paparazziId,
      paparazziName,
      price,
      customerInfo,
      orderDate,
      status
    } = req.body;

    // Validate required fields - either publication or paparazzi must be provided
    if ((!publicationId || !publicationName) && (!paparazziId || !paparazziName)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: either publication or paparazzi information is required'
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
      publication_id: publicationId || null,
      publication_name: publicationName || null,
      paparazzi_id: paparazziId || null,
      paparazzi_name: paparazziName || null,
      order_type: paparazziId ? 'paparazzi' : 'publication',
      price: price || 0,
      customer_name: customerInfo.fullName,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone || null,
      customer_message: customerInfo.message || null,
      status: status || 'pending'
    };

    const order = await Order.create(orderData);

    // Send confirmation email to user
    try {
      const serviceName = order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name;
      const serviceType = order.order_type === 'paparazzi' ? 'paparazzi' : 'publication';

      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Request Submitted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Thank you for your call booking request!</h2>
            <p>Dear ${order.customer_name},</p>
            <p>Your call booking request for <strong>${serviceName}</strong> has been successfully submitted.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}: ${serviceName}</li>
              <li>Price: $${order.price}</li>
              <li>Status: ${order.status}</li>
              <li>Order Date: ${new Date(order.order_date).toLocaleDateString()}</li>
            </ul>
            <p>Our team will review your request and contact you within 24-48 hours to schedule a call and discuss the next steps.</p>
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
      const serviceName = order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name;
      const serviceType = order.order_type === 'paparazzi' ? 'Paparazzi' : 'Publication';

      await emailService.sendCustomEmail(
        process.env.ADMIN_EMAIL || 'admin@newsmarketplace.com',
        'New Call Booking Request - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">New Call Booking Request</h2>
            <p>A new call booking request has been submitted:</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Type: ${serviceType}</li>
              <li>${serviceType}: ${serviceName}</li>
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
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all orders (admin only)
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const offset = (page - 1) * limit;
    const orders = await Order.findAll(filters, limit, offset);
    const total = await Order.getCount(filters);
    const pages = Math.ceil(total / limit);

    res.json({
      orders: orders.map(order => order.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Download CSV
const downloadCSV = async (req, res) => {
  try {
    const { status, sortBy = 'order_date', sortOrder = 'DESC' } = req.query;

    const filters = {};
    if (status) filters.status = status;

    // Get all matching orders
    const orders = await Order.findAll(filters, 100000, 0);

    // In-memory sort
    orders.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null) valA = '';
      if (valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder.toUpperCase() === 'ASC' ? -1 : 1;
      if (valA > valB) return sortOrder.toUpperCase() === 'ASC' ? 1 : -1;
      return 0;
    });

    const headers = [
      'ID', 'Type', 'Service Name', 'Price',
      'Customer Name', 'Customer Email', 'Customer Phone',
      'Status', 'Order Date', 'Last Updated', 'Admin Notes'
    ];

    let csv = headers.join(',') + '\n';

    orders.forEach(order => {
      const escape = (text) => {
        if (text === null || text === undefined) return '';
        const stringValue = String(text);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const serviceName = order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name;

      const row = [
        order.id,
        order.order_type === 'paparazzi' ? 'Paparazzi' : 'Publication',
        escape(serviceName),
        order.price,
        escape(order.customer_name),
        escape(order.customer_email),
        escape(order.customer_phone),
        escape(order.status),
        order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : '',
        order.updated_at ? new Date(order.updated_at).toISOString().split('T')[0] : '',
        escape(order.admin_notes)
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Download CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get order by ID (admin only)
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: order.toJSON() });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Accept order (admin only)
const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.accept();

    // Send email to customer
    try {
      const serviceName = order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name;
      const serviceType = order.order_type === 'paparazzi' ? 'paparazzi' : 'publication';

      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Request Accepted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Your call booking request has been accepted!</h2>
            <p>Dear ${order.customer_name},</p>
            <p>Great news! Your call booking request for <strong>${serviceName}</strong> has been accepted.</p>
            <p>Our team will contact you shortly to schedule a call and discuss the ${serviceType} details.</p>
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
    console.error('Error accepting order:', error);
    res.status(500).json({
      message: 'Failed to accept order',
      error: error.message
    });
  }
};

// Reject order (admin only)
const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.reject(admin_notes);

    // Send email to customer
    try {
      const serviceName = order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name;

      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Request Update - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Call Booking Request Update</h2>
            <p>Dear ${order.customer_name},</p>
            <p>We regret to inform you that your call booking request for <strong>${serviceName}</strong> could not be accepted at this time.</p>
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
    console.error('Error rejecting order:', error);
    res.status(500).json({
      message: 'Failed to reject order',
      error: error.message
    });
  }
};

// Complete order (admin only)
const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.complete();

    // Send email to customer
    try {
      const serviceName = order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name;

      await emailService.sendCustomEmail(
        order.customer_email,
        'Call Booking Completed - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #9C27B0;">Call Booking Completed!</h2>
            <p>Dear ${order.customer_name},</p>
            <p>Your call booking for <strong>${serviceName}</strong> has been completed successfully.</p>
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
    console.error('Error completing order:', error);
    res.status(500).json({
      message: 'Failed to complete order',
      error: error.message
    });
  }
};

// Update order (admin only)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update(updateData);

    res.json({
      message: 'Order updated successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error updating order:', error);
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
  update,
  downloadCSV
};