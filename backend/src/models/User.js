const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.is_verified = data.is_verified || false;
    this.is_active = data.is_active || true;
    this.role = data.role || 'user';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.last_login = data.last_login;
    this.otp_code = data.otp_code;
    this.otp_expires_at = data.otp_expires_at;
  }

  // Create a new user
  static async create(userData) {
    const { email, password, first_name, last_name } = userData;
    const password_hash = await bcrypt.hash(password, 12);

    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await query(sql, [email, password_hash, first_name, last_name]);
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // Find all users
  static async findAll() {
    const sql = 'SELECT id, email, first_name, last_name, is_verified, is_active, role, created_at, updated_at, last_login FROM users ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows.map(row => new User(row));
  }

  // Update user
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
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Set OTP
  async setOTP(code, expiresInMinutes = 10) {
    const otp_expires_at = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await this.update({ otp_code: code, otp_expires_at });
  }

  // Check if OTP exists and is valid
  hasValidOTP() {
    return this.otp_code && this.otp_expires_at && new Date() < new Date(this.otp_expires_at);
  }

  // Verify OTP
  async verifyOTP(code) {
    if (!this.otp_code || !this.otp_expires_at) return false;

    const isExpired = new Date() > new Date(this.otp_expires_at);
    if (isExpired) return false;

    const isValid = this.otp_code === code;
    if (isValid) {
      await this.update({ otp_code: null, otp_expires_at: null, is_verified: true });
    }
    return isValid;
  }

  // Clear OTP
  async clearOTP() {
    await this.update({ otp_code: null, otp_expires_at: null });
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
    const { password_hash, otp_code, otp_expires_at, ...userData } = this;
    return userData;
  }
}

module.exports = User;