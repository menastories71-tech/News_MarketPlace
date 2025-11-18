const express = require('express');
const router = express.Router();
const articleSubmissionController = require('../controllers/articleSubmissionController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads (same as in controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/article-submissions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// User routes
router.post('/',
  verifyToken,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]),
  articleSubmissionController.createValidation,
  articleSubmissionController.createSubmission
);

router.get('/my',
  verifyToken,
  articleSubmissionController.getMySubmissions
);

// Get all user's articles (manual + AI)
router.get('/my-all-articles',
  verifyToken,
  articleSubmissionController.getMyAllArticles
);

// Public route for all approved articles (manual + AI)
router.get('/all-approved-articles',
  articleSubmissionController.getAllApprovedArticles
);

// Public route for approved articles
router.get('/approved-articles',
  articleSubmissionController.getApprovedArticles
);

// Public route for approved article by slug
router.get('/approved-articles/:slug',
  articleSubmissionController.getApprovedArticleById
);

// Public route for approved AI article by ID
router.get('/approved-ai-articles/:id',
  articleSubmissionController.getApprovedAiArticleById
);

module.exports = router;