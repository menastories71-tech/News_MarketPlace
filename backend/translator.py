#!/usr/bin/env python3
# backend/translator.py - Universal Hybrid Version 2.4 (Interoperable Edition)
from flask import Flask, request, jsonify, make_response
from deep_translator import GoogleTranslator
import os, sys, json, logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger("translator")

app = Flask(__name__)
app.url_map.strict_slashes = False

@app.after_request
def add_header(response):
    response.headers['X-Translator-Version'] = '2.4-interop'
    return response

def translate_logic(text, target_lang, source_lang='auto'):
    if not text or not isinstance(text, str) or len(text.strip()) == 0:
        return {"error": "Empty text provided", "success": False}
    
    try:
        # Standardize language codes (e.g., zh -> zh-CN)
        lang_map = {'zh': 'zh-CN', 'zh-cn': 'zh-CN', 'tw': 'zh-TW'}
        target_lang = lang_map.get(target_lang.lower(), target_lang)
        
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translation = translator.translate(text)
        return {
            "translation": translation,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "success": True
        }
    except Exception as e:
        logger.error(f"Logic Error: {str(e)}")
        return {"error": str(e), "success": False}

# --- ROUTES ---

@app.route('/translate', methods=['POST'])
@app.route('/api/translation/translate', methods=['POST'])
def translate():
    data = request.get_json() or {}
    
    # Support both target_lang (Python style) and targetLang (JS style)
    target_lang = data.get('targetLen') or data.get('targetLang') or data.get('target_lang') or data.get('target_language')
    text = data.get('text')
    
    if not text or not target_lang:
        logger.error(f"Invalid single request: {data}")
        return jsonify({"error": "Missing text or targetLang"}), 400

    result = translate_logic(text, target_lang, data.get('source_lang', 'auto'))
    return jsonify(result), 200 if result["success"] else 500

@app.route('/translate/batch', methods=['POST'])
@app.route('/api/translation/translate/batch', methods=['POST'])
@app.route('/api/translation/batch', methods=['POST'])
def translate_batch():
    data = request.get_json() or {}
    
    # Support multiple naming conventions to ensure 100% compatibility
    target_lang = data.get('targetLang') or data.get('target_lang') or data.get('target_language')
    texts = data.get('translations') or data.get('texts')
    
    if not target_lang or not texts or not isinstance(texts, list):
        logger.error(f"Invalid batch request payload: {data}")
        return jsonify({"error": "Missing targetLang or translations array"}), 400

    logger.info(f"Processing batch of {len(texts)} for {target_lang}")
    results = []
    for text in texts:
        res = translate_logic(text, target_lang)
        results.append({
            "success": res["success"],
            "translation": res.get("translation", ""),
            "original": text
        })

    return jsonify({"results": results, "success": True})

@app.route('/health', methods=['GET'])
@app.route('/api/translation/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "version": "2.4", "engine": "google-translate"})

@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "Route not found", "path": request.path}), 404

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] not in ['run', 'serve']:
        # Direct CLI execution for Node.js
        if sys.argv[1] == 'batch':
            source, target, texts_json = sys.argv[2], sys.argv[3], sys.argv[4]
            texts = json.loads(texts_json)
            res = [{"translation": translate_logic(t, target, source)["translation"], "original": t} for t in texts]
            print(json.dumps({"results": res, "success": True}))
        else:
            print(json.dumps(translate_logic(sys.argv[3], sys.argv[2], sys.argv[1])))
    else:
        port = int(os.environ.get('PORT', 5005))
        logger.info(f"Translator V2.4 Starting on port {port}")
        app.run(host='0.0.0.0', port=port)