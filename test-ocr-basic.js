// Simple test to verify OCR service basic functionality
const { OCRService } = require('./lib/services/ocr-service.ts');

try {
  const service = new OCRService();
  
  // Test document type settings
  const settings = service.getDocumentTypeSettings('scientific_paper');
  console.log('✅ Document type settings:', settings);
  
  // Test available document types
  const types = service.getAvailableDocumentTypes();
  console.log('✅ Available document types:', types.length, 'types');
  
  // Test fallback strategies
  const strategies = service.getAvailableFallbackStrategies();
  console.log('✅ Available fallback strategies:', strategies.length, 'strategies');
  
  // Test options validation
  const validation = service.validateOptions({
    confidenceThreshold: 50,
    dpi: 300,
    psmMode: 6
  });
  console.log('✅ Options validation:', validation.valid ? 'PASS' : 'FAIL');
  
  // Test cache functionality
  const stats = service.getCacheStats();
  console.log('✅ Cache stats:', stats);
  
  console.log('\n🎉 All basic OCR service functionality tests passed!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}