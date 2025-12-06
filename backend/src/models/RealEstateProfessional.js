const { query } = require('../config/database');

class RealEstateProfessional {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.ig_url = data.ig_url;
    this.no_of_followers = data.no_of_followers;
    this.verified_tick = data.verified_tick !== undefined ? data.verified_tick : false;
    this.linkedin = data.linkedin;
    this.tiktok = data.tiktok;
    this.facebook = data.facebook;
    this.youtube = data.youtube;
    this.real_estate_agency_owner = data.real_estate_agency_owner !== undefined ? data.real_estate_agency_owner : false;
    this.real_estate_agent = data.real_estate_agent !== undefined ? data.real_estate_agent : false;
    this.developer_employee = data.developer_employee !== undefined ? data.developer_employee : false;
    this.gender = data.gender;
    this.nationality = data.nationality;
    this.current_residence_city = data.current_residence_city;
    // Handle languages field - ensure it's always an array
    if (typeof data.languages === 'string') {
      try {
        this.languages = JSON.parse(data.languages);
      } catch (e) {
        console.error('Error parsing languages JSON:', e);
        this.languages = [];
      }
    } else if (Array.isArray(data.languages)) {
      this.languages = data.languages;
    } else {
      this.languages = data.languages || [];
    }
    this.image = data.image;
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

  // Validate real estate professional data
  static validate(professionalData) {
    const errors = [];

    // Required fields
    if (!professionalData.first_name || typeof professionalData.first_name !== 'string' || professionalData.first_name.trim().length === 0) {
      errors.push('First name is required and must be a non-empty string');
    }

    if (!professionalData.last_name || typeof professionalData.last_name !== 'string' || professionalData.last_name.trim().length === 0) {
      errors.push('Last name is required and must be a non-empty string');
    }

    // String fields
    const stringFields = [
      'ig_url', 'linkedin', 'tiktok', 'facebook', 'youtube',
      'gender', 'nationality', 'current_residence_city', 'image'
    ];

    stringFields.forEach(field => {
      if (professionalData[field] !== undefined && typeof professionalData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Number fields
    if (professionalData.no_of_followers !== undefined && (!Number.isInteger(professionalData.no_of_followers) || professionalData.no_of_followers < 0)) {
      errors.push('Number of followers must be a non-negative integer');
    }

    // Boolean fields
    const booleanFields = ['verified_tick', 'real_estate_agency_owner', 'real_estate_agent', 'developer_employee'];
    booleanFields.forEach(field => {
      if (professionalData[field] !== undefined && typeof professionalData[field] !== 'boolean') {
        errors.push(`${field.replace(/_/g, ' ')} must be a boolean`);
      }
    });

    // Languages array
    if (professionalData.languages !== undefined && !Array.isArray(professionalData.languages)) {
      errors.push('Languages must be an array');
    }

    // Status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (professionalData.status && !validStatuses.includes(professionalData.status)) {
      errors.push('Status must be one of: pending, approved, rejected');
    }

    // User association - submitted_by is required for user submissions, optional for admin submissions
    if (professionalData.submitted_by !== undefined && professionalData.submitted_by !== null && !Number.isInteger(professionalData.submitted_by)) {
      errors.push('Submitted by must be an integer');
    }

    // For admin submissions, either submitted_by or submitted_by_admin should be present
    if (professionalData.submitted_by_admin !== undefined && professionalData.submitted_by_admin !== null && !Number.isInteger(professionalData.submitted_by_admin)) {
      errors.push('Submitted by admin must be an integer');
    }

    // Ensure at least one submitter is present
    if ((professionalData.submitted_by === undefined || professionalData.submitted_by === null) &&
        (professionalData.submitted_by_admin === undefined || professionalData.submitted_by_admin === null)) {
      errors.push('Either submitted_by or submitted_by_admin must be provided');
    }

    return errors;
  }

  // Create a new real estate professional
  static async create(professionalData) {
    console.log('RealEstateProfessional.create - Starting validation');
    const validationErrors = this.validate(professionalData);
    if (validationErrors.length > 0) {
      console.error('RealEstateProfessional.create - Validation errors:', validationErrors);
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    console.log('RealEstateProfessional.create - Validation passed');
    // Only include fields that exist in the database table
    // This prevents errors when columns haven't been added yet via migration
    const allowedFields = [
      'first_name', 'last_name', 'ig_url', 'no_of_followers', 'verified_tick',
      'linkedin', 'tiktok', 'facebook', 'youtube', 'real_estate_agency_owner',
      'real_estate_agent', 'developer_employee', 'gender', 'nationality',
      'current_residence_city', 'languages', 'image', 'is_active'
    ];

    // Temporarily disable optional fields until migration is confirmed
    // const optionalFields = [
    //   'status', 'submitted_by', 'submitted_by_admin', 'approved_at', 'approved_by',
    //   'rejected_at', 'rejected_by', 'rejection_reason', 'admin_comments'
    // ];

    // // Check which optional fields exist in the data
    // optionalFields.forEach(field => {
    //   if (professionalData[field] !== undefined) {
    //     allowedFields.push(field);
    //   }
    // });

    const filteredData = {};
    allowedFields.forEach(field => {
      if (professionalData[field] !== undefined) {
        filteredData[field] = (field === 'languages') ? JSON.stringify(professionalData[field]) : professionalData[field];
      }
    });

    console.log('RealEstateProfessional.create - Filtered data keys:', Object.keys(filteredData));
    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO real_estate_professionals (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    console.log('RealEstateProfessional.create - Executing SQL:', sql);
    console.log('RealEstateProfessional.create - Values:', values);
    const result = await query(sql, values);
    console.log('RealEstateProfessional.create - Query result:', result.rows.length > 0 ? 'Success' : 'No rows returned');

    const professional = new RealEstateProfessional(result.rows[0]);
    console.log('RealEstateProfessional.create - Created professional with ID:', professional.id);
    return professional;
  }

  // Find real estate professional by ID
  static async findById(id) {
    const sql = 'SELECT * FROM real_estate_professionals WHERE id = $1';
    const result = await query(sql, [id]);
    if (result.rows[0]) {
      // Ensure languages field is properly parsed
      const row = result.rows[0];
      if (row.languages && typeof row.languages === 'string') {
        try {
          row.languages = JSON.parse(row.languages);
        } catch (e) {
          console.error('Error parsing languages in findById:', e);
          row.languages = [];
        }
      }
      return new RealEstateProfessional(row);
    }
    return null;
  }

  // Find all real estate professionals
  static async findAll(limit = null, offset = 0) {
    let sql = 'SELECT * FROM real_estate_professionals ORDER BY created_at DESC';
    const params = [];

    if (limit !== null) {
      sql += ' LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    // Ensure languages field is properly parsed
    return result.rows.map(row => {
      if (row.languages && typeof row.languages === 'string') {
        try {
          row.languages = JSON.parse(row.languages);
        } catch (e) {
          console.error('Error parsing languages in findAll:', e);
          row.languages = [];
        }
      }
      return new RealEstateProfessional(row);
    });
  }

  // Update real estate professional
  async update(updateData) {
    console.log('RealEstateProfessional.update - Starting update for ID:', this.id);
    console.log('RealEstateProfessional.update - Update data keys:', Object.keys(updateData));

    // For status updates, only validate the status field to avoid issues with existing invalid data
    if ('status' in updateData) {
      console.log('RealEstateProfessional.update - Status-only update');
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(updateData.status)) {
        console.error('RealEstateProfessional.update - Invalid status:', updateData.status);
        throw new Error('Validation errors: Status must be one of: pending, approved, rejected');
      }

      // For status updates, skip full validation to avoid issues with existing invalid data
      // Only validate the status field
    } else {
      console.log('RealEstateProfessional.update - Full validation');
      // For other updates (non-status updates), validate all fields
      const validationErrors = RealEstateProfessional.validate({ ...this, ...updateData });
      if (validationErrors.length > 0) {
        console.error('RealEstateProfessional.update - Validation errors:', validationErrors);
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }
    }

    console.log('RealEstateProfessional.update - Validation passed');
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push((key === 'languages') ? JSON.stringify(updateData[key]) : updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      console.log('RealEstateProfessional.update - No fields to update');
      return this;
    }

    values.push(this.id);
    const sql = `UPDATE real_estate_professionals SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    console.log('RealEstateProfessional.update - Executing SQL:', sql);
    console.log('RealEstateProfessional.update - Values:', values);

    const result = await query(sql, values);
    console.log('RealEstateProfessional.update - Query result:', result.rows.length > 0 ? 'Success' : 'No rows returned');

    // Handle languages field parsing for updated data
    const updatedData = result.rows[0];
    if (updatedData.languages && typeof updatedData.languages === 'string') {
      try {
        updatedData.languages = JSON.parse(updatedData.languages);
        console.log('RealEstateProfessional.update - Languages parsed successfully');
      } catch (e) {
        console.error('RealEstateProfessional.update - Error parsing languages in update:', e);
        updatedData.languages = [];
      }
    }
    Object.assign(this, updatedData);
    console.log('RealEstateProfessional.update - Update completed for ID:', this.id);
    return this;
  }

  // Delete real estate professional
  async delete() {
    const sql = 'DELETE FROM real_estate_professionals WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      ig_url: this.ig_url,
      no_of_followers: this.no_of_followers,
      verified_tick: this.verified_tick,
      linkedin: this.linkedin,
      tiktok: this.tiktok,
      facebook: this.facebook,
      youtube: this.youtube,
      real_estate_agency_owner: this.real_estate_agency_owner,
      real_estate_agent: this.real_estate_agent,
      developer_employee: this.developer_employee,
      gender: this.gender,
      nationality: this.nationality,
      current_residence_city: this.current_residence_city,
      languages: this.languages,
      image: this.image,
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

module.exports = RealEstateProfessional;