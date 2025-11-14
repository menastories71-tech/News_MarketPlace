const { query } = require('../config/database');

class AffiliateEnquiry {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.gender = data.gender;
    this.email = data.email;
    this.whatsapp = data.whatsapp;
    this.linkedin = data.linkedin;
    this.ig = data.ig;
    this.facebook = data.facebook;
    this.passport_nationality = data.passport_nationality;
    this.current_residency = data.current_residency;
    this.how_did_you_hear = data.how_did_you_hear;
    this.message = data.message;
    this.referral_code = data.referral_code;
    this.terms_accepted = data.terms_accepted;
    this.captcha_verified = data.captcha_verified;
    this.submitted_at = data.submitted_at;
    this.status = data.status || 'new';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validate affiliate enquiry data
  static validate(enquiryData) {
    const errors = [];

    // Required fields
    if (!enquiryData.name || typeof enquiryData.name !== 'string' || enquiryData.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!enquiryData.email || !this.isValidEmail(enquiryData.email)) {
      errors.push('Email is required and must be a valid email address');
    }

    if (enquiryData.terms_accepted !== true) {
      errors.push('Terms and conditions must be accepted');
    }

    if (enquiryData.captcha_verified !== true) {
      errors.push('Captcha verification is required');
    }

    // Optional string fields
    const stringFields = [
      'gender', 'whatsapp', 'linkedin', 'ig', 'facebook', 'passport_nationality',
      'current_residency', 'how_did_you_hear', 'message', 'referral_code'
    ];

    stringFields.forEach(field => {
      if (enquiryData[field] !== undefined && typeof enquiryData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Boolean fields
    if (enquiryData.terms_accepted !== undefined && typeof enquiryData.terms_accepted !== 'boolean') {
      errors.push('Terms accepted must be a boolean');
    }

    if (enquiryData.captcha_verified !== undefined && typeof enquiryData.captcha_verified !== 'boolean') {
      errors.push('Captcha verified must be a boolean');
    }

    // Status
    const validStatuses = ['new', 'viewed'];
    if (enquiryData.status && !validStatuses.includes(enquiryData.status)) {
      errors.push('Status must be one of: new, viewed');
    }

    return errors;
  }

  // Simple email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate referral code
  static generateReferralCode() {
    return 'AFF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Create a new affiliate enquiry
  static async create(enquiryData) {
    const validationErrors = this.validate(enquiryData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Generate referral code if not provided
    if (!enquiryData.referral_code) {
      enquiryData.referral_code = this.generateReferralCode();
    }

    const allowedFields = [
      'name', 'gender', 'email', 'whatsapp', 'linkedin', 'ig', 'facebook',
      'passport_nationality', 'current_residency', 'how_did_you_hear', 'message',
      'referral_code', 'terms_accepted', 'captcha_verified', 'submitted_at', 'status'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (enquiryData[field] !== undefined) {
        filteredData[field] = enquiryData[field];
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO affiliate_enquiries (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new AffiliateEnquiry(result.rows[0]);
  }

  // Find enquiry by ID
  static async findById(id) {
    const sql = 'SELECT * FROM affiliate_enquiries WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new AffiliateEnquiry(result.rows[0]) : null;
  }

  // Find all enquiries
  static async findAll() {
    const sql = 'SELECT * FROM affiliate_enquiries ORDER BY submitted_at DESC';
    const result = await query(sql);
    return result.rows.map(row => new AffiliateEnquiry(row));
  }

  // Update enquiry
  async update(updateData) {
    const validationErrors = AffiliateEnquiry.validate({ ...this, ...updateData });
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
    const sql = `UPDATE affiliate_enquiries SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete enquiry
  async delete() {
    const sql = 'DELETE FROM affiliate_enquiries WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      email: this.email,
      whatsapp: this.whatsapp,
      linkedin: this.linkedin,
      ig: this.ig,
      facebook: this.facebook,
      passport_nationality: this.passport_nationality,
      current_residency: this.current_residency,
      how_did_you_hear: this.how_did_you_hear,
      message: this.message,
      referral_code: this.referral_code,
      terms_accepted: this.terms_accepted,
      captcha_verified: this.captcha_verified,
      submitted_at: this.submitted_at,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = AffiliateEnquiry;