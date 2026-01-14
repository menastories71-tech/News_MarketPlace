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

router.get('/download-csv', verifyAdminToken, requireAdminPanelAccess, (req, res) => awardController.downloadCSV(req, res));

router.get('/:id', awardController.getById);

// Admin routes for managing awards
router.post('/', verifyAdminToken, requireAdminPanelAccess, awardController.createValidation, awardController.create);
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, awardController.updateValidation, awardController.update);
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, awardController.delete);

// Admin search route
router.get('/admin/search', verifyAdminToken, requireAdminPanelAccess, awardController.search);

// Bulk upload and template routes
router.get('/admin/template/download', verifyAdminToken, requireAdminPanelAccess, (req, res) => awardController.downloadTemplate(req, res));
router.post('/admin/bulk-upload',
  verifyAdminToken,
  requireAdminPanelAccess,
  awardController.csvUpload.single('file'),
  (req, res) => awardController.bulkUpload(req, res)
);

module.exports = router;