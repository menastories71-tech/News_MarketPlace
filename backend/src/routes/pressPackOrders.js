const express = require('express');
const router = express.Router();
const pressPackOrderController = require('../controllers/pressPackOrderController');
const multer = require('multer');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  }
});

// Middleware for multiple file fields
const uploadFields = upload.fields([
  { name: 'company_registration_document', maxCount: 1 },
  { name: 'letter_of_authorisation', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'word_pdf_document', maxCount: 1 }
]);

// Create a new press pack order (public route for users)
router.post('/', uploadFields, pressPackOrderController.create);

// Download CSV (admin only)
router.get('/export-csv', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.downloadCSV);

// Get all press pack orders (admin only)
router.get('/', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.getAll);

// Get press pack order by ID (admin only)
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.getById);

// Accept press pack order (admin only)
router.put('/:id/accept', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.acceptOrder);

// Reject press pack order (admin only)
router.put('/:id/reject', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.rejectOrder);

// Complete press pack order (admin only)
router.put('/:id/complete', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.completeOrder);

// Update press pack order (admin only)
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, pressPackOrderController.update);

module.exports = router;