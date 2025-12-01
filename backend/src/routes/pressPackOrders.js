const express = require('express');
const router = express.Router();
const pressPackOrderController = require('../controllers/pressPackOrderController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Create a new press pack order (public route for users)
router.post('/', pressPackOrderController.create);

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