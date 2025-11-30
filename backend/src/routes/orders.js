const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/', orderController.create);

// Admin routes (require admin authentication)
router.get('/admin', adminAuth, orderController.getAll);
router.get('/admin/:id', adminAuth, orderController.getById);
router.put('/admin/:id/accept', adminAuth, orderController.acceptOrder);
router.put('/admin/:id/reject', adminAuth, orderController.rejectOrder);
router.put('/admin/:id/complete', adminAuth, orderController.completeOrder);
router.put('/admin/:id', adminAuth, orderController.update);

module.exports = router;