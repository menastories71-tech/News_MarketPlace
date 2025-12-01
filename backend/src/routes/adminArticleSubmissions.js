const express = require('express');
const router = express.Router();
const articleSubmissionController = require('../controllers/articleSubmissionController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('Admin Article Submissions routes file loaded - FULL VERSION');

// Configure multer for file uploads (using memory storage for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images and documents
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = file.mimetype.startsWith('image/');
    const allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.mimetype);

    if (allowedImageTypes || allowedDocumentTypes) {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDF/Word documents are allowed'), false);
    }
  }
});

const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Test route without middleware
router.get('/test', (req, res) => {
  console.log('Test route hit - full version working');
  res.json({ message: 'Full test route working!' });
});

// Admin routes for article submissions
router.get('/',
  (req, res, next) => {
    console.log('Admin article submissions route hit');
    next();
  },
  articleSubmissionController.getAllSubmissions
);

router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  articleSubmissionController.getSubmissionById
);

router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  articleSubmissionController.updateValidation,
  articleSubmissionController.updateSubmission
);

router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  articleSubmissionController.deleteSubmission
);

router.put('/:id/approve',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('approve_publications'),
  articleSubmissionController.approveSubmission
);

router.put('/:id/reject',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('approve_publications'),
  articleSubmissionController.rejectSubmission
);

// Create manual article (admin only)
router.post('/manual',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  articleSubmissionController.createValidation,
  articleSubmissionController.createManualArticle
);

module.exports = router;