const { translateText, SUPPORTED_LANGUAGES } = require('./src/services/translationService');

async function testAllLanguages() {
  console.log('🧪 Testing Deep-Translator Implementation for All 6 Languages\n');

  const testCases = [
    { text: 'Hello world', source: 'en', target: 'ar', expected: 'Arabic' },
    { text: 'Hello world', source: 'en', target: 'hi', expected: 'Hindi' },
    { text: 'Hello world', source: 'en', target: 'ru', expected: 'Russian' },
    { text: 'Hello world', source: 'en', target: 'zh', expected: 'Chinese' },
    { text: 'Hello world', source: 'en', target: 'fr', expected: 'French' },
    { text: 'مرحبا بالعالم', source: 'ar', target: 'en', expected: 'English' },
    { text: 'नमस्ते दुनिया', source: 'hi', target: 'en', expected: 'English' },
    { text: 'Привет мир', source: 'ru', target: 'en', expected: 'English' },
    { text: '你好世界', source: 'zh', target: 'en', expected: 'English' },
    { text: 'Bonjour le monde', source: 'fr', target: 'en', expected: 'English' }
  ];

  console.log('Supported languages:', SUPPORTED_LANGUAGES);
  console.log();

  let successCount = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}/${totalTests}: Translating "${testCase.text}" from ${testCase.source} to ${testCase.target} (${testCase.expected})`);

    try {
      const result = await translateText(testCase.text, testCase.source, testCase.target);

      if (result.error) {
        console.log(`   ❌ Error: ${result.message}`);
      } else {
        console.log(`   ✅ Success: "${result.translatedText}"`);
        successCount++;
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }

    console.log();

    // Small delay to avoid overwhelming the translation service
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 Test Results:');
  console.log(`   Total tests: ${totalTests}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${totalTests - successCount}`);
  console.log(`   Success rate: ${((successCount / totalTests) * 100).toFixed(1)}%`);

  if (successCount === totalTests) {
    console.log('\n🎉 All tests passed! Deep-translator implementation is working perfectly.');
  } else if (successCount >= totalTests * 0.8) {
    console.log('\n✅ Most tests passed! Implementation is working well.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the implementation.');
  }
}

testAllLanguages().catch(console.error);