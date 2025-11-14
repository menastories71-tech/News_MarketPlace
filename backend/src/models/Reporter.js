const { query } = require('../config/database');

class Reporter {
  constructor(data) {
    this.id = data.id;
    this.function_department = data.function_department;
    this.position = data.position;
    this.name = data.name;
    this.gender = data.gender;
    this.email = data.email;
    this.whatsapp = data.whatsapp;
    this.publication_name = data.publication_name;
    this.website_url = data.website_url;
    this.linkedin = data.linkedin;
    this.instagram = data.instagram;
    this.facebook = data.facebook;
    this.publication_industry = data.publication_industry;
    this.publication_location = data.publication_location;
    this.niche_industry = data.niche_industry;
    this.minimum_expectation_usd = data.minimum_expectation_usd;
    this.articles_per_month = data.articles_per_month;
    this.turnaround_time = data.turnaround_time;
    this.company_allowed_in_title = data.company_allowed_in_title || false;
    this.individual_allowed_in_title = data.individual_allowed_in_title || false;
    this.subheading_allowed = data.subheading_allowed || false;
    this.sample_url = data.sample_url;
    this.will_change_wordings = data.will_change_wordings || false;
    this.article_placed_permanently = data.article_placed_permanently || false;
    this.article_can_be_deleted = data.article_can_be_deleted || false;
    this.article_can_be_modified = data.article_can_be_modified || false;
    this.terms_accepted = data.terms_accepted || false;
    this.how_heard_about_us = data.how_heard_about_us;
    this.message = data.message;
    this.status = data.status || 'pending';
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.approved_at = data.approved_at;
    this.approved_by = data.approved_by;
    this.rejected_at = data.rejected_at;
    this.rejected_by = data.rejected_by;
    this.rejection_reason = data.rejection_reason;
    this.admin_comments = data.admin_comments;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new reporter
  static async create(reporterData) {
    const sql = `
      INSERT INTO reporters (
        function_department, position, name, gender, email, whatsapp,
        publication_name, website_url, linkedin, instagram, facebook,
        publication_industry, publication_location, niche_industry,
        minimum_expectation_usd, articles_per_month, turnaround_time,
        company_allowed_in_title, individual_allowed_in_title, subheading_allowed,
        sample_url, will_change_wordings, article_placed_permanently,
        article_can_be_deleted, article_can_be_modified, terms_accepted,
        how_heard_about_us, message, submitted_by, submitted_by_admin, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31
      )
      RETURNING *
    `;

    const values = [
      reporterData.function_department,
      reporterData.position,
      reporterData.name,
      reporterData.gender,
      reporterData.email,
      reporterData.whatsapp,
      reporterData.publication_name,
      reporterData.website_url,
      reporterData.linkedin,
      reporterData.instagram,
      reporterData.facebook,
      reporterData.publication_industry,
      reporterData.publication_location,
      reporterData.niche_industry,
      reporterData.minimum_expectation_usd,
      reporterData.articles_per_month,
      reporterData.turnaround_time,
      reporterData.company_allowed_in_title || false,
      reporterData.individual_allowed_in_title || false,
      reporterData.subheading_allowed || false,
      reporterData.sample_url,
      reporterData.will_change_wordings || false,
      reporterData.article_placed_permanently || false,
      reporterData.article_can_be_deleted || false,
      reporterData.article_can_be_modified || false,
      reporterData.terms_accepted || false,
      reporterData.how_heard_about_us,
      reporterData.message,
      reporterData.submitted_by,
      reporterData.submitted_by_admin,
      reporterData.status || 'pending'
    ];

    const result = await query(sql, values);
    return new Reporter(result.rows[0]);
  }

  // Find reporter by ID
  static async findById(id) {
    const sql = 'SELECT * FROM reporters WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Reporter(result.rows[0]) : null;
  }

  // Find reporter by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM reporters WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] ? new Reporter(result.rows[0]) : null;
  }

  // Find all reporters with filtering and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = 10, offset = 0) {
    let sql = `
      SELECT r.*,
             u.first_name as submitted_by_first_name,
             u.last_name as submitted_by_last_name,
             a.first_name as submitted_by_admin_first_name,
             a.last_name as submitted_by_admin_last_name,
             aa.first_name as approved_by_first_name,
             aa.last_name as approved_by_last_name,
             ra.first_name as rejected_by_first_name,
             ra.last_name as rejected_by_last_name
      FROM reporters r
      LEFT JOIN users u ON r.submitted_by = u.id
      LEFT JOIN admins a ON r.submitted_by_admin = a.id
      LEFT JOIN admins aa ON r.approved_by = aa.id
      LEFT JOIN admins ra ON r.rejected_by = ra.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      sql += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.function_department) {
      sql += ` AND r.function_department = $${paramCount}`;
      values.push(filters.function_department);
      paramCount++;
    }

    if (filters.position) {
      sql += ` AND r.position = $${paramCount}`;
      values.push(filters.position);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND r.is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows.map(row => new Reporter(row));
  }

  // Find reporters by user ID (for user dashboard)
  static async findByUserId(userId, limit = 10, offset = 0) {
    const sql = `
      SELECT * FROM reporters
      WHERE submitted_by = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    return result.rows.map(row => new Reporter(row));
  }

  // Find reporters by user ID with filters (for user dashboard)
  static async findByUserIdWithFilters(filters, searchSql = '', searchValues = [], limit = 10, offset = 0) {
    let sql = `
      SELECT * FROM reporters r
      WHERE r.submitted_by = $1 AND r.is_active = true
    `;

    const values = [filters.submitted_by];
    let paramCount = 2;

    // Add status filter
    if (filters.status) {
      sql += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql.replace(/\$\d+/g, (match) => {
        const num = parseInt(match.slice(1));
        return `$${paramCount + num - 1}`;
      });
      values.push(...searchValues);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows.map(row => new Reporter(row));
  }

  // Get deleted reporters (admin only)
  static async getDeleted(filters = {}, searchSql = '', searchValues = [], limit = 10, offset = 0) {
    let sql = `
      SELECT r.*,
             u.first_name as submitted_by_first_name,
             u.last_name as submitted_by_last_name,
             a.first_name as submitted_by_admin_first_name,
             a.last_name as submitted_by_admin_last_name
      FROM reporters r
      LEFT JOIN users u ON r.submitted_by = u.id
      LEFT JOIN admins a ON r.submitted_by_admin = a.id
      WHERE r.is_active = false
    `;

    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      sql += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows.map(row => new Reporter(row));
  }

  // Update reporter
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
    const sql = `UPDATE reporters SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Soft delete reporter
  async delete() {
    await this.update({ is_active: false });
  }

  // Get full name (alias for name field)
  get fullName() {
    return this.name || '';
  }

  // Convert to JSON (exclude sensitive data if needed)
  toJSON() {
    const { ...reporterData } = this;
    return reporterData;
  }

  // Get count for pagination
  static async getCount(filters = {}, searchSql = '', searchValues = []) {
    let sql = 'SELECT COUNT(*) as total FROM reporters r WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      sql += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.function_department) {
      sql += ` AND r.function_department = $${paramCount}`;
      values.push(filters.function_department);
      paramCount++;
    }

    if (filters.position) {
      sql += ` AND r.position = $${paramCount}`;
      values.push(filters.position);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND r.is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].total);
  }

  // Get count for user submissions with filters
  static async getUserCount(userId, filters = {}, searchSql = '', searchValues = []) {
    let sql = 'SELECT COUNT(*) as total FROM reporters r WHERE r.submitted_by = $1 AND r.is_active = true';
    const values = [userId];
    let paramCount = 2;

    // Add status filter
    if (filters.status) {
      sql += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql.replace(/\$\d+/g, (match) => {
        const num = parseInt(match.slice(1));
        return `$${paramCount + num - 1}`;
      });
      values.push(...searchValues);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].total);
  }
}

module.exports = Reporter;