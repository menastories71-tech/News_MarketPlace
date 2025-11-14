const Blog = require('../models/Blog');
const { body, validationResult } = require('express-validator');

class BlogController {
  // Validation rules for creating a blog
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    body('publishDate').optional().isISO8601().withMessage('Publish date must be a valid date'),
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
    body('category').optional().trim().isLength({ min: 1 }).withMessage('Category must be a non-empty string if provided')
  ];

  // Validation rules for updating a blog
  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title must be a non-empty string if provided'),
    body('content').optional().trim().isLength({ min: 1 }).withMessage('Content must be a non-empty string if provided'),
    body('publishDate').optional().isISO8601().withMessage('Publish date must be a valid date'),
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
    body('category').optional().trim().isLength({ min: 1 }).withMessage('Category must be a non-empty string if provided')
  ];

  // Create a new blog
  async createBlog(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, content, image, category, publishDate } = req.body;
      const adminId = req.admin?.adminId;

      if (!adminId) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      const blogData = { title, content };
      if (image) blogData.image = image;
      if (category) blogData.category = category;
      if (publishDate) blogData.publishDate = publishDate;

      const blog = await Blog.create(blogData);

      res.status(201).json({
        message: 'Blog created successfully',
        blog: blog.toJSON()
      });
    } catch (error) {
      console.error('Create blog error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all blogs (admin only)
  async getAllBlogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = {};
      const order = [[sortBy, sortOrder.toUpperCase()]];

      // Add category filter
      if (category && category !== 'all') {
        whereClause.category = category;
      }

      // Add search filter
      if (search) {
        whereClause = {
          ...whereClause,
          [require('sequelize').Op.or]: [
            { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
            { content: { [require('sequelize').Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const { count, rows: blogs } = await Blog.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: order
      });

      res.json({
        blogs: blogs.map(blog => blog.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all blogs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get blog by ID
  async getBlogById(req, res) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json({ blog: blog.toJSON() });
    } catch (error) {
      console.error('Get blog by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update blog
  async updateBlog(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { title, content, image, category, publishDate } = req.body;
      const adminId = req.admin?.adminId;

      if (!adminId) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (image !== undefined) updateData.image = image;
      if (category !== undefined) updateData.category = category;
      if (publishDate !== undefined) updateData.publishDate = publishDate;

      const updatedBlog = await blog.update(updateData);

      res.json({
        message: 'Blog updated successfully',
        blog: updatedBlog.toJSON()
      });
    } catch (error) {
      console.error('Update blog error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete blog
  async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.adminId;

      if (!adminId) {
        return res.status(401).json({ error: 'Admin authentication required' });
      }

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      await blog.delete();

      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new BlogController();