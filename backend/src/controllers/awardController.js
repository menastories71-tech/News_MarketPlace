const Award = require('../models/Award');
const AwardCreation = require('../models/AwardCreation');
const { body, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');

class AwardController {
  constructor() {
    this.storage = multer.memoryStorage();

    // Multer for CSV bulk upload
    this.csvUpload = multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'));
        }
      }
    });
  }
  // Validation rules for create/update
  createValidation = [
    body('award_name').trim().isLength({ min: 1 }).withMessage('Award name is required'),
    body('organiser').trim().isLength({ min: 1 }).withMessage('Organiser is required'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    body('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
  ];

  updateValidation = [
    body('award_name').optional().trim().isLength({ min: 1 }).withMessage('Award name is required'),
    body('organiser').optional().trim().isLength({ min: 1 }).withMessage('Organiser is required'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    body('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
  ];

  // Create a new award (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const award = await Award.create(req.body);
      res.status(201).json({
        message: 'Award created successfully',
        award: award.toJSON()
      });
    } catch (error) {
      console.error('Create award error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all awards with filtering and pagination (public) - using AwardCreation model
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        tentative_month,
        company_focused_individual_focused,
        award_name,
        award_organiser_name,
        url,
        industry,
        regional_focused,
        award_country,
        award_city
      } = req.query;

      const filters = {};

      if (tentative_month) filters.tentative_month = tentative_month;
      if (company_focused_individual_focused) filters.company_focused_individual_focused = company_focused_individual_focused;
      if (award_organiser_name) filters.award_organiser_name = award_organiser_name;
      if (url) filters.url = url;
      if (industry) filters.industry = industry;
      if (regional_focused !== undefined && regional_focused !== '') filters.regional_focused = regional_focused;
      if (award_country) filters.award_country = award_country;
      if (award_city) filters.award_city = award_city;

      // Add search filters
      if (award_name) {
        filters.award_name = award_name;
      }

      const offset = (page - 1) * limit;
      const awards = await AwardCreation.findAllFiltered(filters, 'createdAt', 'desc', limit, offset);

      res.json({
        awards: awards.map(award => award.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get awards error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get award by ID (public) - using AwardCreation model
  async getById(req, res) {
    try {
      const { id } = req.params;
      const award = await AwardCreation.findById(id);

      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      res.json({ award: award.toJSON() });
    } catch (error) {
      console.error('Get award by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update award (admin only)
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
      const award = await Award.findById(id);

      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      const updatedAward = await award.update(req.body);
      res.json({
        message: 'Award updated successfully',
        award: updatedAward.toJSON()
      });
    } catch (error) {
      console.error('Update award error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete award (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const award = await AwardCreation.findById(id);

      if (!award) {
        return res.status(404).json({ error: 'Award not found' });
      }

      await award.destroy();
      res.json({ message: 'Award deleted successfully' });
    } catch (error) {
      console.error('Delete award error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search awards (admin only)
  async search(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { q: searchTerm, ...filters } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const awards = await Award.search(searchTerm, filters, limit, offset);

      // Get total count for pagination
      const totalCount = await Award.getSearchTotalCount(searchTerm, filters);

      res.json({
        awards: awards.map(award => award.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Search awards error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download Awards as CSV (admin only)
  async downloadCSV(req, res) {
    try {
      const {
        tentative_month,
        company_focused_individual_focused,
        award_name,
        award_organiser_name,
        url,
        industry,
        regional_focused,
        award_country,
        award_city
      } = req.query;

      const filters = {};

      if (tentative_month) filters.tentative_month = tentative_month;
      if (company_focused_individual_focused) filters.company_focused_individual_focused = company_focused_individual_focused;
      if (award_organiser_name) filters.award_organiser_name = award_organiser_name;
      if (url) filters.url = url;
      if (industry) filters.industry = industry;
      if (regional_focused !== undefined && regional_focused !== '') filters.regional_focused = regional_focused;
      if (award_country) filters.award_country = award_country;
      if (award_city) filters.award_city = award_city;
      if (award_name) filters.award_name = award_name;

      const awards = await AwardCreation.findAllFiltered(filters, 'createdAt', 'desc');

      const headers = ['ID', 'Name', 'Organiser', 'URL', 'Month', 'Industry', 'Region', 'Country', 'City', 'Focus', 'Created At'];
      let csv = headers.join(',') + '\n';

      awards.forEach(a => {
        const row = [
          a.id,
          `"${(a.award_name || '').replace(/"/g, '""')}"`,
          `"${(a.award_organiser_name || '').replace(/"/g, '""')}"`,
          `"${(a.url || '').replace(/"/g, '""')}"`,
          `"${(a.tentative_month || '').replace(/"/g, '""')}"`,
          `"${(a.industry || '').replace(/"/g, '""')}"`,
          `"${a.regional_focused || ''}"`,
          `"${(a.award_country || '').replace(/"/g, '""')}"`,
          `"${(a.award_city || '').replace(/"/g, '""')}"`,
          `"${(a.company_focused_individual_focused || '').replace(/"/g, '""')}"`,
          a.createdAt ? new Date(a.createdAt).toISOString() : ''
        ];
        csv += row.join(',') + '\n';
      });

      const filename = `awards_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.status(200).send(csv);

    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download CSV template for bulk upload
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'award_name',
        'award_organiser_name',
        'url',
        'tentative_month',
        'industry',
        'regional_focused',
        'award_country',
        'award_city',
        'company_focused_individual_focused'
      ];

      const dummyData = [
        ['Best Innovation Award', 'Global Tech Council', 'https://gtc.org', 'October', 'Technology', 'Global', 'USA', 'San Francisco', 'Company Focused'],
        ['Rising Leader Award', 'Business Leaders Forum', 'https://blf.com', 'March', 'Business', 'Regional', 'UK', 'London', 'Individual Focused']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=awards_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload awards from CSV
  async bulkUpload(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV file' });
      }

      const csvParser = require('csv-parser');
      const { Readable } = require('stream');

      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const createdRecords = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                // Basic mapping and cleaning - use AwardCreation model fields
                const awardData = {
                  award_name: row.award_name || '',
                  award_organiser_name: row.award_organiser_name || '',
                  url: row.url || '',
                  tentative_month: row.tentative_month || '',
                  industry: row.industry || '',
                  regional_focused: row.regional_focused || '',
                  award_country: row.award_country || '',
                  award_city: row.award_city || '',
                  company_focused_individual_focused: row.company_focused_individual_focused || ''
                };

                if (!awardData.award_name || !awardData.award_organiser_name) {
                  errors.push(`Row ${index + 1}: Award name and Award Organiser Name are required.`);
                  continue;
                }

                // Use AwardCreation model (same as getAll uses)
                const record = await AwardCreation.create(awardData);
                createdRecords.push(record);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdRecords.length} records created.`,
              count: createdRecords.length,
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (error) {
            console.error('Processing batch error:', error);
            res.status(500).json({ error: 'Error processing bulk upload' });
          }
        });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AwardController();
