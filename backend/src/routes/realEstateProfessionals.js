const express = require('express');
const router = express.Router();
const realEstateProfessionalController = require('../controllers/realEstateProfessionalController');
const { verifyToken: authenticateUser } = require('../middleware/auth');
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
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Maximum 1 image
  }
});

// User routes (create requires authentication)
router.post('/',
  authenticateUser,
  upload.single('image'),
  realEstateProfessionalController.createValidation,
  realEstateProfessionalController.create
);

// Public routes (no authentication required)
router.get('/',
  realEstateProfessionalController.getApprovedRealEstateProfessionals
);

router.get('/:id',
  realEstateProfessionalController.getApprovedById
);

// Form data routes (no authentication required for form population)
router.get('/languages',
  realEstateProfessionalController.getLanguages
);

router.get('/countries',
  realEstateProfessionalController.getCountries
);

router.get('/cities/:country',
  realEstateProfessionalController.getCities
);

module.exports = router;