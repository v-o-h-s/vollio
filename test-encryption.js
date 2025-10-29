// Simple test to verify encryption/decryption works
const crypto = require('crypto');

// Mock environment variable
process.env.ENCRYPTION_KEY = 'ee1db6762f39ff383657882158e17a70afaea2ee37f68bc97d97fab7fd1fe669';

// Import our encryption functions
const { encrypt, decrypt, encryptOAuthTokens, decryptOAuthTokens } = require('./lib/utils/encryption.ts');

async function testEncryption() {
  console.log('🔐 Testing OAuth Token Encryption...\n');

  try {
    // Test basic encryption/decryption
    const testData = 'test-access-token-12345';
    console.log('Original data:', testData);
    
    const encrypted = encrypt(testData);
    console.log('Encrypted data:', encrypted.substring(0, 50) + '...');
    
    const decrypted = decrypt(encrypted);
    console.log('Decrypted data:', decrypted);
    
    if (testData === decrypted) {
      console.log('✅ Basic encryption/decryption works!\n');
    } else {
      console.log('❌ Basic encryption/decryption failed!\n');
      return;
    }

    // Test OAuth token encryption
    const mockTokens = {
      access_token: 'ya29.a0ARrdaM9example_access_token',
      refresh_token: '1//04example_refresh_token'
    };

    console.log('Mock OAuth tokens:', mockTokens);
    
    const encryptedTokens = encryptOAuthTokens(mockTokens);
    console.log('Encrypted tokens:', {
      encrypted_access_token: encryptedTokens.encrypted_access_token.substring(0, 50) + '...',
      encrypted_refresh_token: encryptedTokens.encrypted_refresh_token?.substring(0, 50) + '...'
    });
    
    const decryptedTokens = decryptOAuthTokens(encryptedTokens);
    console.log('Decrypted tokens:', decryptedTokens);
    
    if (mockTokens.access_token === decryptedTokens.access_token && 
        mockTokens.refresh_token === decryptedTokens.refresh_token) {
      console.log('✅ OAuth token encryption/decryption works!');
    } else {
      console.log('❌ OAuth token encryption/decryption failed!');
    }

  } catch (error) {
    console.error('❌ Encryption test failed:', error.message);
  }
}

// Note: This is a simple test file. In a real app, you'd use a proper testing framework
console.log('Run this test after building the TypeScript files:');
console.log('npm run build && node test-encryption.js');