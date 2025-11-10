const Group = require('../models/Group');
const { body, validationResult } = require('express-validator');

class GroupController {
  // Validation rules
  createValidation = [
    body('group_sn').trim().isLength({ min: 1 }).withMessage('Group SN is required'),
    body('group_name').trim().isLength({ min: 1 }).withMessage('Group name is required'),
    body('group_location').trim().isLength({ min: 1 }).withMessage('Group location is required'),
    body('group_website').isURL().withMessage('Valid group website URL is required'),
  ];

  updateValidation = [
    body('group_sn').optional().trim().isLength({ min: 1 }).withMessage('Group SN is required'),
    body('group_name').optional().trim().isLength({ min: 1 }).withMessage('Group name is required'),
    body('group_location').optional().trim().isLength({ min: 1 }).withMessage('Group location is required'),
    body('group_website').optional().isURL().withMessage('Valid group website URL is required'),
    body('status').optional().isIn(['draft', 'pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Create a new group
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const groupData = {
        ...req.body,
        submitted_by: req.user?.userId,
        submitted_by_admin: req.admin?.adminId
      };

      const group = await Group.create(groupData);
      res.status(201).json({
        message: 'Group created successfully',
        group: group.toJSON()
      });
    } catch (error) {
      console.error('Create group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all groups with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        group_name
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (group_name) {
        searchSql += ` AND group_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${group_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const groups = await Group.findAll(filters, searchSql, searchValues, limit, offset);

      res.json({
        groups: groups.map(group => group.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: groups.length // This should be improved with a count query
        }
      });
    } catch (error) {
      console.error('Get groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get group by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json({ group: group.toJSON() });
    } catch (error) {
      console.error('Get group by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update group
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
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const updatedGroup = await group.update(req.body);
      res.json({
        message: 'Group updated successfully',
        group: updatedGroup.toJSON()
      });
    } catch (error) {
      console.error('Update group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete group (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      await group.delete();
      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Delete group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get publications for a group
  async getPublications(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const publications = await group.getPublications();
      res.json({
        group: group.toJSON(),
        publications: publications.map(pub => pub.toJSON())
      });
    } catch (error) {
      console.error('Get group publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk create groups
  async bulkCreate(req, res) {
    try {
      const { groups } = req.body;

      if (!Array.isArray(groups) || groups.length === 0) {
        return res.status(400).json({ error: 'Groups array is required' });
      }

      const createdGroups = [];
      const errors = [];

      for (let i = 0; i < groups.length; i++) {
        try {
          const groupData = {
            ...groups[i],
            submitted_by: req.user?.userId,
            submitted_by_admin: req.admin?.adminId
          };
          const group = await Group.create(groupData);
          createdGroups.push(group.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Created ${createdGroups.length} groups successfully`,
        created: createdGroups,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk create groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update groups
  async bulkUpdate(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const updatedGroups = [];
      const errors = [];

      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, ...updateData } = updates[i];
          const group = await Group.findById(id);

          if (!group) {
            errors.push({ index: i, error: 'Group not found' });
            continue;
          }

          const updatedGroup = await group.update(updateData);
          updatedGroups.push(updatedGroup.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Updated ${updatedGroups.length} groups successfully`,
        updated: updatedGroups,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk update groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete groups
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      const deletedCount = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const group = await Group.findById(ids[i]);

          if (!group) {
            errors.push({ index: i, error: 'Group not found' });
            continue;
          }

          await group.delete();
          deletedCount.push(ids[i]);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deletedCount.length} groups successfully`,
        deleted: deletedCount,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk delete groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update group status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const updatedGroup = await group.update({ status });
      res.json({
        message: 'Group status updated successfully',
        group: updatedGroup.toJSON()
      });
    } catch (error) {
      console.error('Update group status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new GroupController();