const { query } = require('../config/database');

class EventEnquiry {
  constructor(data) {
    this.id = data.id;
    this.event_name = data.event_name;
    this.event_date = data.event_date;
    this.organiser = data.organiser;
    this.event_industry = data.event_industry;
    this.event_sub_industry = data.event_sub_industry;
    this.country = data.country;
    this.city = data.city;
    this.event_venue_name = data.event_venue_name;
    this.google_map_location = data.google_map_location;
    this.event_mode = data.event_mode;
    this.event_type = data.event_type;
    this.event_organised_by = data.event_organised_by;
    this.event_commercial = data.event_commercial;
    this.event_website = data.event_website;
    this.event_ig = data.event_ig;
    this.event_linkedin = data.event_linkedin;
    this.event_facebook = data.event_facebook;
    this.event_youtube = data.event_youtube;
    this.event_entrance = data.event_entrance;
    this.contact_person_name = data.contact_person_name;
    this.contact_person_email = data.contact_person_email;
    this.contact_person_number = data.contact_person_number;
    this.contact_person_whatsapp = data.contact_person_whatsapp;
    this.market_company_name = data.market_company_name;
    this.provide_booth = data.provide_booth;
    this.terms_and_conditions = data.terms_and_conditions;
    this.how_did_you_hear = data.how_did_you_hear;
    this.message = data.message;
    this.status = data.status || 'new';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validate event enquiry data
  static validate(enquiryData) {
    const errors = [];

    // Required fields
    if (!enquiryData.event_name || typeof enquiryData.event_name !== 'string' || enquiryData.event_name.trim().length === 0) {
      errors.push('Event name is required and must be a non-empty string');
    }

    if (!enquiryData.contact_person_name || typeof enquiryData.contact_person_name !== 'string' || enquiryData.contact_person_name.trim().length === 0) {
      errors.push('Contact person name is required and must be a non-empty string');
    }

    if (!enquiryData.contact_person_email || !this.isValidEmail(enquiryData.contact_person_email)) {
      errors.push('Contact person email is required and must be a valid email address');
    }

    if (enquiryData.terms_and_conditions !== true) {
      errors.push('Terms and conditions must be accepted');
    }

    // Temporarily skip reCAPTCHA validation for testing
    // if (!enquiryData.recaptchaToken || typeof enquiryData.recaptchaToken !== 'string' || enquiryData.recaptchaToken.trim().length === 0) {
    //   errors.push('reCAPTCHA token is required');
    // }

    // Enum validations
    const validEventModes = ['virtual', 'in person'];
    if (enquiryData.event_mode && !validEventModes.includes(enquiryData.event_mode)) {
      errors.push('Event mode must be one of: virtual, in person');
    }

    const validEventTypes = ['networking', 'expo', 'exhibition', 'conference', 'awards', 'seminar', 'forum'];
    if (enquiryData.event_type && !validEventTypes.includes(enquiryData.event_type)) {
      errors.push('Event type must be one of: networking, expo, exhibition, conference, awards, seminar, forum');
    }

    const validOrganisedBy = ['Government', 'private', 'ngo'];
    if (enquiryData.event_organised_by && !validOrganisedBy.includes(enquiryData.event_organised_by)) {
      errors.push('Event organised by must be one of: Government, private, ngo');
    }

    const validCommercial = ['profit oriented', 'community oriented'];
    if (enquiryData.event_commercial && !validCommercial.includes(enquiryData.event_commercial)) {
      errors.push('Event commercial must be one of: profit oriented, community oriented');
    }

    const validEntrance = ['free for all', 'ticket based', 'invite based'];
    if (enquiryData.event_entrance && !validEntrance.includes(enquiryData.event_entrance)) {
      errors.push('Event entrance must be one of: free for all, ticket based, invite based');
    }

    // Boolean fields
    if (enquiryData.market_company_name !== undefined && typeof enquiryData.market_company_name !== 'boolean') {
      errors.push('Market company name must be a boolean');
    }

    if (enquiryData.provide_booth !== undefined && typeof enquiryData.provide_booth !== 'boolean') {
      errors.push('Provide booth must be a boolean');
    }

    // String fields
    const stringFields = [
      'organiser', 'event_industry', 'event_sub_industry', 'country', 'city',
      'event_venue_name', 'google_map_location', 'event_website', 'event_ig',
      'event_linkedin', 'event_facebook', 'event_youtube', 'contact_person_number',
      'contact_person_whatsapp', 'how_did_you_hear', 'message'
    ];

    stringFields.forEach(field => {
      if (enquiryData[field] !== undefined && typeof enquiryData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Date field
    if (enquiryData.event_date && isNaN(Date.parse(enquiryData.event_date))) {
      errors.push('Event date must be a valid date');
    }

    // Status
    const validStatuses = ['new', 'viewed'];
    if (enquiryData.status && !validStatuses.includes(enquiryData.status)) {
      errors.push('Status must be one of: new, viewed');
    }

    return errors;
  }

  // Simple email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Create a new event enquiry
  static async create(enquiryData) {
    const validationErrors = this.validate(enquiryData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const allowedFields = [
      'event_name', 'event_date', 'organiser', 'event_industry', 'event_sub_industry',
      'country', 'city', 'event_venue_name', 'google_map_location', 'event_mode',
      'event_type', 'event_organised_by', 'event_commercial', 'event_website',
      'event_ig', 'event_linkedin', 'event_facebook', 'event_youtube', 'event_entrance',
      'contact_person_name', 'contact_person_email', 'contact_person_number',
      'contact_person_whatsapp', 'market_company_name', 'provide_booth',
      'terms_and_conditions', 'how_did_you_hear', 'message', 'status'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (enquiryData[field] !== undefined) {
        filteredData[field] = enquiryData[field];
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO event_enquiries (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new EventEnquiry(result.rows[0]);
  }

  // Find enquiry by ID
  static async findById(id) {
    const sql = 'SELECT * FROM event_enquiries WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new EventEnquiry(result.rows[0]) : null;
  }

  // Find all enquiries
  static async findAll() {
    const sql = 'SELECT * FROM event_enquiries ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows.map(row => new EventEnquiry(row));
  }

  // Update enquiry
  async update(updateData) {
    const validationErrors = EventEnquiry.validate({ ...this, ...updateData });
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
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
    const sql = `UPDATE event_enquiries SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete enquiry
  async delete() {
    const sql = 'DELETE FROM event_enquiries WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_name: this.event_name,
      event_date: this.event_date,
      organiser: this.organiser,
      event_industry: this.event_industry,
      event_sub_industry: this.event_sub_industry,
      country: this.country,
      city: this.city,
      event_venue_name: this.event_venue_name,
      google_map_location: this.google_map_location,
      event_mode: this.event_mode,
      event_type: this.event_type,
      event_organised_by: this.event_organised_by,
      event_commercial: this.event_commercial,
      event_website: this.event_website,
      event_ig: this.event_ig,
      event_linkedin: this.event_linkedin,
      event_facebook: this.event_facebook,
      event_youtube: this.event_youtube,
      event_entrance: this.event_entrance,
      contact_person_name: this.contact_person_name,
      contact_person_email: this.contact_person_email,
      contact_person_number: this.contact_person_number,
      contact_person_whatsapp: this.contact_person_whatsapp,
      market_company_name: this.market_company_name,
      provide_booth: this.provide_booth,
      terms_and_conditions: this.terms_and_conditions,
      how_did_you_hear: this.how_did_you_hear,
      message: this.message,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = EventEnquiry;