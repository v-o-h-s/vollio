---
inclusion: always
---

# Error Handling Guidelines

## Core Error Handling Patterns

### API Route Error Handling

**Always use `withErrorHandling` wrapper for API routes:**

```typescript
import { withErrorHandling, createServerError, ServerErrorType } from '@/lib/utils/server-error-handling';

export const POST = withErrorHandling(
  async (request: Request) => {
    // Your handler logic
  },
  { endpoint: '/api/your-endpoint', method: 'POST' }
);
```

**Required error handling flow:**
1. Validate authentication and parameters using `validateRequired()`
2. Wrap business logic in try-catch blocks
3. Use `createServerError()` for structured errors
4. Implement cleanup on failures (e.g., remove uploaded files)
5. Return appropriate HTTP status codes

### Client-Side Error Boundaries

**Wrap components with appropriate error boundaries:**

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary context="ComponentName">
  <YourComponent />
</ErrorBoundary>
```

**Available error boundaries:**
- `ErrorBoundary` - General purpose
- `PDFErrorBoundary` - PDF-specific operations
- `UploadErrorBoundary` - File upload operations

### Error Hooks Usage

**Use specialized error hooks for different contexts:**

```typescript
import { 
  useErrorHandler, 
  useUploadErrorHandler, 
  usePDFErrorHandler 
} from '@/hooks/use-error-handling';

// General error handling
const { handleError, retry } = useErrorHandler();

// Upload-specific error handling
const { handleUploadError } = useUploadErrorHandler();

// PDF-specific error handling
const { handlePDFError } = usePDFErrorHandler();
```

## File Upload Error Handling

**Always validate file uploads comprehensively:**

```typescript
import { validateFileUpload } from '@/lib/utils/server-error-handling';

validateFileUpload(
  file,
  STORAGE_CONFIG.MAX_FILE_SIZE, // 50MB max
  STORAGE_CONFIG.ALLOWED_MIME_TYPES, // PDF only
  { userId, fileName: file?.name, fileSize: file?.size }
);
```

**Required validation checks:**
- File existence and type
- Size limits (50MB maximum)
- MIME type validation (PDF only)
- File corruption detection

## Database Error Handling

**Map Supabase errors to application errors:**

```typescript
import { mapSupabaseError } from '@/lib/utils/server-error-handling';

try {
  const { data, error } = await supabase.from('table').insert(data);
  if (error) throw mapSupabaseError(error, context);
} catch (error) {
  throw createServerError(
    ServerErrorType.DATABASE_ERROR,
    'Operation failed',
    { operation: 'database_insert', userId },
    error
  );
}
```

## RTK Query Error Integration

**Use enhanced base query with automatic error handling:**

```typescript
// RTK Query automatically handles errors through apiSlice configuration
// Errors are transformed and user notifications are shown
const { data, error, isLoading } = useGetPDFsQuery();

if (error) {
  // Error is already transformed to AppError type
  // User notifications are automatically shown
}
```

## Error Recovery Strategies

### Automatic Retry Configuration

**Default retry settings:**
- Network requests: 3 retries with exponential backoff
- Database operations: 2 retries with linear backoff
- File operations: 1 retry with immediate retry

### User Recovery Options

**Always provide recovery actions:**
- Refresh/retry buttons
- Clear cache options
- Alternative workflows
- Navigation to safe locations

## Error Message Guidelines

### User-Facing Messages
- Clear and actionable
- Non-technical language
- Specific next steps
- Never expose sensitive information

### Technical Messages
- Detailed for debugging
- Include error context
- Stack traces in development only
- Comprehensive logging information

## Required Error Context

**Always include relevant context in errors:**

```typescript
const context = {
  endpoint: '/api/endpoint',
  method: 'POST',
  userId: user.id,
  fileName: file?.name,
  fileSize: file?.size,
  operation: 'specific_operation'
};
```

## Security Considerations

**Error handling security rules:**
- Never expose internal system details to users
- Sanitize error messages before displaying
- Log detailed errors server-side only
- Use generic messages for authentication failures
- Implement rate limiting on error-prone endpoints

## Testing Error Scenarios

**Required error testing:**
- Network failures and timeouts
- Invalid file uploads
- Database constraint violations
- Authentication/authorization failures
- Rate limiting scenarios

## Common Error Types

### Server Errors
- `AUTHENTICATION_ERROR` - Invalid or missing auth
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `DATABASE_ERROR` - Database operation failures
- `STORAGE_ERROR` - File storage issues
- `RATE_LIMIT_ERROR` - Too many requests

### Client Errors
- `NETWORK_ERROR` - Connection issues
- `TIMEOUT_ERROR` - Request timeouts
- `VALIDATION_ERROR` - Form validation failures
- `COMPONENT_ERROR` - React component errors
- `PDF_ERROR` - PDF rendering issues

## Performance Considerations

**Error handling performance rules:**
- Use async error handling to avoid blocking UI
- Implement exponential backoff for retries
- Cache error states to prevent repeated failures
- Clean up error handlers to prevent memory leaks
- Monitor error handling overheadetry**: ML-based retry strategies
3. **User Feedback**: Collect user error reports
4. **Performance Monitoring**: Real-time error metrics
5. **Automated Recovery**: Self-healing error recovery