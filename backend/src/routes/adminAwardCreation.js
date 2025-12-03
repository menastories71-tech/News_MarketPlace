const express = require('express');
const router = express.Router();
const adminAwardCreationController = require('../controllers/adminAwardCreationController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Get all award creations
router.get('/',
  adminAwardCreationController.getAllAwardCreations
);

// Get award creation by ID
router.get('/:id',
  adminAwardCreationController.getAwardCreationById
);

// Create a new award creation (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminAwardCreationController.createValidation,
  adminAwardCreationController.createAwardCreation
);

// Update award creation (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminAwardCreationController.updateValidation,
  adminAwardCreationController.updateAwardCreation
);

// Delete award creation (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminAwardCreationController.deleteAwardCreation
);

module.exports = router;