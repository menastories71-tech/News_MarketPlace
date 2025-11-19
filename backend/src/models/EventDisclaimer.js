const { query } = require('../config/database');

class EventDisclaimer {
  constructor(data) {
    this.id = data.id;
    this.event_id = data.event_id;
    this.message = data.message;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.display_order = data.display_order || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new disclaimer
  static async create(disclaimerData) {
    const {
      event_id,
      message,
      is_active,
      display_order
    } = disclaimerData;

    const sql = `
      INSERT INTO event_disclaimers (
        event_id, message, is_active, display_order
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      event_id, message, is_active !== undefined ? is_active : true, display_order || 0
    ];

    const result = await query(sql, values);
    return new EventDisclaimer(result.rows[0]);
  }

  // Find disclaimer by ID
  static async findById(id) {
    const sql = 'SELECT * FROM event_disclaimers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new EventDisclaimer(result.rows[0]) : null;
  }

  // Find disclaimers by event ID
  static async findByEventId(eventId, activeOnly = false) {
    let sql = 'SELECT * FROM event_disclaimers WHERE event_id = $1';
    const values = [eventId];

    if (activeOnly) {
      sql += ' AND is_active = true';
    }

    sql += ' ORDER BY display_order ASC, created_at ASC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventDisclaimer(row));
  }

  // Find all active disclaimers
  static async findAllActive() {
    const sql = 'SELECT * FROM event_disclaimers WHERE is_active = true ORDER BY display_order ASC, created_at ASC';
    const result = await query(sql);
    return result.rows.map(row => new EventDisclaimer(row));
  }

  // Find all disclaimers with filters
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM event_disclaimers WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.event_id) {
      sql += ` AND event_id = $${paramCount}`;
      values.push(filters.event_id);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    sql += ' ORDER BY display_order ASC, created_at ASC';

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
    return result.rows.map(row => new EventDisclaimer(row));
  }

  // Update disclaimer
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
    const sql = `UPDATE event_disclaimers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete disclaimer
  async delete() {
    const sql = 'DELETE FROM event_disclaimers WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_id: this.event_id,
      message: this.message,
      is_active: this.is_active,
      display_order: this.display_order,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = EventDisclaimer;