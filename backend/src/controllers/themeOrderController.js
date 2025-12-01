const ThemeOrder = require('../models/ThemeOrder');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

class ThemeOrderController {
  // Validation rules
  createValidation = [
    body('themeId').isInt().withMessage('Valid theme ID is required'),
    body('themeName').trim().isLength({ min: 1 }).withMessage('Theme name is required'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('customerInfo').isObject().withMessage('Customer information is required'),
    body('customerInfo.fullName').trim().isLength({ min: 1 }).withMessage('Full name is required'),
    body('customerInfo.email').isEmail().withMessage('Valid email is required'),
    body('customerInfo.phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
    body('orderDate').optional().isISO8601().withMessage('Valid order date is required')
  ];

  updateValidation = [
    body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ];

  // Create a new theme order
  async create(req, res) {
    try {
      console.log('Creating theme order with data:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const orderData = {
        theme_id: req.body.themeId,
        theme_name: req.body.themeName,
        price: req.body.price ? parseFloat(req.body.price) : null,
        customer_info: req.body.customerInfo,
        order_date: req.body.orderDate || new Date(),
        submitted_by: req.user?.userId || null,
        status: 'pending'
      };

      console.log('Order data prepared:', orderData);

      const order = await ThemeOrder.create(orderData);
      console.log('Order created successfully:', order.id);

      res.status(201).json({
        message: 'Theme order created successfully',
        order: order.toJSON()
      });
    } catch (error) {
      console.error('Create theme order error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Get all theme orders with pagination and filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        theme_id,
        submitted_by,
        search
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (theme_id) filters.theme_id = theme_id;
      if (submitted_by) filters.submitted_by = submitted_by;

      // Add search functionality
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        filters[Op.or] = [
          { theme_name: { [Op.iLike]: searchTerm } },
          { 'customer_info.fullName': { [Op.iLike]: searchTerm } },
          { 'customer_info.email': { [Op.iLike]: searchTerm } }
        ];
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { count, rows } = await ThemeOrder.findAllWithPagination(filters, parseInt(limit), offset);

      res.json({
        orders: rows.map(order => order.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get theme orders error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get theme order by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await ThemeOrder.findByPk(id);

      if (!order) {
        return res.status(404).json({ error: 'Theme order not found' });
      }

      // Check permissions (admin or order owner)
      if (!req.admin && order.submitted_by !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ order: order.toJSON() });
    } catch (error) {
      console.error('Get theme order by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update theme order
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
      const order = await ThemeOrder.findByPk(id);

      if (!order) {
        return res.status(404).json({ error: 'Theme order not found' });
      }

      // Check permissions (admin only for status updates)
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const updatedOrder = await order.update(req.body);
      res.json({
        message: 'Theme order updated successfully',
        order: updatedOrder.toJSON()
      });
    } catch (error) {
      console.error('Update theme order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete theme order
  async delete(req, res) {
    try {
      const { id } = req.params;
      const order = await ThemeOrder.findByPk(id);

      if (!order) {
        return res.status(404).json({ error: 'Theme order not found' });
      }

      // Check permissions (admin only)
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await order.destroy();
      res.json({ message: 'Theme order deleted successfully' });
    } catch (error) {
      console.error('Delete theme order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const filters = { submitted_by: userId };
      const offset = (page - 1) * limit;
      const { count, rows } = await ThemeOrder.findAllWithPagination(filters, limit, offset);

      res.json({
        orders: rows.map(order => order.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get user theme orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ThemeOrderController();