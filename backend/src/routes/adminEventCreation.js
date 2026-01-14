const express = require('express');
const router = express.Router();
const adminEventCreationController = require('../controllers/adminEventCreationController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');
const multer = require('multer');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(require('path').extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024, // 500KB limit (matches frontend)
    files: 1 // Maximum 1 image file
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Event Creation test route working!' });
});

// Bulk/CSV Routes
router.get('/download-template',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.downloadTemplate
);

router.post('/bulk-upload',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.csvUpload.single('file'),
  adminEventCreationController.bulkUpload
);

router.get('/download-csv',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.downloadCSV
);

// Get all event creations
router.get('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.getAllEventCreations
);

// Get event creation by ID
router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.getEventCreationById
);

// Create a new event creation (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  upload.single('image'),
  adminEventCreationController.createValidation,
  adminEventCreationController.createEventCreation
);

// Update event creation (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  upload.single('image'),
  adminEventCreationController.updateValidation,
  adminEventCreationController.updateEventCreation
);

// Delete event creation (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.deleteEventCreation
);

module.exports = router;