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

    // Send emails
    try {
      console.log('📧 Sending radio order confirmation emails...');

      // Email to user
      await emailService.sendCustomEmail(
        customerInfo.email,
        'Radio Interview Booking Request Submitted - News Marketplace',
        generateOrderConfirmationEmailTemplate(customerInfo.fullName, radioName, order)
      );

      // Email to admin
      await emailService.sendCustomEmail(
        process.env.ADMIN_EMAIL || 'menastories71@gmail.com',
        'New Radio Interview Booking Request - News Marketplace',
        generateAdminNotificationEmailTemplate(order, radioName, customerInfo)
      );

      console.log('✅ Radio order confirmation emails sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send radio order emails:', emailError);
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
    const oldStatus = order.status;

    // Update status
    const updateQuery = `
      UPDATE radio_orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const updateResult = await db.query(updateQuery, [status, id]);
    const updatedOrder = updateResult.rows[0];

    // Send email notifications
    try {
      console.log(`📧 Sending radio order status update emails for status change: ${oldStatus} -> ${status}`);

      // Email to user
      await emailService.sendCustomEmail(
        customerInfo.email,
        `Radio Interview Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - News Marketplace`,
        generateStatusUpdateEmailTemplate(
          customerInfo.fullName,
          order.radio_name,
          status
        )
      );

      // Email to admin
      await emailService.sendCustomEmail(
        process.env.ADMIN_EMAIL || 'admin@newsmarketplace.com',
        `Radio Order Status Updated - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        generateAdminStatusUpdateEmailTemplate(
          order,
          customerInfo,
          status
        )
      );

      console.log('✅ Radio order status update emails sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send radio order status update emails:', emailError);
      // Don't fail the status update if email fails
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

// Download CSV (admin only)
const downloadCSV = async (req, res) => {
  try {
    const { status } = req.query;
    const { Parser } = require('json2csv');

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

    const result = await db.query(query, values);
    const orders = result.rows;

    const formattedOrders = orders.map(order => {
      const customerInfo = order.customer_info || {};
      return {
        id: order.id,
        radio_name: order.radio_name,
        customer_name: customerInfo.fullName,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        message: customerInfo.message,
        status: order.status,
        created_at: new Date(order.created_at).toLocaleString()
      };
    });

    const fields = [
      { label: 'Order ID', value: 'id' },
      { label: 'Radio Station', value: 'radio_name' },
      { label: 'Customer Name', value: 'customer_name' },
      { label: 'Customer Email', value: 'customer_email' },
      { label: 'Customer Phone', value: 'customer_phone' },
      { label: 'Message', value: 'message' },
      { label: 'Status', value: 'status' },
      { label: 'Date', value: 'created_at' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedOrders);

    res.header('Content-Type', 'text/csv');
    res.attachment('radio_orders.csv');
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
  updateStatus,
  deleteOrder
};

// Email template generators
function generateOrderConfirmationEmailTemplate(fullName, radioName, order) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">News Marketplace</h1>
        <p style="color: #E3F2FD; margin: 8px 0 0 0; font-size: 16px;">Radio Interview Booking Submitted</p>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #1976D2; margin: 0 0 20px 0; font-size: 24px;">Thank You, ${fullName}!</h2>
        <p style="color: #212121; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Your radio interview booking request for <strong style="color: #1976D2;">${radioName}</strong>
          has been successfully submitted.
        </p>

        <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Radio Station:</td>
              <td style="padding: 8px 0; color: #212121;"><strong>${radioName}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Order ID:</td>
              <td style="padding: 8px 0; color: #212121;">${order.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Status:</td>
              <td style="padding: 8px 0;">
                <span style="background: #FFF3E0; color: #FF9800; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                  PENDING REVIEW
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Submitted:</td>
              <td style="padding: 8px 0; color: #212121;">${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background: #FFEBEE; border-left: 4px solid #F44336; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #F44336; font-weight: 600; margin: 0; font-size: 14px;">
            <strong>Important Disclaimer:</strong> We do not guarantee or authorize inclusion in the radio interview.
            All requests are subject to review and editorial discretion.
          </p>
        </div>

        <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976D2; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
          <ul style="color: #212121; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Our team will review your booking request</li>
            <li>You'll receive email updates on the status</li>
            <li>The review process may take 3-5 business days</li>
            <li>We'll contact you to schedule the interview if approved</li>
          </ul>
        </div>

        <p style="color: #757575; font-size: 16px; line-height: 1.6; margin: 20px 0;">
          You will receive email notifications as your booking request progresses through our review process.
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

function generateAdminNotificationEmailTemplate(order, radioName, customerInfo) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">New Radio Booking Alert</h1>
        <p style="color: #FFF3E0; margin: 8px 0 0 0; font-size: 16px;">Action Required</p>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #FF9800; margin: 0 0 20px 0; font-size: 24px;">New Radio Interview Booking Request</h2>

        <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Radio Station:</td>
              <td style="padding: 8px 0; color: #212121;"><strong>${radioName}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Order ID:</td>
              <td style="padding: 8px 0; color: #212121;">${order.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Full Name:</td>
              <td style="padding: 8px 0; color: #212121;">${customerInfo.fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; color: #212121;">${customerInfo.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Phone:</td>
              <td style="padding: 8px 0; color: #212121;">${customerInfo.phone || 'Not provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Status:</td>
              <td style="padding: 8px 0;">
                <span style="background: #FFF3E0; color: #FF9800; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                  PENDING REVIEW
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Submitted:</td>
              <td style="padding: 8px 0; color: #212121;">${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        ${customerInfo.message ? `
        <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1976D2; margin: 0 0 10px 0;">Additional Message:</h4>
          <p style="color: #212121; margin: 0; font-style: italic;">"${customerInfo.message}"</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #757575; margin-bottom: 15px;">Please review this booking request in the admin panel.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/radio-orders"
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

function generateStatusUpdateEmailTemplate(fullName, radioName, status) {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const statusColor = status === 'approved' ? '#4CAF50' : status === 'rejected' ? '#F44336' : '#FF9800';
  const statusBg = status === 'approved' ? '#E8F5E8' : status === 'rejected' ? '#FFEBEE' : '#FFF3E0';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}DD 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Radio Interview Booking ${statusText}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Status Update</p>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #212121; margin: 0 0 20px 0; font-size: 24px;">Dear ${fullName},</h2>

        <div style="background: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="color: ${statusColor}; font-weight: 600; margin: 0 0 10px 0; font-size: 18px;">
            Your radio interview booking request has been ${statusText.toLowerCase()}
          </p>
          <p style="color: #212121; margin: 0; font-size: 16px;">
            Radio Station: <strong>${radioName}</strong>
          </p>
        </div>

        ${status === 'approved' ? `
        <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 18px;">🎉 Congratulations!</h3>
          <p style="color: #212121; margin: 0; line-height: 1.6;">
            Your radio interview booking request has been accepted! Our team will be in touch with you shortly
            to schedule the interview and discuss the details. Thank you for your interest in our radio programs.
          </p>
        </div>
        ` : status === 'rejected' ? `
        <div style="background: #FFEBEE; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #F44336; margin: 0 0 15px 0; font-size: 18px;">Booking Status</h3>
          <p style="color: #212121; margin: 0; line-height: 1.6;">
            We regret to inform you that your radio interview booking request could not be accepted at this time.
            This decision was made after careful consideration by our editorial team.
            We encourage you to apply for future opportunities.
          </p>
        </div>
        ` : `
        <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF9800; margin: 0 0 15px 0; font-size: 18px;">Under Review</h3>
          <p style="color: #212121; margin: 0; line-height: 1.6;">
            Your radio interview booking request is still being reviewed by our team.
            We will update you once a decision has been made.
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

function generateAdminStatusUpdateEmailTemplate(order, customerInfo, status) {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Radio Booking Status Updated</h1>
        <p style="color: #FFF3E0; margin: 8px 0 0 0; font-size: 16px;">Status Change Notification</p>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #FF9800; margin: 0 0 20px 0; font-size: 24px;">Radio Interview Booking ${statusText}</h2>

        <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #212121; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Radio Station:</td>
              <td style="padding: 8px 0; color: #212121;"><strong>${order.radio_name}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Order ID:</td>
              <td style="padding: 8px 0; color: #212121;">${order.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Full Name:</td>
              <td style="padding: 8px 0; color: #212121;">${customerInfo.fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; color: #212121;">${customerInfo.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px 0; color: #757575; font-weight: 600;">Phone:</td>
              <td style="padding: 8px 0; color: #212121;">${customerInfo.phone || 'Not provided'}</td>
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

        ${customerInfo.message ? `
        <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1976D2; margin: 0 0 10px 0;">Additional Message:</h4>
          <p style="color: #212121; margin: 0; font-style: italic;">"${customerInfo.message}"</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #757575; margin-bottom: 15px;">The status of this radio booking has been updated.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/radio-orders"
             style="background: #1976D2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            View in Admin Panel
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

