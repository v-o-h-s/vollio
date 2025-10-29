# Cleanup Old Google API Endpoints

## 🗑️ Files to Remove

The following old Google API endpoints can now be safely removed as they have been replaced by the new school-lms structure:

### Old API Endpoints (Safe to Delete)
```bash
# These files are now replaced by /api/school-lms/google/*
rm -rf app/api/google/auth-url/
rm -rf app/api/google/callback/
rm -rf app/api/google/tokens/
rm -rf app/api/google/test-stored-tokens/
rm -rf app/api/google/  # Remove entire directory if empty
```

### Migration Status
- ✅ **New Structure**: `/api/school-lms/google/*` - Fully implemented and tested
- ✅ **Redirect Page**: `/dashboard/google-connection-test` - Now redirects to new unified interface
- ✅ **Environment Variables**: Updated `GOOGLE_REDIRECT_URI` to new callback URL
- ✅ **Backward Compatibility**: Old `lib/googleClient.ts` has deprecation warnings

## 🔄 Updated References

### Environment Variables
```bash
# OLD
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

# NEW (Already Updated)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/school-lms/google/callback
```

### Import Statements
```typescript
// OLD (Deprecated but still works)
import { initiateGoogleAuth } from "@/lib/googleClient";

// NEW (Recommended)
import { initiateGoogleAuth } from "@/lib/school-lms/google-client";
```

### API Endpoints
```bash
# OLD
GET /api/google/auth-url
GET /api/google/callback
GET /api/google/tokens
GET /api/google/test-stored-tokens

# NEW
GET /api/school-lms/google/auth-url
GET /api/school-lms/google/callback
GET /api/school-lms/google/tokens
GET /api/school-lms/google/test-stored-tokens

# PLUS NEW UNIFIED ENDPOINTS
GET /api/school-lms/connections
GET /api/school-lms/courses
GET /api/school-lms/assignments
```

## ✅ Verification Checklist

Before removing old files, verify:

1. **New endpoints work**: Test `/dashboard/school-lms-test`
2. **OAuth flow works**: Complete Google Classroom connection
3. **Token storage works**: Verify encrypted tokens are saved
4. **Token testing works**: Test stored tokens functionality
5. **Redirect works**: Old page redirects to new interface

## 🚀 Benefits of New Structure

### Multi-Provider Support
- ✅ Google Classroom (implemented)
- 🚧 Moodle (ready for implementation)
- 🚧 Canvas (ready for implementation)
- 🚧 Blackboard (ready for implementation)

### Unified Interface
- Single test page for all LMS providers
- Consistent API patterns across providers
- Centralized token management
- Cross-provider course and assignment sync

### Enhanced Security
- Same AES-256-GCM encryption
- Provider-specific token isolation
- Improved error handling
- Better audit trails

## 📋 Post-Cleanup Tasks

After removing old files:

1. **Update Documentation**: Remove references to old API endpoints
2. **Update Tests**: Ensure all tests use new endpoints
3. **Monitor Logs**: Check for any 404 errors from old endpoints
4. **Update Bookmarks**: Update any saved links to use new test page

## 🔧 Manual Cleanup Commands

```bash
# Navigate to project root
cd /path/to/your/project

# Remove old Google API directory (after verification)
rm -rf app/api/google/

# Optional: Remove test encryption file
rm test-encryption.js

# Verify new structure exists
ls -la app/api/school-lms/
ls -la lib/school-lms/
```

## ⚠️ Important Notes

- **Don't remove** `lib/googleClient.ts` yet - it provides backward compatibility
- **Don't remove** database migrations or encryption utilities
- **Don't remove** OAuth token service - it's used by the new structure
- **Test thoroughly** before removing old files in production

The reorganization is complete and the old Google-specific API endpoints can be safely removed once you've verified the new school-lms structure works correctly!