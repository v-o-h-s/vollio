# Supabase Helpers Documentation

This document provides an overview of the utility functions and helpers available in `lib/utils/supabase-helpers.ts` for interacting with Supabase.

## Type Guards

These functions help validate that a data object matches a specific database row type.

- **`isPDFRow(row: any): boolean`**: Checks if a row matches the `pdfs` table structure.
- **`isUserActivityRow(row: any): boolean`**: Checks if a row matches the `user_activity` table structure.
- **`isHighlightRow(row: any): boolean`**: Checks if a row matches the `highlights` table structure.
- **`isFolderRow(row: any): boolean`**: Checks if a row matches the `folders` table structure.
- **`isOAuthTokenRow(row: any): boolean`**: Checks if a row matches the `oauth_tokens` table structure.

## Data Mappers

These functions convert raw database rows into application domain objects.

- **`mapPDFRowToDocument(row: PDFRow): PDFDocument`**: Converts a `pdfs` row to a `PDFDocument` object.
- **`mapActivityRowToActivity(row: UserActivityRow): UserActivity`**: Converts a `user_activity` row to a `UserActivity` object.
- **`mapHighlightRowToHighlight(row: HighlightsRow): Highlight`**: Converts a `highlights` row to a `Highlight` object.
- **`mapFolderRowToFolder(row: FolderRow): Folder`**: Converts a `folders` row to a `Folder` object.

## File Validation

- **`validateFile(file: File): FileValidationResult`**: Validates a file before upload. Checks for:
  - Existence
  - Allowed MIME types (PDF)
  - File size limits
  - Empty files
  - Filename length and security (malicious patterns)

## Storage Helpers

- **`generateSignedUrl(supabaseClient, storagePath): Promise<string>`**: Generates a signed URL for accessing a file in storage. Handles errors and logging.

## Testing Helpers

- **`getTokenForTesting(getToken, sessionId)`**: Retrieves a Supabase token from Clerk for testing purposes.

## Constants

- **`RETRY_CONFIG`**: Configuration for retrying Supabase operations (max retries, backoff, retryable errors).

## Usage Example

```typescript
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { mapPDFRowToDocument, isPDFRow } from "@/lib/utils/supabase-helpers";

async function fetchDocuments() {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.from("pdfs").select("*");

  if (error) throw error;

  return data.filter(isPDFRow).map(mapPDFRowToDocument);
}
```
