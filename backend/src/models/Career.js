const { query } = require('../config/database');

class Career {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.company = data.company;
    this.location = data.location;
    this.salary = data.salary;
    this.type = data.type;
    this.status = data.status || 'pending';
    this.submitted_by = data.submitted_by;
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

  // Create a new career
  static async create(careerData) {
    const sql = `
      INSERT INTO careers (
        title, description, company, location, salary, type, status, submitted_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING *
    `;

    const values = [
      careerData.title,
      careerData.description,
      careerData.company,
      careerData.location,
      careerData.salary,
      careerData.type,
      careerData.status || 'pending',
      careerData.submitted_by
    ];

    const result = await query(sql, values);
    return new Career(result.rows[0]);
  }

  // Find career by ID
  static async findById(id) {
    const sql = 'SELECT * FROM careers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Career(result.rows[0]) : null;
  }

  // Find all careers with filtering and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = 10, offset = 0) {
    let sql = `
      SELECT c.*,
             u.first_name as submitted_by_first_name,
             u.last_name as submitted_by_last_name,
             a.first_name as approved_by_first_name,
             a.last_name as approved_by_last_name,
             r.first_name as rejected_by_first_name,
             r.last_name as rejected_by_last_name
      FROM careers c
      LEFT JOIN users u ON c.submitted_by = u.id
      LEFT JOIN admins a ON c.approved_by = a.id
      LEFT JOIN admins r ON c.rejected_by = r.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.type) {
      sql += ` AND c.type = $${paramCount}`;
      values.push(filters.type);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND c.is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows.map(row => new Career(row));
  }

  // Find careers by user ID (for user dashboard)
  static async findByUserId(userId, limit = 10, offset = 0) {
    const sql = `
      SELECT * FROM careers
      WHERE submitted_by = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    return result.rows.map(row => new Career(row));
  }

  // Find careers by user ID with filters (for user dashboard)
  static async findByUserIdWithFilters(filters, searchSql = '', searchValues = [], limit = 10, offset = 0) {
    let sql = `
      SELECT * FROM careers c
      WHERE c.submitted_by = $1 AND c.is_active = true
    `;

    const values = [filters.submitted_by];
    let paramCount = 2;

    // Add status filter
    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
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

    sql += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows.map(row => new Career(row));
  }

  // Get deleted careers (admin only)
  static async getDeleted(filters = {}, searchSql = '', searchValues = [], limit = 10, offset = 0) {
    let sql = `
      SELECT c.*,
             u.first_name as submitted_by_first_name,
             u.last_name as submitted_by_last_name
      FROM careers c
      LEFT JOIN users u ON c.submitted_by = u.id
      WHERE c.is_active = false
    `;

    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows.map(row => new Career(row));
  }

  // Update career
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
    const sql = `UPDATE careers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Soft delete career
  async delete() {
    await this.update({ is_active: false });
  }

  // Convert to JSON (exclude sensitive data if needed)
  toJSON() {
    const { ...careerData } = this;
    return careerData;
  }

  // Get count for pagination
  static async getCount(filters = {}, searchSql = '', searchValues = []) {
    let sql = 'SELECT COUNT(*) as total FROM careers c WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.type) {
      sql += ` AND c.type = $${paramCount}`;
      values.push(filters.type);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND c.is_active = $${paramCount}`;
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
    let sql = 'SELECT COUNT(*) as total FROM careers c WHERE c.submitted_by = $1 AND c.is_active = true';
    const values = [userId];
    let paramCount = 2;

    // Add status filter
    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
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

module.exports = Career;