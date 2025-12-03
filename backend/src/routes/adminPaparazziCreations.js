const express = require('express');
const router = express.Router();
const adminPaparazziCreationsController = require('../controllers/adminPaparazziCreationsController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Paparazzi Creations test route working!' });
});

// Get all paparazzi creations (public for GET)
router.get('/',
  adminPaparazziCreationsController.getAll
);

// Get paparazzi creation by ID (public for GET)
router.get('/:id',
  adminPaparazziCreationsController.getById
);

// Create a new paparazzi creation (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.createValidation,
  adminPaparazziCreationsController.create
);

// Update paparazzi creation (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.updateValidation,
  adminPaparazziCreationsController.update
);

// Delete paparazzi creation (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.delete
);

module.exports = router;