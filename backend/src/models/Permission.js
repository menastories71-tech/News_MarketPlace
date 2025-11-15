const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseSequelize');
const Role = require('./Role');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resource: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['name'] },
    { fields: ['resource'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
  ],
});

// Class methods
Permission.findByName = async function(name) {
  return await this.findOne({ where: { name } });
};

Permission.findByResource = async function(resource) {
  return await this.findAll({ where: { resource } });
};

Permission.findByResourceAndAction = async function(resource, action) {
  return await this.findOne({ where: { resource, action } });
};

// Instance methods
Permission.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = Permission;