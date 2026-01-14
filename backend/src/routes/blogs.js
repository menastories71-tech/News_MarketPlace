const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { verifyAdminToken } = require('../middleware/auth');

// specific admin routes first
// Download Template
router.get('/download-template', verifyAdminToken, blogController.downloadTemplate);

// Download CSV
router.get('/download-csv', verifyAdminToken, blogController.downloadCSV);

// Bulk Upload
router.post('/bulk-upload',
    verifyAdminToken,
    blogController.csvUpload.single('file'),
    blogController.bulkUpload
);

// Admin Get All
router.get('/admin', verifyAdminToken, blogController.getAllBlogs);

// Public Routes (no authentication required)
router.get('/', blogController.getAllBlogs);

// Admin Routes (require admin authentication)
router.post('/', verifyAdminToken, blogController.createValidation, blogController.createBlog);
router.put('/:id', verifyAdminToken, blogController.updateValidation, blogController.updateBlog);
router.delete('/:id', verifyAdminToken, blogController.deleteBlog);

// Get by ID (catch-all for GET)
router.get('/:id', blogController.getBlogById);

module.exports = router;