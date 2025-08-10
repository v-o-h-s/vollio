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

### `validatePDFFile(file: File): { valid: boolean; error?: string }`

Alternative PDF validation that checks file type, size, and filename validity. Returns object with validation status and error message.

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

### `generateSignedUrl(storagePath: string): Promise<string>`

Creates time-limited signed URLs for secure PDF access from Supabase storage. Uses configured expiry time from STORAGE_CONFIG.

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

## PDFDatabase Class

Static class providing database operations for PDF management:

### `insertPDF(data): Promise<PDFDocument>`

Creates new PDF record in database with user ownership and file metadata.

### `getUserPDFs(userId: string): Promise<PDFDocument[]>`

Retrieves all PDFs for a user, ordered by upload date (newest first).

### `getPDFById(id: string): Promise<PDFDocument | null>`

Fetches single PDF by ID, returns null if not found.

### `recordActivity(data): Promise<UserActivity>`

Logs user actions (view, upload, delete) for analytics and tracking.

### `getRecentActivity(userId: string, limit?: number): Promise<UserActivity[]>`

Retrieves user's recent activity with configurable limit (default: 1).

## Usage Guidelines

- Always use `withRetry()` for critical database operations
- Validate files with `validatePDFFile()` before upload
- Use `PDFDatabase` class methods for all PDF-related database operations
- Handle errors with `mapSupabaseError()` for consistent error responses
- Generate signed URLs only when needed due to expiry limitations
