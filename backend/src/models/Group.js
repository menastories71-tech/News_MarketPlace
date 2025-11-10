const { query } = require('../config/database');

class Group {
  constructor(data) {
    this.id = data.id;
    this.group_sn = data.group_sn;
    this.group_name = data.group_name;
    this.group_location = data.group_location;
    this.group_website = data.group_website;
    this.group_linkedin = data.group_linkedin;
    this.group_instagram = data.group_instagram;
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.status = data.status || 'pending';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new group
  static async create(groupData) {
    const {
      group_sn,
      group_name,
      group_location,
      group_website,
      group_linkedin,
      group_instagram,
      submitted_by,
      submitted_by_admin
    } = groupData;

    const sql = `
      INSERT INTO groups (group_sn, group_name, group_location, group_website, group_linkedin, group_instagram, submitted_by, submitted_by_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [group_sn, group_name, group_location, group_website, group_linkedin, group_instagram, submitted_by, submitted_by_admin];
    const result = await query(sql, values);
    return new Group(result.rows[0]);
  }

  // Find group by ID
  static async findById(id) {
    const sql = 'SELECT * FROM groups WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Group(result.rows[0]) : null;
  }

  // Find group by SN
  static async findBySN(group_sn) {
    const sql = 'SELECT * FROM groups WHERE group_sn = $1';
    const result = await query(sql, [group_sn]);
    return result.rows[0] ? new Group(result.rows[0]) : null;
  }

  // Find all groups with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM groups WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
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
    return result.rows.map(row => new Group(row));
  }

  // Update group
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
    const sql = `UPDATE groups SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete group (hard delete)
  async delete() {
    const sql = 'DELETE FROM groups WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Get publications for this group
  async getPublications() {
    const Publication = require('./Publication');
    return await Publication.findByGroupId(this.id);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      group_sn: this.group_sn,
      group_name: this.group_name,
      group_location: this.group_location,
      group_website: this.group_website,
      group_linkedin: this.group_linkedin,
      group_instagram: this.group_instagram,
      submitted_by: this.submitted_by,
      submitted_by_admin: this.submitted_by_admin,
      status: this.status,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Group;