/**
 * Verify API endpoint structure and imports
 */

const fs = require('fs');
const path = require('path');

console.log('Verifying API endpoint structure...\n');

// Check if all required files exist
const requiredFiles = [
  'app/api/annotations/route.ts',
  'app/api/pdfs/upload/route.ts',
  'app/api/pdfs/[id]/route.ts',
  'lib/mock-db.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✓ All required API files are present');
  
  // Check if files contain required exports
  const annotationsContent = fs.readFileSync('app/api/annotations/route.ts', 'utf8');
  const uploadsContent = fs.readFileSync('app/api/pdfs/upload/route.ts', 'utf8');
  const pdfIdContent = fs.readFileSync('app/api/pdfs/[id]/route.ts', 'utf8');
  
  console.log('\nChecking exports...');
  
  // Check annotations route
  if (annotationsContent.includes('export async function GET') &&
      annotationsContent.includes('export async function POST') &&
      annotationsContent.includes('export async function PUT') &&
      annotationsContent.includes('export async function DELETE')) {
    console.log('✓ Annotations route has all CRUD operations');
  } else {
    console.log('✗ Annotations route missing some CRUD operations');
  }
  
  // Check PDF upload route
  if (uploadsContent.includes('export async function POST') &&
      uploadsContent.includes('export async function GET')) {
    console.log('✓ PDF upload route has POST and GET operations');
  } else {
    console.log('✗ PDF upload route missing operations');
  }
  
  // Check PDF ID route
  if (pdfIdContent.includes('export async function GET') &&
      pdfIdContent.includes('export async function DELETE')) {
    console.log('✓ PDF ID route has GET and DELETE operations');
  } else {
    console.log('✗ PDF ID route missing operations');
  }
  
  console.log('\n✓ API endpoint structure verification complete');
} else {
  console.log('\n✗ Some required files are missing');
}

console.log('\nAPI Endpoints Summary:');
console.log('- GET /api/annotations?pdfId={id}&page={number} - Get annotations');
console.log('- POST /api/annotations - Create annotation');
console.log('- PUT /api/annotations - Update annotation');
console.log('- DELETE /api/annotations?id={id} - Delete annotation');
console.log('- POST /api/pdfs/upload - Upload PDF');
console.log('- GET /api/pdfs/upload - Get user PDFs');
console.log('- GET /api/pdfs/[id] - Get specific PDF');
console.log('- DELETE /api/pdfs/[id] - Delete PDF');