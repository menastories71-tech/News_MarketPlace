const { query } = require('../config/database');

class ArticleSubmission {
  // Generate slug from title
  static generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Generate unique slug (handles duplicates)
  static async generateUniqueSlug(title, excludeId = null) {
    let baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.findBySlug(slug);
      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Find by slug
  static async findBySlug(slug) {
    const sql = 'SELECT * FROM article_submissions WHERE slug = $1';
    const result = await query(sql, [slug]);
    return result.rows[0] ? new ArticleSubmission(result.rows[0]) : null;
  }
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.publication_id = data.publication_id;
    this.title = data.title;
    this.slug = data.slug;
    this.sub_title = data.sub_title;
    this.by_line = data.by_line;
    this.tentative_publish_date = data.tentative_publish_date;
    this.article_text = data.article_text;
    this.image1 = data.image1;
    this.image2 = data.image2;
    this.document = data.document;
    this.website_link = data.website_link;
    this.instagram_link = data.instagram_link;
    this.facebook_link = data.facebook_link;
    this.terms_agreed = data.terms_agreed !== undefined ? data.terms_agreed : false;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new article submission
  static async create(submissionData) {
    const {
      user_id,
      publication_id,
      title,
      sub_title,
      by_line,
      tentative_publish_date,
      article_text,
      image1,
      image2,
      document,
      website_link,
      instagram_link,
      facebook_link,
      terms_agreed
    } = submissionData;

    // Generate unique slug
    const slug = await this.generateUniqueSlug(title);

    const sql = `
      INSERT INTO article_submissions (
        user_id, publication_id, title, slug, sub_title, by_line, tentative_publish_date,
        article_text, image1, image2, document, website_link, instagram_link, facebook_link, terms_agreed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      user_id, publication_id, title, slug, sub_title, by_line, tentative_publish_date,
      article_text, image1, image2, document, website_link, instagram_link, facebook_link, terms_agreed || false
    ];

    const result = await query(sql, values);
    return new ArticleSubmission(result.rows[0]);
  }

  // Find article submission by ID
  static async findById(id) {
    const sql = 'SELECT * FROM article_submissions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new ArticleSubmission(result.rows[0]) : null;
  }

  // Find article submissions by user ID
  static async findByUserId(user_id, limit = null, offset = null) {
    let sql = 'SELECT * FROM article_submissions WHERE user_id = $1 ORDER BY created_at DESC';
    const values = [user_id];
    let paramCount = 2;

    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(limit);
      paramCount++;
    }

    if (offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => new ArticleSubmission(row));
  }

  // Find article submissions by publication ID
  static async findByPublicationId(publication_id, limit = null, offset = null) {
    let sql = 'SELECT * FROM article_submissions WHERE publication_id = $1 ORDER BY created_at DESC';
    const values = [publication_id];
    let paramCount = 2;

    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(limit);
      paramCount++;
    }

    if (offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => new ArticleSubmission(row));
  }

  // Find all article submissions with filters
  static async findAll(filters = {}, limit = null, offset = null, search = null) {
    console.log('Using new JOIN query for findAll');
    let sql = `
      SELECT
        asub.*,
        p.publication_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM article_submissions asub
      LEFT JOIN publications p ON asub.publication_id = p.id
      LEFT JOIN users u ON asub.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND asub.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND asub.user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.publication_id) {
      sql += ` AND asub.publication_id = $${paramCount}`;
      values.push(filters.publication_id);
      paramCount++;
    }

    // Add search functionality
    if (search && search.trim()) {
      sql += ` AND (asub.title ILIKE $${paramCount} OR asub.sub_title ILIKE $${paramCount + 1} OR asub.by_line ILIKE $${paramCount + 2} OR asub.article_text ILIKE $${paramCount + 3})`;
      const searchTerm = `%${search.trim()}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramCount += 4;
    }

    sql += ' ORDER BY asub.created_at DESC';

    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(limit);
      paramCount++;
    }

    if (offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => {
      const submission = new ArticleSubmission(row);
      // Add joined data
      submission.publication_name = row.publication_name;
      submission.user_first_name = row.user_first_name;
      submission.user_last_name = row.user_last_name;
      submission.user_email = row.user_email;
      return submission;
    });
  }

  // Get total count for pagination
  static async getTotalCount(filters = {}, search = null) {
    let sql = 'SELECT COUNT(*) FROM article_submissions WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.publication_id) {
      sql += ` AND publication_id = $${paramCount}`;
      values.push(filters.publication_id);
      paramCount++;
    }

    // Add search functionality
    if (search && search.trim()) {
      sql += ` AND (title ILIKE $${paramCount} OR sub_title ILIKE $${paramCount + 1} OR by_line ILIKE $${paramCount + 2} OR article_text ILIKE $${paramCount + 3})`;
      const searchTerm = `%${search.trim()}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramCount += 4;
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].count);
  }

  // Update article submission
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
    const sql = `UPDATE article_submissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete article submission
  async delete() {
    const sql = 'DELETE FROM article_submissions WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Get associated user
  async getUser() {
    const User = require('./User');
    return await User.findById(this.user_id);
  }

  // Get associated publication
  async getPublication() {
    const Publication = require('./Publication');
    return await Publication.findById(this.publication_id);
  }

  // Approve submission
  async approve() {
    return await this.update({ status: 'approved' });
  }

  // Reject submission
  async reject() {
    return await this.update({ status: 'rejected' });
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      publication_id: this.publication_id,
      title: this.title,
      slug: this.slug,
      sub_title: this.sub_title,
      by_line: this.by_line,
      tentative_publish_date: this.tentative_publish_date,
      article_text: this.article_text,
      image1: this.image1,
      image2: this.image2,
      document: this.document,
      website_link: this.website_link,
      instagram_link: this.instagram_link,
      facebook_link: this.facebook_link,
      terms_agreed: this.terms_agreed,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Include joined data
      publication_name: this.publication_name,
      user_first_name: this.user_first_name,
      user_last_name: this.user_last_name,
      user_email: this.user_email
    };
  }
}

module.exports = ArticleSubmission;