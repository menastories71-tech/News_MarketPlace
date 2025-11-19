const { query } = require('../config/database');

class EventMediaPartner {
  constructor(data) {
    this.id = data.id;
    this.event_id = data.event_id;
    this.user_id = data.user_id;
    this.organization_name = data.organization_name;
    this.contact_person = data.contact_person;
    this.email = data.email;
    this.phone = data.phone;
    this.website = data.website;
    this.media_type = data.media_type;
    this.audience_size = data.audience_size;
    this.coverage_areas = data.coverage_areas;
    this.partnership_type = data.partnership_type;
    this.description = data.description;
    this.status = data.status || 'pending';
    this.application_date = data.application_date;
    this.reviewed_by = data.reviewed_by;
    this.reviewed_at = data.reviewed_at;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new media partner application
  static async create(mediaPartnerData) {
    const {
      event_id,
      user_id,
      organization_name,
      contact_person,
      email,
      phone,
      website,
      media_type,
      audience_size,
      coverage_areas,
      partnership_type,
      description
    } = mediaPartnerData;

    const sql = `
      INSERT INTO event_media_partners (
        event_id, user_id, organization_name, contact_person, email, phone, website,
        media_type, audience_size, coverage_areas, partnership_type, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      event_id, user_id, organization_name, contact_person, email, phone, website,
      media_type, audience_size, coverage_areas, partnership_type, description
    ];

    const result = await query(sql, values);
    return new EventMediaPartner(result.rows[0]);
  }

  // Find media partner application by ID
  static async findById(id) {
    const sql = 'SELECT * FROM event_media_partners WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new EventMediaPartner(result.rows[0]) : null;
  }

  // Find media partner applications by event ID
  static async findByEventId(eventId, filters = {}) {
    let sql = 'SELECT * FROM event_media_partners WHERE event_id = $1';
    const values = [eventId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY application_date DESC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventMediaPartner(row));
  }

  // Find media partner applications by user ID
  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM event_media_partners WHERE user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY application_date DESC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventMediaPartner(row));
  }

  // Find all media partner applications with filters
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM event_media_partners WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.event_id) {
      sql += ` AND event_id = $${paramCount}`;
      values.push(filters.event_id);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY application_date DESC';

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
    return result.rows.map(row => new EventMediaPartner(row));
  }

  // Update media partner application
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
    const sql = `UPDATE event_media_partners SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete media partner application
  async delete() {
    const sql = 'DELETE FROM event_media_partners WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_id: this.event_id,
      user_id: this.user_id,
      organization_name: this.organization_name,
      contact_person: this.contact_person,
      email: this.email,
      phone: this.phone,
      website: this.website,
      media_type: this.media_type,
      audience_size: this.audience_size,
      coverage_areas: this.coverage_areas,
      partnership_type: this.partnership_type,
      description: this.description,
      status: this.status,
      application_date: this.application_date,
      reviewed_by: this.reviewed_by,
      reviewed_at: this.reviewed_at,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = EventMediaPartner;