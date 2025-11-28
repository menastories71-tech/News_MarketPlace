const { query } = require('../config/database');

class Agency {
  constructor(data) {
    this.id = data.id;
    this.agency_name = data.agency_name;
    this.agency_legal_entity_name = data.agency_legal_entity_name;
    this.agency_website = data.agency_website;
    this.agency_ig = data.agency_ig;
    this.agency_linkedin = data.agency_linkedin;
    this.agency_facebook = data.agency_facebook;
    this.agency_address = data.agency_address;
    this.agency_owner_name = data.agency_owner_name;
    this.agency_owner_linkedin = data.agency_owner_linkedin;
    this.agency_founded_year = data.agency_founded_year;
    this.agency_owner_passport_nationality = data.agency_owner_passport_nationality;
    this.agency_document_incorporation_trade_license = data.agency_document_incorporation_trade_license;
    this.agency_document_tax_registration = data.agency_document_tax_registration;
    this.agency_bank_details = data.agency_bank_details;
    this.agency_owner_passport = data.agency_owner_passport;
    this.agency_owner_photo = data.agency_owner_photo;
    this.agency_email = data.agency_email;
    this.agency_contact_number = data.agency_contact_number;
    this.agency_owner_email = data.agency_owner_email;
    this.agency_owner_contact_number = data.agency_owner_contact_number;
    this.agency_owner_whatsapp_number = data.agency_owner_whatsapp_number;
    this.telegram = data.telegram;
    this.how_did_you_hear_about_us = data.how_did_you_hear_about_us;
    this.any_to_say = data.any_to_say;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validate agency data
  static validate(agencyData) {
    const errors = [];

    if (!agencyData.agency_name || typeof agencyData.agency_name !== 'string' || agencyData.agency_name.trim().length === 0) {
      errors.push('Agency name is required and must be a non-empty string');
    }

    if (agencyData.agency_email && !this.isValidEmail(agencyData.agency_email)) {
      errors.push('Agency email must be a valid email address');
    }

    if (agencyData.agency_owner_email && !this.isValidEmail(agencyData.agency_owner_email)) {
      errors.push('Agency owner email must be a valid email address');
    }

    if (agencyData.agency_founded_year && (!Number.isInteger(agencyData.agency_founded_year) || agencyData.agency_founded_year < 1800 || agencyData.agency_founded_year > new Date().getFullYear())) {
      errors.push('Agency founded year must be a valid integer between 1800 and current year');
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (agencyData.status && !validStatuses.includes(agencyData.status)) {
      errors.push('Status must be one of: pending, approved, rejected');
    }

    return errors;
  }

  // Simple email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Create a new agency
  static async create(agencyData) {
    const validationErrors = this.validate(agencyData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Only include fields that exist in the database table
    const allowedFields = [
      'id', 'agency_name', 'agency_legal_entity_name', 'agency_website', 'agency_ig', 'agency_linkedin', 'agency_facebook', 'agency_address', 'agency_owner_name', 'agency_owner_linkedin', 'agency_founded_year', 'agency_owner_passport_nationality', 'agency_document_incorporation_trade_license', 'agency_document_tax_registration', 'agency_bank_details', 'agency_owner_passport', 'agency_owner_photo', 'agency_email', 'agency_contact_number', 'agency_owner_email', 'agency_owner_contact_number', 'agency_owner_whatsapp_number', 'telegram', 'how_did_you_hear_about_us', 'any_to_say', 'status', 'created_at', 'updated_at'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (agencyData[field] !== undefined) {
        filteredData[field] = agencyData[field];
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO agencies (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new Agency(result.rows[0]);
  }

  // Find agency by ID
  static async findById(id) {
    const sql = 'SELECT * FROM agencies WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Agency(result.rows[0]) : null;
  }

  // Find all agencies with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM agencies WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY created_at DESC';

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
    return result.rows.map(row => new Agency(row));
  }

  // Find agencies by status
  static async findByStatus(status) {
    const sql = 'SELECT * FROM agencies WHERE status = $1 ORDER BY created_at DESC';
    const result = await query(sql, [status]);
    return result.rows.map(row => new Agency(row));
  }

  // Update agency
  async update(updateData) {
    const validationErrors = Agency.validate({ ...this, ...updateData });
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

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
    const sql = `UPDATE agencies SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete agency
  async delete() {
    const sql = 'DELETE FROM agencies WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      agency_name: this.agency_name,
      agency_legal_entity_name: this.agency_legal_entity_name,
      agency_website: this.agency_website,
      agency_ig: this.agency_ig,
      agency_linkedin: this.agency_linkedin,
      agency_facebook: this.agency_facebook,
      agency_address: this.agency_address,
      agency_owner_name: this.agency_owner_name,
      agency_owner_linkedin: this.agency_owner_linkedin,
      agency_founded_year: this.agency_founded_year,
      agency_owner_passport_nationality: this.agency_owner_passport_nationality,
      agency_document_incorporation_trade_license: this.agency_document_incorporation_trade_license,
      agency_document_tax_registration: this.agency_document_tax_registration,
      agency_bank_details: this.agency_bank_details,
      agency_owner_passport: this.agency_owner_passport,
      agency_owner_photo: this.agency_owner_photo,
      agency_email: this.agency_email,
      agency_contact_number: this.agency_contact_number,
      agency_owner_email: this.agency_owner_email,
      agency_owner_contact_number: this.agency_owner_contact_number,
      agency_owner_whatsapp_number: this.agency_owner_whatsapp_number,
      telegram: this.telegram,
      how_did_you_hear_about_us: this.how_did_you_hear_about_us,
      any_to_say: this.any_to_say,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Agency;
