const { query } = require('../config/database');

class AwardSubmission {
  constructor(data) {
    this.id = data.id;
    this.award_id = data.award_id;
    this.interested_receive_award = data.interested_receive_award || false;
    this.interested_sponsor_award = data.interested_sponsor_award || false;
    this.interested_speak_award = data.interested_speak_award || false;
    this.interested_exhibit_award = data.interested_exhibit_award || false;
    this.interested_attend_award = data.interested_attend_award || false;
    this.name = data.name;
    this.email = data.email;
    this.whatsapp = data.whatsapp;
    this.calling_number = data.calling_number;
    this.telegram_username = data.telegram_username;
    this.direct_number = data.direct_number;
    this.gender = data.gender;
    this.dob = data.dob;
    this.dual_passport = data.dual_passport || false;
    this.passport_1 = data.passport_1;
    this.passport_2 = data.passport_2;
    this.residence_uae = data.residence_uae || false;
    this.other_residence = data.other_residence || false;
    this.other_residence_name = data.other_residence_name;
    this.current_company = data.current_company;
    this.position = data.position;
    this.linkedin = data.linkedin;
    this.instagram = data.instagram;
    this.facebook = data.facebook;
    this.personal_website = data.personal_website;
    this.company_website = data.company_website;
    this.company_industry = data.company_industry;
    this.earlier_news_features = data.earlier_news_features;
    this.filling_for_other = data.filling_for_other || false;
    this.other_person_details = data.other_person_details;
    this.captcha_validated = data.captcha_validated || false;
    this.terms_agreed = data.terms_agreed || false;
    this.message = data.message;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new award submission
  static async create(submissionData) {
    // Validate data
    const validation = AwardSubmission.validate(submissionData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      award_id, interested_receive_award, interested_sponsor_award, interested_speak_award,
      interested_exhibit_award, interested_attend_award, name, email, whatsapp,
      calling_number, telegram_username, direct_number, gender, dob, dual_passport,
      passport_1, passport_2, residence_uae, other_residence, other_residence_name,
      current_company, position, linkedin, instagram, facebook, personal_website,
      company_website, company_industry, earlier_news_features, filling_for_other,
      other_person_details, captcha_validated, terms_agreed, message
    } = submissionData;

    const sql = `
      INSERT INTO award_submissions (
        award_id, interested_receive_award, interested_sponsor_award, interested_speak_award,
        interested_exhibit_award, interested_attend_award, name, email, whatsapp,
        calling_number, telegram_username, direct_number, gender, dob, dual_passport,
        passport_1, passport_2, residence_uae, other_residence, other_residence_name,
        current_company, position, linkedin, instagram, facebook, personal_website,
        company_website, company_industry, earlier_news_features, filling_for_other,
        other_person_details, captcha_validated, terms_agreed, message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
      RETURNING *
    `;

    const values = [
      award_id, interested_receive_award, interested_sponsor_award, interested_speak_award,
      interested_exhibit_award, interested_attend_award, name, email, whatsapp,
      calling_number, telegram_username, direct_number, gender, dob, dual_passport,
      passport_1, passport_2, residence_uae, other_residence, other_residence_name,
      current_company, position, linkedin, instagram, facebook, personal_website,
      company_website, company_industry, earlier_news_features, filling_for_other,
      other_person_details, captcha_validated, terms_agreed, message
    ];

    const result = await query(sql, values);
    return new AwardSubmission(result.rows[0]);
  }

  // Find submission by ID
  static async findById(id) {
    const sql = 'SELECT * FROM award_submissions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new AwardSubmission(result.rows[0]) : null;
  }

  // Find submissions by award ID
  static async findByAwardId(awardId) {
    const sql = 'SELECT * FROM award_submissions WHERE award_id = $1 ORDER BY created_at DESC';
    const result = await query(sql, [awardId]);
    return result.rows.map(row => new AwardSubmission(row));
  }

  // Find all submissions with filtering and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT asub.*, a.award_name FROM award_submissions asub LEFT JOIN awards a ON asub.award_id = a.id WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.award_id) {
      sql += ` AND asub.award_id = $${paramCount}`;
      values.push(filters.award_id);
      paramCount++;
    }

    if (filters.interested_receive_award !== undefined) {
      sql += ` AND asub.interested_receive_award = $${paramCount}`;
      values.push(filters.interested_receive_award);
      paramCount++;
    }

    if (filters.interested_sponsor_award !== undefined) {
      sql += ` AND asub.interested_sponsor_award = $${paramCount}`;
      values.push(filters.interested_sponsor_award);
      paramCount++;
    }

    if (filters.interested_speak_award !== undefined) {
      sql += ` AND asub.interested_speak_award = $${paramCount}`;
      values.push(filters.interested_speak_award);
      paramCount++;
    }

    if (filters.interested_exhibit_award !== undefined) {
      sql += ` AND asub.interested_exhibit_award = $${paramCount}`;
      values.push(filters.interested_exhibit_award);
      paramCount++;
    }

    if (filters.interested_attend_award !== undefined) {
      sql += ` AND asub.interested_attend_award = $${paramCount}`;
      values.push(filters.interested_attend_award);
      paramCount++;
    }

    if (filters.gender) {
      sql += ` AND asub.gender = $${paramCount}`;
      values.push(filters.gender);
      paramCount++;
    }

    if (filters.company_industry) {
      sql += ` AND asub.company_industry = $${paramCount}`;
      values.push(filters.company_industry);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY asub.created_at DESC';

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
    return result.rows.map(row => new AwardSubmission(row));
  }

  // Search submissions
  static async search(searchTerm, filters = {}, limit = null, offset = null) {
    let searchSql = '';
    const searchValues = [];

    if (searchTerm) {
      searchSql = ` AND (asub.name ILIKE $${searchValues.length + 1} OR asub.email ILIKE $${searchValues.length + 2} OR asub.current_company ILIKE $${searchValues.length + 3})`;
      const searchPattern = `%${searchTerm}%`;
      searchValues.push(searchPattern, searchPattern, searchPattern);
    }

    return await AwardSubmission.findAll(filters, searchSql, searchValues, limit, offset);
  }

  // Update submission
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
    const sql = `UPDATE award_submissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete submission
  async delete() {
    const sql = 'DELETE FROM award_submissions WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Get associated award
  async getAward() {
    const Award = require('./Award');
    return await Award.findById(this.award_id);
  }

  // Validation
  static validate(submissionData) {
    const errors = [];

    if (!submissionData.award_id) {
      errors.push('Award ID is required');
    }

    if (!submissionData.name || submissionData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!submissionData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submissionData.email)) {
      errors.push('Valid email is required');
    }

    if (!submissionData.terms_agreed) {
      errors.push('Agreement to terms is required');
    }

    if (submissionData.filling_for_other && (!submissionData.other_person_details || submissionData.other_person_details.trim().length === 0)) {
      errors.push('Other person details are required when filling for someone else');
    }

    if (submissionData.dual_passport && (!submissionData.passport_1 || submissionData.passport_1.trim().length === 0)) {
      errors.push('First passport nationality is required when dual passport');
    }

    if (submissionData.other_residence && (!submissionData.other_residence_name || submissionData.other_residence_name.trim().length === 0)) {
      errors.push('Other residence name is required when other residence');
    }

    if (submissionData.linkedin && !/^https?:\/\/.+/.test(submissionData.linkedin)) {
      errors.push('LinkedIn must be a valid URL');
    }

    if (submissionData.instagram && !/^https?:\/\/.+/.test(submissionData.instagram)) {
      errors.push('Instagram must be a valid URL');
    }

    if (submissionData.facebook && !/^https?:\/\/.+/.test(submissionData.facebook)) {
      errors.push('Facebook must be a valid URL');
    }

    if (submissionData.personal_website && !/^https?:\/\/.+/.test(submissionData.personal_website)) {
      errors.push('Personal website must be a valid URL');
    }

    if (submissionData.company_website && !/^https?:\/\/.+/.test(submissionData.company_website)) {
      errors.push('Company website must be a valid URL');
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
      award_id: this.award_id,
      award_name: this.award_name,
      interested_receive_award: this.interested_receive_award,
      interested_sponsor_award: this.interested_sponsor_award,
      interested_speak_award: this.interested_speak_award,
      interested_exhibit_award: this.interested_exhibit_award,
      interested_attend_award: this.interested_attend_award,
      name: this.name,
      email: this.email,
      whatsapp: this.whatsapp,
      calling_number: this.calling_number,
      telegram_username: this.telegram_username,
      direct_number: this.direct_number,
      gender: this.gender,
      dob: this.dob,
      dual_passport: this.dual_passport,
      passport_1: this.passport_1,
      passport_2: this.passport_2,
      residence_uae: this.residence_uae,
      other_residence: this.other_residence,
      other_residence_name: this.other_residence_name,
      current_company: this.current_company,
      position: this.position,
      linkedin: this.linkedin,
      instagram: this.instagram,
      facebook: this.facebook,
      personal_website: this.personal_website,
      company_website: this.company_website,
      company_industry: this.company_industry,
      earlier_news_features: this.earlier_news_features,
      filling_for_other: this.filling_for_other,
      other_person_details: this.other_person_details,
      captcha_validated: this.captcha_validated,
      terms_agreed: this.terms_agreed,
      message: this.message,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Helper method to get total count for pagination
  static async getTotalCount(filters, searchSql, searchValues) {
    try {
      const { query } = require('../config/database');
      let sql = 'SELECT COUNT(*) as total FROM award_submissions asub WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.award_id) {
        sql += ` AND asub.award_id = $${paramCount}`;
        values.push(filters.award_id);
        paramCount++;
      }

      if (filters.interested_receive_award !== undefined) {
        sql += ` AND asub.interested_receive_award = $${paramCount}`;
        values.push(filters.interested_receive_award);
        paramCount++;
      }

      if (filters.interested_sponsor_award !== undefined) {
        sql += ` AND asub.interested_sponsor_award = $${paramCount}`;
        values.push(filters.interested_sponsor_award);
        paramCount++;
      }

      if (filters.interested_speak_award !== undefined) {
        sql += ` AND asub.interested_speak_award = $${paramCount}`;
        values.push(filters.interested_speak_award);
        paramCount++;
      }

      if (filters.interested_exhibit_award !== undefined) {
        sql += ` AND asub.interested_exhibit_award = $${paramCount}`;
        values.push(filters.interested_exhibit_award);
        paramCount++;
      }

      if (filters.interested_attend_award !== undefined) {
        sql += ` AND asub.interested_attend_award = $${paramCount}`;
        values.push(filters.interested_attend_award);
        paramCount++;
      }

      if (filters.gender) {
        sql += ` AND asub.gender = $${paramCount}`;
        values.push(filters.gender);
        paramCount++;
      }

      if (filters.company_industry) {
        sql += ` AND asub.company_industry = $${paramCount}`;
        values.push(filters.company_industry);
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
      let sql = 'SELECT COUNT(*) as total FROM award_submissions asub WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.award_id) {
        sql += ` AND asub.award_id = $${paramCount}`;
        values.push(filters.award_id);
        paramCount++;
      }

      if (filters.interested_receive_award !== undefined) {
        sql += ` AND asub.interested_receive_award = $${paramCount}`;
        values.push(filters.interested_receive_award);
        paramCount++;
      }

      if (filters.interested_sponsor_award !== undefined) {
        sql += ` AND asub.interested_sponsor_award = $${paramCount}`;
        values.push(filters.interested_sponsor_award);
        paramCount++;
      }

      if (filters.interested_speak_award !== undefined) {
        sql += ` AND asub.interested_speak_award = $${paramCount}`;
        values.push(filters.interested_speak_award);
        paramCount++;
      }

      if (filters.interested_exhibit_award !== undefined) {
        sql += ` AND asub.interested_exhibit_award = $${paramCount}`;
        values.push(filters.interested_exhibit_award);
        paramCount++;
      }

      if (filters.interested_attend_award !== undefined) {
        sql += ` AND asub.interested_attend_award = $${paramCount}`;
        values.push(filters.interested_attend_award);
        paramCount++;
      }

      if (filters.gender) {
        sql += ` AND asub.gender = $${paramCount}`;
        values.push(filters.gender);
        paramCount++;
      }

      if (filters.company_industry) {
        sql += ` AND asub.company_industry = $${paramCount}`;
        values.push(filters.company_industry);
        paramCount++;
      }

      if (searchTerm) {
        sql += ` AND (asub.name ILIKE $${paramCount} OR asub.email ILIKE $${paramCount + 1} OR asub.current_company ILIKE $${paramCount + 2})`;
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

module.exports = AwardSubmission;