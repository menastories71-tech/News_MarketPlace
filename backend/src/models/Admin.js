const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const Role = require('./Role');

class Admin {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.role = data.role || data.old_role || 'other'; // backward compatibility
    this.old_role = data.old_role; // keep for migration
    this.role_id = data.role_id;
    this.is_active = data.is_active || true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.last_login = data.last_login;
  }

  // Create a new admin
  static async create(adminData) {
    const { email, password, first_name, last_name, role } = adminData;
    const password_hash = await bcrypt.hash(password, 12);

    const sql = `
      INSERT INTO admins (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [email, password_hash, first_name, last_name, role]);
    return new Admin(result.rows[0]);
  }

  // Find admin by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM admins WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] ? new Admin(result.rows[0]) : null;
  }

  // Find admin by ID
  static async findById(id) {
    const sql = 'SELECT * FROM admins WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Admin(result.rows[0]) : null;
  }

  // Update admin
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE admins SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Update last login
  async updateLastLogin() {
    await this.update({ last_login: new Date() });
  }

  // Get full name
  get fullName() {
    const first = this.first_name || '';
    const last = this.last_name || '';
    return `${first} ${last}`.trim();
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_hash, ...adminData } = this;
    return adminData;
  }

  // Check if admin has specific role
  hasRole(role) {
    return this.role === role;
  }

  // Check if admin has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.role);
  }

  // Get role hierarchy level (for permission checks)
  getRoleLevel() {
    const roleLevels = {
      'super_admin': 5,
      'content_manager': 4,
      'editor': 3,
      'registered_user': 2,
      'agency': 1,
      'other': 0
    };
    return roleLevels[this.role] || 0;
  }

  // Get associated Role model (for new RBAC system)
  async getRole() {
    if (this.role_id) {
      return await Role.findByPk(this.role_id, { include: ['permissions'] });
    }
    return null;
  }

  // Check if admin has specific permission (new RBAC system)
  async hasPermission(permissionName) {
    const role = await this.getRole();
    if (role) {
      return await role.hasPermission(permissionName);
    }
    // Fallback to old role-based logic
    return this.hasRole(this.role);
  }

  // Check if admin has permission by resource and action
  async hasPermissionByResourceAction(resource, action) {
    const role = await this.getRole();
    if (role) {
      return await role.hasPermissionByResourceAction(resource, action);
    }
    // Fallback to old role-based logic (simplified)
    return this.getRoleLevel() >= 3; // editor and above
  }

  // Get all permissions for this admin
  async getPermissions() {
    const role = await this.getRole();
    if (role) {
      return await role.getPermissions();
    }
    return [];
  }
}

module.exports = Admin;