const Role = require('./Role');
const Permission = require('./Permission');

// Define associations after both models are loaded
Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
  timestamps: false, // Junction table doesn't have updated_at column
});

Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
  timestamps: false, // Junction table doesn't have updated_at column
});

module.exports = { Role, Permission };