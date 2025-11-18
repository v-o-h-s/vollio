# Testing GET /api/pdfs in Postman

## Setup

1. **Start your dev server** (if not already running):
   ```bash
   npm run dev
   ```
   This should run on `http://localhost:3000`

2. **Get your authentication token**:
   - Open your app in browser: `http://localhost:3000`
   - Sign in with Clerk
   - Open DevTools (F12) → Application tab
   - Look for Clerk cookies or session token
   - Or check Network tab for Authorization header when making requests

## Test Request in Postman

### Method: GET
### URL: 
```
http://localhost:3000/api/pdfs
```

### Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_CLERK_TOKEN
```

### Expected Successful Response (200):
```json
{
  "success": true,
  "data": {
    "pdfs": [],
    "totalCount": 0
  }
}
```

### Expected Error Response (401 - No Auth):
```json
{
  "success": false,
  "errorType": "AUTH_ERROR",
  "errorSubType": "AUTHENTICATION_REQUIRED",
  "error": {
    "userMessage": "Authentication required. Please sign in.",
    "severity": "HIGH",
    "timestamp": "2025-11-18T...",
    "actionLabel": "Sign In",
    "context": null
  }
}
```

## Common Issues

### "No response" error
- **Cause**: Invalid imports or syntax errors
- **Fix**: Check server console for errors, verify `withErrorHandler` is working
- **Solution**: Already fixed - updated `withErrorHandler` to use `NextResponse` instead of `res.status()`

### "Invalid character" error
- **Cause**: Response JSON has syntax errors  
- **Fixed**: The `withErrorHandler` wrapper now returns proper `NextResponse.json()` responses

### 404 Error
- **Cause**: Route handler not exported correctly
- **Fix**: Verify `export const GET = withErrorHandler(handleGET);` is at bottom of file

### 401 Unauthorized
- **Cause**: Missing or invalid auth token
- **Fix**: Ensure you're passing valid Clerk token in Authorization header

## Testing with cURL

```bash
# Without auth (should get 401)
curl http://localhost:3000/api/pdfs

# With auth token (replace TOKEN)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  http://localhost:3000/api/pdfs
```

## Debugging

If you still get "Invalid character" or no response:

1. **Check server logs**:
   ```bash
   # Watch npm run dev output in terminal
   # Look for "API error caught" messages
   ```

2. **Enable request logging**:
   - The route has `Logger.info()` calls
   - Check terminal for log messages

3. **Verify error handler**:
   - The `withErrorHandler` wrapper catches all errors
   - All responses use `NextResponse.json()` properly formatted

## Success Checklist

✅ Server runs without errors  
✅ GET request returns valid JSON response  
✅ Error responses have proper status codes  
✅ Unauthenticated requests return 401  
✅ Authenticated requests return PDF list or empty array  

If all checks pass, your API route is working correctly!
