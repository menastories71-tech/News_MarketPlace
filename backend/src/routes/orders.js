const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Public routes
router.post('/', orderController.create);

// Admin routes (require admin authentication)
router.get('/admin',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.getAll
);

router.get('/admin/export-csv',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.downloadCSV
);

router.get('/admin/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.getById
);
router.put('/admin/:id/accept',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.acceptOrder
);
router.put('/admin/:id/reject',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.rejectOrder
);
router.put('/admin/:id/complete',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.completeOrder
);
router.put('/admin/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  orderController.update
);

module.exports = router;