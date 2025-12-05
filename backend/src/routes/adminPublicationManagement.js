const express = require('express');
const router = express.Router();
const adminPublicationManagementController = require('../controllers/adminPublicationManagementController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');
// Controller is already an instance, use it directly to access upload middleware
const controller = adminPublicationManagementController;

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Publication Management test route working!' });
});

// Get all publication management records (public for GET)
router.get('/',
  adminPublicationManagementController.getAll
);

// Get publication management record by ID (public for GET)
router.get('/:id',
  adminPublicationManagementController.getById
);

// Create a new publication management record (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  adminPublicationManagementController.createValidation,
  adminPublicationManagementController.create
);

// Update publication management record (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  adminPublicationManagementController.updateValidation,
  adminPublicationManagementController.update
);

// Delete publication management record (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPublicationManagementController.delete
);

module.exports = router;