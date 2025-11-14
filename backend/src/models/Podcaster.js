const { query } = require('../config/database');

class Podcaster {
  constructor(data) {
    this.id = data.id;
    this.image = data.image;
    this.podcast_name = data.podcast_name;
    this.podcast_host = data.podcast_host;
    this.podcast_focus_industry = data.podcast_focus_industry;
    this.podcast_target_audience = data.podcast_target_audience;
    this.podcast_region = data.podcast_region;
    this.podcast_website = data.podcast_website;
    this.podcast_ig = data.podcast_ig;
    this.podcast_linkedin = data.podcast_linkedin;
    this.podcast_facebook = data.podcast_facebook;
    this.podcast_ig_username = data.podcast_ig_username;
    this.podcast_ig_followers = data.podcast_ig_followers;
    this.podcast_ig_engagement_rate = data.podcast_ig_engagement_rate;
    this.podcast_ig_prominent_guests = data.podcast_ig_prominent_guests;
    this.spotify_channel_name = data.spotify_channel_name;
    this.spotify_channel_url = data.spotify_channel_url;
    this.youtube_channel_name = data.youtube_channel_name;
    this.youtube_channel_url = data.youtube_channel_url;
    this.tiktok = data.tiktok;
    this.cta = data.cta;
    this.contact_us_to_be_on_podcast = data.contact_us_to_be_on_podcast;
    this.gender = data.gender;
    this.nationality = data.nationality;
    this.status = data.status || 'pending';
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.approved_at = data.approved_at;
    this.approved_by = data.approved_by;
    this.rejected_at = data.rejected_at;
    this.rejected_by = data.rejected_by;
    this.rejection_reason = data.rejection_reason;
    this.admin_comments = data.admin_comments;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

  // Validate podcaster data
  static validate(podcasterData) {
    const errors = [];

    // Required fields
    if (!podcasterData.podcast_name || typeof podcasterData.podcast_name !== 'string' || podcasterData.podcast_name.trim().length === 0) {
      errors.push('Podcast name is required and must be a non-empty string');
    }

    // String fields
    const stringFields = [
      'image', 'podcast_host', 'podcast_focus_industry', 'podcast_target_audience',
      'podcast_region', 'podcast_website', 'podcast_ig', 'podcast_linkedin',
      'podcast_facebook', 'podcast_ig_username', 'podcast_ig_prominent_guests',
      'spotify_channel_name', 'spotify_channel_url', 'youtube_channel_name',
      'youtube_channel_url', 'tiktok', 'cta', 'contact_us_to_be_on_podcast',
      'gender', 'nationality'
    ];

    stringFields.forEach(field => {
      if (podcasterData[field] !== undefined && typeof podcasterData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Integer fields
    if (podcasterData.podcast_ig_followers !== undefined && (!Number.isInteger(podcasterData.podcast_ig_followers) || podcasterData.podcast_ig_followers < 0)) {
      errors.push('Podcast IG followers must be a non-negative integer');
    }

    // Decimal field
    if (podcasterData.podcast_ig_engagement_rate !== undefined && (typeof podcasterData.podcast_ig_engagement_rate !== 'number' || podcasterData.podcast_ig_engagement_rate < 0 || podcasterData.podcast_ig_engagement_rate > 100)) {
      errors.push('Podcast IG engagement rate must be a number between 0 and 100');
    }

    // Gender validation
    if (podcasterData.gender !== undefined && !['male', 'female', 'other'].includes(podcasterData.gender)) {
      errors.push('Gender must be one of: male, female, other');
    }

    // Status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (podcasterData.status && !validStatuses.includes(podcasterData.status)) {
      errors.push('Status must be one of: pending, approved, rejected');
    }

    // User association - submitted_by is required for user submissions, optional for admin submissions
    if (podcasterData.submitted_by !== undefined && podcasterData.submitted_by !== null && !Number.isInteger(podcasterData.submitted_by)) {
      errors.push('Submitted by must be an integer');
    }

    // For admin submissions, either submitted_by or submitted_by_admin should be present
    if (podcasterData.submitted_by_admin !== undefined && podcasterData.submitted_by_admin !== null && !Number.isInteger(podcasterData.submitted_by_admin)) {
      errors.push('Submitted by admin must be an integer');
    }

    // Ensure at least one submitter is present
    if ((podcasterData.submitted_by === undefined || podcasterData.submitted_by === null) &&
        (podcasterData.submitted_by_admin === undefined || podcasterData.submitted_by_admin === null)) {
      errors.push('Either submitted_by or submitted_by_admin must be provided');
    }

    return errors;
  }

  // Simple email validation (if needed in future)
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Create a new podcaster
  static async create(podcasterData) {
    const validationErrors = this.validate(podcasterData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const allowedFields = [
      'image', 'podcast_name', 'podcast_host', 'podcast_focus_industry',
      'podcast_target_audience', 'podcast_region', 'podcast_website',
      'podcast_ig', 'podcast_linkedin', 'podcast_facebook', 'podcast_ig_username',
      'podcast_ig_followers', 'podcast_ig_engagement_rate', 'podcast_ig_prominent_guests',
      'spotify_channel_name', 'spotify_channel_url', 'youtube_channel_name',
      'youtube_channel_url', 'tiktok', 'cta', 'contact_us_to_be_on_podcast',
      'gender', 'nationality',
      'status', 'submitted_by', 'submitted_by_admin', 'approved_at', 'approved_by',
      'rejected_at', 'rejected_by', 'rejection_reason', 'admin_comments', 'is_active'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (podcasterData[field] !== undefined) {
        filteredData[field] = podcasterData[field];
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO podcasters (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new Podcaster(result.rows[0]);
  }

  // Find podcaster by ID
  static async findById(id) {
    const sql = 'SELECT * FROM podcasters WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Podcaster(result.rows[0]) : null;
  }

  // Find all podcasters
  static async findAll() {
    const sql = 'SELECT * FROM podcasters ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows.map(row => new Podcaster(row));
  }

  // Update podcaster
  async update(updateData) {
    // For status updates, only validate the status field to avoid issues with existing invalid data
    if ('status' in updateData) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('Validation errors: Status must be one of: pending, approved, rejected');
      }

      // For status updates, skip full validation to avoid issues with existing invalid data
      // Only validate the status field
    } else {
      // For other updates (non-status updates), validate all fields
      const validationErrors = Podcaster.validate({ ...this, ...updateData });
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }
    }

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
    const sql = `UPDATE podcasters SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete podcaster
  async delete() {
    const sql = 'DELETE FROM podcasters WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      image: this.image,
      podcast_name: this.podcast_name,
      podcast_host: this.podcast_host,
      podcast_focus_industry: this.podcast_focus_industry,
      podcast_target_audience: this.podcast_target_audience,
      podcast_region: this.podcast_region,
      podcast_website: this.podcast_website,
      podcast_ig: this.podcast_ig,
      podcast_linkedin: this.podcast_linkedin,
      podcast_facebook: this.podcast_facebook,
      podcast_ig_username: this.podcast_ig_username,
      podcast_ig_followers: this.podcast_ig_followers,
      podcast_ig_engagement_rate: this.podcast_ig_engagement_rate,
      podcast_ig_prominent_guests: this.podcast_ig_prominent_guests,
      spotify_channel_name: this.spotify_channel_name,
      spotify_channel_url: this.spotify_channel_url,
      youtube_channel_name: this.youtube_channel_name,
      youtube_channel_url: this.youtube_channel_url,
      tiktok: this.tiktok,
      cta: this.cta,
      contact_us_to_be_on_podcast: this.contact_us_to_be_on_podcast,
      gender: this.gender,
      nationality: this.nationality,
      status: this.status,
      submitted_by: this.submitted_by,
      submitted_by_admin: this.submitted_by_admin,
      approved_at: this.approved_at,
      approved_by: this.approved_by,
      rejected_at: this.rejected_at,
      rejected_by: this.rejected_by,
      rejection_reason: this.rejection_reason,
      admin_comments: this.admin_comments,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_active: this.is_active
    };
  }
}

module.exports = Podcaster;