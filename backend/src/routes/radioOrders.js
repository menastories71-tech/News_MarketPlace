const express = require('express');
const router = express.Router();
const radioOrderController = require('../controllers/radioOrderController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Public route for creating radio order
router.post('/', radioOrderController.create);

// Get all radio orders (admin only)
router.get('/', verifyAdminToken, requireAdminPanelAccess, radioOrderController.getAll);

// Update radio order status (admin only)
router.put('/:id/status', verifyAdminToken, requireAdminPanelAccess, radioOrderController.updateStatus);

// Delete radio order (admin only)
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, radioOrderController.deleteOrder);

module.exports = router;