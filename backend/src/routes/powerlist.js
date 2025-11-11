const express = require('express');
const router = express.Router();
const powerlistController = require('../controllers/powerlistController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// User submission route with authentication and rate limiting handled in controller
router.post('/submit', verifyToken, powerlistController.submitValidation, powerlistController.submit);

// Public route for viewing approved powerlists
router.get('/public', powerlistController.getPublic);

// Public route for viewing single approved powerlist
router.get('/public/:id', powerlistController.getPublicById);

// Admin routes for managing powerlists
router.post('/', verifyAdminToken, requireAdminPanelAccess, powerlistController.createValidation, powerlistController.create);
router.get('/', verifyAdminToken, requireAdminPanelAccess, powerlistController.getAll);
router.get('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistController.getById);
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistController.updateValidation, powerlistController.update);
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, powerlistController.delete);

module.exports = router;