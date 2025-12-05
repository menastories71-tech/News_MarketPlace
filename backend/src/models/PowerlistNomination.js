const { query } = require('../config/database');

class PowerlistNomination {
  constructor(data) {
    this.id = data.id;
    this.publication_name = data.publication_name;
    this.website_url = data.website_url;
    this.power_list_name = data.power_list_name;
    this.industry = data.industry;
    this.company_or_individual = data.company_or_individual;
    this.tentative_month = data.tentative_month;
    this.location_region = data.location_region;
    this.last_power_list_url = data.last_power_list_url;
    this.image = data.image;
    this.submitted_by = data.submitted_by;
    this.status = data.status || 'pending';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new powerlist nomination
  static async create(nominationData) {
    // Validate data
    const validation = PowerlistNomination.validate(nominationData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      publication_name, website_url, power_list_name, industry, company_or_individual,
      tentative_month, location_region, last_power_list_url, image, submitted_by, status
    } = nominationData;

    // Convert is_active to boolean
    const is_active = nominationData.is_active === 'true' || nominationData.is_active === true || nominationData.is_active === undefined ? true : false;

    const sql = `
      INSERT INTO powerlist_nominations (
        publication_name, website_url, power_list_name, industry, company_or_individual,
        tentative_month, location_region, last_power_list_url, image, submitted_by, status, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      publication_name, website_url, power_list_name, industry, company_or_individual,
      tentative_month, location_region, last_power_list_url, image, submitted_by, status || 'pending',
      is_active
    ];

    const result = await query(sql, values);
    return new PowerlistNomination(result.rows[0]);
  }

  // Find nomination by ID
  static async findById(id) {
    const sql = 'SELECT * FROM powerlist_nominations WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PowerlistNomination(result.rows[0]) : null;
  }

  // Find all nominations with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM powerlist_nominations WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // By default, only show active nominations unless explicitly filtering by is_active
    if (filters.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    } else {
      // Default to only active nominations
      sql += ` AND is_active = $${paramCount}`;
      values.push(true);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.industry) {
      sql += ` AND industry = $${paramCount}`;
      values.push(filters.industry);
      paramCount++;
    }

    if (filters.location_region) {
      sql += ` AND location_region = $${paramCount}`;
      values.push(filters.location_region);
      paramCount++;
    }

    if (filters.company_or_individual) {
      sql += ` AND company_or_individual = $${paramCount}`;
      values.push(filters.company_or_individual);
      paramCount++;
    }

    if (filters.tentative_month) {
      sql += ` AND tentative_month = $${paramCount}`;
      values.push(filters.tentative_month);
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
    return result.rows.map(row => new PowerlistNomination(row));
  }

  // Search nominations
  static async search(searchTerm, filters = {}, limit = null, offset = null) {
    let searchSql = '';
    const searchValues = [];

    if (searchTerm) {
      searchSql = ` AND (publication_name ILIKE $${searchValues.length + 1} OR power_list_name ILIKE $${searchValues.length + 2} OR industry ILIKE $${searchValues.length + 3} OR location_region ILIKE $${searchValues.length + 4})`;
      const searchPattern = `%${searchTerm}%`;
      searchValues.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    return await PowerlistNomination.findAll(filters, searchSql, searchValues, limit, offset);
  }

  // Update nomination
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        let value = updateData[key];
        if (key === 'is_active') {
          value = value === 'true' || value === true;
        }
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE powerlist_nominations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete nomination (soft delete)
  async delete() {
    return await this.update({ is_active: false });
  }

  // Validation
  static validate(nominationData) {
    const errors = [];

    if (!nominationData.publication_name || nominationData.publication_name.trim().length === 0) {
      errors.push('Publication name is required');
    }

    if (!nominationData.power_list_name || nominationData.power_list_name.trim().length === 0) {
      errors.push('Power list name is required');
    }

    if (!nominationData.industry || nominationData.industry.trim().length === 0) {
      errors.push('Industry is required');
    }

    if (!nominationData.company_or_individual || nominationData.company_or_individual.trim().length === 0) {
      errors.push('Company or individual is required');
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
      publication_name: this.publication_name,
      website_url: this.website_url,
      power_list_name: this.power_list_name,
      industry: this.industry,
      company_or_individual: this.company_or_individual,
      tentative_month: this.tentative_month,
      location_region: this.location_region,
      last_power_list_url: this.last_power_list_url,
      image: this.image,
      submitted_by: this.submitted_by,
      status: this.status,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Helper method to get total count for pagination
  static async getTotalCount(filters, searchSql, searchValues) {
    try {
      let sql = 'SELECT COUNT(*) as total FROM powerlist_nominations WHERE 1=1';
      const values = [];
      let paramCount = 1;

      // By default, only show active nominations unless explicitly filtering by is_active
      if (filters.is_active !== undefined) {
        sql += ` AND is_active = $${paramCount}`;
        values.push(filters.is_active);
        paramCount++;
      } else {
        // Default to only active nominations
        sql += ` AND is_active = $${paramCount}`;
        values.push(true);
        paramCount++;
      }

      if (filters.status) {
        sql += ` AND status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.industry) {
        sql += ` AND industry = $${paramCount}`;
        values.push(filters.industry);
        paramCount++;
      }

      if (filters.location_region) {
        sql += ` AND location_region = $${paramCount}`;
        values.push(filters.location_region);
        paramCount++;
      }

      if (filters.company_or_individual) {
        sql += ` AND company_or_individual = $${paramCount}`;
        values.push(filters.company_or_individual);
        paramCount++;
      }

      if (filters.tentative_month) {
        sql += ` AND tentative_month = $${paramCount}`;
        values.push(filters.tentative_month);
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
      let sql = 'SELECT COUNT(*) as total FROM powerlist_nominations WHERE 1=1';
      const values = [];
      let paramCount = 1;

      // By default, only show active nominations unless explicitly filtering by is_active
      if (filters.is_active !== undefined) {
        sql += ` AND is_active = $${paramCount}`;
        values.push(filters.is_active);
        paramCount++;
      } else {
        // Default to only active nominations
        sql += ` AND is_active = $${paramCount}`;
        values.push(true);
        paramCount++;
      }

      if (filters.status) {
        sql += ` AND status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.industry) {
        sql += ` AND industry = $${paramCount}`;
        values.push(filters.industry);
        paramCount++;
      }

      if (filters.location_region) {
        sql += ` AND location_region = $${paramCount}`;
        values.push(filters.location_region);
        paramCount++;
      }

      if (filters.company_or_individual) {
        sql += ` AND company_or_individual = $${paramCount}`;
        values.push(filters.company_or_individual);
        paramCount++;
      }

      if (filters.tentative_month) {
        sql += ` AND tentative_month = $${paramCount}`;
        values.push(filters.tentative_month);
        paramCount++;
      }

      if (searchTerm) {
        sql += ` AND (publication_name ILIKE $${paramCount} OR power_list_name ILIKE $${paramCount + 1} OR industry ILIKE $${paramCount + 2} OR location_region ILIKE $${paramCount + 3})`;
        const searchPattern = `%${searchTerm}%`;
        values.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const result = await query(sql, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting search total count:', error);
      return 0;
    }
  }
}

module.exports = PowerlistNomination;