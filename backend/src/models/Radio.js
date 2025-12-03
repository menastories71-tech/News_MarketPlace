const { query } = require('../config/database');

class Radio {
  constructor(data) {
    this.id = data.id;
    this.sn = data.sn;
    this.group_id = data.group_id;
    this.radio_name = data.radio_name;
    this.frequency = data.frequency;
    this.radio_language = data.radio_language;
    this.radio_website = data.radio_website;
    this.radio_linkedin = data.radio_linkedin;
    this.radio_instagram = data.radio_instagram;
    this.emirate_state = data.emirate_state;
    this.radio_popular_rj = data.radio_popular_rj;
    this.remarks = data.remarks;
    this.image_url = data.image_url;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new radio
  static async create(radioData) {
    const {
      sn,
      group_id,
      radio_name,
      frequency,
      radio_language,
      radio_website,
      radio_linkedin,
      radio_instagram,
      emirate_state,
      radio_popular_rj,
      remarks,
      image_url,
      description
    } = radioData;

    // If no sn provided or it's a duplicate, generate a unique one
    let finalSn = sn;
    if (!finalSn) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000);
      finalSn = `RAD-${timestamp}-${random}`;
    }

    // Ensure uniqueness by checking and incrementing if needed
    let uniqueSn = finalSn;
    let counter = 1;
    while (await this.findBySN(uniqueSn)) {
      uniqueSn = `${finalSn}-${counter}`;
      counter++;
    }

    const sql = `
      INSERT INTO radios (sn, group_id, radio_name, frequency, radio_language, radio_website, radio_linkedin, radio_instagram, emirate_state, radio_popular_rj, remarks, image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [uniqueSn, group_id, radio_name, frequency, radio_language, radio_website, radio_linkedin, radio_instagram, emirate_state, radio_popular_rj, remarks, image_url, description];
    const result = await query(sql, values);
    return new Radio(result.rows[0]);
  }

  // Find radio by ID
  static async findById(id) {
    const sql = 'SELECT * FROM radios WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Radio(result.rows[0]) : null;
  }

  // Find radio by SN
  static async findBySN(sn) {
    const sql = 'SELECT * FROM radios WHERE sn = $1';
    const result = await query(sql, [sn]);
    return result.rows[0] ? new Radio(result.rows[0]) : null;
  }

  // Find all radios with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM radios WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.group_id) {
      sql += ` AND group_id = $${paramCount}`;
      values.push(filters.group_id);
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
    return result.rows.map(row => new Radio(row));
  }

  // Update radio
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
    const sql = `UPDATE radios SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete radio (hard delete)
  async delete() {
    const sql = 'DELETE FROM radios WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Get associated group
  async getGroup() {
    if (!this.group_id) return null;
    const Group = require('./Group');
    return await Group.findById(this.group_id);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      sn: this.sn,
      group_id: this.group_id,
      radio_name: this.radio_name,
      frequency: this.frequency,
      radio_language: this.radio_language,
      radio_website: this.radio_website,
      radio_linkedin: this.radio_linkedin,
      radio_instagram: this.radio_instagram,
      emirate_state: this.emirate_state,
      radio_popular_rj: this.radio_popular_rj,
      remarks: this.remarks,
      image_url: this.image_url,
      description: this.description,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Radio;