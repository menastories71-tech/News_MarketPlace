const { query } = require('../config/database');

class Award {
  constructor(data) {
    this.id = data.id;
    this.award_name = data.award_name;
    this.award_focus = data.award_focus;
    this.organiser = data.organiser;
    this.website = data.website;
    this.linkedin = data.linkedin;
    this.instagram = data.instagram;
    this.award_month = data.award_month;
    this.cta_text = data.cta_text;
    this.description = data.description;
    this.chief_guest = data.chief_guest;
    this.celebrity_guest = data.celebrity_guest;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new award
  static async create(awardData) {
    // Validate data
    const validation = Award.validate(awardData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      award_name, award_focus, organiser, website, linkedin, instagram,
      award_month, cta_text, description, chief_guest, celebrity_guest
    } = awardData;

    const sql = `
      INSERT INTO awards (
        award_name, award_focus, organiser, website, linkedin, instagram,
        award_month, cta_text, description, chief_guest, celebrity_guest
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      award_name, award_focus, organiser, website, linkedin, instagram,
      award_month, cta_text, description, chief_guest, celebrity_guest
    ];

    const result = await query(sql, values);
    return new Award(result.rows[0]);
  }

  // Find award by ID
  static async findById(id) {
    const sql = 'SELECT * FROM awards WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Award(result.rows[0]) : null;
  }

  // Find all awards with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM awards WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.award_month) {
      sql += ` AND award_month = $${paramCount}`;
      values.push(filters.award_month);
      paramCount++;
    }

    if (filters.organiser) {
      sql += ` AND organiser = $${paramCount}`;
      values.push(filters.organiser);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
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
    return result.rows.map(row => new Award(row));
  }

  // Search awards
  static async search(searchTerm, filters = {}, limit = null, offset = null) {
    let searchSql = '';
    const searchValues = [];

    if (searchTerm) {
      searchSql = ` AND (award_name ILIKE $${searchValues.length + 1} OR organiser ILIKE $${searchValues.length + 2} OR award_focus ILIKE $${searchValues.length + 3})`;
      const searchPattern = `%${searchTerm}%`;
      searchValues.push(searchPattern, searchPattern, searchPattern);
    }

    return await Award.findAll(filters, searchSql, searchValues, limit, offset);
  }

  // Update award
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
    const sql = `UPDATE awards SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete award
  async delete() {
    const sql = 'DELETE FROM awards WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Validation
  static validate(awardData) {
    const errors = [];

    if (!awardData.award_name || awardData.award_name.trim().length === 0) {
      errors.push('Award name is required');
    }

    if (!awardData.organiser || awardData.organiser.trim().length === 0) {
      errors.push('Organiser is required');
    }

    if (awardData.website && !/^https?:\/\/.+/.test(awardData.website)) {
      errors.push('Website must be a valid URL');
    }

    if (awardData.linkedin && !/^https?:\/\/.+/.test(awardData.linkedin)) {
      errors.push('LinkedIn must be a valid URL');
    }

    if (awardData.instagram && !/^https?:\/\/.+/.test(awardData.instagram)) {
      errors.push('Instagram must be a valid URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      award_name: this.award_name,
      award_focus: this.award_focus,
      organiser: this.organiser,
      website: this.website,
      linkedin: this.linkedin,
      instagram: this.instagram,
      award_month: this.award_month,
      cta_text: this.cta_text,
      description: this.description,
      chief_guest: this.chief_guest,
      celebrity_guest: this.celebrity_guest,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Helper method to get total count for pagination
  static async getTotalCount(filters, searchSql, searchValues) {
    try {
      const { query } = require('../config/database');
      let sql = 'SELECT COUNT(*) as total FROM awards WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.award_month) {
        sql += ` AND award_month = $${paramCount}`;
        values.push(filters.award_month);
        paramCount++;
      }

      if (filters.organiser) {
        sql += ` AND organiser = $${paramCount}`;
        values.push(filters.organiser);
        paramCount++;
      }

      if (searchSql) {
        sql += searchSql;
        values.push(...searchValues);
      }

      const result = await query(sql, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  }

  // Helper method to get search total count
  static async getSearchTotalCount(searchTerm, filters) {
    try {
      let sql = 'SELECT COUNT(*) as total FROM awards WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.award_month) {
        sql += ` AND award_month = $${paramCount}`;
        values.push(filters.award_month);
        paramCount++;
      }

      if (filters.organiser) {
        sql += ` AND organiser = $${paramCount}`;
        values.push(filters.organiser);
        paramCount++;
      }

      if (searchTerm) {
        sql += ` AND (award_name ILIKE $${paramCount} OR organiser ILIKE $${paramCount + 1} OR award_focus ILIKE $${paramCount + 2})`;
        const searchPattern = `%${searchTerm}%`;
        values.push(searchPattern, searchPattern, searchPattern);
      }

      const { query } = require('../config/database');
      const result = await query(sql, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting search total count:', error);
      return 0;
    }
  }
}

module.exports = Award;