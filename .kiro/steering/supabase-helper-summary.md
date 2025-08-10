---
inclusion: fileMatch
fileMatchPattern:
  ["**/supabase-helpers.ts", "**/api/**/*.ts", "**/store/**/*.ts"]
---

# Supabase Helper Functions Reference

## Error Handling Functions

### `mapSupabaseError(error: any): APIError`

Converts Supabase errors to standardized application error types. Maps specific error codes (PGRST116, PGRST301) to meaningful error types like AUTHENTICATION_ERROR, DATABASE_ERROR, etc.

### `withRetry<T>(operation: () => Promise<T>, config?): Promise<T>`

Implements exponential backoff retry logic for failed operations. Automatically retries network, storage, and database errors up to 3 times with increasing delays.

## File Validation Functions

### `validateFileUpload(file: File): APIError | null`

Validates PDF file uploads against size (50MB max) and type constraints. Returns null if valid, or APIError with specific validation failure details.

### `validateFile(file: File): FileValidationResult`

Comprehensive PDF file validation with enhanced security checks. Validates file existence, type (PDF only), size limits, filename security, and checks for malicious patterns like directory traversal and Windows reserved names. Returns object with validation status and detailed error messages.

## Type Guards

### `isPDFRow(row: any): row is Database["public"]["Tables"]["pdfs"]["Row"]`

Type guard to verify if an object matches the PDF database row structure. Checks for required fields: id, user_id, filename, file_size, storage_path.

### `isUserActivityRow(row: any): row is Database["public"]["Tables"]["user_activity"]["Row"]`

Type guard for user activity database rows. Validates presence of id, user_id, pdf_id, and activity_type fields.

## Data Mapping Functions

### `mapPDFRowToDocument(row: PDFRow): PDFDocument`

Converts database row format to application PDFDocument type. Transforms snake_case database fields to camelCase and converts timestamps to Date objects.

### `mapActivityRowToActivity(row: UserActivityRow): UserActivity`

Maps database user activity rows to application UserActivity type with proper type casting and timestamp conversion.

## Storage & URL Functions

### `generateStoragePath(userId: string, filename: string): string`

Creates unique storage path for user PDFs using format: `{userId}/{timestamp}_{sanitizedFilename}`. Sanitizes filename by replacing special characters.

### `generateSignedUrl(supabaseClient: any, storagePath: string): Promise<string>`

Generates time-limited signed URLs for secure file access from Supabase Storage. Uses STORAGE_CONFIG.SIGNED_URL_EXPIRY for expiration time. Throws detailed errors if URL generation fails or no URL is returned.

## Utility Functions

### `createAPIResponse<T>(success: boolean, data?: T, error?: string)`

Standardizes API response format across the application. Returns consistent structure with success flag, optional data, and error message.

### `handleSupabaseResult<T>(result: { data: T | null; error: any })`

Processes Supabase query results by throwing mapped errors or returning data. Simplifies error handling in API routes.

### `checkUserAccess(supabaseClient, table: string, resourceId: string, userId: string): Promise<boolean>`

Verifies if a user has access to a specific resource by checking ownership. Returns false for access denied or errors.

### `formatFileSize(bytes: number): string`

Converts byte values to human-readable format (Bytes, KB, MB, GB) with proper rounding.

### `formatDatabaseTimestamp(timestamp: string): Date`

Converts database timestamp strings to JavaScript Date objects.

## Usage Guidelines

- Always use `withRetry()` for critical database operations
- Validate files with `validateFile()` before upload (enhanced security validation)
- Use direct Supabase client calls with helper functions for database operations
- Handle errors with `mapSupabaseError()` for consistent error responses
- Generate signed URLs only when needed due to expiry limitations

## PDF Upload API Implementation

### Upload Route Structure (`app/api/pdfs/upload/route.ts`)

The PDF upload endpoint follows a robust pattern with proper error handling and cleanup:

1. **Authentication**: Uses Clerk's `auth()` to verify user identity
2. **File Validation**: Validates PDF files using `validateFile()` helper
3. **Storage Upload**: Uploads to Supabase Storage with user-organized paths
4. **Signed URL Generation**: Creates time-limited access URLs for files
5. **Database Recording**: Stores metadata in `pdfs` table with RLS protection
6. **Activity Logging**: Records upload activity (non-critical operation)
7. **Error Cleanup**: Removes uploaded files if database operations fail

### Key Functions in Upload Route

- `uploadToStorage()`: Handles file upload to Supabase Storage
- `generateSignedUrl()`: Creates signed URLs for file access
- `storePDFMetadata()`: Records PDF information in database
- `recordUploadActivity()`: Logs user activity (non-blocking)
- `generateStoragePath()`: Creates organized storage paths by user

### Row Level Security (RLS) Integration

The application uses RLS for automatic security:

- Database tables have RLS enabled with user-based policies
- `requesting_user_id()` function extracts Clerk user ID from JWT
- Manual `userId` still needed for file organization and explicit ownership
- RLS provides defense-in-depth security automatically

## Recent Changes

- **Added**: `generateSignedUrl()` function exported from supabase-helpers.ts for consistent signed URL generation across API routes
- **Fixed**: PDF upload route now properly generates signed URLs instead of using raw paths
- **Fixed**: Import errors in PDF listing route resolved with proper function exports
- **Fixed**: Type casting issues in recent activity data for proper TypeScript compliance
- **Improved**: Better error handling and cleanup in upload process with automatic file removal on database failures
- **Enhanced**: RLS integration with Clerk authentication for automatic security and user data isolation
- **Added**: Comprehensive file validation with security checks for malicious patterns and directory traversal
- **Optimized**: Error mapping and retry logic for robust API operations
- **Completed**: Full PDF upload workflow with metadata storage and activity logging
- **Completed**: PDF listing API endpoint with signed URL generation and recent activity tracking
