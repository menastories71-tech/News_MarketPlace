const { query } = require('../config/database');

class Event {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.country = data.country;
    this.city = data.city;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.month = data.month;
    this.event_type = data.event_type;
    this.is_free = data.is_free || false;
    this.organizer = data.organizer;
    this.venue = data.venue;
    this.capacity = data.capacity;
    this.registration_deadline = data.registration_deadline;
    this.status = data.status || 'active';
    this.custom_form_fields = data.custom_form_fields;
    this.disclaimer_text = data.disclaimer_text;
    this.enable_sponsor = data.enable_sponsor || false;
    this.enable_media_partner = data.enable_media_partner || false;
    this.enable_speaker = data.enable_speaker || false;
    this.enable_guest = data.enable_guest || false;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new event
  static async create(eventData) {
    const {
      title,
      description,
      country,
      city,
      start_date,
      end_date,
      month,
      event_type,
      is_free,
      organizer,
      venue,
      capacity,
      registration_deadline,
      status,
      custom_form_fields,
      disclaimer_text,
      enable_sponsor,
      enable_media_partner,
      enable_speaker,
      enable_guest,
      created_by
    } = eventData;

    const sql = `
      INSERT INTO events (
        title, description, country, city, start_date, end_date, month,
        event_type, is_free, organizer, venue, capacity, registration_deadline,
        status, custom_form_fields, disclaimer_text, enable_sponsor,
        enable_media_partner, enable_speaker, enable_guest, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      title, description, country, city, start_date, end_date, month,
      event_type, is_free || false, organizer, venue, capacity, registration_deadline,
      status || 'active', custom_form_fields, disclaimer_text,
      enable_sponsor || false, enable_media_partner || false, enable_speaker || false, enable_guest || false,
      created_by
    ];

    const result = await query(sql, values);
    return new Event(result.rows[0]);
  }

  // Find event by ID
  static async findById(id) {
    const sql = 'SELECT * FROM events WHERE id = $1 AND status != \'cancelled\'';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Event(result.rows[0]) : null;
  }

  // Find all events with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM events WHERE status != \'cancelled\'';
    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.country) {
      sql += ` AND country ILIKE $${paramCount}`;
      values.push(`%${filters.country}%`);
      paramCount++;
    }

    if (filters.city) {
      sql += ` AND city ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    if (filters.month) {
      sql += ` AND month = $${paramCount}`;
      values.push(filters.month);
      paramCount++;
    }

    if (filters.event_type) {
      sql += ` AND event_type = $${paramCount}`;
      values.push(filters.event_type);
      paramCount++;
    }

    if (filters.is_free !== undefined) {
      sql += ` AND is_free = $${paramCount}`;
      values.push(filters.is_free);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY start_date ASC';

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
    return result.rows.map(row => new Event(row));
  }

  // Search events
  static async search(searchTerm, filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM events WHERE status != \'cancelled\'';
    const values = [];
    let paramCount = 1;

    // Add search term
    if (searchTerm) {
      sql += ` AND (
        title ILIKE $${paramCount} OR
        description ILIKE $${paramCount} OR
        organizer ILIKE $${paramCount} OR
        venue ILIKE $${paramCount}
      )`;
      values.push(`%${searchTerm}%`);
      paramCount++;
    }

    // Add filters
    if (filters.country) {
      sql += ` AND country ILIKE $${paramCount}`;
      values.push(`%${filters.country}%`);
      paramCount++;
    }

    if (filters.city) {
      sql += ` AND city ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    if (filters.month) {
      sql += ` AND month = $${paramCount}`;
      values.push(filters.month);
      paramCount++;
    }

    if (filters.event_type) {
      sql += ` AND event_type = $${paramCount}`;
      values.push(filters.event_type);
      paramCount++;
    }

    if (filters.is_free !== undefined) {
      sql += ` AND is_free = $${paramCount}`;
      values.push(filters.is_free);
      paramCount++;
    }

    sql += ' ORDER BY start_date ASC';

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
    return result.rows.map(row => new Event(row));
  }

  // Update event
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
    const sql = `UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete event (soft delete by setting status to cancelled)
  async delete() {
    return await this.update({ status: 'cancelled' });
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      country: this.country,
      city: this.city,
      start_date: this.start_date,
      end_date: this.end_date,
      month: this.month,
      event_type: this.event_type,
      is_free: this.is_free,
      organizer: this.organizer,
      venue: this.venue,
      capacity: this.capacity,
      registration_deadline: this.registration_deadline,
      status: this.status,
      custom_form_fields: this.custom_form_fields,
      disclaimer_text: this.disclaimer_text,
      enable_sponsor: this.enable_sponsor,
      enable_media_partner: this.enable_media_partner,
      enable_speaker: this.enable_speaker,
      enable_guest: this.enable_guest,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Event;