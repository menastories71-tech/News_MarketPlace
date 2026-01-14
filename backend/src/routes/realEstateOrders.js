const express = require('express');
const router = express.Router();
const realEstateOrderController = require('../controllers/realEstateOrderController');
const { verifyToken, verifyAdminToken } = require('../middleware/auth');

// User routes (require authentication)
router.post('/', verifyToken, realEstateOrderController.createValidation, realEstateOrderController.create);

// Get orders by professional (for professional dashboard)
router.get('/professional/:professionalId', verifyToken, realEstateOrderController.getOrdersByProfessional);

// Admin routes (require admin authentication)
router.get('/export-csv', verifyAdminToken, realEstateOrderController.downloadCSV);
router.get('/', verifyAdminToken, realEstateOrderController.getAll);
router.get('/:id', verifyAdminToken, realEstateOrderController.getById);
router.put('/:id', verifyAdminToken, realEstateOrderController.update);
router.delete('/:id', verifyAdminToken, realEstateOrderController.delete);

module.exports = router;