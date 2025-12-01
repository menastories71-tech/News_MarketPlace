const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/databaseSequelize');

const ThemeOrder = sequelize.define('ThemeOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  theme_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'themes',
      key: 'id'
    }
  },
  theme_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  customer_info: {
    type: DataTypes.JSON,
    allowNull: false
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'theme_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Static methods
ThemeOrder.findAllWithPagination = async function(filters = {}, limit = 10, offset = 0) {
  try {
    const whereClause = {};

    // Handle basic filters
    if (filters.status) whereClause.status = filters.status;
    if (filters.theme_id) whereClause.theme_id = filters.theme_id;
    if (filters.submitted_by) whereClause.submitted_by = filters.submitted_by;

    // Handle search filters
    if (filters[Op.or]) {
      whereClause[Op.or] = filters[Op.or];
    }

    console.log('Query filters:', whereClause);

    const { count, rows } = await this.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: []
    });

    return { count, rows };
  } catch (error) {
    console.error('Error in findAllWithPagination:', error);
    throw error;
  }
};

ThemeOrder.getTotalCount = async function(filters = {}) {
  const whereClause = {};

  if (filters.status) whereClause.status = filters.status;
  if (filters.theme_id) whereClause.theme_id = filters.theme_id;
  if (filters.submitted_by) whereClause.submitted_by = filters.submitted_by;

  return await this.count({ where: whereClause });
};

module.exports = ThemeOrder;