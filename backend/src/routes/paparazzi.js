const express = require('express');
const router = express.Router();
const paparazziController = require('../controllers/paparazziController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for CSV uploads
const storage = multer.memoryStorage();
const csvUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Admin CSV operations (must come before other admin routes)
router.get('/admin/template', verifyAdminToken, requireAdminPanelAccess, paparazziController.downloadTemplate);
router.get('/admin/export-csv', verifyAdminToken, requireAdminPanelAccess, paparazziController.exportCSV);
router.post('/admin/bulk-upload', verifyAdminToken, requireAdminPanelAccess, csvUpload.single('file'), paparazziController.bulkUpload);
router.post('/admin/bulk-approve', verifyAdminToken, requireAdminPanelAccess, paparazziController.bulkApprove);
router.post('/admin/bulk-reject', verifyAdminToken, requireAdminPanelAccess, paparazziController.bulkReject);
router.post('/admin/bulk-delete', verifyAdminToken, requireAdminPanelAccess, paparazziController.bulkDelete);


// Admin routes (admins can manage all paparazzi)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, paparazziController.getAll);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, paparazziController.getById);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, paparazziController.createValidation, paparazziController.create);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, paparazziController.updateValidation, paparazziController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, paparazziController.delete);

// Admin approval/rejection routes
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, paparazziController.approve);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, paparazziController.reject);

// User routes (authenticated users can view approved paparazzi and manage their own submissions)
router.get('/public', paparazziController.getPublic);
router.get('/', verifyToken, paparazziController.getAll); // Only approved paparazzi
router.post('/', verifyToken, paparazziController.createValidation, paparazziController.create);
router.get('/:id', verifyToken, paparazziController.getById);
router.put('/:id', verifyToken, paparazziController.updateValidation, paparazziController.update); // Only if owned and pending
router.delete('/:id', verifyToken, paparazziController.delete); // Only if owned and pending

module.exports = router;