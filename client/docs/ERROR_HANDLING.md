# Error Handling & Sentry Strategy

Vollio uses a centralized error management system designed to keep the UI clean, the server secure, and developers informed.

## 🏗️ Architecture

The error handling flow follows this lifecycle:

1. **Request Fails**: The server returns a non-200 status code.
2. **Sentry Interception**: The `baseQuery` wrapper in `apiSlice.ts` captures the raw error.
3. **Filtering**: If the error is an "expected" result (like a 403 Quota limit), it is ignored by Sentry.
4. **Transformation**: The `transformRTKQueryError` utility scrubs sensitive technical details.
5. **UI Notification**: The feature hooks (`useSubmitQuiz`, etc.) receive a clean object and trigger toasts or modals.

## 📡 Sentry Integration

Sentry is initialized globally, but most manual reporting happens in `@/lib/store/apiSlice.ts`.

### Silent Errors (Ignored)

We do not report the following to Sentry because they represent user behavior or business logic, not code bugs:

- `QuotaExceededError` (User needs to upgrade)
- `RateLimitingError` (User is too fast)
- `AuthError` (User is not logged in)
- `NotFoundError` (Item doesn't exist)
- `ConflictError` (Duplicate entry)
- `AbortError` (User navigated away)

### Technical Errors (Reported)

We automatically report:

- `5xx` Server errors (Crashes, Unhandled exceptions)
- `FETCH_ERROR` (Network failures, CORS issues)
- `TIMEOUT_ERROR` (Server took too long)
- `400 Bad Request` (Client/Server contract mismatch)

## 🔒 Security: The "Blackbox" Rule

We never show raw server errors to the user unless they are whitelisted as **Safe Errors**.

| Error Type                               | User Sees                      | Developer Sees (Sentry)      |
| :--------------------------------------- | :----------------------------- | :--------------------------- |
| **Whitelisted** (e.g. `ValidationError`) | Specific message from server   | Full request context         |
| **Sensitive** (e.g. `DatabaseError`)     | "An unexpected error occurred" | Full SQL error & stack trace |

### Safe Error Whitelist

- `RateLimitingError`
- `QuotaExceededError`
- `ValidationError`
- `NotFoundError`
- `ConflictError`
- `AuthError`

## 🛠 Usage in Hooks

Use the centralized hooks to benefit from this standardized flow:

```typescript
const { onSubmit, error, isErrorModalOpen } = useSubmitFlashcards();

// Error is already transformed into: { message: string, name: string }
// Sentry reporting is already handled by the API slice.
```
