# Sentry Integration

This document describes how Sentry error monitoring and tracing is configured in the Vollio server.

## Overview

Sentry provides:
- **Error Monitoring**: Automatic capture of exceptions and errors
- **Performance Tracing**: Track request latency and identify bottlenecks
- **Release Tracking**: Associate errors with specific deployments

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | Yes | - | Data Source Name from Sentry project settings |
| `SENTRY_ENVIRONMENT` | No | `NODE_ENV` or `development` | Environment name (development, staging, production) |
| `SENTRY_RELEASE` | No | - | Release version (e.g., `1.0.0` or git commit SHA) |
| `SENTRY_TRACES_SAMPLE_RATE` | No | `1.0` (dev) / `0.1` (prod) | Percentage of transactions to trace (0.0 to 1.0) |

### Getting Your SENTRY_DSN

1. Go to [sentry.io](https://sentry.io) and sign in
2. Create a new project or select an existing one (choose **Node.js** or **Fastify** as the platform)
3. Navigate to **Settings > Projects > [Your Project] > Client Keys (DSN)**
4. Copy the DSN string (looks like `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### Example .env Configuration

```bash
# Sentry Configuration
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=1.0.0
SENTRY_TRACES_SAMPLE_RATE=1.0
```

## Architecture

### Instrumentation File (`src/instrument.ts`)

This file **must** be imported before any other modules. It:

1. **Loads `dotenv/config` first** - This is critical! Environment variables must be available before `Sentry.init()` runs
2. Initializes Sentry with:
   - DSN configuration
   - Environment and release tracking
   - Trace sampling rates
   - PII settings for debugging
   - Error filtering for expected errors

> **Important**: The `dotenv/config` import was moved into `instrument.ts` to ensure environment variables are loaded before Sentry initializes. Do NOT import `dotenv/config` elsewhere in the application.

### Server Integration (`src/server.ts`)

The server imports the instrumentation file first, then sets up:
- `Sentry.setupFastifyErrorHandler(app)` - Captures unhandled errors in routes

### Error Handler Integration (`src/shared/utils/errorHandler.ts`)

The custom error handler calls `Sentry.captureException()` with additional context:
- Request URL and method
- User ID (if authenticated)
- Error-specific tags and metadata

## What Gets Sent to Sentry

| Error Type | Sent to Sentry | Reason |
|------------|----------------|--------|
| `DatabaseError` | Yes | Infrastructure issues need attention |
| `ServerError` | Yes | Internal server problems |
| `VoyageAIError` | Yes | External service failures |
| Unexpected errors | Yes | Critical/unknown issues |
| `ValidationError` | No | Expected user input issues |
| `NotFoundError` | No | Expected 404 responses |
| `RateLimitingError` | No | Expected rate limit behavior |

## Testing the Integration

### Debug Route (Development Only)

A test route is available in non-production environments:

```bash
# Start the server
npm run dev --workspace=server

# Trigger a test error
curl http://localhost:3000/debug-sentry
```

The error should appear in your Sentry dashboard within seconds.

### Manual Testing

You can also test by intentionally causing an error in your code:

```typescript
import * as Sentry from "@sentry/node";

// Capture a test message
Sentry.captureMessage("Test message from Vollio server");

// Capture a test exception
Sentry.captureException(new Error("Test error"));
```

## Performance Tracing

With tracing enabled (`SENTRY_TRACES_SAMPLE_RATE > 0`), Sentry automatically tracks:
- HTTP request duration
- Database query performance
- External API calls

### Sample Rate Recommendations

| Environment | Recommended Rate | Notes |
|-------------|------------------|-------|
| Development | `1.0` (100%) | Capture everything for debugging |
| Staging | `0.5` (50%) | Good balance of data and cost |
| Production | `0.1` (10%) | Reduce costs while maintaining visibility |

## Adding Custom Context

### Setting User Context

When a user is authenticated, Sentry automatically receives user ID from the error handler. You can add more context:

```typescript
import * as Sentry from "@sentry/node";

Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

### Adding Breadcrumbs

Track user actions leading up to an error:

```typescript
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User uploaded a document",
  level: "info",
  data: {
    documentId: doc.id,
    fileSize: file.size,
  },
});
```

### Custom Tags

Add tags to filter errors in the Sentry dashboard:

```typescript
Sentry.setTag("feature", "document-upload");
Sentry.setTag("plan", user.subscriptionPlan);
```

## Source Maps (Optional)

For readable stack traces in production, upload source maps:

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Or use the wizard
npx @sentry/wizard@latest -i sourcemaps
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check SENTRY_DSN**: Ensure it's set correctly in `.env`
2. **Check enabled flag**: Sentry only sends events when `SENTRY_DSN` is configured
3. **Check network**: Ensure the server can reach `*.ingest.sentry.io`
4. **Check filtering**: Some errors are intentionally filtered (ValidationError, NotFoundError, etc.)

### Console Logging in Development

When `SENTRY_DSN` is not set in development, the instrumentation file logs what would have been sent:

```
[Sentry] Would have sent event: Test Sentry error - this is intentional!
```

### Too Many Events

If you're seeing too many events:
1. Lower `SENTRY_TRACES_SAMPLE_RATE`
2. Add more error types to the `ignoreErrors` array in `instrument.ts`
3. Use `beforeSend` to filter specific errors

## Related Files

- `src/instrument.ts` - Sentry initialization
- `src/server.ts` - Fastify error handler setup
- `src/shared/utils/errorHandler.ts` - Custom error handling with Sentry integration
