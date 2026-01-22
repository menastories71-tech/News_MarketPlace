const express = require('express');
const { getSupportedLanguages, translate, batchTranslate } = require('../controllers/translationController');

const router = express.Router();

router.get('/supported-languages', getSupportedLanguages);
router.get('/supported-pairs', getSupportedLanguages); // Alias for backward compatibility
router.post('/translate', translate);
router.post('/translate/batch', batchTranslate);

module.exports = router;