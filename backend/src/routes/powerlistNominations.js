const express = require('express');
const router = express.Router();
const powerlistNominationController = require('../controllers/powerlistNominationController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');
const multer = require('multer');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(require('path').extname(file.originalname).toLowerCase());
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Maximum 1 image file
  }
});

// User submission route with authentication and rate limiting handled in controller
router.post('/submit', verifyToken, powerlistNominationController.submitValidation, powerlistNominationController.submit);

// User route for viewing approved powerlist nominations
router.get('/public', verifyToken, powerlistNominationController.getPublic);

// Create a new powerlist nomination (admin only)
router.post('/', verifyAdminToken, requireAdminPanelAccess, upload.single('image'), powerlistNominationController.createValidation, powerlistNominationController.create);

// Get all powerlist nominations (admin only)
router.get('/', verifyAdminToken, requireAdminPanelAccess, powerlistNominationController.getAll);

// Get powerlist nomination by ID (admin only)
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistNominationController.getById);

// Update powerlist nomination (admin only)
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, upload.single('image'), powerlistNominationController.updateValidation, powerlistNominationController.update);

// Delete powerlist nomination (admin only)
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistNominationController.delete);

// Search powerlist nominations (admin only)
router.get('/search', verifyAdminToken, requireAdminPanelAccess, powerlistNominationController.search);

// Update powerlist nomination status (admin only)
router.put('/:id/status', verifyAdminToken, requireAdminPanelAccess, powerlistNominationController.updateStatus);

module.exports = router;