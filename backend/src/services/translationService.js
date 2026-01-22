const { execFile } = require('child_process');
const path = require('path');
const redis = require('redis');

// Initialize Redis client with lazy loading
let redisClient = null;
let redisInitialized = false;

async function getRedisClient() {
  if (redisInitialized) {
    return redisClient;
  }

  try {
    // Use URL-based connection for Redis Cloud
    const redisUrl = `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

    const client = redis.createClient({
      url: redisUrl,
      retry_strategy: () => null // Disable retries
    });

    client.on('error', (err) => {
      console.warn('Redis connection failed:', err.message);
      redisClient = null;
    });

    client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    await client.connect();
    redisClient = client;
    redisInitialized = true;

    return redisClient;
  } catch (error) {
    console.warn('Redis initialization failed:', error.message);
    redisClient = null;
    redisInitialized = true; // Don't try again
    return null;
  }
}

// Language mapping for deep-translator (frontend codes → deep-translator codes)
const LANGUAGE_MAP = {
  'en': 'en',      // English
  'ar': 'ar',      // Arabic
  'hi': 'hi',      // Hindi
  'ru': 'ru',      // Russian
  'zh': 'zh-CN',  // Chinese (Simplified)
  'fr': 'fr',      // French
  'es': 'es',      // Spanish
  'de': 'de',      // German
  'it': 'it',      // Italian
  'pt': 'pt',      // Portuguese
  'ja': 'ja',      // Japanese
  'ko': 'ko'       // Korean
};

// Supported languages for translation (frontend codes)
const SUPPORTED_LANGUAGES = ['en', 'ar', 'hi', 'ru', 'zh', 'fr'];

// Path to the Python translator script
const TRANSLATOR_SCRIPT = path.join(__dirname, '../../translator.py');

async function translateText(text, sourceLang, targetLang) {
  try {
    // Validate input
    if (!text || !sourceLang || !targetLang) {
      return { error: true, message: 'Missing required parameters: text, sourceLang, targetLang' };
    }

    if (!SUPPORTED_LANGUAGES.includes(sourceLang) || !SUPPORTED_LANGUAGES.includes(targetLang)) {
      return { error: true, message: `Unsupported language pair: ${sourceLang} → ${targetLang}` };
    }

    // Map frontend language codes to deep-translator codes
    const deepTranslatorSource = LANGUAGE_MAP[sourceLang];
    const deepTranslatorTarget = LANGUAGE_MAP[targetLang];

    // Create cache key
    const key = `translate:${sourceLang}:${targetLang}:${Buffer.from(text).toString('base64')}`;

    // Check cache first
    try {
      const client = await getRedisClient();
      if (client) {
        const cached = await client.get(key);
        if (cached) {
          console.log(`Cache hit for: ${sourceLang} → ${targetLang}`);
          return { translatedText: cached };
        }
      }
    } catch (redisError) {
      console.warn('Redis cache error:', redisError.message);
    }

    console.log(`Translating "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" from ${sourceLang} to ${targetLang}`);

    // Call Python translator script
    const result = await new Promise((resolve, reject) => {
      execFile('python', [TRANSLATOR_SCRIPT, deepTranslatorSource, deepTranslatorTarget, text], {
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
        cwd: path.dirname(TRANSLATOR_SCRIPT) // Set working directory to script location
      }, (error, stdout, stderr) => {
        console.log('Python script output:', { stdout: stdout?.trim(), stderr: stderr?.trim(), error: error?.message });

        if (error) {
          console.error('Python execution error:', error);
          reject(new Error(`Python execution failed: ${error.message}`));
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.error) {
            reject(new Error(parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Raw output:', stdout);
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });
    });

    const translatedText = result.translation;

    // Cache the result
    try {
      const client = await getRedisClient();
      if (client && translatedText) {
        await client.setEx(key, 3600, translatedText); // Cache for 1 hour
      }
    } catch (redisError) {
      console.warn('Redis cache write error:', redisError.message);
    }

    return { translatedText };

  } catch (error) {
    console.error('Translation error:', error.message);
    return {
      error: true,
      message: `Translation failed: ${error.message}`
    };
  }
}

async function translateBatch(texts, sourceLang, targetLang) {
  try {
    // Validate input
    if (!texts || !Array.isArray(texts) || !sourceLang || !targetLang) {
      return { error: true, message: 'Missing required parameters: texts (array), sourceLang, targetLang' };
    }

    if (!SUPPORTED_LANGUAGES.includes(sourceLang) || !SUPPORTED_LANGUAGES.includes(targetLang)) {
      return { error: true, message: `Unsupported language pair: ${sourceLang} → ${targetLang}` };
    }

    // Map frontend language codes to deep-translator codes
    const deepTranslatorSource = LANGUAGE_MAP[sourceLang];
    const deepTranslatorTarget = LANGUAGE_MAP[targetLang];

    console.log(`Translating batch of ${texts.length} items from ${sourceLang} to ${targetLang}`);

    // Call Python translator script with 'batch' argument
    // Pass texts as a JSON string
    const result = await new Promise((resolve, reject) => {
      execFile('python', [TRANSLATOR_SCRIPT, 'batch', deepTranslatorSource, deepTranslatorTarget, JSON.stringify(texts)], {
        timeout: 60000, // 60 second timeout for batches
        maxBuffer: 5 * 1024 * 1024, // 5MB buffer for large batches
        cwd: path.dirname(TRANSLATOR_SCRIPT)
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('Python execution error (batch):', error);
          reject(new Error(`Python execution failed: ${error.message}`));
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.error) {
            reject(new Error(parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (parseError) {
          console.error('JSON parse error (batch):', parseError, 'Raw output:', stdout);
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });
    });

    return result;

  } catch (error) {
    console.error('Batch translation error:', error.message);
    return {
      error: true,
      message: `Batch translation failed: ${error.message}`
    };
  }
}

module.exports = { translateText, translateBatch, SUPPORTED_LANGUAGES };