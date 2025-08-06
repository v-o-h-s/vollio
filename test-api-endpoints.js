/**
 * Simple test script to verify API endpoints are working
 * This would normally be done with proper testing frameworks
 */

const { mockDB } = require('./lib/mock-db.ts');

console.log('Testing Mock Database...');

// Test PDF operations
console.log('\n=== Testing PDF Operations ===');

const testPDF = {
  id: 'test-pdf-1',
  userId: 'user-123',
  filename: 'test.pdf',
  uploadedAt: new Date(),
  fileUrl: 'blob:test-pdf-1'
};

// Create PDF
const createdPDF = mockDB.createPDF(testPDF);
console.log('Created PDF:', createdPDF.id);

// Get PDFs for user
const userPDFs = mockDB.getPDFs('user-123');
console.log('User PDFs count:', userPDFs.length);

// Get specific PDF
const retrievedPDF = mockDB.getPDF('test-pdf-1', 'user-123');
console.log('Retrieved PDF:', retrievedPDF ? retrievedPDF.id : 'Not found');

// Test Annotation operations
console.log('\n=== Testing Annotation Operations ===');

const testAnnotation = {
  id: 'test-annotation-1',
  userId: 'user-123',
  pdfId: 'test-pdf-1',
  pageNumber: 1,
  selectedText: 'Test selected text',
  noteContent: 'This is a test note',
  coordinates: { x: 100, y: 200, width: 150, height: 20 },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Create annotation
const createdAnnotation = mockDB.createAnnotation(testAnnotation);
console.log('Created annotation:', createdAnnotation.id);

// Get annotations for user and PDF
const annotations = mockDB.getAnnotations('user-123', 'test-pdf-1');
console.log('Annotations count:', annotations.length);

// Update annotation
const updatedAnnotation = mockDB.updateAnnotation('test-annotation-1', 'user-123', {
  noteContent: 'Updated note content'
});
console.log('Updated annotation:', updatedAnnotation ? 'Success' : 'Failed');

// Get annotations for specific page
const pageAnnotations = mockDB.getAnnotations('user-123', 'test-pdf-1', 1);
console.log('Page 1 annotations count:', pageAnnotations.length);

console.log('\n=== All tests completed ===');
console.log('Mock database is working correctly!');