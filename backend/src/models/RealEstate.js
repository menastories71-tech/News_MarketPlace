const { query } = require('../config/database');

class RealEstate {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.location = data.location;
    this.property_type = data.property_type;
    this.bedrooms = data.bedrooms;
    this.bathrooms = data.bathrooms;
    this.area_sqft = data.area_sqft;
    // Handle images field - ensure it's always an array
    if (typeof data.images === 'string') {
      try {
        this.images = JSON.parse(data.images);
      } catch (e) {
        console.error('Error parsing images JSON:', e);
        this.images = [];
      }
    } else if (Array.isArray(data.images)) {
      this.images = data.images;
    } else {
      this.images = data.images || [];
    }
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

  // Validate real estate data
  static validate(realEstateData) {
    const errors = [];

    // Required fields
    if (!realEstateData.title || typeof realEstateData.title !== 'string' || realEstateData.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    }

    if (!realEstateData.description || typeof realEstateData.description !== 'string' || realEstateData.description.trim().length === 0) {
      errors.push('Description is required and must be a non-empty string');
    }

    // String fields
    const stringFields = [
      'location', 'property_type'
    ];

    stringFields.forEach(field => {
      if (realEstateData[field] !== undefined && typeof realEstateData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Number fields
    if (realEstateData.price !== undefined && (typeof realEstateData.price !== 'number' || realEstateData.price < 0)) {
      errors.push('Price must be a non-negative number');
    }

    if (realEstateData.bedrooms !== undefined && (!Number.isInteger(realEstateData.bedrooms) || realEstateData.bedrooms < 0)) {
      errors.push('Bedrooms must be a non-negative integer');
    }

    if (realEstateData.bathrooms !== undefined && (!Number.isInteger(realEstateData.bathrooms) || realEstateData.bathrooms < 0)) {
      errors.push('Bathrooms must be a non-negative integer');
    }

    if (realEstateData.area_sqft !== undefined && (typeof realEstateData.area_sqft !== 'number' || realEstateData.area_sqft < 0)) {
      errors.push('Area must be a non-negative number');
    }

    // Status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (realEstateData.status && !validStatuses.includes(realEstateData.status)) {
      errors.push('Status must be one of: pending, approved, rejected');
    }

    // User association - submitted_by is required for user submissions, optional for admin submissions
    if (realEstateData.submitted_by !== undefined && realEstateData.submitted_by !== null && !Number.isInteger(realEstateData.submitted_by)) {
      errors.push('Submitted by must be an integer');
    }

    // For admin submissions, either submitted_by or submitted_by_admin should be present
    if (realEstateData.submitted_by_admin !== undefined && realEstateData.submitted_by_admin !== null && !Number.isInteger(realEstateData.submitted_by_admin)) {
      errors.push('Submitted by admin must be an integer');
    }

    // Ensure at least one submitter is present
    if ((realEstateData.submitted_by === undefined || realEstateData.submitted_by === null) &&
      (realEstateData.submitted_by_admin === undefined || realEstateData.submitted_by_admin === null)) {
      errors.push('Either submitted_by or submitted_by_admin must be provided');
    }

    return errors;
  }

  // Create a new real estate
  static async create(realEstateData) {
    const validationErrors = this.validate(realEstateData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const allowedFields = [
      'title', 'description', 'price', 'location', 'property_type',
      'bedrooms', 'bathrooms', 'area_sqft', 'images',
      'status', 'submitted_by', 'submitted_by_admin', 'approved_at', 'approved_by',
      'rejected_at', 'rejected_by', 'rejection_reason', 'admin_comments', 'is_active'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (realEstateData[field] !== undefined) {
        filteredData[field] = field === 'images' ? JSON.stringify(realEstateData[field]) : realEstateData[field];
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO real_estates (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new RealEstate(result.rows[0]);
  }

  // Find all with filters, sorting, and count
  static async findAndCountAll({ where = {}, limit = null, offset = null, order = [['created_at', 'DESC']] }) {
    let sql = 'SELECT * FROM real_estates';
    let countSql = 'SELECT COUNT(*) FROM real_estates';
    const values = [];
    const whereClauses = [];

    // Construct WHERE clause
    Object.keys(where).forEach((key) => {
      const condition = where[key];
      if (condition && typeof condition === 'object') {
        if (key === 'search' && condition.val) {
          whereClauses.push(`(title ILIKE $${values.length + 1} OR location ILIKE $${values.length + 2} OR property_type ILIKE $${values.length + 3})`);
          values.push(`%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`);
        }
      } else if (condition !== undefined && condition !== null) {
        whereClauses.push(`${key} = $${values.length + 1}`);
        values.push(condition);
      }
    });

    if (whereClauses.length > 0) {
      const wherePart = ` WHERE ${whereClauses.join(' AND ')}`;
      sql += wherePart;
      countSql += wherePart;
    }

    // Handle ORDER BY
    if (order && order.length > 0) {
      const [col, dir] = order[0];
      sql += ` ORDER BY ${col} ${dir}`;
    }

    // Handle Limit and Offset
    if (limit !== null) {
      sql += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }
    if (offset !== null) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const [result, countResult] = await Promise.all([
      query(sql, values),
      query(countSql, values.slice(0, values.length - (limit !== null ? (offset !== null ? 2 : 1) : 0)))
    ]);

    return {
      rows: result.rows.map(row => {
        if (row.images && typeof row.images === 'string') {
          try {
            row.images = JSON.parse(row.images);
          } catch (e) {
            row.images = [];
          }
        }
        return new RealEstate(row);
      }),
      count: parseInt(countResult.rows[0].count)
    };
  }

  // Find real estate by ID
  static async findById(id) {
    const sql = 'SELECT * FROM real_estates WHERE id = $1';
    const result = await query(sql, [id]);
    if (result.rows[0]) {
      // Ensure images field is properly parsed
      const row = result.rows[0];
      if (row.images && typeof row.images === 'string') {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          console.error('Error parsing images in findById:', e);
          row.images = [];
        }
      }
      return new RealEstate(row);
    }
    return null;
  }

  // Find all real estates
  static async findAll() {
    const sql = 'SELECT * FROM real_estates ORDER BY created_at DESC';
    const result = await query(sql);
    // Ensure images field is properly parsed
    return result.rows.map(row => {
      if (row.images && typeof row.images === 'string') {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          console.error('Error parsing images in findAll:', e);
          row.images = [];
        }
      }
      return new RealEstate(row);
    });
  }

  // Update real estate
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
      const validationErrors = RealEstate.validate({ ...this, ...updateData });
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
        values.push(key === 'images' ? JSON.stringify(updateData[key]) : updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE real_estates SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    // Handle images field parsing for updated data
    const updatedData = result.rows[0];
    if (updatedData.images && typeof updatedData.images === 'string') {
      try {
        updatedData.images = JSON.parse(updatedData.images);
      } catch (e) {
        console.error('Error parsing images in update:', e);
        updatedData.images = [];
      }
    }
    Object.assign(this, updatedData);
    return this;
  }

  // Delete real estate
  async delete() {
    const sql = 'DELETE FROM real_estates WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      price: this.price,
      location: this.location,
      property_type: this.property_type,
      bedrooms: this.bedrooms,
      bathrooms: this.bathrooms,
      area_sqft: this.area_sqft,
      images: this.images,
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

module.exports = RealEstate;