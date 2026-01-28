#!/usr/bin/env python3
# backend/translator.py - Universal Hybrid Version 2.3 (Diagnostic Edition)
from flask import Flask, request, jsonify, make_response
from deep_translator import GoogleTranslator
import os, sys, json, logging

# Configure logging to show up in PM2 logs clearly
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger("translator")

app = Flask(__name__)
app.url_map.strict_slashes = False # Be indifferent to trailing slashes

@app.after_request
def add_header(response):
    response.headers['X-Translator-Version'] = '2.3-diagnostic'
    return response

def translate_logic(text, target_lang, source_lang='auto'):
    if not text or not isinstance(text, str) or len(text.strip()) == 0:
        return {"error": "Empty text provided", "success": False}
    
    try:
        # Standardize language codes
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
    result = translate_logic(data.get('text'), data.get('target_lang'), data.get('source_lang', 'auto'))
    return jsonify(result), 200 if result["success"] else 400

@app.route('/translate/batch', methods=['POST'])
@app.route('/api/translation/translate/batch', methods=['POST'])
@app.route('/api/translation/batch', methods=['POST'])
def translate_batch():
    data = request.get_json() or {}
    target_lang = data.get('target_lang') or data.get('target_language')
    texts = data.get('translations') or data.get('texts')
    
    if not target_lang or not texts or not isinstance(texts, list):
        return jsonify({"error": "Missing target_lang or translations array"}), 400

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
    return jsonify({"status": "healthy", "version": "2.3", "engine": "google-translate"})

@app.errorhandler(404)
def handle_404(e):
    logger.warning(f"404 NOT FOUND: {request.method} {request.path}")
    return jsonify({
        "error": "Route not found",
        "path": request.path,
        "valid_routes": ["/translate/batch", "/translate", "/health"]
    }), 404

# --- CLI MODE ---
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] not in ['run', 'serve']:
        # Direct CLI execution for Node.js
        if sys.argv[1] == 'batch':
            # Usage: translator.py batch en fr '["hello","world"]'
            source, target, texts = sys.argv[2], sys.argv[3], json.loads(sys.argv[4])
            res = [{"translation": translate_logic(t, target, source)["translation"], "original": t} for t in texts]
            print(json.dumps({"results": res, "success": True}))
        else:
            # Usage: translator.py en fr "hello"
            print(json.dumps(translate_logic(sys.argv[3], sys.argv[2], sys.argv[1])))
    else:
        port = int(os.environ.get('PORT', 5005))
        logger.info(f"Translator V2.3 starting on port {port}")
        app.run(host='0.0.0.0', port=port)