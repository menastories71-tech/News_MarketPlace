const express = require('express');
const router = express.Router();
const awardController = require('../controllers/awardController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Public routes for viewing awards
router.get('/', awardController.getAll);
router.get('/:id', awardController.getById);

// Admin routes for managing awards
router.post('/', verifyAdminToken, requireAdminPanelAccess, awardController.createValidation, awardController.create);
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, awardController.updateValidation, awardController.update);
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, awardController.delete);

// Admin search route
router.get('/admin/search', verifyAdminToken, requireAdminPanelAccess, awardController.search);

module.exports = router;