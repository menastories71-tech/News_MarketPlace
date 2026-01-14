const express = require('express');
const router = express.Router();
const paparazziOrderController = require('../controllers/paparazziOrderController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Create a new paparazzi order (public route for users)
router.post('/', paparazziOrderController.create);

// Get all paparazzi orders (admin only)
router.get('/', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.getAll);

// Download CSV (admin only)
router.get('/export-csv', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.downloadCSV);

// Get paparazzi order by ID (admin only)
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.getById);

// Accept paparazzi order (admin only)
router.put('/:id/accept', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.acceptOrder);

// Reject paparazzi order (admin only)
router.put('/:id/reject', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.rejectOrder);

// Complete paparazzi order (admin only)
router.put('/:id/complete', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.completeOrder);

// Update paparazzi order (admin only)
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, paparazziOrderController.update);

module.exports = router;