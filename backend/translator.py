#!/usr/bin/env python3
# backend/translator.py - Universal Hybrid Version 2.1
# Supports both Flask API service and Direct CLI execution
from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import os, sys, json, logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("translator")

app = Flask(__name__)

def translate_logic(text, target_lang, source_lang='auto'):
    if not text or not isinstance(text, str) or len(text.strip()) == 0:
        return {"error": "Empty text provided", "success": False}
    if len(text) > 5000:
        return {"error": "Text too long (max 5000 characters)", "success": False}
    
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translation = translator.translate(text)
        return {
            "translation": translation,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "original_text": text,
            "success": True
        }
    except Exception as e:
        logger.error(f"Translation logic error: {str(e)}")
        return {"error": str(e), "success": False}

# --- FLASK ROUTES ---

@app.route('/translate', methods=['POST'])
@app.route('/api/translation/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload"}), 400
            
        result = translate_logic(
            data.get('text'), 
            data.get('target_lang'), 
            data.get('source_lang', 'auto')
        )
        return jsonify(result), 200 if result["success"] else 400
    except Exception as e:
        logger.error(f"Internal error in /translate: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/translate/batch', methods=['POST'])
@app.route('/api/translation/translate/batch', methods=['POST'])
def translate_batch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload"}), 400

        target_lang = data.get('target_lang') or data.get('target_language')
        texts = data.get('translations') or data.get('texts')
        
        if not target_lang or not texts or not isinstance(texts, list):
            logger.error(f"Invalid batch request payload: {data}")
            return jsonify({"error": "Missing target_lang or translations array"}), 400

        results = []
        for text in texts:
            res = translate_logic(text, target_lang)
            results.append({
                "success": res["success"],
                "translation": res.get("translation", ""),
                "original": text,
                "error": res.get("error")
            })

        return jsonify({"results": results, "success": True})
    except Exception as e:
        logger.error(f"Internal error in /translate/batch: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
@app.route('/api/translation/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "version": "2.1-hybrid-ready",
        "service": "translator"
    })

# Final catch-all for any method to help with diagnostics
@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    logger.warning(f"CATCH-ALL hit: {request.method} /{path}")
    return jsonify({
        "error": "Path not found in translator",
        "method": request.method,
        "path": f"/{path}",
        "full_url": request.url,
        "suggestion": "Check Nginx proxy_pass trailing slash or use /translate/batch"
    }), 404

@app.errorhandler(404)
def handle_404(e):
    logger.warning(f"404 Not Found: {request.path} [{request.method}]")
    return jsonify({
        "error": "Route not found in translator.py", 
        "path": request.path,
        "method": request.method,
        "hint": "Try /translate/batch or /translate"
    }), 404

# --- CLI EXECUTION LOGIC (for Node.js execFile) ---

def run_cli():
    # Usage: script.py <source> <target> <text>
    # Usage: script.py batch <source> <target> <json_texts>
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Insufficient arguments", "usage": "source target text OR batch source target json_texts"}))
        sys.exit(1)

    if sys.argv[1] == 'batch':
        # Batch mode
        source_lang = sys.argv[2]
        target_lang = sys.argv[3]
        try:
            texts = json.loads(sys.argv[4])
            results = []
            for text in texts:
                res = translate_logic(text, target_lang, source_lang)
                results.append({
                    "success": res["success"],
                    "translation": res.get("translation", ""),
                    "original": text
                })
            print(json.dumps({"results": results, "success": True}))
        except Exception as e:
            print(json.dumps({"error": str(e), "success": False}))
    else:
        # Single mode
        source_lang = sys.argv[1]
        target_lang = sys.argv[2]
        text = sys.argv[3]
        result = translate_logic(text, target_lang, source_lang)
        print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] != 'run':
        # If arguments provided (and first isn't 'run'), assume CLI mode
        run_cli()
    else:
        # Flask mode
        port = int(os.environ.get('PORT', 5005))
        logger.info(f"Starting Translator (V2.1) on port {port}")
        app.run(host='0.0.0.0', port=port, debug=False)