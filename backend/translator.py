#!/usr/bin/env python3
# translator.py - Python microservice for translation using deep-translator
from deep_translator import GoogleTranslator
import sys
import json

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python3 translator.py <source_lang> <target_lang> <text>"}))
        sys.exit(1)

    source_lang = sys.argv[1]
    target_lang = sys.argv[2]
    text = sys.argv[3]

    try:
        # Use GoogleTranslator via deep-translator
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translation = translator.translate(text)

        # Return successful result
        result = {
            "translation": translation,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "original_text": text
        }
        print(json.dumps(result))

    except Exception as e:
        # Return error result
        error_result = {
            "error": str(e),
            "source_lang": source_lang,
            "target_lang": target_lang,
            "original_text": text
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()