const { query } = require('../config/database');

class PowerlistNominationSubmission {
  constructor(data) {
    this.id = data.id;
    this.powerlist_nomination_id = data.powerlist_nomination_id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.additional_message = data.additional_message;
    this.status = data.status || 'pending';
    this.submitted_at = data.submitted_at;
    this.updated_at = data.updated_at;
  }

  // Create a new submission
  static async create(submissionData) {
    // Validate data
    const validation = PowerlistNominationSubmission.validate(submissionData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      powerlist_nomination_id, full_name, email, phone, additional_message, status
    } = submissionData;

    const sql = `
      INSERT INTO powerlist_nomination_submissions (
        powerlist_nomination_id, full_name, email, phone, additional_message, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      powerlist_nomination_id, full_name, email, phone, additional_message, status || 'pending'
    ];

    const result = await query(sql, values);
    return new PowerlistNominationSubmission(result.rows[0]);
  }

  // Find submission by ID
  static async findById(id) {
    const sql = 'SELECT * FROM powerlist_nomination_submissions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PowerlistNominationSubmission(result.rows[0]) : null;
  }

  // Find all submissions with filters and pagination
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM powerlist_nomination_submissions WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.powerlist_nomination_id) {
      sql += ` AND powerlist_nomination_id = $${paramCount}`;
      values.push(filters.powerlist_nomination_id);
      paramCount++;
    }

    if (filters.email) {
      sql += ` AND email = $${paramCount}`;
      values.push(filters.email);
      paramCount++;
    }

    sql += ' ORDER BY submitted_at DESC';

    // Add pagination
    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(limit);
      paramCount++;
    }

    if (offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(offset);
      paramCount++;
    }

    const result = await query(sql, values);
    return result.rows.map(row => new PowerlistNominationSubmission(row));
  }

  // Update submission
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
    const sql = `UPDATE powerlist_nomination_submissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete submission
  async delete() {
    const sql = 'DELETE FROM powerlist_nomination_submissions WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Validation
  static validate(submissionData) {
    const errors = [];

    if (!submissionData.powerlist_nomination_id) {
      errors.push('Powerlist nomination ID is required');
    }

    if (!submissionData.full_name || submissionData.full_name.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!submissionData.email || submissionData.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submissionData.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      powerlist_nomination_id: this.powerlist_nomination_id,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      additional_message: this.additional_message,
      status: this.status,
      submitted_at: this.submitted_at,
      updated_at: this.updated_at
    };
  }

  // Helper method to get total count for pagination
  static async getTotalCount(filters = {}) {
    try {
      let sql = 'SELECT COUNT(*) as total FROM powerlist_nomination_submissions WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        sql += ` AND status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.powerlist_nomination_id) {
        sql += ` AND powerlist_nomination_id = $${paramCount}`;
        values.push(filters.powerlist_nomination_id);
        paramCount++;
      }

      if (filters.email) {
        sql += ` AND email = $${paramCount}`;
        values.push(filters.email);
        paramCount++;
      }

      const result = await query(sql, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  }
}

module.exports = PowerlistNominationSubmission;