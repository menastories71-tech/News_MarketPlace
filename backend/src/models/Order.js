const { query } = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.publication_id = data.publication_id;
    this.publication_name = data.publication_name;
    this.price = data.price;
    this.customer_name = data.customer_name;
    this.customer_email = data.customer_email;
    this.customer_phone = data.customer_phone;
    this.customer_message = data.customer_message;
    this.status = data.status || 'pending';
    this.admin_notes = data.admin_notes;
    this.order_date = data.order_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new order
  static async create(orderData) {
    const {
      publication_id,
      publication_name,
      price,
      customer_name,
      customer_email,
      customer_phone,
      customer_message,
      status
    } = orderData;

    const sql = `
      INSERT INTO orders (
        publication_id, publication_name, price, customer_name,
        customer_email, customer_phone, customer_message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      publication_id, publication_name, price, customer_name,
      customer_email, customer_phone, customer_message, status || 'pending'
    ];

    const result = await query(sql, values);
    return new Order(result.rows[0]);
  }

  // Find order by ID
  static async findById(id) {
    const sql = 'SELECT * FROM orders WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Order(result.rows[0]) : null;
  }

  // Find all orders with pagination and filters
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.publication_id) {
      sql += ` AND publication_id = $${paramCount}`;
      values.push(filters.publication_id);
      paramCount++;
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
    return result.rows.map(row => new Order(row));
  }

  // Get count of orders
  static async getCount(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.publication_id) {
      sql += ` AND publication_id = $${paramCount}`;
      values.push(filters.publication_id);
      paramCount++;
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].count);
  }

  // Update order
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
    const sql = `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Accept order
  async accept(adminNotes = null) {
    const updateData = {
      status: 'accepted',
      admin_notes: adminNotes
    };
    return await this.update(updateData);
  }

  // Reject order
  async reject(adminNotes = null) {
    const updateData = {
      status: 'rejected',
      admin_notes: adminNotes
    };
    return await this.update(updateData);
  }

  // Complete order
  async complete(adminNotes = null) {
    const updateData = {
      status: 'completed',
      admin_notes: adminNotes
    };
    return await this.update(updateData);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      publication_id: this.publication_id,
      publication_name: this.publication_name,
      price: this.price,
      customer_name: this.customer_name,
      customer_email: this.customer_email,
      customer_phone: this.customer_phone,
      customer_message: this.customer_message,
      status: this.status,
      admin_notes: this.admin_notes,
      order_date: this.order_date,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Order;