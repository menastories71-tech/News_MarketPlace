const express = require('express');
const router = express.Router();
const podcasterController = require('../controllers/podcasterController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');
const { podcasterSubmitLimit } = require('../middleware/rateLimit');

// Configure multer for image uploads (same as in controller)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Maximum 1 image file
  }
});

// CSV upload for bulk operations
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

/**
 * ADMIN CSV & BULK UPLOAD ROUTES
 * These must be defined before parameterized routes to avoid conflicts
 */
router.get('/admin/template', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.downloadTemplate);
router.get('/admin/export-csv', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.exportCSV);
router.post('/admin/bulk-upload', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), csvUpload.single('file'), podcasterController.bulkUpload);

/**
 * PUBLIC ROUTES
 */
router.get('/approved', podcasterController.getApprovedPodcasters);
router.get('/approved/:id', podcasterController.getApprovedById);

/**
 * FILE UPLOAD ROUTES
 */
router.post('/upload-file', upload.single('file'), podcasterController.uploadFile);

/**
 * USER MANAGEMENT ROUTES
 */
router.post('/', verifyToken, podcasterSubmitLimit, podcasterController.createValidation, podcasterController.create);
router.get('/my', verifyToken, podcasterController.getMyPodcasters);

/**
 * ADMIN MANAGEMENT ROUTES (General)
 */
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), upload.single('image'), podcasterController.adminCreateValidation, podcasterController.create);

/**
 * BULK OPERATIONS (Static paths must come before parameterized ids)
 */
router.put('/bulk-approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.bulkApprove);
router.put('/bulk-reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.bulkReject);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), (req, res) => {
  // Bulk delete implementation would go here
  res.status(501).json({ error: 'Bulk delete not implemented yet' });
});

/**
 * ADMIN MANAGEMENT ROUTES (By ID)
 */
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), upload.single('image'), podcasterController.updateValidation, podcasterController.update);
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.approvePodcaster);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.rejectPodcaster);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.delete);

// Legacy/Alternative paths for approval
router.post('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.approvePodcaster);
router.post('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.rejectPodcaster);

/**
 * USER PARAMETERIZED ROUTES (Always keep wildcards at the end)
 */
router.get('/:id', verifyToken, podcasterController.getById);
router.put('/:id', verifyToken, requireOwnership('podcaster'), upload.single('image'), podcasterController.updateValidation, podcasterController.update);
router.delete('/:id', verifyToken, requireOwnership('podcaster'), podcasterController.delete);

// Status updates by ID (Wildcard)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), (req, res) => {
  // Status update implementation would go here
  res.status(501).json({ error: 'Status update not implemented yet' });
});

module.exports = router;