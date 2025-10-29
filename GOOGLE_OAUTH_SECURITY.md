# Google OAuth Token Security Implementation

## Overview

This implementation provides secure storage and management of Google OAuth tokens using AES-256-GCM encryption. All tokens are encrypted before being stored in the database and decrypted only when needed.

## Security Features

### 1. AES-256-GCM Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes) - randomly generated for each encryption
- **Authentication Tag**: 128 bits (16 bytes) for integrity verification
- **Additional Authenticated Data (AAD)**: "oauth-token" string for context binding

### 2. Database Schema
```sql
CREATE TABLE oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google',
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)
- **Policy**: Users can only access their own OAuth tokens
- **Implementation**: `user_id = requesting_user_id()`
- **Automatic Isolation**: Clerk JWT integration ensures user data separation

### 4. Environment Variables
```bash
# 256-bit encryption key (64 hex characters)
ENCRYPTION_KEY=ee1db6762f39ff383657882158e17a70afaea2ee37f68bc97d97fab7fd1fe669
```

## Implementation Details

### Encryption Process
1. Generate random 128-bit IV
2. Create AES-256-GCM cipher with key and IV
3. Set Additional Authenticated Data (AAD)
4. Encrypt plaintext token
5. Get authentication tag
6. Combine: IV + Tag + Encrypted Data (all hex-encoded)

### Decryption Process
1. Extract IV, Tag, and Encrypted Data from stored string
2. Create AES-256-GCM decipher with key and IV
3. Set AAD and authentication tag
4. Decrypt and verify integrity
5. Return plaintext token

### Token Storage Flow
```typescript
// 1. OAuth callback receives tokens
const { tokens } = await oauth2Client.getToken(code);

// 2. Encrypt tokens before storage
const encryptedTokens = encryptOAuthTokens({
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
});

// 3. Store in database with RLS protection
await saveOAuthTokens(userId, encryptedTokens);
```

### Token Retrieval Flow
```typescript
// 1. Fetch encrypted tokens from database
const storedTokens = await getOAuthTokens(userId, 'google');

// 2. Decrypt tokens for use
const decryptedTokens = decryptOAuthTokens(storedTokens);

// 3. Create authenticated Google client
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(decryptedTokens);
```

## API Endpoints

### `/api/google/callback` - OAuth Callback
- Exchanges authorization code for tokens
- Encrypts and stores tokens securely
- Tests connection with Google Classroom API

### `/api/google/tokens` - Token Management
- `GET`: Check if user has stored tokens (without exposing them)
- `DELETE`: Remove stored tokens for user

### `/api/google/test-stored-tokens` - Token Verification
- Tests stored tokens by making Google API call
- Verifies encryption/decryption works correctly
- Provides detailed error messages for debugging

## Security Best Practices

### 1. Key Management
- Use cryptographically secure random key generation
- Store encryption key in secure environment variables
- Never log or expose encryption keys
- Consider key rotation for production environments

### 2. Token Handling
- Tokens are never stored in plaintext
- Decryption only happens in memory when needed
- No token data in client-side code or logs
- Automatic cleanup on authentication failures

### 3. Error Handling
- Generic error messages to prevent information leakage
- Detailed logging server-side for debugging
- Graceful degradation when tokens are invalid/expired
- Clear user feedback for re-authentication needs

### 4. Database Security
- RLS policies prevent cross-user access
- Unique constraints prevent token duplication
- Automatic timestamps for audit trails
- Proper indexing for performance without exposing data

## Usage Examples

### Authenticate User
```typescript
// Redirect to Google OAuth
await initiateGoogleAuth();

// After callback, tokens are automatically encrypted and stored
```

### Use Stored Tokens
```typescript
// Get authenticated Google Classroom client
const classroom = await getGoogleClassroomClient(userId);

// Make API calls
const courses = await classroom.courses.list();
```

### Check Token Status
```typescript
// Check if user has valid tokens
const response = await fetch('/api/google/tokens');
const { hasTokens, expiresAt } = await response.json();
```

## Testing

### Manual Testing
1. Visit `/dashboard/google-connection-test`
2. Click "Connect to Google Classroom"
3. Complete OAuth flow
4. Verify tokens are stored and working
5. Test API calls with stored tokens

### Automated Testing
```bash
# Test token encryption/decryption
npm test -- encryption.test.ts

# Test OAuth service
npm test -- oauth-token-service.test.ts

# Test API endpoints
npm test -- google-api.test.ts
```

## Production Considerations

### 1. Key Rotation
- Implement periodic encryption key rotation
- Maintain backward compatibility during transitions
- Use key versioning for gradual migration

### 2. Token Refresh
- Implement automatic token refresh using refresh tokens
- Handle refresh failures gracefully
- Update stored tokens after successful refresh

### 3. Monitoring
- Monitor token usage and expiration
- Alert on authentication failures
- Track API usage patterns

### 4. Compliance
- Ensure GDPR compliance for EU users
- Implement data retention policies
- Provide user data export/deletion capabilities

## Troubleshooting

### Common Issues
1. **"No tokens found"**: User needs to authenticate
2. **"Tokens expired"**: Implement token refresh or re-authentication
3. **"Decryption failed"**: Check encryption key consistency
4. **"Invalid grant"**: Tokens may be revoked, need re-authentication

### Debug Steps
1. Check environment variables are set correctly
2. Verify database migration was applied
3. Test encryption/decryption with known values
4. Check Supabase RLS policies are active
5. Verify Clerk authentication is working

This implementation provides enterprise-grade security for OAuth token storage while maintaining ease of use and development efficiency.