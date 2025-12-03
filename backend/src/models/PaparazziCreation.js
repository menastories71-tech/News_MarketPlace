const { query } = require('../config/database');

class PaparazziCreation {
  constructor(data) {
    this.id = data.id;
    this.instagram_page_name = data.instagram_page_name;
    this.no_of_followers = data.no_of_followers;
    this.region_focused = data.region_focused;
    this.category = data.category;
    this.instagram_url = data.instagram_url;
    this.profile_dp_logo = data.profile_dp_logo;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new paparazzi creation entry
  static async create(data) {
    const {
      instagram_page_name,
      no_of_followers,
      region_focused,
      category,
      instagram_url,
      profile_dp_logo
    } = data;

    const sql = `
      INSERT INTO paparazzi_creations (
        instagram_page_name, no_of_followers, region_focused, category,
        instagram_url, profile_dp_logo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      instagram_page_name, no_of_followers, region_focused, category,
      instagram_url, profile_dp_logo
    ];

    const result = await query(sql, values);
    return new PaparazziCreation(result.rows[0]);
  }

  // Find by ID
  static async findById(id) {
    const sql = 'SELECT * FROM paparazzi_creations WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PaparazziCreation(result.rows[0]) : null;
  }

  // Find all
  static async findAll(limit = null, offset = null) {
    let sql = 'SELECT * FROM paparazzi_creations ORDER BY created_at DESC';
    const values = [];

    if (limit) {
      sql += ' LIMIT $1';
      values.push(limit);
    }

    if (offset) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => new PaparazziCreation(row));
  }

  // Update
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
    const sql = `UPDATE paparazzi_creations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete
  async delete() {
    const sql = 'DELETE FROM paparazzi_creations WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      instagram_page_name: this.instagram_page_name,
      no_of_followers: this.no_of_followers,
      region_focused: this.region_focused,
      category: this.category,
      instagram_url: this.instagram_url,
      profile_dp_logo: this.profile_dp_logo,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PaparazziCreation;