#!/usr/bin/env python3
# translator.py - Flask microservice for translation using deep-translator
from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import os

import sys
import json

app = Flask(__name__)

def translate_logic(text, target_lang, source_lang='auto'):
    if not text or not isinstance(text, str) or len(text.strip()) == 0:
        return {"error": "Text must be a non-empty string"}
    if len(text) > 5000:
        return {"error": "Text too long (max 5000 characters)"}
    
    translator = GoogleTranslator(source=source_lang, target=target_lang)
    translation = translator.translate(text)
    return {
        "translation": translation,
        "source_lang": source_lang,
        "target_lang": target_lang,
        "original_text": text
    }

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang')
        text = data.get('text')

        if not target_lang or not text:
            return jsonify({"error": "Missing required parameters: target_lang and text"}), 400

        result = translate_logic(text, target_lang, source_lang)
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/translate/batch', methods=['POST'])
def translate_batch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang')
        texts = data.get('translations') # frontend sends 'translations'

        if not target_lang or not texts or not isinstance(texts, list):
            return jsonify({"error": "Missing required parameters: target_lang and translations (list)"}), 400

        results = []
        for text in texts:
            try:
                res = translate_logic(text, target_lang, source_lang)
                if "error" in res:
                    results.append({"success": False, "error": res["error"], "original": text})
                else:
                    results.append({"success": True, "translation": res["translation"], "original": text})
            except Exception as e:
                results.append({"success": False, "error": str(e), "original": text})

        return jsonify({"results": results, "success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    # Check for CLI arguments
    if len(sys.argv) > 1:
        try:
            # Handle batch translation via CLI if first arg is 'batch'
            if sys.argv[1] == 'batch':
                source_lang = sys.argv[2]
                target_lang = sys.argv[3]
                # Rejoin remaining args as potential multiple texts or a single JSON array
                # For simplicity with execFile, we'll expect a JSON string of texts as the 4th arg
                try:
                    texts = json.loads(sys.argv[4])
                except:
                    texts = sys.argv[4:] # Fallback to remaining args
                
                results = []
                for text in texts:
                    res = translate_logic(text, target_lang, source_lang)
                    if "error" in res:
                        results.append({"success": False, "error": res["error"], "original": text})
                    else:
                        results.append({"success": True, "translation": res["translation"], "original": text})
                
                print(json.dumps({"results": results, "success": True}))
            else:
                # Single translation: python translator.py <source> <target> <text>
                source_lang = sys.argv[1]
                target_lang = sys.argv[2]
                text = " ".join(sys.argv[3:])
                result = translate_logic(text, target_lang, source_lang)
                print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
        sys.exit(0)
    else:
        # Flask Mode
        port = int(os.environ.get('PORT', 5005))
        app.run(host='0.0.0.0', port=port, debug=False)