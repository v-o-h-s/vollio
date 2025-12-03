---
inclusion: always
---

# Error Handling Guidelines

## Overview

This project uses a comprehensive, categorized error handling system with 8 error types, proper logging, and consistent JSON responses.

## Error Categories

The system includes 8 main error classes with static factory methods:

### 1. **AuthError** - Authentication & Authorization

```typescript
throw AuthError.authenticationRequired("User not logged in", context);
throw AuthError.authorizationDenied("No permission", context);
throw AuthError.tokenExpired("Token has expired", context);
```

### 2. **AIError** - AI Service Operations

```typescript
throw AIError.serviceError("DeepSeek API failed", context);
throw AIError.quotaExceeded("API quota exceeded", context);
throw AIError.modelUnavailable("Model not available", context);
```

### 3. **ValidationError** - Input Validation

```typescript
throw ValidationError.general("Validation error", context);
throw ValidationError.fileTooLarge(100, context); // 100MB limit
throw ValidationError.invalidFileType("PDF", context);
throw ValidationError.invalidFileFormat("Invalid format", context);
throw ValidationError.fieldRequired("name", context);
throw ValidationError.fieldLengthInvalid("name", 1, 255, context);
throw ValidationError.invalidFormat("parent_id", "UUID format", context);
throw ValidationError.duplicateValue("name", "Already exists", context);
```

### 4. **StorageError** - Cloud Storage Operations

```typescript
throw StorageError.general("Upload failed", context);
throw StorageError.quotaExceeded("Storage quota exceeded", context);
throw StorageError.uploadFailed("Upload error", context);
throw StorageError.accessDenied("Access denied", context);
```

### 5. **FileError** - File Operations

```typescript
throw FileError.general("File operation failed", context);
throw FileError.notFound("File not found", context);
throw FileError.corrupted("File is corrupted", context);
throw FileError.loadingError("Failed to load file", context);
```

### 6. **DatabaseError** - Database Operations

```typescript
throw DatabaseError.general("Query failed", context);
throw DatabaseError.connectionError("Connection failed", context);
throw DatabaseError.constraintError("Constraint violation", context);
throw DatabaseError.rlsViolation("RLS policy violation", context);
throw DatabaseError.accessDenied("Access denied", context);
throw DatabaseError.notFound("Record not found", context);
throw DatabaseError.jwtExpired("JWT token expired", context);

// Map Supabase errors automatically
throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
  error.code,
  `Failed to fetch user folders: ${error.message}`,
  { operation: "fetch_user_folders", userId }
);
```

### 7. **NetworkError** - Network Operations

```typescript
throw NetworkError.general("Request failed", context);
throw NetworkError.timeout("Request timeout", context);
throw NetworkError.connectionFailed("Connection failed", context);
```

### 8. **GeneralError** - General/Unknown Errors

```typescript
throw GeneralError.unknown("Unexpected error", context);
throw GeneralError.internalServer("Internal server error", context);
throw GeneralError.serviceUnavailable("Service unavailable", context);
throw GeneralError.externalService("External service failed", context);
throw GeneralError.processing("Processing failed", context);
throw GeneralError.rateLimit("Too many requests", 60, context); // retry after 60s
```

## Error Properties

All errors inherit from `BaseAppError` and include:

```typescript
{
  timestamp: string;           // ISO 8601 timestamp
  severity: ErrorSeverity;     // CRITICAL | HIGH | MEDIUM | LOW
  userMessage: string;         // User-friendly message
  technicalMessage: string;    // Technical error details
  statusCode: number;          // HTTP status code
  context?: ErrorContext;      // Operation context (operation, userId, etc.)
  retryable?: boolean;         // Whether operation can be retried
}
```

## Error Handling Wrappers

### withErrorHandler - API Error Handling

Wraps API route handlers and provides comprehensive error formatting:

```typescript
import { withErrorHandler } from "@/lib/wrappers/withErrorHandling";

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Your handler logic
  throw AuthError.authenticationRequired("Auth required", context);
});
```

**Response Format:**

```json
{
  "success": false,
  "errorType": "AUTH_ERROR",
  "errorSubType": "AUTHENTICATION_REQUIRED",
  "error": {
    "userMessage": "Please log in to continue",
    "severity": "HIGH",
    "timestamp": "2025-11-18T14:30:45.000Z",
    "actionLabel": "Sign In",
    "context": { "operation": "fetch_folders" }
  }
}
```

### withValidation - Request Body Validation

Validates request bodies using Zod schemas before handler execution:

```typescript
import { withValidation } from "@/lib/wrappers/withValidation";
import { z } from "zod";

const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parent_id: z.string().uuid().optional(),
});

export const POST = withValidation(createFolderSchema, handlePOST);
```

**Validation Error Response:**

```json
{
  "success": false,
  "errorType": "VALIDATION_ERROR",
  "error": {
    "userMessage": "There was a validation error. Please check your input and try again.",
    "message": "name: String must contain at least 1 character; parent_id: Invalid UUID format",
    "severity": "LOW",
    "statusCode": 400,
    "timestamp": "2025-11-18T14:30:45.000Z"
  }
}
```

### withValidatedHandler - Combined Validation & Error Handling

Composes both wrappers for cleaner code:

```typescript
import { withValidatedHandler } from "@/lib/wrappers/withErrorHandling";

const schema = z.object({
  name: z.string().min(1).max(255),
});

export const POST = withValidatedHandler(
  schema,
  async (request: NextRequest) => {
    // Request body already validated
    const body = await request.json();
    // Your logic here
  }
);
```

## Logging

All API handlers should use the `Logger` utility for comprehensive logging:

```typescript
import { Logger } from "@/lib/utils/logger";

Logger.info("📂 Fetching folders", { endpoint: "/api/folders" });
Logger.warn("🔐 Unauthorized access attempt", { userId });
Logger.error("❌ Database error", error);
Logger.success("✅ Operation completed", { count: 5 });
```

**Log Levels:**

- `info()` - General operations
- `warn()` - Warnings and suspicious activity
- `error()` - Error states
- `success()` - Successful operations

## API Endpoint Pattern

**Recommended pattern for all API routes:**

```typescript
import { withValidatedHandler } from "@/lib/wrappers/withErrorHandling";
import { AuthError, DatabaseError } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";

// Schema validation
const createSchema = z.object({
  name: z.string().min(1).max(255),
});

async function handlePOST(request: NextRequest) {
  const context = { operation: "create_resource" };

  Logger.info("📝 Creating resource", { endpoint: "/api/resource" });

  // Authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    Logger.warn("🔐 Unauthorized access");
    throw AuthError.authenticationRequired("Auth required", context);
  }
  const userId = user.id;

  // Parse validated body
  const body = await request.json();

  // Database operation
  const supabase = await getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.from("table").insert(body);

  if (error) {
    Logger.error("Database error", error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error.code,
      `Failed to create resource: ${error.message}`,
      { ...context, userId }
    );
  }

  Logger.success("✅ Resource created", { id: data.id });
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export const POST = withValidatedHandler(createSchema, handlePOST);
```

## Error Context

Always pass context to errors for better debugging:

```typescript
const context = {
  operation: "fetch_user_folders", // What operation failed
  userId: userId, // Who it affected
  resourceId: folderId, // What resource
  additionalInfo: "custom data", // Any other relevant info
};

throw DatabaseError.general("Query failed", context);
```

## Best Practices

1. **Throw Errors Early** - Don't try to handle them, let the wrapper catch them
2. **Use Factory Methods** - Always use static factory methods, never `new Error()`
3. **Add Context** - Include operation, userId, and resource IDs in errors
4. **Log Before Throwing** - Log the error context before throwing
5. **Validate at Boundary** - Use Zod schemas to validate all inputs
6. **Handle in Wrapper** - Let `withErrorHandler` format responses
7. **No Manual Error Responses** - Don't manually create error JSON responses
8. **Remove console.log** - Use Logger utility instead of console

## Migration Guide

**Old Pattern (❌ Don't use):**

```typescript
try {
  // logic
} catch (error) {
  console.error("error:", error);
  return NextResponse.json({ error: "failed" }, { status: 500 });
}
```

**New Pattern (✅ Use this):**

```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  Logger.info("Starting operation");
  // logic
  throw DatabaseError.general("Failed", context);
});
```

## Common Error Codes

| Error Type             | HTTP Status | Example               |
| ---------------------- | ----------- | --------------------- |
| AuthenticationRequired | 401         | User not logged in    |
| AuthorizationDenied    | 403         | No permission         |
| ValidationError        | 400         | Invalid input         |
| NotFound               | 404         | Resource not found    |
| ConflictError          | 409         | Duplicate value       |
| RateLimitExceeded      | 429         | Too many requests     |
| InternalServerError    | 500         | Database query failed |
| ServiceUnavailable     | 503         | External service down |

````
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
#
# Production Implementation Status ✅

### Completed Error Handling Features
1. **Comprehensive API Error Handling**: All API routes use `withErrorHandling` wrapper
2. **Client-Side Error Boundaries**: Complete error boundary coverage for all major components
3. **RTK Query Integration**: Automatic error handling and user notifications
4. **File Upload Validation**: Comprehensive validation with security checks
5. **Database Error Mapping**: Complete Supabase error mapping and recovery
6. **User-Friendly Messages**: Clear, actionable error messages throughout
7. **Retry Mechanisms**: Automatic retry with exponential backoff
8. **Error Context**: Comprehensive error logging and debugging information

### Future Enhancements
1. **Enhanced Error Analytics**: Advanced error tracking and analysis
2. **Smart Retry**: ML-based retry strategies
3. **User Feedback**: Collect user error reports for continuous improvement
4. **Performance Monitoring**: Real-time error metrics and alerting
5. **Automated Recovery**: Self-healing error recovery mechanisms

---

**Last Updated**: January 2025
**Version**: 2.0.0
**Status**: Production Ready ✅ - Complete error handling implementation across all systems
````
