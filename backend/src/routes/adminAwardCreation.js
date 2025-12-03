const express = require('express');
const router = express.Router();
const adminAwardCreationController = require('../controllers/adminAwardCreationController');
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

// Get all award creations
router.get('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminAwardCreationController.getAllAwardCreations
);

// Get award creation by ID
router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminAwardCreationController.getAwardCreationById
);

// Create a new award creation (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  upload.single('image'),
  adminAwardCreationController.createValidation,
  adminAwardCreationController.createAwardCreation
);

// Update award creation (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  upload.single('image'),
  adminAwardCreationController.updateValidation,
  adminAwardCreationController.updateAwardCreation
);

// Delete award creation (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminAwardCreationController.deleteAwardCreation
);

module.exports = router;