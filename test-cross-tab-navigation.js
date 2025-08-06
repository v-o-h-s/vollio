/**
 * Test script to verify cross-tab communication and navigation functionality
 * Run this in the browser console to test the implementation
 */

console.log('Testing Cross-Tab Navigation Implementation...');

// Test 1: URL parameter parsing
console.log('\n=== Test 1: URL Parameter Parsing ===');

// Test hash parsing
const testHash = '#pdf?page=3&x=120&y=450&width=200&height=18';
console.log('Testing hash:', testHash);

// Simulate the parsing logic
try {
    if (testHash.startsWith('#pdf?')) {
        const urlParams = new URLSearchParams(testHash.substring(5));
        const params = {
            page: parseInt(urlParams.get('page'), 10),
            x: parseFloat(urlParams.get('x')),
            y: parseFloat(urlParams.get('y')),
            width: parseFloat(urlParams.get('width')),
            height: parseFloat(urlParams.get('height'))
        };
        
        console.log('Parsed parameters:', params);
        
        // Validate parameters
        const isValid = params.page >= 1 && 
                       params.x >= 0 && params.y >= 0 && 
                       params.width > 0 && params.height > 0 &&
                       params.x <= 10000 && params.y <= 10000 &&
                       params.width <= 10000 && params.height <= 10000;
        
        console.log('Parameters valid:', isValid);
    }
} catch (error) {
    console.error('Hash parsing failed:', error);
}

// Test 2: PostMessage data validation
console.log('\n=== Test 2: PostMessage Data Validation ===');

const testPostMessageData = {
    type: 'PDF_NAVIGATION',
    page: 3,
    coordinates: {
        x: 120,
        y: 450,
        width: 200,
        height: 18
    },
    hash: '#pdf?page=3&x=120&y=450&width=200&height=18'
};

console.log('Testing postMessage data:', testPostMessageData);

// Validate postMessage data structure
const isValidMessage = testPostMessageData &&
    testPostMessageData.type === 'PDF_NAVIGATION' &&
    typeof testPostMessageData.page === 'number' &&
    testPostMessageData.coordinates &&
    typeof testPostMessageData.coordinates.x === 'number' &&
    typeof testPostMessageData.coordinates.y === 'number' &&
    typeof testPostMessageData.coordinates.width === 'number' &&
    typeof testPostMessageData.coordinates.height === 'number' &&
    typeof testPostMessageData.hash === 'string';

console.log('PostMessage data valid:', isValidMessage);

// Test 3: Navigation hash creation
console.log('\n=== Test 3: Navigation Hash Creation ===');

const navigationParams = {
    page: 5,
    x: 250,
    y: 300,
    width: 150,
    height: 25
};

const createdHash = `#pdf?page=${navigationParams.page}&x=${navigationParams.x}&y=${navigationParams.y}&width=${navigationParams.width}&height=${navigationParams.height}`;
console.log('Created navigation hash:', createdHash);

// Test 4: Cross-tab communication simulation
console.log('\n=== Test 4: Cross-Tab Communication Simulation ===');

// Check if we're in a context where we can test opener
if (typeof window !== 'undefined') {
    console.log('Window opener available:', !!window.opener);
    console.log('Window opener closed:', window.opener ? window.opener.closed : 'N/A');
    
    // Test postMessage capability (to self for testing)
    try {
        const testMessage = {
            type: 'PDF_NAVIGATION_TEST',
            timestamp: Date.now()
        };
        
        // Add a temporary listener
        const testListener = (event) => {
            if (event.data && event.data.type === 'PDF_NAVIGATION_TEST') {
                console.log('PostMessage test successful:', event.data);
                window.removeEventListener('message', testListener);
            }
        };
        
        window.addEventListener('message', testListener);
        window.postMessage(testMessage, '*');
        
        // Clean up after 1 second if no response
        setTimeout(() => {
            window.removeEventListener('message', testListener);
        }, 1000);
        
    } catch (error) {
        console.error('PostMessage test failed:', error);
    }
} else {
    console.log('Not in browser environment, skipping window tests');
}

// Test 5: Edge cases
console.log('\n=== Test 5: Edge Cases ===');

// Test invalid hash formats
const invalidHashes = [
    '#pdf',
    '#pdf?',
    '#pdf?page=abc',
    '#pdf?page=1&x=-50',
    '#pdf?page=1&x=50&y=100&width=0',
    '#pdf?page=1&x=50&y=100&width=200&height=-10',
    '#pdf?page=1&x=99999&y=100&width=200&height=10'
];

invalidHashes.forEach(hash => {
    console.log(`Testing invalid hash: ${hash}`);
    try {
        if (hash.startsWith('#pdf?')) {
            const urlParams = new URLSearchParams(hash.substring(5));
            const params = {
                page: parseInt(urlParams.get('page'), 10),
                x: parseFloat(urlParams.get('x')),
                y: parseFloat(urlParams.get('y')),
                width: parseFloat(urlParams.get('width')),
                height: parseFloat(urlParams.get('height'))
            };
            
            const isValid = !isNaN(params.page) && params.page >= 1 && 
                           !isNaN(params.x) && params.x >= 0 && 
                           !isNaN(params.y) && params.y >= 0 && 
                           !isNaN(params.width) && params.width > 0 && 
                           !isNaN(params.height) && params.height > 0 &&
                           params.x <= 10000 && params.y <= 10000 &&
                           params.width <= 10000 && params.height <= 10000;
            
            console.log(`  Result: ${isValid ? 'VALID (unexpected!)' : 'INVALID (expected)'}`);
        } else {
            console.log('  Result: INVALID (expected - wrong format)');
        }
    } catch (error) {
        console.log('  Result: INVALID (expected - parsing error)');
    }
});

console.log('\n=== Cross-Tab Navigation Tests Complete ===');
console.log('All tests completed. Check the results above for any issues.');

// Instructions for manual testing
console.log('\n=== Manual Testing Instructions ===');
console.log('1. Open the PDF notes page and upload a PDF');
console.log('2. Select some text and create a note (opens in new tab)');
console.log('3. In the note editor, click "Back to PDF" - should navigate and close tab');
console.log('4. Create another note and click on a PDF location link in the editor');
console.log('5. Should navigate to the specific location in the PDF without closing editor');
console.log('6. Test on different browsers and with different security settings');