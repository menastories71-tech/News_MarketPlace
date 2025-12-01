const express = require('express');
const router = express.Router();
const themeOrderController = require('../controllers/themeOrderController');
const { verifyToken, requireAuth } = require('../middleware/auth');
const { verifyAdminToken, requireAdminPanelAccess } = require('../middleware/auth');

// User routes (authenticated users)
router.post('/', verifyToken, requireAuth, themeOrderController.createValidation, themeOrderController.create);
router.get('/my-orders', verifyToken, requireAuth, themeOrderController.getUserOrders);

// Admin routes
router.get('/', verifyAdminToken, requireAdminPanelAccess, themeOrderController.getAll);
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, themeOrderController.getById);
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, themeOrderController.updateValidation, themeOrderController.update);
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, themeOrderController.delete);

module.exports = router;