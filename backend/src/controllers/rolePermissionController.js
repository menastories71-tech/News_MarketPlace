const Role = require('../models/Role');
const Permission = require('../models/Permission');
require('../models/associations'); // Ensure associations are loaded
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');

class RolePermissionController {
  // Validation rules
  createRoleValidation = [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Role name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('level').optional().isInt({ min: 0, max: 10 }).withMessage('Level must be 0-10'),
  ];

  updateRoleValidation = [
    param('id').isInt().withMessage('Invalid role ID'),
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Role name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('level').optional().isInt({ min: 0, max: 10 }).withMessage('Level must be 0-10'),
  ];

  createPermissionValidation = [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Permission name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('resource').isLength({ min: 1, max: 100 }).withMessage('Resource must be 1-100 characters'),
    body('action').isLength({ min: 1, max: 50 }).withMessage('Action must be 1-50 characters'),
  ];

  updatePermissionValidation = [
    param('id').isInt().withMessage('Invalid permission ID'),
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Permission name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('resource').optional().isLength({ min: 1, max: 100 }).withMessage('Resource must be 1-100 characters'),
    body('action').optional().isLength({ min: 1, max: 50 }).withMessage('Action must be 1-50 characters'),
  ];

  // Roles CRUD
  async getAllRoles(req, res) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

      const offset = (page - 1) * limit;
      const where = search ? { name: { [Op.iLike]: `%${search}%` } } : {};

      const { count, rows: roles } = await Role.findAndCountAll({
        where,
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Get admin users for each role
      const rolesWithAdmins = await Promise.all(roles.map(async (role) => {
        const { query } = require('../config/database');
        const adminSql = 'SELECT email, first_name, last_name FROM admins WHERE role_id = $1 AND is_active = true';
        const adminResult = await query(adminSql, [role.id]);
        const admins = adminResult.rows.map(admin => ({
          email: admin.email,
          fullName: `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
        }));

        return {
          ...role.toJSON(),
          admins: admins
        };
      }));

      res.json({
        roles: rolesWithAdmins,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await Role.findByPk(id, {
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      });

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json({ role });
    } catch (error) {
      console.error('Get role by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, description, level, permissionIds = [] } = req.body;

      // Check if role name already exists
      const existingRole = await Role.findByName(name);
      if (existingRole) {
        return res.status(400).json({ error: 'Role name already exists' });
      }

      const role = await Role.create({ name, description, level });

      // Assign permissions if provided
      if (permissionIds.length > 0) {
        const permissions = await Permission.findAll({ where: { id: permissionIds } });
        await role.setPermissions(permissions);
      }

      // Fetch role with permissions
      const roleWithPermissions = await Role.findByPk(role.id, {
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      });

      res.status(201).json({
        role: roleWithPermissions,
        message: 'Role created successfully'
      });
    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { name, description, level, permissionIds } = req.body;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check name uniqueness if name is being updated
      if (name && name !== role.name) {
        const existingRole = await Role.findByName(name);
        if (existingRole) {
          return res.status(400).json({ error: 'Role name already exists' });
        }
      }

      await role.update({ name, description, level });

      // Update permissions if provided
      if (permissionIds !== undefined) {
        const permissions = await Permission.findAll({ where: { id: permissionIds } });
        await role.setPermissions(permissions);
      }

      // Fetch updated role with permissions
      const updatedRole = await Role.findByPk(id, {
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      });

      res.json({
        role: updatedRole,
        message: 'Role updated successfully'
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Prevent deletion of super_admin role
      if (role.name === 'super_admin') {
        return res.status(400).json({ error: 'Cannot delete super_admin role' });
      }

      await role.destroy();

      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Delete role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Permissions CRUD
  async getAllPermissions(req, res) {
    try {
      const { page = 1, limit = 10, search = '', resource = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      if (resource) {
        where.resource = resource;
      }

      const { count, rows: permissions } = await Permission.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        permissions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get all permissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPermissionById(req, res) {
    try {
      const { id } = req.params;
      const permission = await Permission.findByPk(id);

      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      res.json({ permission });
    } catch (error) {
      console.error('Get permission by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPermission(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, description, resource, action } = req.body;

      // Check if permission name already exists
      const existingPermission = await Permission.findByName(name);
      if (existingPermission) {
        return res.status(400).json({ error: 'Permission name already exists' });
      }

      const permission = await Permission.create({ name, description, resource, action });

      res.status(201).json({
        permission,
        message: 'Permission created successfully'
      });
    } catch (error) {
      console.error('Create permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePermission(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { name, description, resource, action } = req.body;

      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      // Check name uniqueness if name is being updated
      if (name && name !== permission.name) {
        const existingPermission = await Permission.findByName(name);
        if (existingPermission) {
          return res.status(400).json({ error: 'Permission name already exists' });
        }
      }

      await permission.update({ name, description, resource, action });

      res.json({
        permission,
        message: 'Permission updated successfully'
      });
    } catch (error) {
      console.error('Update permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deletePermission(req, res) {
    try {
      const { id } = req.params;

      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      await permission.destroy();

      res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
      console.error('Delete permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Role-Permission relationships
  async assignPermissionToRole(req, res) {
    try {
      const { roleId, permissionId } = req.params;

      const role = await Role.findByPk(roleId);
      const permission = await Permission.findByPk(permissionId);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      await role.addPermission(permission);

      res.json({ message: 'Permission assigned to role successfully' });
    } catch (error) {
      console.error('Assign permission to role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removePermissionFromRole(req, res) {
    try {
      const { roleId, permissionId } = req.params;

      const role = await Role.findByPk(roleId);
      const permission = await Permission.findByPk(permissionId);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      await role.removePermission(permission);

      res.json({ message: 'Permission removed from role successfully' });
    } catch (error) {
      console.error('Remove permission from role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRolePermissions(req, res) {
    try {
      const { id } = req.params;

      const role = await Role.findByPk(id, {
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      });

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json({ permissions: role.permissions });
    } catch (error) {
      console.error('Get role permissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async setRolePermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ error: 'permissionIds must be an array' });
      }

      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await role.setPermissions(permissions);

      res.json({ message: 'Role permissions updated successfully' });
    } catch (error) {
      console.error('Set role permissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get available resources for permissions
  async getResources(req, res) {
    try {
      const resources = await Permission.findAll({
        attributes: [[Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('resource')), 'resource']],
        raw: true,
      });

      const resourceList = resources.map(r => r.resource).sort();

      res.json({ resources: resourceList });
    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RolePermissionController();