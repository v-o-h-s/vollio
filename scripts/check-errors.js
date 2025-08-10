#!/usr/bin/env node

/**
 * Simple error checking script for the PDF annotation system
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking PDF Annotation System...\n');

// Check for required files
const requiredFiles = [
  'components/pdf/PDFAnnotationViewer.tsx',
  'components/pdf/AnnotationTooltip.tsx',
  'components/pdf/AnnotationPreviewCard.tsx',
  'components/pdf/AnnotationOverlay.tsx',
  'components/pdf/MobileAnnotationDialog.tsx',
  'components/pdf/FallbackUI.tsx',
  'lib/store/annotationSlice.ts',
  'lib/store/apiSlice.ts',
  'lib/store/selectors.ts',
  'lib/utils/notifications.ts',
  'lib/utils/crossTabNavigation.ts',
  'lib/utils/pdfCoordinates.ts',
  'hooks/use-mobile.ts',
  'hooks/use-keyboard-shortcuts.ts',
  'components/ErrorBoundary.tsx',
  'components/ui/loading.tsx'
];

let missingFiles = [];
let existingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    existingFiles.push(file);
  } else {
    missingFiles.push(file);
  }
});

console.log('✅ Existing files:');
existingFiles.forEach(file => console.log(`   ${file}`));

if (missingFiles.length > 0) {
  console.log('\n❌ Missing files:');
  missingFiles.forEach(file => console.log(`   ${file}`));
} else {
  console.log('\n✅ All required files are present!');
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@syncfusion/ej2-react-pdfviewer',
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@reduxjs/toolkit',
  'react-redux',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-popover',
  '@radix-ui/react-dialog'
];

let missingDeps = [];
requiredDeps.forEach(dep => {
  if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.log('❌ Missing dependencies:');
  missingDeps.forEach(dep => console.log(`   ${dep}`));
} else {
  console.log('✅ All required dependencies are installed!');
}

console.log('\n🎯 Summary:');
console.log(`   Files: ${existingFiles.length}/${requiredFiles.length} present`);
console.log(`   Dependencies: ${requiredDeps.length - missingDeps.length}/${requiredDeps.length} installed`);

if (missingFiles.length === 0 && missingDeps.length === 0) {
  console.log('\n🎉 System appears to be complete! Try running: npm run dev');
} else {
  console.log('\n⚠️  Some issues found. Please address the missing files/dependencies above.');
}