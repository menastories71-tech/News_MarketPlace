const Radio = require('../models/Radio');
const { s3Service: S3Service } = require('../services/s3Service');
const { body, validationResult } = require('express-validator');
const { Readable } = require('stream');

class RadioController {
  // Validation rules
  createValidation = [
    body('sn').trim().isLength({ min: 1 }).withMessage('Radio SN is required'),
    body('radio_name').trim().isLength({ min: 1 }).withMessage('Radio name is required'),
    body('frequency').trim().isLength({ min: 1 }).withMessage('Frequency is required'),
    body('radio_language').trim().isLength({ min: 1 }).withMessage('Radio language is required'),
    body('emirate_state').trim().isLength({ min: 1 }).withMessage('Emirate/State is required'),
    body('group_id').optional().isInt().withMessage('Group ID must be an integer'),
    body('radio_website').optional({ checkFalsy: true }).isURL().withMessage('Valid radio website URL is required'),
    body('radio_linkedin').optional({ checkFalsy: true }).isURL().withMessage('Valid LinkedIn URL is required'),
    body('radio_instagram').optional({ checkFalsy: true }).isURL().withMessage('Valid Instagram URL is required'),
    body('image_url').optional({ checkFalsy: true }).isURL().withMessage('Valid image URL is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  ];

  updateValidation = [
    body('sn').optional().trim().isLength({ min: 1 }).withMessage('Radio SN is required'),
    body('radio_name').optional().trim().isLength({ min: 1 }).withMessage('Radio name is required'),
    body('frequency').optional().trim().isLength({ min: 1 }).withMessage('Frequency is required'),
    body('radio_language').optional().trim().isLength({ min: 1 }).withMessage('Radio language is required'),
    body('emirate_state').optional().trim().isLength({ min: 1 }).withMessage('Emirate/State is required'),
    body('group_id').optional().isInt().withMessage('Group ID must be an integer'),
    body('radio_website').optional({ checkFalsy: true }).isURL().withMessage('Valid radio website URL is required'),
    body('radio_linkedin').optional({ checkFalsy: true }).isURL().withMessage('Valid LinkedIn URL is required'),
    body('radio_instagram').optional({ checkFalsy: true }).isURL().withMessage('Valid Instagram URL is required'),
    body('image_url').optional({ checkFalsy: true }).isURL().withMessage('Valid image URL is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  ];

  // Create a new radio
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const radioData = req.body;

      // Handle image upload
      if (req.file) {
        try {
          const imageUrl = await S3Service.uploadRadioImage(req.file.buffer, req.file.originalname, 'radios');
          radioData.image_url = imageUrl;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(400).json({ error: 'Failed to upload image' });
        }
      }

      const radio = await Radio.create(radioData);
      res.status(201).json({
        message: 'Radio created successfully',
        radio: radio.toJSON()
      });
    } catch (error) {
      console.error('Create radio error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all radios with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit, // No default limit - if not specified, fetch all
        group_id,
        radio_name
      } = req.query;

      // If no limit specified, fetch all records (for client-side pagination)
      const actualLimit = limit ? parseInt(limit) : null;

      const filters = {};
      if (group_id) filters.group_id = parseInt(group_id);

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (radio_name) {
        searchSql += ` AND radio_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${radio_name}%`);
        searchParamCount++;
      }

      const offset = actualLimit ? (page - 1) * actualLimit : null;
      const radios = await Radio.findAll(filters, searchSql, searchValues, actualLimit, offset);

      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM radios WHERE 1=1';
      const countValues = [];
      let countParamCount = 1;

      if (filters.group_id) {
        countSql += ` AND group_id = $${countParamCount}`;
        countValues.push(filters.group_id);
        countParamCount++;
      }

      if (radio_name) {
        countSql += ` AND radio_name ILIKE $${countParamCount}`;
        countValues.push(`%${radio_name}%`);
        countParamCount++;
      }

      const countResult = await require('../config/database').query(countSql, countValues);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        radios: radios.map(radio => radio.toJSON()),
        pagination: {
          page: actualLimit ? parseInt(page) : 1,
          limit: actualLimit || total,
          total: total
        }
      });
    } catch (error) {
      console.error('Get radios error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get radio by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const radio = await Radio.findById(id);

      if (!radio) {
        return res.status(404).json({ error: 'Radio not found' });
      }

      res.json({ radio: radio.toJSON() });
    } catch (error) {
      console.error('Get radio by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update radio
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const radio = await Radio.findById(id);

      if (!radio) {
        return res.status(404).json({ error: 'Radio not found' });
      }

      const updateData = { ...req.body };

      // Handle image upload
      if (req.file) {
        try {
          // Delete old image if exists
          if (radio.image_url) {
            try {
              await S3Service.deleteRadioImage(radio.image_url);
            } catch (deleteError) {
              console.warn('Failed to delete old image:', deleteError);
            }
          }

          const imageUrl = await S3Service.uploadRadioImage(req.file.buffer, req.file.originalname, 'radios');
          updateData.image_url = imageUrl;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(400).json({ error: 'Failed to upload image' });
        }
      }

      const updatedRadio = await radio.update(updateData);
      res.json({
        message: 'Radio updated successfully',
        radio: updatedRadio.toJSON()
      });
    } catch (error) {
      console.error('Update radio error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete radio
  async delete(req, res) {
    try {
      const { id } = req.params;
      const radio = await Radio.findById(id);

      if (!radio) {
        return res.status(404).json({ error: 'Radio not found' });
      }

      // Delete associated image if exists
      if (radio.image_url) {
        try {
          await S3Service.deleteRadioImage(radio.image_url);
        } catch (deleteError) {
          console.warn('Failed to delete image:', deleteError);
        }
      }

      await radio.delete();
      res.json({ message: 'Radio deleted successfully' });
    } catch (error) {
      console.error('Delete radio error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Upload image separately
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate file
      const validation = S3Service.validateRadioImageFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Upload to S3
      const imageUrl = await S3Service.uploadRadioImage(req.file.buffer, req.file.originalname, 'radios');

      res.json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  // Get group for a radio
  async getGroup(req, res) {
    try {
      const { id } = req.params;
      const radio = await Radio.findById(id);

      if (!radio) {
        return res.status(404).json({ error: 'Radio not found' });
      }

      const group = await radio.getGroup();
      res.json({
        radio: radio.toJSON(),
        group: group ? group.toJSON() : null
      });
    } catch (error) {
      console.error('Get radio group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload radios
  async bulkUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file provided' });
      }

      const results = [];
      const errors = [];
      const csv = require('csv-parser');
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          let successCount = 0;

          for (const [index, row] of results.entries()) {
            try {
              // Basic validation
              if (!row.radio_name || !row.frequency || !row.radio_language || !row.emirate_state) {
                errors.push(`Row ${index + 1}: Missing required fields`);
                continue;
              }

              // Create radio object
              const radioData = {
                sn: row.sn || null, // Allow auto-generation if empty
                group_id: row.group_id ? parseInt(row.group_id) : null,
                radio_name: row.radio_name,
                frequency: row.frequency,
                radio_language: row.radio_language,
                radio_website: row.radio_website || '',
                radio_linkedin: row.radio_linkedin || '',
                radio_instagram: row.radio_instagram || '',
                emirate_state: row.emirate_state,
                radio_popular_rj: row.radio_popular_rj || '',
                remarks: row.remarks || '',
                description: row.description || '',
                image_url: row.image_url || '' // Optional image URL from CSV
              };

              await Radio.create(radioData);
              successCount++;
            } catch (error) {
              errors.push(`Row ${index + 1}: ${error.message}`);
            }
          }

          res.json({
            message: 'Bulk upload processing completed',
            summary: {
              total: results.length,
              successful: successCount,
              failed: errors.length,
              errors: errors
            }
          });
        });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error during bulk upload' });
    }
  }

  // Download CSV template
  async downloadTemplate(req, res) {
    try {
      const { Parser } = require('json2csv');
      const fields = [
        'sn',
        'group_id',
        'radio_name',
        'frequency',
        'radio_language',
        'radio_website',
        'radio_linkedin',
        'radio_instagram',
        'emirate_state',
        'radio_popular_rj',
        'remarks',
        'description',
        'image_url'
      ];

      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse([]);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=radios_template.csv');
      return res.send(csv);
    } catch (error) {
      console.error('Template download error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export CSV
  async exportCSV(req, res) {
    try {
      const { Parser } = require('json2csv');
      const {
        group_id,
        radio_name,
        date_from,
        date_to
      } = req.query;

      const filters = {};
      if (group_id) filters.group_id = parseInt(group_id);

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (radio_name) {
        searchSql += ` AND radio_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${radio_name}%`);
        searchParamCount++;
      }

      if (date_from) {
        searchSql += ` AND created_at >= $${searchParamCount}`;
        searchValues.push(date_from);
        searchParamCount++;
      }

      if (date_to) {
        searchSql += ` AND created_at <= $${searchParamCount}`;
        searchValues.push(date_to);
        searchParamCount++;
      }

      // Fetch all matching records (no limit)
      const radios = await Radio.findAll(filters, searchSql, searchValues);

      const fields = [
        'id',
        'sn',
        'group_id',
        'radio_name',
        'frequency',
        'radio_language',
        'radio_website',
        'radio_linkedin',
        'radio_instagram',
        'emirate_state',
        'radio_popular_rj',
        'remarks',
        'description',
        'image_url',
        'created_at'
      ];

      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(radios.map(r => r.toJSON()));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=radios_export.csv');
      return res.send(csv);

    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RadioController();