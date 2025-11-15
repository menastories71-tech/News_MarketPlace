const express = require('express');
const router = express.Router();
const realEstateController = require('../controllers/realEstateController');
const { verifyToken: authenticateUser, verifyAdminToken: authenticateAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/real-estates');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueSuffix = timestamp + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'real-estate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    files: 10 // Maximum 10 images
  }
});

// User routes (require authentication)
router.post('/',
  authenticateUser,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.createValidation,
  realEstateController.create
);

router.get('/my',
  authenticateUser,
  realEstateController.getMyRealEstates
);

router.put('/:id',
  authenticateUser,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.updateValidation,
  realEstateController.update
);

router.delete('/:id',
  authenticateUser,
  realEstateController.delete
);

// Admin routes (require admin authentication)
router.get('/admin',
  authenticateAdmin,
  realEstateController.getAll
);

router.post('/admin',
  authenticateAdmin,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.adminCreateValidation,
  realEstateController.create
);

router.get('/admin/:id',
  authenticateAdmin,
  realEstateController.getById
);

router.put('/admin/:id',
  authenticateAdmin,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.updateValidation,
  realEstateController.update
);

router.delete('/admin/:id',
  authenticateAdmin,
  realEstateController.delete
);

router.put('/admin/:id/approve',
  authenticateAdmin,
  realEstateController.approveRealEstate
);

router.put('/admin/:id/reject',
  authenticateAdmin,
  realEstateController.rejectRealEstate
);

router.put('/bulk-approve',
  authenticateAdmin,
  realEstateController.bulkApprove
);

router.put('/bulk-reject',
  authenticateAdmin,
  realEstateController.bulkReject
);

// Public routes (no authentication required)
router.get('/',
  realEstateController.getApprovedRealEstates
);

router.get('/approved/:id',
  realEstateController.getApprovedById
);

router.get('/:id',
  realEstateController.getApprovedById
);

module.exports = router;