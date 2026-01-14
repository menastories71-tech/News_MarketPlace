const { query } = require('../config/database');

class Website {
  constructor(data) {
    // Core Fields
    this.id = data.id;
    this.media_name = data.media_name;
    this.media_website_address = data.media_website_address;
    this.news_media_type = data.news_media_type;
    this.languages = data.languages;
    this.categories = data.categories;
    this.custom_category = data.custom_category;
    this.location_type = data.location_type;
    this.selected_continent = Array.isArray(data.selected_continent) ? data.selected_continent : (data.selected_continent ? JSON.parse(data.selected_continent) : []);
    this.selected_country = Array.isArray(data.selected_country) ? data.selected_country : (data.selected_country ? JSON.parse(data.selected_country) : []);
    this.selected_state = Array.isArray(data.selected_state) ? data.selected_state : (data.selected_state ? JSON.parse(data.selected_state) : []);
    this.country_name = data.country_name; // Keep for backward compatibility

    // Social Media Links
    this.ig = data.ig;
    this.facebook = data.facebook;
    this.linkedin = data.linkedin;
    this.tiktok = data.tiktok;
    this.youtube = data.youtube;
    this.snapchat = data.snapchat;
    this.twitter = data.twitter;
    this.instagram = data.instagram;
    this.whatsapp = data.whatsapp;

    // Content Policies
    this.social_media_embedded_allowed = data.social_media_embedded_allowed;
    this.social_media_url_allowed = data.social_media_url_allowed;
    this.external_website_link_allowed = data.external_website_link_allowed;
    this.images_allowed = data.images_allowed;
    this.words_limit = data.words_limit;
    this.back_date_allowed = data.back_date_allowed;
    this.da_score = data.da_score;
    this.dr_score = data.dr_score;
    this.pa_score = data.pa_score;
    this.do_follow_links = data.do_follow_links;
    this.disclaimer_required = data.disclaimer_required;
    this.listicle_allowed = data.listicle_allowed;
    this.turnaround_time = data.turnaround_time;
    this.price = data.price;
    this.company_name_in_title = data.company_name_in_title;
    this.individual_name_in_title = data.individual_name_in_title;
    this.sub_heading_allowed = data.sub_heading_allowed;
    this.by_line_allowed = data.by_line_allowed;
    this.permanent_placement = data.permanent_placement;
    this.deletion_allowed = data.deletion_allowed;
    this.modification_allowed = data.modification_allowed;

    // Owner Information
    this.owner_name = data.owner_name;
    this.owner_nationality = data.owner_nationality;
    this.owner_gender = data.owner_gender;
    this.owner_number = data.owner_number;
    this.whatsapp = data.whatsapp;
    this.owner_whatsapp = data.owner_whatsapp;
    this.owner_email = data.owner_email;
    this.owner_telegram = data.owner_telegram;
    this.how_did_you_hear = data.how_did_you_hear;
    this.any_to_say = data.any_to_say;

    // Document Paths
    this.registration_document = data.registration_document;
    this.tax_document = data.tax_document;
    this.bank_details_document = data.bank_details_document;
    this.passport_document = data.passport_document;
    this.contact_details_document = data.contact_details_document;

    // Additional
    this.how_did_you_hear = data.how_did_you_hear;
    this.comments = data.comments;
    this.terms_accepted = data.terms_accepted;
    this.captcha_response = data.captcha_response;

    // Metadata
    this.status = data.status || 'pending';
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

  // Validate website data
  static validate(websiteData) {
    const errors = [];

    // Core Fields
    if (!websiteData.media_name || typeof websiteData.media_name !== 'string' || websiteData.media_name.trim().length === 0) {
      errors.push('Media name is required and must be a non-empty string');
    }

    if (!websiteData.media_website_address || typeof websiteData.media_website_address !== 'string' || websiteData.media_website_address.trim().length === 0) {
      errors.push('Media website address is required and must be a non-empty string');
    }

    const validMediaTypes = ['Blog', 'Local news', 'News agency', 'News media', 'Just a website', 'Social media'];
    if (!websiteData.news_media_type || !validMediaTypes.includes(websiteData.news_media_type)) {
      errors.push('News media type must be one of: Blog, Local news, News agency, News media, Just a website, social media');
    }

    const validLanguages = ['english', 'russian', 'arabic', 'hindi', 'french', 'chinese'];
    if (!Array.isArray(websiteData.languages) || websiteData.languages.length === 0) {
      errors.push('Languages must be a non-empty array');
    } else {
      for (let lang of websiteData.languages) {
        if (!validLanguages.includes(lang)) {
          errors.push(`Invalid language: ${lang}`);
        }
      }
    }

    if (!Array.isArray(websiteData.categories) || websiteData.categories.length === 0) {
      errors.push('Categories must be a non-empty array');
    }

    const validLocationTypes = ['Global', 'Regional'];
    if (!websiteData.location_type || !validLocationTypes.includes(websiteData.location_type)) {
      errors.push('Location type must be one of: Global, Regional');
    }

    if (websiteData.location_type === 'Regional') {
      if (!Array.isArray(websiteData.selected_country) || websiteData.selected_country.length === 0) {
        errors.push('At least one country is required when location type is Regional');
      }
    }

    // Content Policies
    if (websiteData.social_media_embedded_allowed !== undefined && typeof websiteData.social_media_embedded_allowed !== 'boolean') {
      errors.push('Social media embedded allowed must be a boolean');
    }

    if (websiteData.social_media_url_allowed !== undefined && typeof websiteData.social_media_url_allowed !== 'boolean') {
      errors.push('Social media URL allowed must be a boolean');
    }

    if (websiteData.external_website_link_allowed !== undefined && typeof websiteData.external_website_link_allowed !== 'boolean') {
      errors.push('External website link allowed must be a boolean');
    }

    if (websiteData.images_allowed !== undefined && (!Number.isInteger(websiteData.images_allowed) || websiteData.images_allowed < 0)) {
      errors.push('Images allowed must be a non-negative integer');
    }

    if (websiteData.words_limit !== undefined && (!Number.isInteger(websiteData.words_limit) || websiteData.words_limit < 0)) {
      errors.push('Words limit must be a non-negative integer');
    }

    if (websiteData.back_date_allowed !== undefined && typeof websiteData.back_date_allowed !== 'boolean') {
      errors.push('Back date allowed must be a boolean');
    }

    if (websiteData.da_score !== undefined && (!Number.isInteger(websiteData.da_score) || websiteData.da_score < 0 || websiteData.da_score > 100)) {
      errors.push('DA score must be an integer between 0 and 100');
    }

    if (websiteData.dr_score !== undefined && (!Number.isInteger(websiteData.dr_score) || websiteData.dr_score < 0 || websiteData.dr_score > 100)) {
      errors.push('DR score must be an integer between 0 and 100');
    }

    if (websiteData.pa_score !== undefined && (!Number.isInteger(websiteData.pa_score) || websiteData.pa_score < 0 || websiteData.pa_score > 100)) {
      errors.push('PA score must be an integer between 0 and 100');
    }

    if (websiteData.do_follow_links !== undefined && typeof websiteData.do_follow_links !== 'boolean') {
      errors.push('Do follow links must be a boolean');
    }

    if (websiteData.disclaimer_required !== undefined && typeof websiteData.disclaimer_required !== 'boolean') {
      errors.push('Disclaimer required must be a boolean');
    }

    if (websiteData.listicle_allowed !== undefined && typeof websiteData.listicle_allowed !== 'boolean') {
      errors.push('Listicle allowed must be a boolean');
    }

    if (websiteData.turnaround_time !== undefined && typeof websiteData.turnaround_time !== 'string') {
      errors.push('Turnaround time must be a string');
    }

    if (websiteData.price !== undefined && (typeof websiteData.price !== 'number' || websiteData.price < 0)) {
      errors.push('Price must be a non-negative number');
    }

    if (websiteData.company_name_in_title !== undefined && typeof websiteData.company_name_in_title !== 'boolean') {
      errors.push('Company name in title must be a boolean');
    }

    if (websiteData.individual_name_in_title !== undefined && typeof websiteData.individual_name_in_title !== 'boolean') {
      errors.push('Individual name in title must be a boolean');
    }

    if (websiteData.sub_heading_allowed !== undefined && typeof websiteData.sub_heading_allowed !== 'boolean') {
      errors.push('Sub heading allowed must be a boolean');
    }

    if (websiteData.by_line_allowed !== undefined && typeof websiteData.by_line_allowed !== 'boolean') {
      errors.push('By line allowed must be a boolean');
    }

    if (websiteData.permanent_placement !== undefined && typeof websiteData.permanent_placement !== 'boolean') {
      errors.push('Permanent placement must be a boolean');
    }

    if (websiteData.deletion_allowed !== undefined && typeof websiteData.deletion_allowed !== 'boolean') {
      errors.push('Deletion allowed must be a boolean');
    }

    if (websiteData.modification_allowed !== undefined && typeof websiteData.modification_allowed !== 'boolean') {
      errors.push('Modification allowed must be a boolean');
    }

    // Owner Information
    if (!websiteData.owner_name || typeof websiteData.owner_name !== 'string' || websiteData.owner_name.trim().length === 0) {
      errors.push('Owner name is required and must be a non-empty string');
    }

    if (websiteData.owner_nationality && typeof websiteData.owner_nationality !== 'string') {
      errors.push('Owner nationality must be a string');
    }

    if (websiteData.owner_gender && typeof websiteData.owner_gender !== 'string') {
      errors.push('Owner gender must be a string');
    }

    if (!websiteData.owner_number || typeof websiteData.owner_number !== 'string' || websiteData.owner_number.trim().length === 0) {
      errors.push('Owner number is required and must be a non-empty string');
    }

    if (websiteData.owner_whatsapp && typeof websiteData.owner_whatsapp !== 'string') {
      errors.push('Owner WhatsApp must be a string');
    }

    if (websiteData.owner_email && !this.isValidEmail(websiteData.owner_email)) {
      errors.push('Owner email must be a valid email address');
    }

    if (websiteData.owner_telegram && typeof websiteData.owner_telegram !== 'string') {
      errors.push('Owner Telegram must be a string');
    }

    // Document Paths
    if (websiteData.registration_document && typeof websiteData.registration_document !== 'string') {
      errors.push('Registration document must be a string');
    }

    if (websiteData.tax_document && typeof websiteData.tax_document !== 'string') {
      errors.push('Tax document must be a string');
    }

    if (websiteData.bank_details_document && typeof websiteData.bank_details_document !== 'string') {
      errors.push('Bank details document must be a string');
    }

    if (websiteData.passport_document && typeof websiteData.passport_document !== 'string') {
      errors.push('Passport document must be a string');
    }

    if (websiteData.contact_details_document && typeof websiteData.contact_details_document !== 'string') {
      errors.push('Contact details document must be a string');
    }

    // Additional
    if (websiteData.how_did_you_hear && typeof websiteData.how_did_you_hear !== 'string') {
      errors.push('How did you hear must be a string');
    }

    if (websiteData.comments && typeof websiteData.comments !== 'string') {
      errors.push('Comments must be a string');
    }

    if (websiteData.terms_accepted !== true) {
      errors.push('Terms must be accepted');
    }

    if (websiteData.captcha_response !== undefined && (typeof websiteData.captcha_response !== 'string' || websiteData.captcha_response.trim().length === 0)) {
      errors.push('Captcha response must be a non-empty string if provided');
    }

    // Metadata
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (websiteData.status && !validStatuses.includes(websiteData.status)) {
      errors.push('Status must be one of: pending, approved, rejected');
    }

    if (!Number.isInteger(websiteData.submitted_by)) {
      errors.push('Submitted by must be an integer');
    }

    if (websiteData.submitted_by_admin !== undefined && !Number.isInteger(websiteData.submitted_by_admin)) {
      errors.push('Submitted by admin must be an integer');
    }

    return errors;
  }

  // Simple email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Create a new website
  static async create(websiteData) {
    const validationErrors = this.validate(websiteData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Only use the fields that exist in our model
    const allowedFields = [
      'id', 'media_name', 'media_website_address', 'news_media_type', 'languages',
      'categories', 'location_type', 'selected_continent', 'selected_country', 'selected_state', 'country_name', 'ig', 'facebook', 'linkedin',
      'tiktok', 'youtube', 'snapchat', 'twitter', 'social_media_embedded_allowed',
      'social_media_url_allowed', 'external_website_link_allowed', 'images_allowed',
      'words_limit', 'back_date_allowed', 'da_score', 'dr_score', 'pa_score',
      'do_follow_links', 'disclaimer_required', 'listicle_allowed', 'turnaround_time',
      'price', 'company_name_in_title', 'individual_name_in_title', 'sub_heading_allowed',
      'by_line_allowed', 'permanent_placement', 'deletion_allowed', 'modification_allowed',
      'owner_name', 'owner_nationality', 'owner_gender', 'owner_number', 'owner_whatsapp',
      'owner_email', 'owner_telegram', 'registration_document', 'tax_document',
      'bank_details_document', 'passport_document', 'contact_details_document',
      'how_did_you_hear', 'comments', 'terms_accepted', 'captcha_response',
      'status', 'submitted_by', 'submitted_by_admin', 'created_at', 'updated_at',
      'is_active'
    ];

    // Filter to only allowed fields and convert JSON arrays to proper JSON strings
    const filteredData = {};
    allowedFields.forEach(field => {
      if (websiteData[field] !== undefined) {
        let value = websiteData[field];

        // Convert JavaScript arrays to JSON strings for database
        if ((field === 'languages' || field === 'categories' || field === 'selected_continent' || field === 'selected_country' || field === 'selected_state') && Array.isArray(value)) {
          value = JSON.stringify(value);
        }

        filteredData[field] = value;
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO websites (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new Website(result.rows[0]);
  }

  // Find website by ID
  static async findById(id) {
    const sql = 'SELECT * FROM websites WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Website(result.rows[0]) : null;
  }

  // Find all websites
  static async findAll() {
    const sql = 'SELECT * FROM websites ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows.map(row => new Website(row));
  }

  // Update website
  async update(updateData, options = {}) {
    // Check if we should validate
    // Skip validation if:
    // 1. Explicitly requested via options.skipValidation
    // 2. Only 'status' is being updated (legacy support)
    // 3. Only 'is_active' is being updated (soft delete)
    // 4. Multiple bulk update fields (status + metadata)

    const fieldsToUpdate = Object.keys(updateData);
    const isSoftDelete = fieldsToUpdate.includes('is_active') && fieldsToUpdate.length === 1;
    const isStatusUpdate = fieldsToUpdate.includes('status');
    const shouldSerialize = options.skipValidation || isSoftDelete || isStatusUpdate;

    if (!shouldSerialize) {
      const validationErrors = Website.validate({ ...this, ...updateData });
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      // Skip updated_at as it is handled by SQL NOW()
      if (key === 'updated_at') return;

      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE websites SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete website
  async delete() {
    const sql = 'DELETE FROM websites WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Get associated user (if submitted_by is set)
  async getUser() {
    if (!this.submitted_by) {
      return null;
    }

    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [this.submitted_by]);
    return result.rows[0] || null;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      media_name: this.media_name,
      media_website_address: this.media_website_address,
      news_media_type: this.news_media_type,
      languages: this.languages,
      categories: this.categories,
      custom_category: this.custom_category,
      location_type: this.location_type,
      selected_continent: this.selected_continent,
      selected_country: this.selected_country,
      selected_state: this.selected_state,
      country_name: this.country_name,
      ig: this.ig,
      facebook: this.facebook,
      linkedin: this.linkedin,
      tiktok: this.tiktok,
      youtube: this.youtube,
      snapchat: this.snapchat,
      twitter: this.twitter,
      instagram: this.instagram,
      whatsapp: this.whatsapp,
      social_media_embedded_allowed: this.social_media_embedded_allowed,
      social_media_url_allowed: this.social_media_url_allowed,
      external_website_link_allowed: this.external_website_link_allowed,
      images_allowed: this.images_allowed,
      words_limit: this.words_limit,
      back_date_allowed: this.back_date_allowed,
      da_score: this.da_score,
      dr_score: this.dr_score,
      pa_score: this.pa_score,
      do_follow_links: this.do_follow_links,
      disclaimer_required: this.disclaimer_required,
      listicle_allowed: this.listicle_allowed,
      turnaround_time: this.turnaround_time,
      price: this.price,
      company_name_in_title: this.company_name_in_title,
      individual_name_in_title: this.individual_name_in_title,
      sub_heading_allowed: this.sub_heading_allowed,
      by_line_allowed: this.by_line_allowed,
      permanent_placement: this.permanent_placement,
      deletion_allowed: this.deletion_allowed,
      modification_allowed: this.modification_allowed,
      owner_name: this.owner_name,
      owner_nationality: this.owner_nationality,
      owner_gender: this.owner_gender,
      owner_number: this.owner_number,
      owner_whatsapp: this.owner_whatsapp,
      owner_email: this.owner_email,
      owner_telegram: this.owner_telegram,
      registration_document: this.registration_document,
      tax_document: this.tax_document,
      bank_details_document: this.bank_details_document,
      passport_document: this.passport_document,
      contact_details_document: this.contact_details_document,
      how_did_you_hear: this.how_did_you_hear,
      comments: this.comments,
      terms_accepted: this.terms_accepted,
      captcha_response: this.captcha_response,
      status: this.status,
      submitted_by: this.submitted_by,
      submitted_by_admin: this.submitted_by_admin,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_active: this.is_active
    };
  }
}

module.exports = Website;