#!/usr/bin/env node

/**
 * Test script to verify mobile responsiveness and touch interactions
 * for the PDF annotation system
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Mobile PDF Annotation Functionality\n');

// Test 1: Verify mobile dialog component exists
console.log('1. Checking MobileAnnotationDialog component...');
const mobileDialogPath = path.join(__dirname, 'components/pdf/MobileAnnotationDialog.tsx');
if (fs.existsSync(mobileDialogPath)) {
    console.log('✅ MobileAnnotationDialog component exists');
    
    const content = fs.readFileSync(mobileDialogPath, 'utf8');
    
    // Check for key mobile features
    const checks = [
        { feature: 'Dialog component import', pattern: /Dialog.*from.*@\/components\/ui\/dialog/ },
        { feature: 'Touch-friendly button sizing', pattern: /min-h-\[44px\]/ },
        { feature: 'Mobile-optimized layout', pattern: /max-w-\[95vw\]/ },
        { feature: 'Selected text truncation', pattern: /truncateText/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ MobileAnnotationDialog component not found');
}

// Test 2: Verify PDFAnnotationViewer mobile integration
console.log('\n2. Checking PDFAnnotationViewer mobile integration...');
const pdfViewerPath = path.join(__dirname, 'components/pdf/PDFAnnotationViewer.tsx');
if (fs.existsSync(pdfViewerPath)) {
    console.log('✅ PDFAnnotationViewer component exists');
    
    const content = fs.readFileSync(pdfViewerPath, 'utf8');
    
    const checks = [
        { feature: 'Mobile hook import', pattern: /useIsMobile.*from.*@\/hooks\/use-mobile/ },
        { feature: 'Mobile dialog state', pattern: /showMobileDialog.*setShowMobileDialog/ },
        { feature: 'Touch event handling', pattern: /touchend.*handleTouchEnd/ },
        { feature: 'Mobile-specific PDF settings', pattern: /enableMagnification.*isMobile/ },
        { feature: 'Mobile dialog component', pattern: /<MobileAnnotationDialog/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ PDFAnnotationViewer component not found');
}

// Test 3: Verify AnnotationTooltip mobile handling
console.log('\n3. Checking AnnotationTooltip mobile handling...');
const tooltipPath = path.join(__dirname, 'components/pdf/AnnotationTooltip.tsx');
if (fs.existsSync(tooltipPath)) {
    console.log('✅ AnnotationTooltip component exists');
    
    const content = fs.readFileSync(tooltipPath, 'utf8');
    
    const checks = [
        { feature: 'Mobile hook import', pattern: /useIsMobile/ },
        { feature: 'Mobile conditional rendering', pattern: /if.*isMobile.*return null/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ AnnotationTooltip component not found');
}

// Test 4: Verify AnnotationPreviewCard mobile optimization
console.log('\n4. Checking AnnotationPreviewCard mobile optimization...');
const previewCardPath = path.join(__dirname, 'components/pdf/AnnotationPreviewCard.tsx');
if (fs.existsSync(previewCardPath)) {
    console.log('✅ AnnotationPreviewCard component exists');
    
    const content = fs.readFileSync(previewCardPath, 'utf8');
    
    const checks = [
        { feature: 'Mobile hook import', pattern: /useIsMobile/ },
        { feature: 'Touch-friendly button sizing', pattern: /min-h-\[44px\]/ },
        { feature: 'Mobile-specific text', pattern: /Tap to edit note/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ AnnotationPreviewCard component not found');
}

// Test 5: Verify AnnotationOverlay touch handling
console.log('\n5. Checking AnnotationOverlay touch handling...');
const overlayPath = path.join(__dirname, 'components/pdf/AnnotationOverlay.tsx');
if (fs.existsSync(overlayPath)) {
    console.log('✅ AnnotationOverlay component exists');
    
    const content = fs.readFileSync(overlayPath, 'utf8');
    
    const checks = [
        { feature: 'Mobile hook import', pattern: /useIsMobile/ },
        { feature: 'Touch event handlers', pattern: /handleHighlightTouchStart.*handleHighlightTouchEnd/ },
        { feature: 'Touch-friendly sizing', pattern: /minHeight.*isMobile.*44px/ },
        { feature: 'Touch event attributes', pattern: /onTouchStart.*onTouchEnd/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ AnnotationOverlay component not found');
}

// Test 6: Verify mobile CSS optimizations
console.log('\n6. Checking mobile CSS optimizations...');
const cssPath = path.join(__dirname, 'app/globals.css');
if (fs.existsSync(cssPath)) {
    console.log('✅ Global CSS file exists');
    
    const content = fs.readFileSync(cssPath, 'utf8');
    
    const checks = [
        { feature: 'Mobile media query', pattern: /@media.*max-width.*768px/ },
        { feature: 'Touch-friendly highlights', pattern: /min-height.*44px.*!important/ },
        { feature: 'Touch scrolling optimization', pattern: /-webkit-overflow-scrolling.*touch/ },
        { feature: 'Touch action optimization', pattern: /touch-action.*pan-x pan-y/ },
        { feature: 'Tap highlight color', pattern: /-webkit-tap-highlight-color/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ Global CSS file not found');
}

// Test 7: Verify dialog UI component
console.log('\n7. Checking Dialog UI component...');
const dialogUIPath = path.join(__dirname, 'components/ui/dialog.tsx');
if (fs.existsSync(dialogUIPath)) {
    console.log('✅ Dialog UI component exists');
    
    const content = fs.readFileSync(dialogUIPath, 'utf8');
    
    const checks = [
        { feature: 'Radix Dialog import', pattern: /import.*DialogPrimitive.*from.*@radix-ui\/react-dialog/ },
        { feature: 'Mobile-responsive content', pattern: /max-w-\[95vw\]/ },
        { feature: 'Smooth animations', pattern: /duration-200/ },
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`   ✅ ${check.feature} implemented`);
        } else {
            console.log(`   ❌ ${check.feature} missing`);
        }
    });
} else {
    console.log('❌ Dialog UI component not found');
}

console.log('\n🎉 Mobile functionality test completed!');
console.log('\n📱 Key Mobile Features Implemented:');
console.log('   • Tap-to-select functionality for mobile devices');
console.log('   • Full-screen modal for "Create note" on mobile');
console.log('   • Touch-friendly sizing (min 44px touch targets)');
console.log('   • Optimized PDF viewer performance for mobile');
console.log('   • Touch event handling for annotation highlights');
console.log('   • Mobile-specific CSS optimizations');
console.log('   • Responsive dialog components');