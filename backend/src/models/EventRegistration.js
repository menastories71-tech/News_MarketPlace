const { query } = require('../config/database');

class EventRegistration {
  constructor(data) {
    this.id = data.id;
    this.event_id = data.event_id;
    this.user_id = data.user_id;
    this.ticket_id = data.ticket_id;
    this.registration_data = data.registration_data;
    this.status = data.status || 'pending';
    this.payment_status = data.payment_status || 'unpaid';
    this.payment_amount = data.payment_amount;
    this.registration_date = data.registration_date;
    this.updated_at = data.updated_at;
    this.event_title = data.event_title;
    this.event_date = data.event_date;
    this.user = data.first_name ? {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email
    } : null;
  }

  // Create a new registration
  static async create(registrationData) {
    const {
      event_id,
      user_id,
      ticket_id,
      registration_data,
      status,
      payment_status,
      payment_amount
    } = registrationData;

    const sql = `
      INSERT INTO event_registrations (
        event_id, user_id, ticket_id, registration_data, status, payment_status, payment_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      event_id, user_id, ticket_id, registration_data, status || 'pending',
      payment_status || 'unpaid', payment_amount
    ];

    const result = await query(sql, values);
    return new EventRegistration(result.rows[0]);
  }

  // Find registration by ID
  static async findById(id) {
    const sql = 'SELECT * FROM event_registrations WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new EventRegistration(result.rows[0]) : null;
  }

  // Find registrations by event ID
  static async findByEventId(eventId, filters = {}) {
    let sql = `
      SELECT er.*, e.title as event_title, e.start_date as event_date,
             u.first_name, u.last_name, u.email
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = $1
    `;
    const values = [eventId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND er.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.payment_status) {
      sql += ` AND er.payment_status = $${paramCount}`;
      values.push(filters.payment_status);
      paramCount++;
    }

    sql += ' ORDER BY er.registration_date DESC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventRegistration(row));
  }

  // Find registrations by user ID
  static async findByUserId(userId, filters = {}) {
    let sql = `
      SELECT er.*, e.title as event_title, e.start_date as event_date,
             u.first_name, u.last_name, u.email
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      JOIN users u ON er.user_id = u.id
      WHERE er.user_id = $1
    `;
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND er.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.payment_status) {
      sql += ` AND er.payment_status = $${paramCount}`;
      values.push(filters.payment_status);
      paramCount++;
    }

    sql += ' ORDER BY er.registration_date DESC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventRegistration(row));
  }

  // Find all registrations with filters
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = `
      SELECT er.*, e.title as event_title, e.start_date as event_date,
             u.first_name, u.last_name, u.email
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      JOIN users u ON er.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.event_id) {
      sql += ` AND er.event_id = $${paramCount}`;
      values.push(filters.event_id);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND er.user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND er.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.payment_status) {
      sql += ` AND er.payment_status = $${paramCount}`;
      values.push(filters.payment_status);
      paramCount++;
    }

    sql += ' ORDER BY er.registration_date DESC';

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
    return result.rows.map(row => new EventRegistration(row));
  }

  // Update registration
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
    const sql = `UPDATE event_registrations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete registration
  async delete() {
    const sql = 'DELETE FROM event_registrations WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_id: this.event_id,
      user_id: this.user_id,
      ticket_id: this.ticket_id,
      registration_data: this.registration_data,
      status: this.status,
      payment_status: this.payment_status,
      payment_amount: this.payment_amount,
      registration_date: this.registration_date,
      updated_at: this.updated_at,
      event_title: this.event_title,
      event_date: this.event_date,
      user: this.user
    };
  }
}

module.exports = EventRegistration;