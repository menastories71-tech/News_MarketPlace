const express = require('express');
const router = express.Router();
const radioController = require('../controllers/radioController');
const { upload } = require('../services/s3Service');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');

// User routes (authenticated users can view radios)
router.get('/public', radioController.getPublic);
router.get('/', verifyToken, radioController.getAll);

// Admin routes (admins can manage all radios)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, radioController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, upload.single('image'), radioController.createValidation, radioController.create);
// Image upload route
router.post('/admin/upload-image', verifyAdminToken, requireAdminPanelAccess, upload.single('image'), radioController.uploadImage);

// Configure multer for CSV uploads
const multer = require('multer');
const csvStorage = multer.memoryStorage();
const csvUpload = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for CSV
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Bulk upload and CSV operations
router.post('/admin/bulk-upload', verifyAdminToken, requireAdminPanelAccess, csvUpload.single('file'), radioController.bulkUpload);
router.get('/admin/template', verifyAdminToken, requireAdminPanelAccess, radioController.downloadTemplate);
router.get('/admin/export-csv', verifyAdminToken, requireAdminPanelAccess, radioController.exportCSV);

// CRUD routes with :id parameter (must come after specific routes)
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, radioController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, upload.single('image'), radioController.updateValidation, radioController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, radioController.delete);


// Get group for a specific radio
router.get('/:id/group', verifyToken, radioController.getGroup);

// User parameterized routes
router.get('/:id', verifyToken, radioController.getById);

module.exports = router;