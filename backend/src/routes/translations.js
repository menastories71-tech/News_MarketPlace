const express = require('express');
const { getSupportedLanguages, translate } = require('../controllers/translationController');

const router = express.Router();

router.get('/supported-languages', getSupportedLanguages);
router.get('/supported-pairs', getSupportedLanguages); // Alias for backward compatibility
router.post('/translate', translate);

module.exports = router;