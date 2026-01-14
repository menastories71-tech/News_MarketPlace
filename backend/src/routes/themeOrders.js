const express = require('express');
const router = express.Router();
const themeOrderController = require('../controllers/themeOrderController');
const { verifyToken, verifyAdminToken, requireAdminPanelAccess, optionalAuth } = require('../middleware/auth');

// User routes - make verifyToken optional for order creation
router.post('/', optionalAuth, themeOrderController.createValidation, themeOrderController.create);
router.get('/my-orders', verifyToken, themeOrderController.getUserOrders);

// Admin routes
router.get('/export-csv', verifyAdminToken, requireAdminPanelAccess, themeOrderController.downloadCSV);
router.get('/', verifyAdminToken, requireAdminPanelAccess, themeOrderController.getAll);
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, themeOrderController.getById);
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, themeOrderController.updateValidation, themeOrderController.update);
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, themeOrderController.delete);

module.exports = router;