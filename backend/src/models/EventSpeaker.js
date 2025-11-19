const { query } = require('../config/database');

class EventSpeaker {
  constructor(data) {
    this.id = data.id;
    this.event_id = data.event_id;
    this.user_id = data.user_id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.organization = data.organization;
    this.position = data.position;
    this.bio = data.bio;
    this.expertise = data.expertise;
    this.topic = data.topic;
    this.presentation_type = data.presentation_type;
    this.duration = data.duration;
    this.special_requirements = data.special_requirements;
    this.linkedin_profile = data.linkedin_profile;
    this.website = data.website;
    this.status = data.status || 'pending';
    this.application_date = data.application_date;
    this.reviewed_by = data.reviewed_by;
    this.reviewed_at = data.reviewed_at;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new speaker application
  static async create(speakerData) {
    const {
      event_id,
      user_id,
      full_name,
      email,
      phone,
      organization,
      position,
      bio,
      expertise,
      topic,
      presentation_type,
      duration,
      special_requirements,
      linkedin_profile,
      website
    } = speakerData;

    const sql = `
      INSERT INTO event_speakers (
        event_id, user_id, full_name, email, phone, organization, position, bio,
        expertise, topic, presentation_type, duration, special_requirements,
        linkedin_profile, website
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      event_id, user_id, full_name, email, phone, organization, position, bio,
      expertise, topic, presentation_type, duration, special_requirements,
      linkedin_profile, website
    ];

    const result = await query(sql, values);
    return new EventSpeaker(result.rows[0]);
  }

  // Find speaker application by ID
  static async findById(id) {
    const sql = 'SELECT * FROM event_speakers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new EventSpeaker(result.rows[0]) : null;
  }

  // Find speaker applications by event ID
  static async findByEventId(eventId, filters = {}) {
    let sql = 'SELECT * FROM event_speakers WHERE event_id = $1';
    const values = [eventId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY application_date DESC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventSpeaker(row));
  }

  // Find speaker applications by user ID
  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM event_speakers WHERE user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY application_date DESC';

    const result = await query(sql, values);
    return result.rows.map(row => new EventSpeaker(row));
  }

  // Find all speaker applications with filters
  static async findAll(filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM event_speakers WHERE 1=1';
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
    return result.rows.map(row => new EventSpeaker(row));
  }

  // Update speaker application
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
    const sql = `UPDATE event_speakers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete speaker application
  async delete() {
    const sql = 'DELETE FROM event_speakers WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_id: this.event_id,
      user_id: this.user_id,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      organization: this.organization,
      position: this.position,
      bio: this.bio,
      expertise: this.expertise,
      topic: this.topic,
      presentation_type: this.presentation_type,
      duration: this.duration,
      special_requirements: this.special_requirements,
      linkedin_profile: this.linkedin_profile,
      website: this.website,
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

module.exports = EventSpeaker;