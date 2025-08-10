#!/usr/bin/env node

/**
 * Diagnostic script to identify common issues with the PDF annotation system
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Diagnosing PDF Annotation System Issues...\n');

// Check for common import issues
function checkImportIssues() {
  console.log('📋 Checking import statements...');
  
  const filesToCheck = [
    'app/dashboard/pdf-notes/page.tsx',
    'components/pdf/PDFAnnotationViewer.tsx',
    'lib/store/annotationSlice.ts'
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common import issues
      const issues = [];
      
      // Check for missing 'use client' directive in client components
      if (file.includes('components/') && content.includes('useState') && !content.includes("'use client'")) {
        issues.push("Missing 'use client' directive");
      }
      
      // Check for potential circular imports
      if (content.includes('@/components/pdf') && content.includes('@/lib/store')) {
        // This is normal, but worth noting
      }
      
      if (issues.length > 0) {
        console.log(`   ⚠️  ${file}:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
      } else {
        console.log(`   ✅ ${file}`);
      }
    }
  });
}

// Check for environment issues
function checkEnvironment() {
  console.log('\n🌍 Checking environment configuration...');
  
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    
    const requiredVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
    
    if (missingVars.length > 0) {
      console.log('   ❌ Missing environment variables:');
      missingVars.forEach(varName => console.log(`      - ${varName}`));
    } else {
      console.log('   ✅ All required environment variables are present');
    }
  } else {
    console.log('   ❌ .env.local file not found');
  }
}

// Check for potential runtime issues
function checkRuntimeIssues() {
  console.log('\n⚡ Checking for potential runtime issues...');
  
  // Check if all required CSS files exist
  const cssFiles = [
    'app/globals.css',
    'app/syncfusion.css'
  ];
  
  cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ Missing: ${file}`);
    }
  });
  
  // Check for potential Syncfusion issues
  if (fs.existsSync('app/syncfusion.css')) {
    const syncfusionCss = fs.readFileSync('app/syncfusion.css', 'utf8');
    if (syncfusionCss.includes('@syncfusion')) {
      console.log('   ✅ Syncfusion CSS imports found');
    } else {
      console.log('   ⚠️  Syncfusion CSS might be incomplete');
    }
  }
}

// Provide recommendations
function provideRecommendations() {
  console.log('\n💡 Recommendations:');
  console.log('   1. Try running: npm run dev');
  console.log('   2. If you see Syncfusion license warnings, they can be ignored in development');
  console.log('   3. Check browser console for any client-side errors');
  console.log('   4. Ensure all PDF files are under 50MB');
  console.log('   5. Test with a simple PDF first');
  
  console.log('\n🚀 Quick test steps:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Navigate to: http://localhost:3000/dashboard/pdf-notes');
  console.log('   3. Upload a small PDF file');
  console.log('   4. Try selecting text to create an annotation');
}

// Run all checks
checkImportIssues();
checkEnvironment();
checkRuntimeIssues();
provideRecommendations();

console.log('\n✨ Diagnosis complete!');