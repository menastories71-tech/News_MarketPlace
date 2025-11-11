const { query } = require('../config/database');

class Powerlist {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.whatsapp = data.whatsapp;
    this.calling_number = data.calling_number;
    this.telegram_username = data.telegram_username;
    this.direct_number = data.direct_number;
    this.gender = data.gender;
    this.date_of_birth = data.date_of_birth;
    this.dual_passport = data.dual_passport || false;
    this.passport_nationality_one = data.passport_nationality_one;
    this.passport_nationality_two = data.passport_nationality_two;
    this.uae_permanent_residence = data.uae_permanent_residence || false;
    this.other_permanent_residency = data.other_permanent_residency || false;
    this.other_residency_mention = data.other_residency_mention;
    this.current_company = data.current_company;
    this.position = data.position;
    this.linkedin_url = data.linkedin_url;
    this.instagram_url = data.instagram_url;
    this.facebook_url = data.facebook_url;
    this.personal_website = data.personal_website;
    this.company_website = data.company_website;
    this.company_industry = data.company_industry;
    this.filling_on_behalf = data.filling_on_behalf || false;
    this.behalf_name = data.behalf_name;
    this.behalf_position = data.behalf_position;
    this.behalf_relation = data.behalf_relation;
    this.behalf_gender = data.behalf_gender;
    this.behalf_email = data.behalf_email;
    this.behalf_contact_number = data.behalf_contact_number;
    this.captcha_verified = data.captcha_verified || false;
    this.agree_terms = data.agree_terms;
    this.message = data.message;
    this.submitted_by = data.submitted_by;
    this.status = data.status || 'pending';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new powerlist entry
  static async create(powerlistData) {
    // Validate data
    const validation = Powerlist.validate(powerlistData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      name, email, whatsapp, calling_number, telegram_username, direct_number,
      gender, date_of_birth, dual_passport, passport_nationality_one, passport_nationality_two,
      uae_permanent_residence, other_permanent_residency, other_residency_mention,
      current_company, position, linkedin_url, instagram_url, facebook_url,
      personal_website, company_website, company_industry, filling_on_behalf,
      behalf_name, behalf_position, behalf_relation, behalf_gender, behalf_email,
      behalf_contact_number, captcha_verified, agree_terms, message, submitted_by
    } = powerlistData;

    const sql = `
      INSERT INTO powerlists (
        name, email, whatsapp, calling_number, telegram_username, direct_number,
        gender, date_of_birth, dual_passport, passport_nationality_one, passport_nationality_two,
        uae_permanent_residence, other_permanent_residency, other_residency_mention,
        current_company, position, linkedin_url, instagram_url, facebook_url,
        personal_website, company_website, company_industry, filling_on_behalf,
        behalf_name, behalf_position, behalf_relation, behalf_gender, behalf_email,
        behalf_contact_number, captcha_verified, agree_terms, message, submitted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
      RETURNING *
    `;

    const values = [
      name, email, whatsapp, calling_number, telegram_username, direct_number,
      gender, date_of_birth, dual_passport, passport_nationality_one, passport_nationality_two,
      uae_permanent_residence, other_permanent_residency, other_residency_mention,
      current_company, position, linkedin_url, instagram_url, facebook_url,
      personal_website, company_website, company_industry, filling_on_behalf,
      behalf_name, behalf_position, behalf_relation, behalf_gender, behalf_email,
      behalf_contact_number, captcha_verified, agree_terms, message, submitted_by
    ];

    const result = await query(sql, values);
    return new Powerlist(result.rows[0]);
  }

  // Find powerlist by ID
  static async findById(id) {
    const sql = 'SELECT * FROM powerlists WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Powerlist(result.rows[0]) : null;
  }

  // Find powerlist by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM powerlists WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] ? new Powerlist(result.rows[0]) : null;
  }

  // Find all powerlists with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT p.*, u.first_name as submitted_by_first_name, u.last_name as submitted_by_last_name FROM powerlists p LEFT JOIN users u ON p.submitted_by = u.id WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND p.is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.submitted_by) {
      sql += ` AND p.submitted_by = $${paramCount}`;
      values.push(filters.submitted_by);
      paramCount++;
    }

    if (filters.gender) {
      sql += ` AND p.gender = $${paramCount}`;
      values.push(filters.gender);
      paramCount++;
    }

    if (filters.company_industry) {
      sql += ` AND p.company_industry = $${paramCount}`;
      values.push(filters.company_industry);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY p.created_at DESC';

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
    return result.rows.map(row => new Powerlist(row));
  }

  // Search powerlists
  static async search(searchTerm, filters = {}, limit = null, offset = null) {
    let searchSql = '';
    const searchValues = [];

    if (searchTerm) {
      searchSql = ` AND (p.name ILIKE $${searchValues.length + 1} OR p.email ILIKE $${searchValues.length + 2} OR p.current_company ILIKE $${searchValues.length + 3} OR p.position ILIKE $${searchValues.length + 4})`;
      const searchPattern = `%${searchTerm}%`;
      searchValues.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    return await Powerlist.findAll(filters, searchSql, searchValues, limit, offset);
  }

  // Update powerlist
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
    const sql = `UPDATE powerlists SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete powerlist (soft delete)
  async delete() {
    return await this.update({ is_active: false });
  }

  // Get user who submitted this powerlist
  async getUser() {
    const User = require('./User');
    return await User.findById(this.submitted_by);
  }

  // Get associated publications
  async getPublications() {
    const sql = `
      SELECT pub.* FROM publications pub
      INNER JOIN powerlist_publications pp ON pub.id = pp.publication_id
      WHERE pp.powerlist_id = $1 AND pub.is_active = true
      ORDER BY pp.created_at DESC
    `;
    const result = await query(sql, [this.id]);
    const Publication = require('./Publication');
    return result.rows.map(row => new Publication(row));
  }

  // Add publication association
  async addPublication(publicationId) {
    const sql = 'INSERT INTO powerlist_publications (powerlist_id, publication_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await query(sql, [this.id, publicationId]);
  }

  // Remove publication association
  async removePublication(publicationId) {
    const sql = 'DELETE FROM powerlist_publications WHERE powerlist_id = $1 AND publication_id = $2';
    await query(sql, [this.id, publicationId]);
  }

  // Validation
  static validate(powerlistData) {
    const errors = [];

    if (!powerlistData.name || powerlistData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!powerlistData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(powerlistData.email)) {
      errors.push('Valid email is required');
    }

    if (!powerlistData.agree_terms) {
      errors.push('Agreement to terms is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON (exclude sensitive data if any)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      whatsapp: this.whatsapp,
      calling_number: this.calling_number,
      telegram_username: this.telegram_username,
      direct_number: this.direct_number,
      gender: this.gender,
      date_of_birth: this.date_of_birth,
      dual_passport: this.dual_passport,
      passport_nationality_one: this.passport_nationality_one,
      passport_nationality_two: this.passport_nationality_two,
      uae_permanent_residence: this.uae_permanent_residence,
      other_permanent_residency: this.other_permanent_residency,
      other_residency_mention: this.other_residency_mention,
      current_company: this.current_company,
      position: this.position,
      linkedin_url: this.linkedin_url,
      instagram_url: this.instagram_url,
      facebook_url: this.facebook_url,
      personal_website: this.personal_website,
      company_website: this.company_website,
      company_industry: this.company_industry,
      filling_on_behalf: this.filling_on_behalf,
      behalf_name: this.behalf_name,
      behalf_position: this.behalf_position,
      behalf_relation: this.behalf_relation,
      behalf_gender: this.behalf_gender,
      behalf_email: this.behalf_email,
      behalf_contact_number: this.behalf_contact_number,
      captcha_verified: this.captcha_verified,
      agree_terms: this.agree_terms,
      message: this.message,
      submitted_by: this.submitted_by,
      submitted_by_first_name: this.submitted_by_first_name,
      submitted_by_last_name: this.submitted_by_last_name,
      status: this.status,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Helper method to get total count for pagination
  static async getTotalCount(filters, searchSql, searchValues) {
    try {
      const { query } = require('../config/database');
      let sql = 'SELECT COUNT(*) as total FROM powerlists p WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        sql += ` AND p.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.is_active !== undefined) {
        sql += ` AND p.is_active = $${paramCount}`;
        values.push(filters.is_active);
        paramCount++;
      }

      if (filters.submitted_by) {
        sql += ` AND p.submitted_by = $${paramCount}`;
        values.push(filters.submitted_by);
        paramCount++;
      }

      if (filters.gender) {
        sql += ` AND p.gender = $${paramCount}`;
        values.push(filters.gender);
        paramCount++;
      }

      if (filters.company_industry) {
        sql += ` AND p.company_industry = $${paramCount}`;
        values.push(filters.company_industry);
        paramCount++;
      }

      if (searchSql) {
        sql += searchSql;
        values.push(...searchValues);
      }

      const result = await query(sql, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  }

  // Helper method to get search total count
  static async getSearchTotalCount(searchTerm, filters) {
    try {
      let sql = 'SELECT COUNT(*) as total FROM powerlists p WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        sql += ` AND p.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.is_active !== undefined) {
        sql += ` AND p.is_active = $${paramCount}`;
        values.push(filters.is_active);
        paramCount++;
      }

      if (filters.submitted_by) {
        sql += ` AND p.submitted_by = $${paramCount}`;
        values.push(filters.submitted_by);
        paramCount++;
      }

      if (filters.gender) {
        sql += ` AND p.gender = $${paramCount}`;
        values.push(filters.gender);
        paramCount++;
      }

      if (filters.company_industry) {
        sql += ` AND p.company_industry = $${paramCount}`;
        values.push(filters.company_industry);
        paramCount++;
      }

      if (searchTerm) {
        sql += ` AND (p.name ILIKE $${paramCount} OR p.email ILIKE $${paramCount + 1} OR p.current_company ILIKE $${paramCount + 2})`;
        const searchPattern = `%${searchTerm}%`;
        values.push(searchPattern, searchPattern, searchPattern);
      }

      const { query } = require('../config/database');
      const result = await query(sql, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting search total count:', error);
      return 0;
    }
  }
}

module.exports = Powerlist;