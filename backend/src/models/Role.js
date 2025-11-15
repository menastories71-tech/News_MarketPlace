const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseSequelize');

const Role = sequelize.define('Role', {
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
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['name'] },
    { fields: ['created_at'] },
  ],
});

// Class methods
Role.findByName = async function(name) {
  return await this.findOne({ where: { name } });
};

// Instance methods
Role.prototype.hasPermission = async function(permissionName) {
  const permissions = await this.getPermissions();
  return permissions.some(permission => permission.name === permissionName);
};

Role.prototype.hasPermissionByResourceAction = async function(resource, action) {
  const permissions = await this.getPermissions();
  return permissions.some(permission => permission.resource === resource && permission.action === action);
};

// Note: getPermissions, addPermission, removePermission, and setPermissions
// methods are automatically provided by Sequelize through the belongsToMany association

Role.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = Role;