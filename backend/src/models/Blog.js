const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseSequelize');

const BlogModel = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  publishDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'blogs',
});

class Blog {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.image = data.image;
    this.category = data.category;
    this.publishDate = data.publishDate;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validate blog data
  static validate(blogData) {
    const errors = [];

    if (!blogData.title || typeof blogData.title !== 'string' || blogData.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    }

    if (!blogData.content || typeof blogData.content !== 'string' || blogData.content.trim().length === 0) {
      errors.push('Content is required and must be a non-empty string');
    }

    if (!blogData.publishDate) {
      errors.push('Publish date is required');
    }

    if (blogData.image !== undefined && typeof blogData.image !== 'string') {
      errors.push('Image must be a string');
    }

    if (blogData.category !== undefined && typeof blogData.category !== 'string') {
      errors.push('Category must be a string');
    }

    return errors;
  }

  // Create a new blog
  static async create(blogData) {
    const validationErrors = this.validate(blogData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Ensure timestamps are set
    const now = new Date();
    console.log('Creating blog with timestamp:', now);
    const blogDataWithTimestamps = {
      ...blogData,
      created_at: now,
      updated_at: now
    };

    const blog = await BlogModel.create(blogDataWithTimestamps);
    const createdBlog = new Blog(blog.toJSON());
    console.log('Created blog with createdAt:', createdBlog.createdAt);
    return createdBlog;
  }

  // Find blog by ID
  static async findById(id) {
    const blog = await BlogModel.findByPk(id);
    return blog ? new Blog(blog.toJSON()) : null;
  }

  // Find all blogs
  static async findAll(options = {}) {
    const blogs = await BlogModel.findAll(options);
    return blogs.map(blog => new Blog(blog.toJSON()));
  }

  // Find and count all blogs
  static async findAndCountAll(options = {}) {
    const result = await BlogModel.findAndCountAll(options);
    return {
      count: result.count,
      rows: result.rows.map(blog => new Blog(blog.toJSON()))
    };
  }

  // Update blog
  async update(updateData) {
    const validationErrors = Blog.validate({ ...this, ...updateData });
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Ensure updated_at is set
    const updateDataWithTimestamp = {
      ...updateData,
      updated_at: new Date()
    };

    await BlogModel.update(updateDataWithTimestamp, { where: { id: this.id } });
    const updatedBlog = await BlogModel.findByPk(this.id);
    Object.assign(this, updatedBlog.toJSON());
    return this;
  }

  // Delete blog
  async delete() {
    await BlogModel.destroy({ where: { id: this.id } });
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      image: this.image,
      category: this.category,
      publishDate: this.publishDate,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    };
  }
}

module.exports = Blog;