const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifyAdminToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Routes
router.post('/upload-file', upload.single('file'), agencyController.uploadFile);

router.post('/register', agencyController.registerValidation, agencyController.registerAgency);

router.post('/verify-otp', agencyController.otpValidation, agencyController.verifyOtp);

router.post('/send-otp', agencyController.sendOtp);

router.post('/resend-otp', agencyController.resendOtp);

router.get('/', verifyAdminToken, agencyController.getAllAgencies);

router.get('/download-csv', verifyAdminToken, (req, res) => agencyController.downloadCSV(req, res));

router.post('/update-status', verifyAdminToken, agencyController.updateAgencyStatus);

module.exports = router;
