const { query } = require('../config/database');

class Ticket {
  constructor(data) {
    this.id = data.id;
    this.event_id = data.event_id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price || 0.00;
    this.quantity_available = data.quantity_available;
    this.max_per_user = data.max_per_user || 1;
    this.sale_start_date = data.sale_start_date;
    this.sale_end_date = data.sale_end_date;
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new ticket
  static async create(ticketData) {
    const {
      event_id,
      name,
      description,
      price,
      quantity_available,
      max_per_user,
      sale_start_date,
      sale_end_date,
      status
    } = ticketData;

    const sql = `
      INSERT INTO tickets (
        event_id, name, description, price, quantity_available, max_per_user,
        sale_start_date, sale_end_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      event_id, name, description, price || 0.00, quantity_available, max_per_user || 1,
      sale_start_date, sale_end_date, status || 'active'
    ];

    const result = await query(sql, values);
    return new Ticket(result.rows[0]);
  }

  // Find ticket by ID
  static async findById(id) {
    const sql = 'SELECT * FROM tickets WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Ticket(result.rows[0]) : null;
  }

  // Find tickets by event ID
  static async findByEventId(eventId, filters = {}) {
    let sql = 'SELECT * FROM tickets WHERE event_id = $1';
    const values = [eventId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY created_at ASC';

    const result = await query(sql, values);
    return result.rows.map(row => new Ticket(row));
  }

  // Find all tickets with filters
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.event_id) {
      sql += ` AND event_id = $${paramCount}`;
      values.push(filters.event_id);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY created_at ASC';

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
    return result.rows.map(row => new Ticket(row));
  }

  // Update ticket
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
    const sql = `UPDATE tickets SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete ticket
  async delete() {
    const sql = 'DELETE FROM tickets WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_id: this.event_id,
      name: this.name,
      description: this.description,
      price: this.price,
      quantity_available: this.quantity_available,
      max_per_user: this.max_per_user,
      sale_start_date: this.sale_start_date,
      sale_end_date: this.sale_end_date,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Ticket;