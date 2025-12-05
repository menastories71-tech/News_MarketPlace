const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { verifyToken, verifyAdminToken } = require('../middleware/auth');
const { publicationSubmitLimit, otpLimit } = require('../middleware/rateLimit');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads (using memory storage for S3)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allow common document and image types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  }
});

// User Routes (require user authentication)
router.post('/send-otp', verifyToken, otpLimit, websiteController.sendOtp);

router.post('/submit', verifyToken, publicationSubmitLimit, upload.fields([
  { name: 'website_registration_document', maxCount: 1 },
  { name: 'tax_document', maxCount: 1 },
  { name: 'bank_details', maxCount: 1 },
  { name: 'owner_passport', maxCount: 1 },
  { name: 'general_contact_details', maxCount: 1 }
]), websiteController.submitValidation, websiteController.submitWebsite);

router.post('/verify-otp', verifyToken, otpLimit, websiteController.otpValidation, websiteController.verifyOtp);

// Admin Routes (require admin authentication)
router.get('/', verifyAdminToken, websiteController.getAll);
router.get('/:id', verifyAdminToken, websiteController.getById);
router.put('/:id/status', verifyAdminToken, websiteController.updateStatusValidation, websiteController.updateStatus);
router.delete('/:id', verifyAdminToken, websiteController.delete);
router.post('/bulk/status', verifyAdminToken, websiteController.bulkUpdateStatusValidation, websiteController.bulkUpdateStatus);
router.post('/bulk/delete', verifyAdminToken, websiteController.bulkDeleteValidation, websiteController.bulkDelete);

module.exports = router;