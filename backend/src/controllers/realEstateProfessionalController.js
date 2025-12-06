const RealEstateProfessional = require('../models/RealEstateProfessional');
const { verifyRecaptcha } = require('../services/recaptchaService');
const { s3Service } = require('../services/s3Service');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Maximum 1 file for professional image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});


class RealEstateProfessionalController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getApprovedRealEstateProfessionals = this.getApprovedRealEstateProfessionals.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
    this.getLanguages = this.getLanguages.bind(this);
    this.getCountries = this.getCountries.bind(this);
    this.getCities = this.getCities.bind(this);
  }

  // Validation rules for user submissions
  createValidation = [
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('ig_url').optional().isURL().withMessage('Instagram URL must be a valid URL'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('verified_tick').optional().isBoolean().withMessage('Verified tick must be a boolean'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    body('tiktok').optional().isURL().withMessage('TikTok URL must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook URL must be a valid URL'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be a valid URL'),
    body('real_estate_agency_owner').optional().isBoolean().withMessage('Real estate agency owner must be a boolean'),
    body('real_estate_agent').optional().isBoolean().withMessage('Real estate agent must be a boolean'),
    body('developer_employee').optional().isBoolean().withMessage('Developer employee must be a boolean'),
    body('gender').optional().trim(),
    body('nationality').optional().trim(),
    body('current_residence_city').optional().trim(),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('recaptchaToken').optional().isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
  ];

  // Create a new real estate professional submission
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Verify reCAPTCHA for user submissions
      if (req.user && req.body.recaptchaToken) {
        const recaptchaScore = await verifyRecaptcha(req.body.recaptchaToken);
        if (recaptchaScore === null || recaptchaScore < 0.5) {
          return res.status(400).json({
            error: 'reCAPTCHA verification failed',
            message: 'Please complete the reCAPTCHA verification'
          });
        }
      }

      const professionalData = { ...req.body };

      // Handle image upload to S3
      if (req.file) {
        const s3Key = s3Service.generateKey('real-estate-professionals', 'image', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          professionalData.image = s3Url;
        } catch (uploadError) {
          console.error(`Failed to upload professional image to S3:`, uploadError);
          throw new Error('Failed to upload image');
        }
      }

      // Remove recaptchaToken from data before saving
      delete professionalData.recaptchaToken;

      // Set submission details
      professionalData.submitted_by = req.user?.userId;
      professionalData.status = 'pending';

      const professional = await RealEstateProfessional.create(professionalData);
      res.status(201).json({
        message: 'Real estate professional submission created successfully and is pending review',
        professional: professional.toJSON()
      });
    } catch (error) {
      console.error('Create real estate professional error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Get approved real estate professionals for public access
  async getApprovedRealEstateProfessionals(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        first_name,
        last_name,
        nationality,
        current_residence_city,
        languages
      } = req.query;

      // Build filters - only approved and active
      const filters = {
        status: 'approved',
        is_active: true
      };

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (first_name) {
        searchSql += ` AND rp.first_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${first_name}%`);
        searchParamCount++;
      }

      if (last_name) {
        searchSql += ` AND rp.last_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${last_name}%`);
        searchParamCount++;
      }

      if (nationality) {
        searchSql += ` AND rp.nationality ILIKE $${searchParamCount}`;
        searchValues.push(`%${nationality}%`);
        searchParamCount++;
      }

      if (current_residence_city) {
        searchSql += ` AND rp.current_residence_city ILIKE $${searchParamCount}`;
        searchValues.push(`%${current_residence_city}%`);
        searchParamCount++;
      }

      if (languages) {
        // Search for professionals who speak the specified language
        searchSql += ` AND $${searchParamCount} = ANY(rp.languages)`;
        searchValues.push(languages);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const professionals = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        professionals: professionals.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get approved real estate professionals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get approved real estate professional by ID (public access)
  async getApprovedById(req, res) {
    try {
      const { id } = req.params;
      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      // Only allow access to approved and active professionals
      if (professional.status !== 'approved' || !professional.is_active) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      res.json({ professional: professional.toJSON() });
    } catch (error) {
      console.error('Get approved real estate professional by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods for database queries
  async findAllWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE rp.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT rp.* FROM real_estate_professionals rp
      ${whereClause} ${searchSql}
      ORDER BY rp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    // Ensure languages field is properly parsed for raw SQL results
    return result.rows.map(row => {
      if (row.languages && typeof row.languages === 'string') {
        try {
          row.languages = JSON.parse(row.languages);
        } catch (e) {
          console.error('Error parsing languages in raw query result:', e);
          row.languages = [];
        }
      }
      return new RealEstateProfessional(row);
    });
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE rp.is_active = true';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM real_estate_professionals rp ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Get languages for real estate professional form
  async getLanguages(req, res) {
    try {
      const languages = [
        'English', 'Hindi', 'Arabic', 'French', 'Spanish', 'Chinese', 'Russian', 'German', 'Japanese', 'Portuguese'
      ];
      res.json({ languages });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get countries for real estate professional form
  async getCountries(req, res) {
    try {
      const countryPhoneData = require('../data/countryPhoneData');
      const countries = Object.keys(countryPhoneData);
      res.json({ countries });
    } catch (error) {
      console.error('Get countries error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get cities for a specific country
  async getCities(req, res) {
    try {
      const { country } = req.params;
      if (!country) {
        return res.status(400).json({ error: 'Country parameter is required' });
      }

      const citiesByCountry = {
        "India": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Surat"],
        "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
        "United Kingdom": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Glasgow", "Edinburgh", "Bristol", "Newcastle", "Sheffield"],
        "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
        "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraydah"],
        // Add more countries as needed
      };

      const cities = citiesByCountry[country] || [];
      res.json({ cities });
    } catch (error) {
      console.error('Get cities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RealEstateProfessionalController();