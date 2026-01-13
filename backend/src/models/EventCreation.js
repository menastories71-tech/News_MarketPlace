const { query } = require('../config/database');

class EventCreation {
  constructor(data) {
    this.id = data.id;
    this.event_name = data.event_name;
    this.event_organiser_name = data.event_organiser_name;
    this.url = data.url;
    this.tentative_month = data.tentative_month;
    this.industry = data.industry;
    this.regional_focused = data.regional_focused;
    this.event_country = data.event_country;
    this.event_city = data.event_city;
    this.company_focused_individual_focused = data.company_focused_individual_focused;
    this.image = data.image;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new event creation entry
  static async create(data) {
    const {
      event_name,
      event_organiser_name,
      url,
      tentative_month,
      industry,
      regional_focused,
      event_country,
      event_city,
      company_focused_individual_focused,
      image
    } = data;

    const sql = `
      INSERT INTO event_creations (
        event_name, event_organiser_name, url, tentative_month, industry,
        regional_focused, event_country, event_city, company_focused_individual_focused, image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      event_name, event_organiser_name, url, tentative_month, industry,
      regional_focused, event_country, event_city, company_focused_individual_focused, image
    ];

    const result = await query(sql, values);
    return new EventCreation(result.rows[0]);
  }

  // Find by ID
  static async findById(id) {
    const sql = 'SELECT * FROM event_creations WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new EventCreation(result.rows[0]) : null;
  }

  // Find all with filters, sorting, and count
  static async findAndCountAll({ where = {}, limit = null, offset = null, order = [['created_at', 'DESC']] }) {
    let sql = 'SELECT * FROM event_creations';
    let countSql = 'SELECT COUNT(*) FROM event_creations';
    const values = [];
    const whereClauses = [];

    // Construct WHERE clause
    Object.keys(where).forEach((key) => {
      const condition = where[key];
      if (condition && typeof condition === 'object') {
        // Handle Op.iLike style if we want to be fancy, 
        // but since this is manual SQL, let's keep it simple
        const Op = require('sequelize')?.Op; // Cheeky check if available
        if (key === 'search' && condition.val) {
          whereClauses.push(`(event_name ILIKE $${values.length + 1} OR event_organiser_name ILIKE $${values.length + 2} OR industry ILIKE $${values.length + 3} OR event_country ILIKE $${values.length + 4} OR event_city ILIKE $${values.length + 5})`);
          values.push(`%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`);
        }
      } else if (condition !== undefined && condition !== null) {
        whereClauses.push(`${key} = $${values.length + 1}`);
        values.push(condition);
      }
    });

    if (whereClauses.length > 0) {
      const wherePart = ` WHERE ${whereClauses.join(' AND ')}`;
      sql += wherePart;
      countSql += wherePart;
    }

    // Handle ORDER BY
    if (order && order.length > 0) {
      const [col, dir] = order[0];
      sql += ` ORDER BY ${col} ${dir}`;
    }

    // Handle Limit and Offset
    if (limit !== null) {
      sql += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }
    if (offset !== null) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const [result, countResult] = await Promise.all([
      query(sql, values),
      query(countSql, values.slice(0, values.length - (limit !== null ? (offset !== null ? 2 : 1) : 0)))
    ]);

    return {
      rows: result.rows.map(row => new EventCreation(row)),
      count: parseInt(countResult.rows[0].count)
    };
  }

  // Find all
  static async findAll(limit = null, offset = null) {
    let sql = 'SELECT * FROM event_creations ORDER BY created_at DESC';
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
    return result.rows.map(row => new EventCreation(row));
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
    const sql = `UPDATE event_creations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete
  async delete() {
    const sql = 'DELETE FROM event_creations WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_name: this.event_name,
      event_organiser_name: this.event_organiser_name,
      url: this.url,
      tentative_month: this.tentative_month,
      industry: this.industry,
      regional_focused: this.regional_focused,
      event_country: this.event_country,
      event_city: this.event_city,
      company_focused_individual_focused: this.company_focused_individual_focused,
      image: this.image,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = EventCreation;