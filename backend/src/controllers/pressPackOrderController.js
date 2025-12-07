const PressPackOrder = require('../models/PressPackOrder');
const PressPack = require('../models/PressPack');
const emailService = require('../services/emailService');
const { s3Service } = require('../services/s3Service');

// Create a new press pack order
const create = async (req, res) => {
  try {
    const {
      name,
      whatsapp_country_code,
      whatsapp_number,
      calling_country_code,
      calling_number,
      press_release_type,
      email,
      submitted_by_type,
      press_release_selection,
      package_selection,
      message,
      captcha_token,
      terms_accepted,
      content_writing_assistance
    } = req.body;

    // Convert string values to proper types
    const parsedPressReleaseSelection = press_release_selection ? parseInt(press_release_selection) : 1; // Default to 1 if not provided
    const parsedTermsAccepted = terms_accepted === 'true';
    const parsedContentWritingAssistance = content_writing_assistance === 'required';

    // Handle file uploads to S3
    const uploadedFiles = {};

    if (req.files) {
      const fileFields = ['company_registration_document', 'letter_of_authorisation', 'image', 'word_pdf_document'];

      for (const fieldName of fileFields) {
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          const s3Key = s3Service.generateKey('press-pack-orders', fieldName, file.originalname);
          const contentType = s3Service.getContentType(file.originalname);

          try {
            const s3Url = await s3Service.uploadFile(file.buffer, s3Key, contentType, file.originalname);
            uploadedFiles[fieldName] = s3Url;
          } catch (uploadError) {
            console.error(`Error uploading ${fieldName}:`, uploadError);
            // Continue with other files, don't fail the whole order
          }
        }
      }
    }

    // Validate required fields
    if (!name || !email || !whatsapp_number) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and WhatsApp number are required'
      });
    }

    // Terms accepted validation removed since column doesn't exist in remote DB

    // Create order data (save additional data in message as JSON since remote DB has limited columns)
    const additionalData = {
      whatsapp_country_code: whatsapp_country_code,
      calling_number: calling_number,
      calling_country_code: calling_country_code,
      press_release_type: press_release_type,
      submitted_by_type: submitted_by_type,
      content_writing_assistance: parsedContentWritingAssistance,
      company_registration_document: uploadedFiles.company_registration_document || null,
      letter_of_authorisation: uploadedFiles.letter_of_authorisation || null,
      image: uploadedFiles.image || null,
      word_pdf_document: uploadedFiles.word_pdf_document || null
    };

    const orderData = {
      name: name,
      whatsapp_number: whatsapp_number,
      email: email,
      press_release_selection: parsedPressReleaseSelection,
      package_selection: package_selection,
      message: message ? `${message}\n\nADDITIONAL_DATA:${JSON.stringify(additionalData)}` : `ADDITIONAL_DATA:${JSON.stringify(additionalData)}`,
      status: 'pending'
    };

    const order = await PressPackOrder.create(orderData);

    // Send confirmation email to user
    try {
      await emailService.sendCustomEmail(
        order.email,
        'Press Release Order Submitted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Thank you for your press release order!</h2>
            <p>Dear ${order.name},</p>
            <p>Your press release order has been successfully submitted.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Package: ${order.package_selection || 'Not specified'}</li>
              <li>Content Writing: ${order.content_writing_assistance ? 'Required' : 'Not Required'}</li>
              <li>Status: ${order.status}</li>
              <li>Order Date: ${new Date(order.created_at).toLocaleString()}</li>
            </ul>
            <p>Our team will review your request and contact you within 24-48 hours to discuss the press release distribution details.</p>
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
        'New Press Release Order - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">New Press Release Order</h2>
            <p>A new press release order has been submitted:</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Package: ${order.package_selection || 'Not specified'}</li>
              <li>Customer: ${order.name}</li>
              <li>Email: ${order.email}</li>
              <li>WhatsApp: ${order.whatsapp_number}</li>
              <li>Calling Number: ${order.calling_number || 'Not provided'}</li>
              <li>Submitted By: ${order.submitted_by_type}</li>
              <li>Content Writing: ${order.content_writing_assistance ? 'Required' : 'Not Required'}</li>
              <li>Status: ${order.status}</li>
              <li>Order Date: ${new Date(order.created_at).toLocaleString()}</li>
            </ul>
            <p>Please review this order in the admin panel.</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Press pack order submitted successfully',
      order: order.toJSON()
    });

  } catch (error) {
    console.error('Error creating press pack order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all press pack orders (admin only)
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
        LOWER(press_pack_name) LIKE $${paramIndex} OR
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
      SELECT * FROM press_pack_orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Build the count query
    const countQuery = `
      SELECT COUNT(*) as total FROM press_pack_orders
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
    const formattedOrders = orders.map(order => {
      // Parse additional data from message field
      let additionalData = {};
      let cleanMessage = order.customer_message || '';
      if (cleanMessage.includes('ADDITIONAL_DATA:')) {
        const parts = cleanMessage.split('ADDITIONAL_DATA:');
        cleanMessage = parts[0].trim();
        try {
          additionalData = JSON.parse(parts[1]);
          console.log('Parsed additional data:', additionalData); // Debug log
        } catch (e) {
          console.error('Error parsing additional data:', e);
          additionalData = {};
        }
      }

      // Handle press_release_type - could be string or array
      let pressReleaseType = '';
      if (additionalData.press_release_type) {
        if (Array.isArray(additionalData.press_release_type)) {
          pressReleaseType = additionalData.press_release_type.join(', ');
        } else {
          pressReleaseType = additionalData.press_release_type;
        }
      }

      return {
        id: order.id,
        // Map database fields to admin panel expected fields
        name: order.customer_name,
        email: order.customer_email,
        whatsapp_number: order.customer_phone,
        whatsapp_country_code: additionalData.whatsapp_country_code || '+91',
        calling_number: additionalData.calling_number || 'Not provided',
        calling_country_code: additionalData.calling_country_code || '+91',
        company_project_type: pressReleaseType,
        submitted_by: additionalData.submitted_by_type === 'agency' ? 'Agency' : 'Direct Company/Individual',
        press_release_name: 'Not specified', // Could be fetched from press releases table
        press_release_package: order.press_pack_name || 'Not specified',
        content_writing_assistance: additionalData.content_writing_assistance ? 'Yes' : 'No',
        status: order.status,
        admin_notes: order.admin_comments || '',
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Additional fields
        press_release_selection: order.press_pack_id,
        message: cleanMessage,
        company_registration_document: additionalData.company_registration_document,
        letter_of_authorisation: additionalData.letter_of_authorisation,
        image: additionalData.image,
        word_pdf_document: additionalData.word_pdf_document,
      };
    });

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
    console.error('Error fetching press pack orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get press pack order by ID (admin only)
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PressPackOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: order.toJSON() });

  } catch (error) {
    console.error('Error fetching press pack order:', error);
    res.status(500).json({
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Accept press pack order (admin only)
const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    // First, find the order
    const findResult = await pool.query('SELECT * FROM press_pack_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = findResult.rows[0];

    // Update order status to accepted
    const updateResult = await pool.query(
      'UPDATE press_pack_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['accepted', id]
    );

    const updatedOrder = updateResult.rows[0];

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        updatedOrder.customer_email,
        'Press Pack Order Accepted - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Your press pack order has been accepted!</h2>
            <p>Dear ${updatedOrder.customer_name},</p>
            <p>Great news! Your press pack order for <strong>${updatedOrder.press_pack_name}</strong> has been accepted.</p>
            <p>Our team will contact you shortly to discuss the press pack distribution and provide you with the necessary details.</p>
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
    console.error('Error accepting press pack order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order',
      error: error.message
    });
  }
};

// Reject press pack order (admin only)
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
    const findResult = await pool.query('SELECT * FROM press_pack_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = findResult.rows[0];

    // Update order status to rejected with admin notes
    const updateResult = await pool.query(
      'UPDATE press_pack_orders SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['rejected', admin_notes, id]
    );

    const updatedOrder = updateResult.rows[0];

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        updatedOrder.customer_email,
        'Press Pack Order Update - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Press Pack Order Update</h2>
            <p>Dear ${updatedOrder.customer_name},</p>
            <p>We regret to inform you that your press pack order for <strong>${updatedOrder.press_pack_name}</strong> could not be accepted at this time.</p>
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
    console.error('Error rejecting press pack order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order',
      error: error.message
    });
  }
};

// Complete press pack order (admin only)
const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    // First, find the order
    const findResult = await pool.query('SELECT * FROM press_pack_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = findResult.rows[0];

    // Update order status to completed
    const updateResult = await pool.query(
      'UPDATE press_pack_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['completed', id]
    );

    const updatedOrder = updateResult.rows[0];

    // Send email to customer
    try {
      await emailService.sendCustomEmail(
        updatedOrder.customer_email,
        'Press Pack Order Completed - News Marketplace',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #9C27B0;">Press Pack Order Completed!</h2>
            <p>Dear ${updatedOrder.customer_name},</p>
            <p>Your press pack order for <strong>${updatedOrder.press_pack_name}</strong> has been completed successfully.</p>
            <p>Thank you for choosing News Marketplace. We hope the press pack distribution was successful and met your expectations.</p>
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
    console.error('Error completing press pack order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete order',
      error: error.message
    });
  }
};

// Update press pack order (admin only)
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
    const findResult = await pool.query('SELECT * FROM press_pack_orders WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldOrder = findResult.rows[0];
    const oldStatus = oldOrder.status;

    // Build dynamic update query - only update status for now since remote DB may not have all columns
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Always update status if provided
    if (updateData.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(updateData.status);
      paramIndex++;
    }

    // Try to update admin_comments if it exists (won't fail if column doesn't exist)
    if (updateData.admin_notes !== undefined) {
      try {
        // Check if admin_comments column exists by attempting a simple query
        await pool.query('SELECT admin_comments FROM press_pack_orders LIMIT 1');
        updateFields.push(`admin_comments = $${paramIndex}`);
        values.push(updateData.admin_notes);
        paramIndex++;
      } catch (columnError) {
        // Column doesn't exist, skip it
        console.log('admin_comments column not found, skipping update');
      }
    }

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
      UPDATE press_pack_orders
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, values);
    const updatedOrder = updateResult.rows[0];

    // Send email notification if status changed
    if (updateData.status && updateData.status !== oldStatus) {
      await sendOrderStatusUpdateEmail(updatedOrder);
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating press pack order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// Send email notification when order status is updated
const sendOrderStatusUpdateEmail = async (order) => {
  try {
    let subject, statusMessage, statusColor;

    switch (order.status) {
      case 'approved':
        subject = 'Press Pack Order Approved - News Marketplace';
        statusMessage = 'Congratulations! Your press pack order has been approved.';
        statusColor = '#4CAF50';
        break;
      case 'rejected':
        subject = 'Press Pack Order Update - News Marketplace';
        statusMessage = 'We regret to inform you that your press pack order has been rejected.';
        statusColor = '#F44336';
        break;
      case 'completed':
        subject = 'Press Pack Order Completed - News Marketplace';
        statusMessage = 'Your press pack order has been successfully completed.';
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
          <p><strong>Press Pack:</strong> ${order.press_pack_name}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${order.status.toUpperCase()}</span></p>
          <p><strong>Price:</strong> $${order.price}</p>
        </div>

        ${order.admin_notes ? `
          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong>Admin Notes:</strong><br>
            ${order.admin_notes}
          </div>
        ` : ''}

        <p>If you have any questions, please contact our support team.</p>

        <p>Best regards,<br>News Marketplace Team</p>
      </div>
    `;

    await emailService.sendCustomEmail(order.customer_email, subject, html);

  } catch (error) {
    console.error('Error sending order status update email:', error);
    // Don't throw error as the order status was successfully updated
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