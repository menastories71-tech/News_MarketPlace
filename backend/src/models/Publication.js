const { query } = require('../config/database');

class Publication {
  constructor(data) {
    this.id = data.id;
    this.group_id = data.group_id;
    this.publication_sn = data.publication_sn;
    this.publication_grade = data.publication_grade;
    this.publication_name = data.publication_name;
    this.publication_website = data.publication_website;
    this.publication_price = data.publication_price;
    this.agreement_tat = data.agreement_tat;
    this.practical_tat = data.practical_tat;
    this.publication_socials_icons = data.publication_socials_icons;
    this.publication_language = data.publication_language;
    this.publication_region = data.publication_region;
    this.publication_primary_industry = data.publication_primary_industry;
    this.website_news_index = data.website_news_index;
    this.da = data.da;
    this.dr = data.dr;
    this.sponsored_or_not = data.sponsored_or_not || false;
    this.words_limit = data.words_limit;
    this.number_of_images = data.number_of_images;
    this.do_follow_link = data.do_follow_link || false;
    this.example_link = data.example_link;
    this.excluding_categories = data.excluding_categories;
    this.other_remarks = data.other_remarks;
    this.tags_badges = data.tags_badges;
    this.live_on_platform = data.live_on_platform || false;
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.status = data.status || 'pending';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.status_history = data.status_history || [];
    this.approved_at = data.approved_at;
    this.approved_by = data.approved_by;
    this.rejected_at = data.rejected_at;
    this.rejected_by = data.rejected_by;
    this.rejection_reason = data.rejection_reason;
    this.admin_comments = data.admin_comments;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new publication
  static async create(publicationData) {
    const {
      group_id,
      publication_sn,
      publication_grade,
      publication_name,
      publication_website,
      publication_price,
      agreement_tat,
      practical_tat,
      publication_socials_icons,
      publication_language,
      publication_region,
      publication_primary_industry,
      website_news_index,
      da,
      dr,
      sponsored_or_not,
      words_limit,
      number_of_images,
      do_follow_link,
      example_link,
      excluding_categories,
      other_remarks,
      tags_badges,
      live_on_platform,
      submitted_by,
      submitted_by_admin
    } = publicationData;

    const sql = `
      INSERT INTO publications (
        group_id, publication_sn, publication_grade, publication_name, publication_website,
        publication_price, agreement_tat, practical_tat, publication_socials_icons,
        publication_language, publication_region, publication_primary_industry,
        website_news_index, da, dr, sponsored_or_not, words_limit, number_of_images,
        do_follow_link, example_link, excluding_categories, other_remarks, tags_badges,
        live_on_platform, submitted_by, submitted_by_admin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `;

    const values = [
      group_id, publication_sn, publication_grade, publication_name, publication_website,
      publication_price, agreement_tat, practical_tat, publication_socials_icons,
      publication_language, publication_region, publication_primary_industry,
      website_news_index, da, dr, sponsored_or_not, words_limit, number_of_images,
      do_follow_link, example_link, excluding_categories, other_remarks, tags_badges,
      live_on_platform, submitted_by, submitted_by_admin
    ];

    const result = await query(sql, values);
    return new Publication(result.rows[0]);
  }

  // Find publication by ID
  static async findById(id) {
    const sql = 'SELECT * FROM publications WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Publication(result.rows[0]) : null;
  }

  // Find publication by SN
  static async findBySN(publication_sn) {
    const sql = 'SELECT * FROM publications WHERE publication_sn = $1';
    const result = await query(sql, [publication_sn]);
    return result.rows[0] ? new Publication(result.rows[0]) : null;
  }

  // Find publications by group ID
  static async findByGroupId(group_id) {
    const sql = 'SELECT * FROM publications WHERE group_id = $1 ORDER BY created_at DESC';
    const result = await query(sql, [group_id]);
    return result.rows.map(row => new Publication(row));
  }

  // Find all publications with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT p.*, g.group_name FROM publications p LEFT JOIN groups g ON p.group_id = g.id WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND p.is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.live_on_platform !== undefined) {
      sql += ` AND p.live_on_platform = $${paramCount}`;
      values.push(filters.live_on_platform);
      paramCount++;
    }

    if (filters.group_id) {
      sql += ` AND p.group_id = $${paramCount}`;
      values.push(filters.group_id);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY p.created_at DESC';

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
    return result.rows.map(row => new Publication(row));
  }

  // Update publication
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Track status changes for history
    const oldStatus = this.status;
    const newStatus = updateData.status;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE publications SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    // Update status history if status changed
    if (newStatus && oldStatus !== newStatus) {
      await this.addStatusHistoryEntry(newStatus, updateData.adminId || updateData.approved_by || updateData.rejected_by, updateData.rejection_reason);
    }

    return this;
  }

  // Delete publication (soft delete by setting is_active to false)
  async delete() {
    return await this.update({ is_active: false });
  }

  // Get group for this publication
  async getGroup() {
    const Group = require('./Group');
    return await Group.findById(this.group_id);
  }

  // Add status history entry
  async addStatusHistoryEntry(newStatus, adminId, rejectionReason = null) {
    const historyEntry = {
      status: newStatus,
      changed_at: new Date().toISOString(),
      changed_by: adminId,
      rejection_reason: rejectionReason
    };

    const currentHistory = Array.isArray(this.status_history) ? this.status_history : [];
    currentHistory.push(historyEntry);

    const sql = 'UPDATE publications SET status_history = $1 WHERE id = $2';
    await query(sql, [JSON.stringify(currentHistory), this.id]);

    this.status_history = currentHistory;
  }

  // Approve publication
  async approve(adminId) {
    const updateData = {
      status: 'approved',
      approved_at: new Date(),
      approved_by: adminId,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null
    };

    return await this.update(updateData);
  }

  // Reject publication
  async reject(adminId, reason) {
    const updateData = {
      status: 'rejected',
      rejected_at: new Date(),
      rejected_by: adminId,
      rejection_reason: reason,
      approved_at: null,
      approved_by: null
    };

    return await this.update(updateData);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      group_id: this.group_id,
      publication_sn: this.publication_sn,
      publication_grade: this.publication_grade,
      publication_name: this.publication_name,
      publication_website: this.publication_website,
      publication_price: this.publication_price,
      agreement_tat: this.agreement_tat,
      practical_tat: this.practical_tat,
      publication_socials_icons: this.publication_socials_icons,
      publication_language: this.publication_language,
      publication_region: this.publication_region,
      publication_primary_industry: this.publication_primary_industry,
      website_news_index: this.website_news_index,
      da: this.da,
      dr: this.dr,
      sponsored_or_not: this.sponsored_or_not,
      words_limit: this.words_limit,
      number_of_images: this.number_of_images,
      do_follow_link: this.do_follow_link,
      example_link: this.example_link,
      excluding_categories: this.excluding_categories,
      other_remarks: this.other_remarks,
      tags_badges: this.tags_badges,
      live_on_platform: this.live_on_platform,
      submitted_by: this.submitted_by,
      submitted_by_admin: this.submitted_by_admin,
      status: this.status,
      is_active: this.is_active,
      status_history: this.status_history,
      approved_at: this.approved_at,
      approved_by: this.approved_by,
      rejected_at: this.rejected_at,
      rejected_by: this.rejected_by,
      rejection_reason: this.rejection_reason,
      admin_comments: this.admin_comments,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Publication;