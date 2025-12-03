const express = require('express');
const router = express.Router();
const adminEventCreationController = require('../controllers/adminEventCreationController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Event Creation test route working!' });
});

// Get all event creations (public for GET)
router.get('/',
  adminEventCreationController.getAllEventCreations
);

// Get event creation by ID (public for GET)
router.get('/:id',
  adminEventCreationController.getEventCreationById
);

// Create a new event creation (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.createValidation,
  adminEventCreationController.createEventCreation
);

// Update event creation (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.updateValidation,
  adminEventCreationController.updateEventCreation
);

// Delete event creation (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminEventCreationController.deleteEventCreation
);

module.exports = router;