# Supabase Helper Functions Summary

## Overview

The `lib/utils/supabase-helpers.ts` file contains essential utility functions for database operations, type validation, error handling, and data mapping. These functions ensure type safety and consistent error handling across the application.

## Type Guards

### Database Row Validation

#### `isPDFRow(row: any): row is PDFRow`
- Validates PDF database row structure
- Checks required fields: `id`, `user_id`, `filename`, `file_size`, `storage_path`
- Returns type-safe PDF row object

#### `isUserActivityRow(row: any): row is UserActivityRow`
- Validates user activity database row structure
- Checks required fields: `id`, `user_id`, `pdf_id`, `activity_type`
- Returns type-safe user activity row object

#### `isHighlightRow(row: any): row is HighlightRow` ✅ UPDATED
- Validates highlight database row structure
- Checks required fields: `id`, `user_id`, `pdf_id`, `content`, `page_number`, `type`, `textbounds`
- Validates highlight type is one of: `"quick"`, `"comment"`, `"note"`
- Ensures `textbounds` is an array for coordinate data
- Returns type-safe highlight row object

## Error Handling

### `mapSupabaseError(error: any): APIError`
Maps Supabase errors to standardized application error types:
- **PGRST116**: Authentication errors (access denied)
- **PGRST301**: Database errors (resource not found)
- **JWT errors**: Token expiration
- **Network errors**: Connection issues (retryable)
- **Storage errors**: File operation failures (retryable)

### `withRetry<T>(operation: () => Promise<T>, config?): Promise<T>`
Implements exponential backoff retry logic:
- Default: 3 retries with 2x backoff multiplier
- Initial delay: 1000ms
- Retries on: NETWORK_ERROR, STORAGE_ERROR, DATABASE_ERROR
- Throws original error after max retries

## Data Mapping Functions

### `mapPDFRowToDocument(row: PDFRow): PDFDocument`
Converts database PDF row to application PDFDocument type:
- Maps snake_case database fields to camelCase application fields
- Converts timestamp strings to Date objects
- Handles null/undefined timestamps with fallback dates

### `mapActivityRowToActivity(row: UserActivityRow): UserActivity`
Converts database activity row to application UserActivity type:
- Maps database fields to application structure
- Converts activity_type to typed enum values
- Converts timestamp to Date object

### `mapHighlightRowToHighlight(row: HighlightRow): Highlight` ✅ UPDATED
Converts database highlight row to application Highlight type:
- Maps all highlight fields from database to application structure
- Preserves textbounds array for coordinate data
- Maintains type safety for highlight types (quick/comment/note)
- Converts timestamps to proper format

## File Validation

### `validateFile(file: File): FileValidationResult`
Comprehensive file validation for PDF uploads:
- **Type validation**: Only allows PDF MIME types
- **Size validation**: Enforces maximum file size limits
- **Security checks**: 
  - Prevents empty files
  - Validates filename length (max 255 characters)
  - Blocks directory traversal patterns (`../`)
  - Prevents invalid filename characters (`<>:"|?*`)
  - Blocks Windows reserved names (CON, PRN, AUX, etc.)

## Storage Operations

### `generateSignedUrl(supabaseClient, storagePath): Promise<string>`
Generates time-limited signed URLs for secure file access:
- Uses configured bucket name and expiry time
- Provides comprehensive error handling
- Returns secure URL for PDF viewing

## Utility Functions

### `createAPIResponse<T>(success: boolean, data?: T, error?: string)`
Creates standardized API response format for consistent client handling.

### `handleSupabaseResult<T>(result: {data: T | null; error: any})`
Processes Supabase query results with automatic error mapping and throwing.

### `checkUserAccess(supabaseClient, table, resourceId, userId): Promise<boolean>`
Verifies user has access to specific resources using RLS policies.

### `formatDatabaseTimestamp(timestamp: string): Date`
Converts database timestamp strings to JavaScript Date objects.

### `formatFileSize(bytes: number): string`
Formats byte values to human-readable file sizes (Bytes, KB, MB, GB).

## Usage Guidelines

### When Adding New Database Tables
1. **Create Type Guard**: Add `is[TableName]Row` function following existing patterns
2. **Add Mapper Function**: Create `map[TableName]RowTo[AppType]` for data conversion
3. **Update Error Handling**: Add table-specific error codes if needed
4. **Test Validation**: Ensure type guards catch invalid data structures

### When Modifying Existing Tables
1. **Update Type Guards**: Modify validation logic for new/changed fields
2. **Update Mappers**: Adjust field mapping for schema changes
3. **Maintain Backward Compatibility**: Handle optional fields gracefully
4. **Update Tests**: Verify type guards work with new schema

### Error Handling Best Practices
- Always use `mapSupabaseError` for consistent error formatting
- Use `withRetry` for operations that may fail due to network issues
- Implement proper cleanup in catch blocks for file operations
- Log detailed errors server-side while showing user-friendly messages

### Type Safety Requirements
- Use type guards before processing database rows
- Always validate data structure before mapping to application types
- Handle null/undefined values in database fields
- Maintain strict TypeScript compliance

## Integration Points

### RTK Query Integration
- Use these helpers in RTK Query mutation/query functions
- Implement proper error handling in API slice definitions
- Leverage retry logic for network resilience

### API Route Usage
- Use `handleSupabaseResult` in API route handlers
- Implement `checkUserAccess` for authorization
- Use `createAPIResponse` for consistent response format

### Component Integration
- Use mapped types in React components for type safety
- Handle loading/error states from RTK Query
- Implement proper error boundaries with mapped error types

## Recent Updates

### Highlight System Support ✅ COMPLETED
- Added `isHighlightRow` type guard for PDF annotation system
- Supports multi-mode highlighting (quick, comment, note)
- Validates textbounds array for coordinate data
- Enables type-safe highlight database operations
- Integrates with PDF annotation workflow

### Advanced Highlight Management ✅ NEW
- **HighlightContextMenu Integration**: Support for highlight color and opacity updates
- **RTK Query Mutations**: `useUpdateHighlightMutation` and `useDeleteHighlightMutation` support
- **Color Validation**: Validates hex color codes for highlight customization
- **Opacity Validation**: Ensures opacity values are between 0.1 and 1.0
- **Hover Trigger Support**: Database operations for highlight hover interactions

### Advanced Highlight Management ✅ NEW
- **HighlightContextMenu Integration**: Support for highlight color and opacity updates
- **RTK Query Mutations**: `useUpdateHighlightMutation` and `useDeleteHighlightMutation` support
- **Color Validation**: Validates hex color codes for highlight customization
- **Opacity Validation**: Ensures opacity values are between 0.1 and 1.0
- **Hover Trigger Support**: Database operations for highlight hover interactions

This helper system ensures type safety, consistent error handling, and reliable database operations across the entire application.