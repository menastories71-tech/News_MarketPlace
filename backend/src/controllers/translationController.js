const { translateText, translateBatch, SUPPORTED_LANGUAGES } = require('../services/translationService');

function getSupportedLanguages(req, res) {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    note: 'All major languages supported via Google Translate through deep-translator Python library'
  });
}

async function translate(req, res) {
  const { text, sourceLang, targetLang } = req.body;
  try {
    const result = await translateText(text, sourceLang, targetLang);
    if (result.error) {
      return res.status(500).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function batchTranslate(req, res) {
  const { translations, sourceLang, targetLang } = req.body;
  try {
    const result = await translateBatch(translations, sourceLang, targetLang);
    if (result.error) {
      return res.status(500).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getSupportedLanguages, translate, batchTranslate };