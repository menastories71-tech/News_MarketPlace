const express = require('express');
const router = express.Router();
const aiGeneratedArticleController = require('../controllers/aiGeneratedArticleController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads (same as in controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/ai-articles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ai-article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, GIF, and TXT files are allowed.'), false);
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
  upload.single('uploaded_file'),
  aiGeneratedArticleController.createValidation,
  aiGeneratedArticleController.createQuestionnaire
);

router.get('/my',
  verifyToken,
  aiGeneratedArticleController.getMyArticles
);

router.get('/:id',
  verifyToken,
  aiGeneratedArticleController.getArticleById
);

router.post('/:id/generate',
  verifyToken,
  aiGeneratedArticleController.generateArticle
);

router.post('/:id/finalize',
  verifyToken,
  aiGeneratedArticleController.finalizeArticle
);

router.delete('/:id',
  verifyToken,
  aiGeneratedArticleController.deleteArticle
);

// Admin routes
router.get('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  aiGeneratedArticleController.getAllArticles
);

router.patch('/:id/status',
  verifyAdminToken,
  requireAdminPanelAccess,
  aiGeneratedArticleController.updateStatusValidation,
  aiGeneratedArticleController.updateStatus
);

router.delete('/admin/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  aiGeneratedArticleController.deleteArticle
);

module.exports = router;