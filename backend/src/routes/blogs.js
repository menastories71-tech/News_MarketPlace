const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { verifyAdminToken } = require('../middleware/auth');

// Public Routes (no authentication required)
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin Routes (require admin authentication)
router.post('/', verifyAdminToken, blogController.createValidation, blogController.createBlog);
router.get('/admin', verifyAdminToken, blogController.getAllBlogs);
router.put('/:id', verifyAdminToken, blogController.updateValidation, blogController.updateBlog);
router.delete('/:id', verifyAdminToken, blogController.deleteBlog);

module.exports = router;